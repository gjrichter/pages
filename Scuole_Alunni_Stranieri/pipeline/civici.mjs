// Geocoder per indirizzo sui numeri civici georeferenziati.
//   ANNCSU (Agenzia Entrate, indirizzario regionale) per 10 città; per Torino e Bari ANNCSU non ha
//   coordinate (verificato 2026-09), quindi si usano i civici pubblicati dai due comuni.
//   Nominatim come ultimo ripiego, accettato solo se restituisce il numero civico.

import fs from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import readline from 'node:readline';

const ANNCSU = 'https://anncsu.open.agenziaentrate.gov.it/age-inspire/opendata/anncsu/getds.php?INDIR_';
const ANNCSU_REGION = { H501: 'LAZI', F205: 'LOMB', F839: 'CAMP', G273: 'SICI', C351: 'SICI', D969: 'LIGU',
                        A944: 'EMIL', D612: 'TOSC', L736: 'VENE', L781: 'VENE' };
const TORINO = 'https://risorse.comune.torino.it/opendata/geodata/civici_WGS84_EPSG4326_csv_202010.csv';
const BARI = 'https://sit.egov.ba.it/vector/api/shp/qdjango/384/vwm_db_grafo_civico20210224101146733/';
const UA = { 'User-Agent': 'scuole-stranieri/1.0' };

async function download(url, file) {
  if (fs.existsSync(file)) return;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}
async function* lines(cmd, args) {
  const p = spawn(cmd, args);
  p.on('error', e => { throw new Error(`${cmd} non disponibile: ${e.message}`); });
  yield* readline.createInterface({ input: p.stdout, crlfDelay: Infinity });
}
const num = s => +String(s).replace(',', '.');

// → Map codiceComune → [{via (grezza), civ, xy}]
async function loadRaw(codes) {
  const out = new Map(codes.map(c => [c, []]));
  let complete = true;   // se una fonte fallisce non si scrive la cache, così il run successivo ritenta
  const cache = 'data/civici_12citta.json';
  if (fs.existsSync(cache)) return new Map(Object.entries(JSON.parse(fs.readFileSync(cache, 'utf8'))));

  for (const region of new Set(codes.map(c => ANNCSU_REGION[c]).filter(Boolean))) {
    const zip = `data/anncsu_${region}.bin`;
    console.log(`  ANNCSU ${region}…`);
    await download(ANNCSU + region, zip);
    let header;
    for await (const l of lines('unzip', ['-p', zip])) {
      const r = l.split(';');
      if (!header) { header = Object.fromEntries(r.map((h, i) => [h, i])); continue; }
      const c = r[header.CODICE_COMUNE];
      if (ANNCSU_REGION[c] !== region || !out.has(c) || !r[header.COORD_X_COMUNE]) continue;
      out.get(c).push({ via: r[header.ODONIMO], civ: r[header.CIVICO], xy: [num(r[header.COORD_X_COMUNE]), num(r[header.COORD_Y_COMUNE])] });
    }
    if (!header) throw new Error(`${zip}: archivio vuoto o illeggibile`);
  }
  if (out.has('L219')) {
    console.log('  civici Torino…');
    await download(TORINO, 'data/civici_torino.csv');
    const rows = fs.readFileSync('data/civici_torino.csv', 'latin1').split(/\r?\n/).slice(1);
    for (const l of rows) {
      const r = l.split(';');   // COD_CIVICO;COMUNE;VIA;CIVICO;CIRCOSCRIZIONE;CAP;COORDINATA_X;COORDINATA_Y
      if (r[6]) out.get('L219').push({ via: r[2], civ: r[3], xy: [num(r[6]), num(r[7])] });
    }
  }
  if (out.has('A662')) {
    console.log('  civici Bari (shapefile UTM33N → WGS84 con ogr2ogr)…');
    await download(BARI, 'data/civici_bari.zip');
    try {
      execFileSync('ogr2ogr', ['-f', 'CSV', '-t_srs', 'EPSG:4326', '-lco', 'GEOMETRY=AS_XY', '-select', 'denom_via,numero',
                               'data/civici_bari.csv', '/vsizip/data/civici_bari.zip'], { stdio: 'inherit' });
      const rows = fs.readFileSync('data/civici_bari.csv', 'utf8').split(/\r?\n/).slice(1);
      for (const l of rows) {
        const m = l.match(/^([-\d.]+),([-\d.]+),"?(.*?)"?,(\d*)$/);   // X,Y,denom_via,numero
        if (m && m[4]) out.get('A662').push({ via: m[3], civ: m[4], xy: [+m[1], +m[2]] });
      }
    } catch (e) {
      console.warn(`  Bari saltata: ogr2ogr (GDAL) non disponibile o fallito — ${e.message}`);
      complete = false;
    } finally { fs.rmSync('data/civici_bari.csv', { force: true }); }
  }
  if (complete) fs.writeFileSync(cache, JSON.stringify(Object.fromEntries(out)));
  return out;
}

// Indice per comune: civico → [{via normalizzata, tokens, xy}]
export async function loadCivici(codes, norm) {
  const raw = await loadRaw(codes);
  const idx = new Map();
  for (const [code, list] of raw) {
    const byCiv = new Map();
    for (const { via, civ, xy } of list) {
      const n = (String(civ).match(/\d+/) || [''])[0], v = norm(via);
      if (!n || !v) continue;
      (byCiv.get(n) ?? byCiv.set(n, []).get(n)).push({ via: v, tokens: v.split(' '), xy });
    }
    idx.set(code, byCiv);
    console.log(`  civici ${code}: ${list.length}`);
  }
  return idx;
}

// Somiglianza tra la via della scuola e quella del civico: parole uguali, o iniziale puntata ("A" ↔ "ARTURO").
// Serve l'ultima parola uguale (di solito il cognome o il nome proprio della via).
function viaScore(school, civ) {
  const s = school.split(' ');
  if (s.at(-1) !== civ.tokens.at(-1)) return 0;
  if (school === civ.via) return 100;
  return s.filter(t => civ.tokens.some(c => c === t || (t.length === 1 && c[0] === t))).length
       - 0.1 * Math.abs(civ.tokens.length - s.length);
}

// addrs: [{via (normalizzata), civ}] → {xy, via, ambiguo} | null
export function matchCivico(byCiv, addrs) {
  for (const a of addrs) {
    const cand = a.civ && byCiv?.get(a.civ);
    if (!cand) continue;
    const scored = cand.map(c => ({ c, s: viaScore(a.via, c) })).filter(x => x.s > 0).sort((x, y) => y.s - x.s);
    if (!scored.length) continue;
    const best = scored[0];
    // due vie diverse con lo stesso punteggio (es. "VIA ROMA" / "PIAZZA ROMA" dopo la normalizzazione)
    const ambiguo = scored.some(x => x.s === best.s && x.c.via !== best.c.via);
    return { xy: best.c.xy, via: best.c.via, esatto: best.s === 100, ambiguo };
  }
  return null;
}

// Nominatim (max 1 richiesta/s da policy OSMF), con cache su disco; solo risultati con numero civico.
const NOMI_CACHE = 'data/nominatim.json';
const nomiCache = fs.existsSync(NOMI_CACHE) ? JSON.parse(fs.readFileSync(NOMI_CACHE, 'utf8')) : {};
let lastCall = 0;
export async function nominatim(street, city) {
  const key = `${street}|${city}`;
  if (!(key in nomiCache)) {
    await new Promise(r => setTimeout(r, Math.max(0, lastCall + 1100 - Date.now())));
    lastCall = Date.now();
    const u = new URL('https://nominatim.openstreetmap.org/search');
    Object.entries({ street, city, countrycodes: 'it', format: 'jsonv2', addressdetails: 1, limit: 1 })
      .forEach(([k, v]) => u.searchParams.set(k, v));
    let r;
    try {
      const res = await fetch(u, { headers: UA });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      [r] = await res.json();
    } catch (e) { console.warn(`  Nominatim ${e.message} per "${key}"`); return null; }   // non in cache: si riprova al prossimo run
    nomiCache[key] = r?.address?.house_number ? [+r.lon, +r.lat] : null;
    fs.writeFileSync(NOMI_CACHE, JSON.stringify(nomiCache));
  }
  return nomiCache[key];
}
