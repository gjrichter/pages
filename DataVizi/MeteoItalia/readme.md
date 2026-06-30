# WBGT — Stress Termico Italia

Mappa interattiva dell'Italia in tempo reale che mostra l'indice di stress da
calore **WBGT (Wet Bulb Globe Temperature, ISO 7243)**, costruita con ixMaps.

**Mappa live:** <https://gjrichter.github.io/stage/live/temperature_attuali_wbgt_kde.html>
**File:** `stage/live/temperature_attuali_wbgt_kde.html`

---

## Intento della mappa

L'obiettivo è andare oltre la semplice temperatura dell'aria e mostrare **come
cambia la pressione del caldo** sul corpo umano, mettendo a confronto sulla stessa
mappa diversi livelli di lettura della situazione termica:

- **Temperatura misurata** — il dato grezzo dell'aria, il punto di partenza.
- **Temperatura percepita (apparente)** — quanto caldo si *sente* davvero, perché
  umidità e vento modificano la sensazione rispetto al termometro.
- **WBGT (ISO 7243)** — un indice normato di **stress da calore** per ambienti
  outdoor (lavoro, sport), che pesa l'evaporazione (bulbo umido), la radiazione
  solare (temperatura del globo) e l'aria.
  (un grazie a Lorenza Perrone per il suo suggerimento di integrazione WBGT)

Passando da una modalità all'altra si vede **come la stessa giornata si trasforma**:
una temperatura moderata può nascondere uno stress elevato in presenza di alta
umidità e sole intenso, mentre aria secca e ventilata possono ridurre lo stress
reale anche con temperature alte. Confrontare *misurata → percepita/WBGT* rende
visibile questa differenza, che è ciò che conta per la salute delle persone.

**Target:** offrire una lettura immediata del rischio termico in Italia. I due
indici servono pubblici diversi:

- la **temperatura apparente** è orientata al **comfort e all'attività fisica**
  (sport, vita all'aperto, popolazione generale): risponde a "quanto sarà
  faticoso e sgradevole muoversi con questo caldo?";
- il **WBGT** è lo standard normato per la **sicurezza sul lavoro** (medicina del
  lavoro, cantieri, agricoltura, forze armate): risponde a "quando va ridotto o
  sospeso il lavoro all'aperto?", con soglie ufficiali di azione.

Avere entrambi sulla stessa mappa permette a ciascun pubblico di leggere la
situazione con l'indice giusto per il proprio scopo.

Tutti i modelli di stress sono calcolabili perché **MeteoHub serve tutti i valori
necessari** (temperatura, umidità, vento e radiazione solare) dalla stessa rete di
stazioni. Un'unica differenza pratica: il **WBGT ha meno punti** delle altre
modalità, perché la **radiazione solare è misurata solo da un sottoinsieme di
stazioni** — e senza quel dato la temperatura del globo non è calcolabile.

---

## Cosa mostra

All'apertura la mappa parte in modalità **WBGT**: ogni stazione è un grafico a
lollipop colorato secondo le fasce di rischio ISO 7243, sovrapposto a un campo
**KDE** (interpolazione spaziale) colorato con le stesse fasce. L'utente può
passare a tre altre modalità: Temperature misurate, Temperature percepite,
Umidità.

---

## Catena dati

I dati provengono dall'**API REST di MeteoHub** (Agenzia ItaliaMeteo —
`https://meteohub.agenziaitaliameteo.it/api/observations`), la piattaforma
meteorologica nazionale che aggrega oltre 4000 stazioni e 3 milioni di
osservazioni giornaliere. L'endpoint accetta una query sul `reftime` (timestamp
in **UTC**) e sul codice prodotto BUFR, restituendo le ultime osservazioni in JSON.

Una **GitHub Action** (`fetch-meteohub-data.yml`, repo `data`) interroga l'API
**ogni ora** filtrando esplicitamente la **licenza `CCBY_COMPLIANT`** (solo dati
ridistribuibili con attribuzione, CC-BY), con `reliabilityCheck=true` e `last=true`
per prendere il valore più recente e verificato di ciascuna stazione. Scarica
quattro variabili BUFR, le salva come file JSON nel repo `data` e li commit-pusha;
da lì sono servite via **CDN jsDelivr** (cache globale) e consumate dalla mappa
insieme a un `metadata.json` con l'ora dell'ultimo aggiornamento.

| Codice BUFR | Variabile | Uso |
|-------------|-----------|-----|
| `B12101` | Temperatura aria a 2 m | Ta |
| `B13003` | Umidità relativa a 2 m | RH → Tnw |
| `B11002` | Velocità vento a 10 m | v → Tg |
| `B14198` | Irradiazione solare (W/m²) | S → Tg |

La pipeline è completamente serverless: nessun backend, solo l'Action schedulata +
file statici su CDN.

---

## Calcolo della temperatura apparente

La temperatura apparente (AT) usa la formula semplificata **BOM/Steadman**, valida
sia per il caldo che per il freddo:

```
AT = Ta + 0.33·e − 0.70·v − 4
```

- **Ta** — temperatura dell'aria (°C)
- **v** — velocità del vento a 10 m (m/s)
- **e** — pressione di vapore (hPa), ricavata da temperatura e umidità relativa:

```
e = (RH / 100) · 6.105 · exp( 17.27·Ta / (237.7 + Ta) )
```

L'umidità (tramite `e`) **alza** la temperatura percepita, il vento la **abbassa**.
Bastano quindi temperatura, umidità e vento — variabili presenti in **quasi tutte**
le stazioni — quindi la modalità *Temperature percepite* copre molti più punti del
WBGT, che richiede in più la radiazione solare.

---

## Calcolo del WBGT

Per ogni stazione che dispone del dato di radiazione solare:

```
WBGT = 0.7·Tnw + 0.2·Tg + 0.1·Ta
```

- **Tnw** — bulbo umido naturale, formula di Stull (2011), accuratezza ±0.3 °C
- **Tg** — temperatura del globo, approssimazione di Liljegren: `Tg = T + 0.0146·S − 0.70·v`
- **Ta** — temperatura dell'aria secca

Le stazioni **senza dato solare** (necessario per Tg) non vengono calcolate →
circa **226 stazioni attive**. Questo è il motivo per cui il WBGT copre meno
stazioni della temperatura percepita.

### Filtri qualità

Prima del calcolo:

1. **Filtro outlier IQR globale** — `min = Q1 − 3·IQR`, `max = Q3 + 3·IQR`
2. **Filtro spaziale** — stazioni che si discostano di più di 8 °C dalla mediana
   delle vicine entro 80 km vengono escluse
3. **Umidità** — valori `> 105%` o `< 0%` scartati come errori di sensore

---

## Le quattro modalità

| Modalità | Variabile | KDE |
|----------|-----------|-----|
| Temperature misurate | temperatura aria | anomalie (campo rosso sopra la media) |
| Temperature percepite | temperatura apparente (BOM/Steadman) | anomalie |
| Umidità | umidità relativa, celle aggregate | nessuno |
| **WBGT** | stress termico ISO 7243 | fasce di rischio |

### KDE adattivo

- In modalità **WBGT** il KDE interpola i **valori assoluti** e li colora con le
  fasce di rischio ISO 7243.
- In **Misurate / Percepite** il KDE interpola le **anomalie** (deviazione % dalla
  media) con un campo rosso, ma con un **inviluppo a soglia assoluta** (vedi sotto).
- La legenda nel sidebar — etichetta, swatch colore e descrizione — **cambia
  automaticamente** con il tema attivo.
- In **Umidità** il blocco KDE viene nascosto (lì non c'è interpolazione).

### Inviluppo a soglia assoluta (KDE anomalie)

Il KDE delle anomalie normalizzava la deviazione dividendo per la media
(`(T − media) / |media| · 100`). Questo **amplificava** le anomalie a basse
temperature: una differenza di 3 °C valeva ~60% in inverno (media 5 °C) contro
~10% in estate (media 30 °C), facendo apparire rosso scuro anche senza calore reale.

Per mediare, il campo viene moltiplicato per un **inviluppo basato sulla temperatura
assoluta locale** interpolata:

```
env = clamp( (T_locale − T_LO) / (T_HI − T_LO), 0, 1 )   con T_LO = 24 °C, T_HI = 33 °C
valore_KDE = deviazione · env
```

- sotto **24 °C** l'inviluppo è 0 → la cella **non viene disegnata**
- sopra **33 °C** l'inviluppo è 1 → comportamento pieno
- in mezzo, intensità proporzionale al calore reale

Il rosso scuro richiede quindi **sia** un'anomalia positiva **sia** una temperatura
realmente alta. Esempi:

| Scenario | media → picco | deviazione | inviluppo | risultato |
|----------|---------------|-----------|-----------|-----------|
| Freddo | 5 → 8 °C | 60% | 0.00 | non disegnato |
| Mite | 22 → 27 °C | 23% | 0.33 | 7.6 (chiaro) |
| Caldo | 33 → 37 °C | 12% | 1.00 | 12 (moderato) |
| Afa | 30 → 40 °C | 33% | 1.00 | 33 (rosso scuro) |

Le soglie `KDE_T_LO` / `KDE_T_HI` sono costanti regolabili nel codice.

---

## Fasce di rischio ISO 7243

Colori del KDE in modalità WBGT:

| Colore | WBGT | Rischio |
|--------|------|---------|
| 🔵 `#4575b4` | &lt; 18 °C | nessun rischio |
| 🟢 `#66bd63` | 18–25 °C | rischio basso |
| 🟠 `#fdae61` | 25–28 °C | rischio moderato |
| 🔴 `#a50026` | 28–30 °C | rischio alto |
| 🟣 `#4d0026` | &gt; 30 °C | molto alto / pericoloso |

---

## WBGT vs Temperatura apparente

| | AT (BOM/Steadman) | WBGT (ISO 7243) |
|---|---|---|
| **Uso** | comfort percepito, bollettini | sicurezza lavoro / sport |
| **Radiazione solare** | no | sì (temperatura globo) |
| **Vento** | esplicito | implicito (bulbo umido) |
| **Umidità** | pressione vapore | bulbo umido |
| **Soglie normative** | no | sì |

Il WBGT può risultare **più basso** sia della temperatura apparente sia della
temperatura misurata: con aria secca e ventilata il bulbo umido scende molto
sotto l'aria secca, perché la sudorazione raffredda in modo efficiente. È questo
che lo rende l'indice corretto per valutare il rischio fisiologico (usato da
medici del lavoro, eserciti, comitati olimpici).

---

## Dettagli UI

- **Legenda WBGT dedicata** (TEXTLEGEND) con formula, variabili e fasce di rischio
- **Pannello statistiche mode-aware** — "WBGT medio", conteggio stazioni attive,
  stazioni escluse riportate come "senza dato solare" (non outlier)
- **Slider** opacità e smoothing del KDE; slider "evidenzia valori alti"
- **Popup informativo** con la spiegazione completa di WBGT, formula, filtri e
  fonti dati
- **Asset ixMaps** serviti via jsDelivr CDN

---

*Dati: MeteoHub — ItaliaMeteo (licenza CC-BY) · Visualizzazione: iXMaps / Data Viz Italia*
