# Alunni stranieri per scuola — 12 grandi città

**Mappa:** https://gjrichter.github.io/pages/Scuole_Alunni_Stranieri/

Percentuale di alunni con cittadinanza non italiana in ogni plesso scolastico (statale e paritario, primaria e secondaria) di Roma, Milano, Napoli, Torino, Palermo, Genova, Bologna, Firenze, Bari, Catania, Venezia e Verona, anno scolastico **2024/25**. Mappa realizzata con [ixMaps](https://github.com/gjrichter/ixmaps-flat).

| Codifica | Significato |
|---|---|
| Colore | % alunni stranieri, 5 classi: < 5% · 5–10% · 10–20% · 20–35% · ≥ 35% (media nazionale 12%) |
| Forma | Tipo di scuola: ● primaria · ■ secondaria di I grado · ▼ liceo · ◆ tecnico o professionale |
| Dimensione | Numero di alunni del plesso |

Controlli: selettore **Città** (ordinato per % complessiva) e filtro **Tipo di scuola**. La legenda ricalcola i conteggi per classe sull'area visibile e sul filtro attivo; cliccando una classe la si isola sulla mappa. Il tooltip mostra scuola, tipo, gestione, % e numeri assoluti, e la fonte delle coordinate.

## Risultati principali

| Città | % stranieri | | Tipo di scuola | % stranieri |
|---|---|---|---|---|
| Venezia | 21,7 | | Primaria | 17,4 |
| Torino | 21,5 | | Tecnico o professionale | 16,4 |
| Milano | 21,2 | | Secondaria di I grado | 15,7 |
| Bologna | 19,3 | | Liceo | **6,3** |
| Genova | 18,5 | | | |
| Firenze | 17,4 | | | |
| Verona | 17,1 | | | |
| Roma | 12,4 | | | |
| Bari | 4,4 | | | |
| Napoli | 4,3 | | | |
| Palermo | 3,9 | | | |
| Catania | 3,8 | | | |

Percentuali calcolate sulle scuole mappate (stranieri / alunni). Nei licei la quota di stranieri è circa un terzo di quella degli altri tipi di scuola; nelle città del Nord le quote più alte si concentrano in periferia.

## File

| File | Contenuto |
|---|---|
| [`index.html`](index.html) | la mappa, con i dati incorporati |
| [`data/scuole_12citta.csv`](data/scuole_12citta.csv) | anagrafe geolocalizzata: 6.305 scuole (statali e paritarie, compresa l'infanzia), 5.850 con coordinate |
| [`data/non_geolocalizzate.csv`](data/non_geolocalizzate.csv) | le 455 scuole senza coordinate |
| [`data/report_citta.csv`](data/report_citta.csv) | statistiche per città: scuole per livello di geolocalizzazione, copertura, controlli OSM ↔ FGB e OSM ↔ civici |
| [`data/LICENSE.md`](data/LICENSE.md) | licenza dei CSV (ODbL 1.0) e attribuzione da riportare |
| [`pipeline/`](pipeline/) | gli script che producono i CSV e la mappa (vedi [Riprodurre](#riprodurre)), licenza [MIT](pipeline/LICENSE) |

### Colonne di `scuole_12citta.csv`

| Colonna | Significato |
|---|---|
| `codice_scuola`, `codice_istituto` | codice MIM del plesso e dell'istituto di riferimento (vuoto per le paritarie) |
| `gestione` | `statale` / `paritaria` |
| `denominazione`, `grado`, `indirizzo`, `cap` | dall'anagrafe MIM |
| `codice_comune`, `comune` | codice catastale (Belfiore) e nome del comune |
| `lon`, `lat` | coordinate WGS84 (vuote se non geolocalizzata) |
| `fonte` | livello della cascata che ha dato le coordinate (vedi sotto) |
| `codice_edificio` | codice edificio MIM dell'indirizzo che ha trovato un match nell'FGB (anche se poi le coordinate vengono da un'altra fonte) |
| `id_bene` | id dell'immobile nel dataset beni pubblici, se `fonte` = `fgb_*` |
| `osm_id` | elemento OSM (`node/…`, `way/…`), se `fonte` = `osm_*` |
| `alunni`, `stranieri`, `stranieri_ue`, `stranieri_nonue` | alunni totali e con cittadinanza non italiana (UE / non UE), tutti gli anni di corso; vuoti per l'infanzia |
| `pct_stranieri` | stranieri / alunni × 100 |
| `percorso_prevalente`, `quota_percorso` | solo II grado: LICEO / TECNICO / PROFESSIONALE prevalente e quota dei suoi studenti |
| `flag` | `ambiguo`, `conflitto_osm_fgb`, `fuori_comune`, `pochi_alunni` (separati da `;`) |

## Il problema

L'anagrafe delle scuole del Ministero dell'Istruzione e del Merito (MIM) **non ha coordinate**, e nemmeno il dataset MIM "Elenco e localizzazione degli edifici scolastici attivi", che nonostante il nome contiene solo indirizzi. Per mappare le scuole bisogna geolocalizzarle. Qui si combinano più fonti in cascata, dalla più affidabile, e si misura la precisione di ciascuna.

## Fonti

### Dati sulle scuole (MIM open data, [dati.istruzione.it](https://dati.istruzione.it/opendata/))

| Dataset | File | Uso |
|---|---|---|
| Anagrafe scuole statali | `SCUANAGRAFESTAT20242520240901.csv` | elenco dei plessi (`SEDESCOLASTICA = SI`), indirizzo, codice comune |
| Anagrafe scuole paritarie | `SCUANAGRAFEPAR20242520240901.csv` | elenco delle paritarie |
| Studenti per cittadinanza, statali | `ALUITASTRACITSTA20242520250831.csv` | alunni e stranieri per `CODICESCUOLA` e anno di corso |
| Studenti per cittadinanza, paritarie | `ALUITASTRACITPAR20242520250831.csv` | idem |
| Edifici scolastici statali | `EDIANAGRAFESTA202120242520250806.csv` | indirizzo strutturato (via e civico separati) per scuola ed edificio |
| Studenti di II grado per indirizzo, statali | `ALUSECGRADOINDSTA20242520250831.csv` | percorso LICEO / TECNICO / PROFESSIONALE |
| Studenti di II grado per indirizzo, paritarie | `ALUSECGRADOINDPAR20242520250831.csv` | idem |

Tutti i dataset sono dello **stesso anno scolastico (2024/25)**. È necessario: con il dimensionamento scolastico molti codici cambiano da un anno all'altro (2.424 codici del file cittadinanza 2024/25 non esistono più nell'anagrafe 2026/27).

### Coordinate

| Fonte | Contenuto | Licenza |
|---|---|---|
| [OpenStreetMap](https://www.openstreetmap.org) via Overpass (`overpass.openstreetmap.fr`) | scuole (`amenity=school/kindergarten/college`) con codice MIM nei tag `ref`, `operator:ref`, `ref:miur` | ODbL |
| Beni immobili pubblici (MEF), [FlatGeobuf](https://ixmaps-data.s3.amazonaws.com/TestData/beni_immobili_pubblici.fgb) | 2,83 milioni di immobili pubblici georeferenziati, con indirizzo e codice catastale del comune | open data MEF |
| [ANNCSU](https://www.dati.gov.it/view-dataset/dataset?id=6e5632b2-5652-42e5-9177-745e1110d641) (Agenzia delle Entrate) | Archivio nazionale dei numeri civici e delle strade urbane, indirizzari regionali con coordinate | CC BY 4.0 |
| [Comune di Torino](https://www.dati.gov.it/view-dataset/dataset?id=30ca3c4a-1979-4fe0-97f3-d05d16bc6d26) | numerazione civica georeferenziata (WGS84) | CC BY 4.0 |
| [Comune di Bari](https://www.dati.gov.it/view-dataset/dataset?id=da2b0e0f-e913-4944-9062-d23aeef7a6c5) | civilario unico comunale (shapefile UTM 33N) | CC BY 4.0 |
| [Nominatim](https://nominatim.openstreetmap.org) | geocoding degli indirizzi rimasti, 1 richiesta/s | ODbL |
| [openpolis/geojson-italy](https://github.com/openpolis/geojson-italy) | confini comunali per il controllo point-in-polygon | CC BY 4.0 |

ANNCSU ha coordinate per il 99–100% dei civici in 10 città su 12, ma **nessuna per Torino e quasi nessuna per Bari** (verificato a settembre 2026): per queste due si usano i civici pubblicati dai comuni.

## Processo di acquisizione e geolocalizzazione

### 1. Base scuole

- Plessi statali (`SEDESCOLASTICA = SI`, cioè sedi fisiche e non sedi di direzione) e tutte le paritarie dei 12 comuni, selezionati per **codice catastale (Belfiore)**, lo stesso codice usato da MIM, FGB e ANNCSU.
- Join esatto su `CODICESCUOLA` con i dati di cittadinanza, sommando tutti gli anni di corso.
- Per la secondaria di II grado, tipo di scuola dal **percorso prevalente** per numero di studenti (`TIPOPERCORSO`: LICEO / TECNICO / PROFESSIONALE, con IeFP contato come professionale). Copre tutte le 990 scuole di II grado della mappa; le 59 che hanno più percorsi sono classificate per quello prevalente. I nomi delle scuole non bastano: molte paritarie hanno nomi propri ("MAGNUM", "PIO XII") che non dicono l'indirizzo.

### 2. Coordinate a cascata

Per ogni scuola si prova ogni fonte in quest'ordine e ci si ferma alla prima che risponde. La colonna `fonte` registra quale.

| Livello | Metodo | Scuole |
|---|---|---|
| `osm_plesso` | codice MIM del plesso trovato in un tag OSM: match esatto | 275 |
| `fgb_civico` | FGB beni pubblici: via normalizzata + numero civico | 1.588 |
| `fgb_cognome` | FGB: ultima parola della via + civico (tollera "VIA A. GRAF" ↔ "Via Arturo Graf") | 915 |
| `civico` | civici georeferenziati (ANNCSU, Torino, Bari): stesso civico, stessa ultima parola della via, poi punteggio sulle altre parole con le iniziali puntate | 2.839 |
| `nominatim` | Nominatim, accettato solo se il risultato contiene il numero civico | 54 |
| `osm_istituto` | codice dell'istituto di riferimento in OSM: sede dell'istituto, non del plesso (approssimato) | 45 |
| `fgb_via` | FGB: sola via, punto "da qualche parte sulla via" (approssimato) | 134 |
| `nessuna` | nessuna fonte | 455 |

Dettagli del matching per indirizzo:

- **Normalizzazione:** maiuscole, rimozione di accenti e punteggiatura, rimozione del prefisso toponomastico (VIA, VIALE, PIAZZA, LARGO, CORSO, LUNGOTEVERE, CALLE, FONDAMENTA…).
- **Indirizzi MIM in testo libero:** gestione di civici attaccati (`VIA GIUSTI15`), `N. 34`, intervalli (`12/14`) e doppi indirizzi (`…PERONI8(ORD.)-VIA CRESCENZAGO110(SUCC)`, si usa il primo).
- **Più indirizzi per scuola:** si provano prima quelli strutturati del dataset edifici MIM, poi l'indirizzo dell'anagrafe.
- **FGB:** letto per bounding box tramite l'indice spaziale (non si scaricano i 2,2 GB), senza filtrare per tipologia d'uso. La classificazione degli immobili non è affidabile (un edificio scolastico può risultare "laboratori scientifici"): la tipologia serve solo a scegliere tra più candidati, preferendo edifici scolastici e punti georeferenziati al civico o da identificativi catastali.
- **Filtrare l'FGB per tipologia prima del join è controproducente:** a Milano, via + civico sui soli edifici "scolastici" abbina il 9% dei plessi; su tutti gli immobili il 26%.

### 3. Controlli di qualità

- **Point-in-polygon** sul confine del comune: i punti fuori comune vengono scartati (17).
- **Affidabilità del join per indirizzo**, misurata sulle scuole che hanno anche il codice esatto in OSM:
  - FGB entro 200 m da OSM: **89%** (175 su 197);
  - civici entro 200 m da OSM: **89%** (230 su 258).
- **Flag per scuola** (colonna `flag`):
  - `ambiguo`: più vie diverse con lo stesso punteggio, o candidati FGB dispersi oltre 300 m;
  - `conflitto_osm_fgb`: OSM e FGB distano più di 200 m;
  - `fuori_comune`: il punto cade fuori dal comune ed è stato scartato;
  - `pochi_alunni`: meno di 20 alunni.

### Copertura

| Città | Scuole | Con coordinate | Scuole con dati alunni | …di cui con coordinate |
|---|---|---|---|---|
| Roma | 1.833 | 1.717 | 1.083 | 96,2% |
| Milano | 800 | 754 | 514 | 95,7% |
| Napoli | 723 | 607 | 409 | 85,1% |
| Torino | 503 | 493 | 295 | 99,3% |
| Palermo | 592 | 522 | 302 | 91,7% |
| Genova | 389 | 381 | 225 | 98,2% |
| Bologna | 276 | 257 | 142 | 97,2% |
| Firenze | 274 | 265 | 167 | 96,4% |
| Bari | 208 | 173 | 112 | 85,7% |
| Catania | 284 | 271 | 169 | 95,9% |
| Venezia | 189 | 181 | 115 | 96,5% |
| Verona | 234 | 229 | 147 | 98,6% |
| **Totale** | **6.305** | **5.850 (93%)** | | |

"Scuole con dati alunni" esclude l'infanzia, per cui il MIM non pubblica la cittadinanza per singola scuola.

### 4. Mappa

La mappa mostra le 3.438 scuole con coordinate, dati di cittadinanza e almeno 20 alunni. I dati sono incorporati nella pagina (nessuna richiesta esterna per i dati).

- **Palette:** blu a un solo tono, 5 classi, verificata per monotonia di luminosità e distanza tra classi adiacenti. Con 6 classi i passi scuri non restavano distinguibili.
- **Motore:** tema ixMaps `CHART|SYMBOL|CATEGORICAL|NOSORT`, con colore dalla classe di %, dimensione dal numero di alunni (`binding.size`) e forma dal tipo di scuola (`symbolfield` / `symbolvalues` / `symbols`).
- **Filtro per tipo:** `changeThemeStyle` con `filter:WHERE "tipo" == "…"`.

## Riprodurre

Requisiti: Node.js 18 o superiore, `unzip` e, per i civici di Bari, `ogr2ogr` (GDAL). Senza GDAL Bari viene saltata con un avviso e ritentata al run successivo.

```bash
cd pipeline
npm install
node build.mjs      # scarica le fonti, geolocalizza → out/scuole_12citta.csv, non_geolocalizzate.csv, report_citta.csv
node make_map.mjs   # → out/mappa_stranieri.html (da map_template.html)
```

| Script | Ruolo |
|---|---|
| `build.mjs` | dati MIM, join cittadinanza e percorsi, lettura FGB per bbox, Overpass, cascata delle coordinate, controlli, report |
| `civici.mjs` | carica ANNCSU e i civici di Torino e Bari, matching via + civico, Nominatim con cache |
| `make_map.mjs` | filtra le scuole mappabili, calcola classi e tipo di scuola, genera la pagina da `map_template.html` |

- **Tempi:** il primo run scarica circa 300 MB in `pipeline/data/` (soprattutto gli indirizzari ANNCSU) e interroga Nominatim a 1 richiesta al secondo: circa 10–15 minuti. I run successivi usano la cache e durano 1–2 minuti.
- **`--no-nominatim`:** salta Nominatim, ma ignora anche i risultati già in cache. Usalo solo per prove veloci.
- **Aggiornare le fonti:** i download restano in cache in `pipeline/data/`. Per riscaricare una fonte, cancellane il file. Per ANNCSU, che è aggiornato ogni mese, cancella anche `data/civici_12citta.json`.
- **Cambiare anno scolastico:** aggiorna i nomi dei file MIM in `SRC` in `build.mjs`. L'anagrafe, la cittadinanza e i percorsi devono essere dello stesso anno.

## Limiti

- **La scuola non è la residenza degli alunni.** Soprattutto per le superiori, che hanno bacini ampi, una % alta dice chi frequenta quella scuola, non chi abita nel quartiere.
- **L'infanzia è esclusa.** Il MIM non pubblica la cittadinanza per singola scuola dell'infanzia, e molte scuole d'infanzia sono comunali.
- **Plessi piccoli:** sotto i 20 alunni la % è troppo instabile, quindi sono esclusi dalla mappa.
- **Coordinate approssimate:** i livelli `osm_istituto` (sede dell'istituto) e `fgb_via` (solo via), 179 scuole in tutto, sono indicativi.
- **455 scuole senza coordinate:** più della metà a Roma, Napoli e Palermo.
- **Cittadinanza ≠ origine:** "stranieri" indica la cittadinanza non italiana, non il luogo di nascita. Molti alunni stranieri sono nati in Italia.

## Licenze e attribuzioni

- **I CSV in `data/` sono distribuiti con licenza [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)** (i singoli contenuti sotto [DbCL 1.0](https://opendatacommons.org/licenses/dbcl/1-0/)). La ragione è che contengono coordinate ricavate da OpenStreetMap: circa 370 righe con `fonte` = `osm_plesso`, `osm_istituto` o `nominatim`. Condizioni e attribuzione da riportare sono in [`data/LICENSE.md`](data/LICENSE.md).
- **Fonti originali:** dati MIM, ANNCSU, Comune di Torino, Comune di Bari e openpolis sono CC BY 4.0; beni immobili pubblici: open data MEF. Le coordinate OSM e Nominatim sono © OpenStreetMap contributors, ODbL.
- **Codice della pipeline** (`pipeline/`): licenza [MIT](pipeline/LICENSE). La licenza MIT copre solo il codice; i dati che la pipeline scarica restano sotto le licenze delle rispettive fonti.
- **Mappa di base:** © MapTiler © OpenStreetMap contributors.
