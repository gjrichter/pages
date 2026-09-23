// Anagrafe scuole (statali + paritarie, a.s. 2024/25) geolocalizzata per le 12 grandi città,
// con % alunni con cittadinanza non italiana.
//
// Coordinate a cascata (colonna `fonte`, dalla più affidabile):
//   osm_plesso       OSM amenity=school/kindergarten/college con codice MIM del plesso (ref / operator:ref / ref:miur)
//   fgb_civico       beni_immobili_pubblici.fgb, via normalizzata + civico
//   fgb_cognome      beni_immobili_pubblici.fgb, ultima parola della via + civico (tollera "A. GRAF" vs "Arturo Graf")
//   civico           numeri civici georeferenziati (ANNCSU; comuni di Torino e Bari), vedi civici.mjs
//   nominatim        Nominatim/OSM, solo se trova il numero civico (saltato con --no-nominatim)
//   osm_istituto     OSM con il codice dell'istituto di riferimento (sede dell'istituto, non del plesso: approssimato)
//   fgb_via          beni_immobili_pubblici.fgb, sola via (punto "da qualche parte sulla via")
// Controlli: point-in-polygon sul comune (fuori → coordinate scartate), distanza OSM↔FGB, candidati FGB dispersi.
//
// Uso: node build.mjs [--no-nominatim]   (i download sono in cache in data/, gli output in out/)
//      richiede `unzip` e, per i civici di Bari, `ogr2ogr` (GDAL)

import fs from 'node:fs';
import Papa from 'papaparse';
import { deserialize } from 'flatgeobuf/lib/mjs/geojson.js';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { loadCivici, matchCivico, nominatim } from './civici.mjs';

const MIM = 'https://dati.istruzione.it/opendata/opendata/catalogo/elements1';
const SRC = {
  anaSta: `${MIM}/SCUANAGRAFESTAT20242520240901.csv`,
  anaPar: `${MIM}/SCUANAGRAFEPAR20242520240901.csv`,
  citSta: `${MIM}/ALUITASTRACITSTA20242520250831.csv`,
  citPar: `${MIM}/ALUITASTRACITPAR20242520250831.csv`,
  edi:    `${MIM}/EDIANAGRAFESTA202120242520250806.csv`,
  indSta: `${MIM}/ALUSECGRADOINDSTA20242520250831.csv`,   // studenti di II grado per indirizzo (LICEO/TECNICO/PROFESSIONALE)
  indPar: `${MIM}/ALUSECGRADOINDPAR20242520250831.csv`,
  comuni: 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_municipalities.geojson',
};
const FGB = 'https://ixmaps-data.s3.amazonaws.com/TestData/beni_immobili_pubblici.fgb';
const OVERPASS = 'https://overpass.openstreetmap.fr/api/interpreter';

// codice catastale (Belfiore), usato sia dal MIM sia dall'FGB
const CITIES = { H501: 'Roma', F205: 'Milano', F839: 'Napoli', L219: 'Torino', G273: 'Palermo', D969: 'Genova',
                 A944: 'Bologna', D612: 'Firenze', A662: 'Bari', C351: 'Catania', L736: 'Venezia', L781: 'Verona' };

const MAX_OSM_FGB_M = 200;   // oltre: flag `conflitto_osm_fgb`
const MAX_SPREAD_M = 300;    // candidati FGB più dispersi di così: flag `ambiguo`
const MIN_ALUNNI = 20;       // sotto: pct calcolata ma flag `pochi_alunni`
const USE_NOMINATIM = !process.argv.includes('--no-nominatim');

fs.mkdirSync('data', { recursive: true });
fs.mkdirSync('out', { recursive: true });

// ---------- utilità ----------

async function cached(name, url, { fetchOpts, retries = 3 } = {}) {
  const file = `data/${name}`;
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  for (let i = 1; ; i++) {
    const res = await fetch(url, fetchOpts);
    if (res.ok) { const txt = await res.text(); fs.writeFileSync(file, txt); return txt; }
    if (i >= retries) throw new Error(`${url} → HTTP ${res.status}`);
    console.warn(`  ${name}: HTTP ${res.status}, nuovo tentativo ${i + 1}/${retries} tra ${10 * i}s`);
    await new Promise(r => setTimeout(r, 10000 * i));
  }
}
const csv = txt => Papa.parse(txt, { header: true, skipEmptyLines: true }).data;

const STREET_PREFIX = /^(VIA|VIALE|V LE|PIAZZA|P ZZA|PZA|PIAZZALE|P LE|LARGO|L GO|CORSO|C SO|VICOLO|VICO|STRADA|SALITA|CALATA|RAMPA|BASTIONI|ALZAIA|PASSAGGIO|LUNGOTEVERE|LUNGOMARE|CONTRADA|BORGO|CALLE|FONDAMENTA|CAMPO|SESTIERE) /;
const norm = s => (s ?? '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().replace(STREET_PREFIX, '');
const lastWord = v => v.split(' ').pop();
const civNum = s => (String(s ?? '').match(/\d+/) || [''])[0];
// "VIA A. GRAF 74" / "VIA GIUSTI15" / "VIA BOLOGNA N. 34" → {via, civ}
const splitAddress = a => {
  const s = (a ?? '').split(/\(|\s-\s/)[0];                       // "…PERONI8(ORD.)-VIA …" → prima parte
  const m = s.match(/^(.*?)[\s,]*(?:N\.?\s?)?(\d+)\D*$/);
  return m ? { via: norm(m[1]), civ: m[2] } : { via: norm(s), civ: '' };
};
const distM = (a, b) => {
  const R = 6371000, r = Math.PI / 180, dLat = (b[1] - a[1]) * r, dLon = (b[0] - a[0]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const bboxOf = geom => {
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = c => typeof c[0] === 'number'
    ? (minX = Math.min(minX, c[0]), minY = Math.min(minY, c[1]), maxX = Math.max(maxX, c[0]), maxY = Math.max(maxY, c[1]))
    : c.forEach(walk);
  walk(geom.coordinates);
  return { minX, minY, maxX, maxY };
};
const MIM_CODE = /^[A-Z]{2}[A-Z0-9]{8}$/;
const put = (m, k, v) => (m.get(k) ?? m.set(k, []).get(k)).push(v);

// ---------- dati nazionali MIM ----------

console.log('Download / cache dati MIM e confini…');
const [anaSta, anaPar, citSta, citPar, edi, indSta, indPar, comuni] = await Promise.all([
  cached('anagrafe_statali_2425.csv', SRC.anaSta).then(csv),
  cached('anagrafe_paritarie_2425.csv', SRC.anaPar).then(csv),
  cached('cittadinanza_statali_2425.csv', SRC.citSta).then(csv),
  cached('cittadinanza_paritarie_2425.csv', SRC.citPar).then(csv),
  cached('edifici_statali_2425.csv', SRC.edi).then(csv),
  cached('indirizzi_statali_2425.csv', SRC.indSta).then(csv),
  cached('indirizzi_paritarie_2425.csv', SRC.indPar).then(csv),
  cached('comuni_openpolis.geojson', SRC.comuni).then(JSON.parse),
]);

const alunni = new Map();   // CODICESCUOLA → {alunni, stranieri, ue, nonue}
for (const r of [...citSta, ...citPar]) {
  const a = alunni.get(r.CODICESCUOLA) ?? { alunni: 0, stranieri: 0, ue: 0, nonue: 0 };
  a.alunni += +r.ALUNNI || 0;
  a.stranieri += +r.ALUNNICITTADINANZANONITALIANA || 0;
  a.ue += +r.ALUNNICITTADINANZANONITALIANAPAESIUE || 0;
  a.nonue += +r.ALUNNICITTADINANZANONITALIANAPAESINONUE || 0;
  alunni.set(r.CODICESCUOLA, a);
}
// II grado: percorso prevalente per numero di studenti ("PROFESSIONALE IeFP" contato come PROFESSIONALE)
const percorsi = new Map();   // CODICESCUOLA → {LICEO: n, TECNICO: n, PROFESSIONALE: n}
for (const r of [...indSta, ...indPar]) {
  const p = percorsi.get(r.CODICESCUOLA) ?? percorsi.set(r.CODICESCUOLA, {}).get(r.CODICESCUOLA);
  const t = r.TIPOPERCORSO.replace(/ IEFP$/i, '');
  p[t] = (p[t] ?? 0) + (+r.ALUNNIMASCHI || 0) + (+r.ALUNNIFEMMINE || 0);
}
const percorsoOf = code => {
  const p = percorsi.get(code);
  if (!p) return { percorso: '', quota: '' };
  const tot = Object.values(p).reduce((x, y) => x + y, 0);
  const [top, n] = Object.entries(p).sort((x, y) => y[1] - x[1])[0];
  return { percorso: top, quota: tot ? +(n / tot).toFixed(2) : '' };
};
const edifici = new Map();  // CODICESCUOLA → [{via, civ, codiceEdificio}]
for (const r of edi) put(edifici, r.CODICESCUOLA, { via: norm(r.DENOMINAZIONEINDIRIZZO), civ: civNum(r.NUMEROCIVICO), codiceEdificio: r.CODICEEDIFICIO });

const confini = new Map(comuni.features.filter(f => CITIES[f.properties.com_catasto_code]).map(f => [f.properties.com_catasto_code, f]));

const scuole = [
  ...anaSta.filter(r => r.SEDESCOLASTICA === 'SI').map(r => ({ ...r, gestione: 'statale' })),
  ...anaPar.map(r => ({ ...r, gestione: 'paritaria', CODICEISTITUTORIFERIMENTO: '' })),
].filter(r => CITIES[r.CODICECOMUNESCUOLA]);

console.log('Civici georeferenziati…');
const civici = await loadCivici(Object.keys(CITIES), norm);
// indirizzi candidati di una scuola: quelli degli edifici MIM (strutturati) e poi quello dell'anagrafe
const addressesOf = s => {
  const list = [...(edifici.get(s.CODICESCUOLA) ?? []), splitAddress(s.INDIRIZZOSCUOLA)];
  return list.filter((a, i) => list.findIndex(b => b.via === a.via && b.civ === a.civ) === i);
};

// ---------- per città ----------

const out = [], report = [];
for (const [code, name] of Object.entries(CITIES)) {
  const confine = confini.get(code);
  if (!confine) { console.error(`${name}: confine ${code} non trovato, salto`); continue; }
  const bb = bboxOf(confine.geometry);
  console.log(`\n${name} (${code})`);

  // FGB: lettura per bbox via indice spaziale, poi filtro sul codice comune
  const fgb = { full: new Map(), last: new Map(), street: new Map() };
  let nFgb = 0;
  for await (const f of deserialize(FGB, bb)) {
    const p = f.properties;
    if (p.codice_comune_del_bene !== code || !f.geometry) continue;
    const v = norm(p.indirizzo), n = civNum(p.numero_civico);
    if (!v) continue;
    const rec = { xy: f.geometry.coordinates, id_bene: p.id_bene, p };
    if (n) { put(fgb.full, `${v}|${n}`, rec); put(fgb.last, `${lastWord(v)}|${n}`, rec); }
    put(fgb.street, v, rec);
    nFgb++;
  }
  console.log(`  FGB: ${nFgb} beni con indirizzo`);

  // OSM: scuole con codice MIM
  const q = `[out:json][timeout:180];nwr["amenity"~"^(school|kindergarten|college)$"](${bb.minY},${bb.minX},${bb.maxY},${bb.maxX});out center tags;`;
  const osmJson = JSON.parse(await cached(`osm_${code}.json`, OVERPASS,
    // senza User-Agent overpass.openstreetmap.fr risponde 403
    { fetchOpts: { method: 'POST', body: new URLSearchParams({ data: q }), headers: { 'User-Agent': 'scuole-stranieri/1.0' } } }));
  const osm = new Map();
  for (const e of osmJson.elements) {
    const xy = e.type === 'node' ? [e.lon, e.lat] : e.center && [e.center.lon, e.center.lat];
    if (!xy) continue;
    for (const k of ['ref:miur', 'ref', 'operator:ref'])
      for (const c of String(e.tags?.[k] ?? '').toUpperCase().split(/[;,]/).map(s => s.trim()))
        if (MIM_CODE.test(c) && !osm.has(c)) osm.set(c, { xy, osm: `${e.type}/${e.id}` });
  }
  console.log(`  OSM: ${osmJson.elements.length} scuole, ${osm.size} codici MIM`);

  const score = r => (/^Edificio scolastico/.test(r.p.tipologia_bene_immobile) || r.p.finalita === 'Attività didattica' ? 2 : 0)
                   + (r.p.precisione_georeferenziazione === 'CIVICO' || r.p.fonte_georeferenziazione === 'IDENTIFICATIVI_CATASTALI' ? 1 : 0);
  const pickFgb = s => {
    const addrs = edifici.get(s.CODICESCUOLA) ?? [];
    if (!addrs.length) addrs.push({ ...splitAddress(s.INDIRIZZOSCUOLA), codiceEdificio: '' });
    for (const [level, key] of [['fgb_civico', a => a.civ && fgb.full.get(`${a.via}|${a.civ}`)],
                                ['fgb_cognome', a => a.civ && fgb.last.get(`${lastWord(a.via)}|${a.civ}`)],
                                ['fgb_via', a => fgb.street.get(a.via)]])
      for (const a of addrs) {
        const cand = key(a);
        if (!cand?.length) continue;
        const best = cand.reduce((x, y) => score(y) > score(x) ? y : x);
        const spread = Math.max(...cand.map(c => distM(c.xy, best.xy)));
        return { level, best, spread, edificio: a.codiceEdificio };
      }
    return null;
  };

  const stat = { citta: name, scuole: 0, osm_plesso: 0, fgb_civico: 0, fgb_cognome: 0, civico: 0, nominatim: 0, osm_istituto: 0, fgb_via: 0,
                 nessuna: 0, fuori_comune: 0, con_alunni: 0, con_alunni_geoloc: 0,
                 osm_fgb_confronti: 0, osm_fgb_conflitti: 0,
                 osm_civico_confronti: 0, osm_civico_conflitti: 0 };
  for (const s of scuole.filter(s => s.CODICECOMUNESCUOLA === code)) {
    stat.scuole++;
    const osmP = osm.get(s.CODICESCUOLA), osmI = s.CODICEISTITUTORIFERIMENTO && osm.get(s.CODICEISTITUTORIFERIMENTO);
    const f = pickFgb(s);
    const flags = [];
    let fonte = 'nessuna', xy = null;
    if (osmP) [fonte, xy] = ['osm_plesso', osmP.xy];
    else if (f && f.level !== 'fgb_via') [fonte, xy] = [f.level, f.best.xy];
    const civ = matchCivico(civici.get(code), addressesOf(s));
    if (osmP && civ) {   // come per l'FGB: distanza dal punto OSM a codice esatto
      stat.osm_civico_confronti++;
      if (distM(osmP.xy, civ.xy) > MAX_OSM_FGB_M) stat.osm_civico_conflitti++;
    }
    if (!xy && civ) {
      [fonte, xy] = ['civico', civ.xy];
      if (civ.ambiguo) flags.push('ambiguo');
    }
    if (!xy && USE_NOMINATIM) {
      const nxy = await nominatim(s.INDIRIZZOSCUOLA.split(/\(|\s-\s/)[0], name);
      if (nxy) [fonte, xy] = ['nominatim', nxy];
    }
    if (!xy && osmI) [fonte, xy] = ['osm_istituto', osmI.xy];
    else if (!xy && f) [fonte, xy] = ['fgb_via', f.best.xy];

    if (f && f.level !== 'fgb_via' && f.spread > MAX_SPREAD_M && fonte.startsWith('fgb')) flags.push('ambiguo');
    // dove ci sono sia OSM (codice esatto) sia FGB, la distanza misura l'affidabilità del join per indirizzo
    if (osmP && f && f.level !== 'fgb_via') {
      stat.osm_fgb_confronti++;
      if (distM(osmP.xy, f.best.xy) > MAX_OSM_FGB_M) { flags.push('conflitto_osm_fgb'); stat.osm_fgb_conflitti++; }
    }
    if (xy && !booleanPointInPolygon(xy, confine)) { flags.push('fuori_comune'); stat.fuori_comune++; fonte = 'nessuna'; xy = null; }
    stat[fonte]++;

    const a = alunni.get(s.CODICESCUOLA);
    if (a) { stat.con_alunni++; if (xy) stat.con_alunni_geoloc++; }
    if (a && a.alunni < MIN_ALUNNI) flags.push('pochi_alunni');
    out.push({
      codice_scuola: s.CODICESCUOLA, codice_istituto: s.CODICEISTITUTORIFERIMENTO, gestione: s.gestione,
      denominazione: s.DENOMINAZIONESCUOLA, grado: s.DESCRIZIONETIPOLOGIAGRADOISTRUZIONESCUOLA,
      indirizzo: s.INDIRIZZOSCUOLA, cap: s.CAPSCUOLA, codice_comune: code, comune: name,
      lon: xy ? +xy[0].toFixed(6) : '', lat: xy ? +xy[1].toFixed(6) : '', fonte,
      codice_edificio: f?.edificio ?? '', id_bene: fonte.startsWith('fgb') ? f.best.id_bene : '',
      osm_id: fonte === 'osm_plesso' ? osmP.osm : fonte === 'osm_istituto' ? osmI.osm : '',
      alunni: a?.alunni ?? '', stranieri: a?.stranieri ?? '', stranieri_ue: a?.ue ?? '', stranieri_nonue: a?.nonue ?? '',
      pct_stranieri: a?.alunni ? +(100 * a.stranieri / a.alunni).toFixed(1) : '',
      percorso_prevalente: percorsoOf(s.CODICESCUOLA).percorso, quota_percorso: percorsoOf(s.CODICESCUOLA).quota,
      flag: flags.join(';'),
    });
  }
  report.push(stat);
}

// ---------- output ----------

const write = (file, rows) => fs.writeFileSync(file, Papa.unparse(rows));
write('out/scuole_12citta.csv', out);
write('out/non_geolocalizzate.csv', out.filter(r => r.fonte === 'nessuna'));
write('out/report_citta.csv', report);
console.log('\n');
console.table(report.map(r => ({ ...r, geoloc_pct: +(100 * (r.scuole - r.nessuna) / r.scuole).toFixed(1),
                                  geoloc_alunni_pct: +(100 * r.con_alunni_geoloc / r.con_alunni).toFixed(1) })));
console.log(`\nout/scuole_12citta.csv: ${out.length} scuole, ${out.filter(r => r.lat !== '').length} con coordinate`);
