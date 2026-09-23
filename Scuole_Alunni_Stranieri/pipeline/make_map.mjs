// Genera out/mappa_stranieri.html (ixMaps) da out/scuole_12citta.csv, con i dati incorporati nella pagina
// (si apre anche da file://). Uso: node make_map.mjs   (dopo node build.mjs)

import fs from 'node:fs';
import Papa from 'papaparse';

const MIN_ALUNNI = 20;   // stessa soglia del flag `pochi_alunni` in build.mjs
// classi ordinali; palette blu a un solo tono validata (dataviz validate_palette --ordinal)
const CLASSES = [
  { max: 5,        label: 'meno del 5%', color: '#86b6ef' },
  { max: 10,       label: '5–10%',       color: '#5598e7' },
  { max: 20,       label: '10–20%',      color: '#2a78d6' },
  { max: 35,       label: '20–35%',      color: '#1c5cab' },
  { max: Infinity, label: '35% e oltre', color: '#0d366b' },
];
// tipo di scuola → simbolo (nomi built-in del motore: circle, square, triangle, diamond, cross, hexagon)
// II grado: percorso prevalente MIM (build.mjs → percorso_prevalente); il nome solo se il percorso manca
const TYPES = [
  { label: 'Primaria',                symbol: 'circle',   test: r => /PRIMARIA/.test(r.grado) },
  { label: 'Secondaria di I grado',   symbol: 'square',   test: r => /PRIMO GRADO/.test(r.grado) },
  { label: 'Liceo',                   symbol: 'triangle', test: r => r.percorso_prevalente ? r.percorso_prevalente === 'LICEO'
                                                                                         : /LICE|MAGISTRAL/.test(r.grado) },
  { label: 'Tecnico o professionale', symbol: 'diamond',  test: () => true },
];

const rows = Papa.parse(fs.readFileSync('out/scuole_12citta.csv', 'utf8'), { header: true, skipEmptyLines: true }).data
  .filter(r => r.lat && r.alunni && +r.alunni >= MIN_ALUNNI);

const data = rows.map(r => ({
  lat: +r.lat, lon: +r.lon, n: r.denominazione, g: r.grado.toLowerCase(), gest: r.gestione, c: r.comune,
  a: +r.alunni, s: +r.stranieri, p: +r.pct_stranieri, fonte: r.fonte,
  classe: CLASSES.find(k => +r.pct_stranieri < k.max).label,
  tipo: TYPES.find(t => t.test(r)).label,
}));

// centro di ogni città = media delle scuole; % della città = stranieri / alunni sulle scuole mappate
const cities = {};
for (const d of data) {
  const c = cities[d.c] ??= { lat: 0, lon: 0, n: 0, a: 0, s: 0 };
  c.lat += d.lat; c.lon += d.lon; c.n++; c.a += d.a; c.s += d.s;
}
const cityList = Object.entries(cities)
  .map(([name, c]) => ({ name, lat: +(c.lat / c.n).toFixed(4), lng: +(c.lon / c.n).toFixed(4), n: c.n,
                         pct: +(100 * c.s / c.a).toFixed(1), zoom: name === 'Roma' ? 11 : 12 }))
  .sort((x, y) => y.pct - x.pct);

const html = fs.readFileSync('map_template.html', 'utf8')
  .replace('/*__DATA__*/null', JSON.stringify(data))
  .replace('/*__CITIES__*/null', JSON.stringify(cityList))
  .replace('/*__CLASSES__*/null', JSON.stringify(CLASSES.map(({ label, color }) => ({ label, color }))))
  .replace('/*__TYPES__*/null', JSON.stringify(TYPES.map(({ label, symbol }) => ({ label, symbol }))));
fs.writeFileSync('out/mappa_stranieri.html', html);
console.log(`out/mappa_stranieri.html: ${data.length} scuole, ${(html.length / 1024).toFixed(0)} KB`);
console.table(cityList);
console.table(TYPES.map(t => ({ tipo: t.label, simbolo: t.symbol, scuole: data.filter(d => d.tipo === t.label).length })));
