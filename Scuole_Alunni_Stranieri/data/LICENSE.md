# Licenza dei dati

I file CSV di questa cartella (`scuole_12citta.csv`, `non_geolocalizzate.csv`, `report_citta.csv`) sono un database derivato che contiene anche coordinate ricavate da OpenStreetMap. Per questo sono distribuiti con la stessa licenza di OpenStreetMap.

**This database is made available under the [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/). Any rights in individual contents of the database are licensed under the [Database Contents License (DbCL) v1.0](https://opendatacommons.org/licenses/dbcl/1-0/).**

In breve, l'ODbL permette di usare, copiare, distribuire e modificare i dati, anche per usi commerciali, a tre condizioni:

- **Attribuzione:** citare le fonti elencate sotto.
- **Condivisione allo stesso modo:** un database derivato pubblicato va distribuito con licenza ODbL.
- **Accesso aperto:** chi distribuisce il database con misure tecniche di restrizione deve renderne disponibile anche una versione senza restrizioni.

Il testo completo della licenza è quello vincolante.

## Attribuzione richiesta

> Dati: © OpenStreetMap contributors (ODbL); MIM – Ministero dell'Istruzione e del Merito, Agenzia delle Entrate (ANNCSU), Comune di Torino, Comune di Bari, openpolis (CC BY 4.0); MEF, beni immobili pubblici. Elaborazione: gjrichter/pages – Scuole_Alunni_Stranieri.

| Fonte | Licenza originale | Parte dei dati |
|---|---|---|
| © OpenStreetMap contributors | ODbL 1.0 | coordinate con `fonte` = `osm_plesso`, `osm_istituto`, `nominatim` |
| MIM open data | CC BY 4.0 | anagrafe, alunni per cittadinanza, percorsi, indirizzi degli edifici |
| ANNCSU, Agenzia delle Entrate | CC BY 4.0 | coordinate con `fonte` = `civico` (10 città) |
| Comune di Torino, Comune di Bari | CC BY 4.0 | coordinate con `fonte` = `civico` (Torino, Bari) |
| MEF, beni immobili pubblici | open data MEF | coordinate con `fonte` = `fgb_*` |
| openpolis/geojson-italy | CC BY 4.0 | confini comunali, usati solo per il controllo |

Le fonti CC BY 4.0 permettono la ridistribuzione con altra licenza purché siano attribuite: l'attribuzione sopra resta quindi obbligatoria anche sotto ODbL.
