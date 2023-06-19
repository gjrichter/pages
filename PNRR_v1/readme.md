# ItaliaDomani - dati da ReGIS- v1 

Una mappa configurabile per visualizzare l'impatto territoriale dei progetti PNRR

Questa mappa visualizza i dati del Universo REGIS alla **data di osservazione del 06.03.2023**.
Per una mappa basata su dati aggiornati all'ultima data di osservazione si prega di vedere [qui](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html).



### link alla mappa (versione 1 - 06.03.2023)

Il  link principale alla pagina HTML con la mappa è: 

[https://gjrichter.github.io/pages/PNRR_v1/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html](https://gjrichter.github.io/pages/PNRR_v1/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html)

alla URL sopra poi si può aggiungere un filtro sui campi del dataset e una posizione per la mappa per produrre mappe con interessi particolarizzate. 

##### Esempio

Fonte: <a href="https://www.italiadomani.gov.it/content/sogei-ng/it/it/catalogo-open-data.html?orderby=%40jcr%3Acontent%2FobservationDateInEvidence&sort=desc" target="_blank">ItaliaDomani - Open Data PNRR</a>  

<iframe id="map" width="1024px" height="840" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE%20%22Descrizione%20Misura%22%20=%20%22Creazione%20di%20imprese%20femminili%22&scale=10"></iframe>


La mappa sopra è un esempio come includere la visualizzazione PNRR configurabile in un documento. 
Qui il codice per includere la mappa in una pagina HTML:

```javascript
<iframe id="map" width="1024px" height="840" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE%20%22Descrizione%20Misura%22%20=%20%22Creazione%20di%20imprese%20femminili%22&scale=10"></iframe>
```



## come configurare la mappa

Il  link principale alla pagina HTML con la mappa è: 

[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html)

poi si può aggiungere un filtro sui campi del dataset e una posizione per la mappa.

### filtri

I filtri possono essere definiti simile al linguaggio SQL:

- WHERE "campo" = "valore" o 
- WHERE "campo" like "valore"

esempio:

-  filter=WHERE "Descrizione Misura" = "Creazione di imprese femminili"

filtri possono comprendere più di un campo:

- WHERE "campo1" = "valore1" AND "campo2" = "valore2"

I campi utilizzabili per definire filtri sono:

```
Codice Univoco submisura
Descrizione Submisura
CUP
Codice Locale Progetto
Descrizione Regione
Descrizione Provincia
Descrizione Comune
Indirizzo
CAP
Data di Estrazione
missione
Descrizione Misura
CUP Descrizione Categoria
CUP Descrizione Settore
PROCOM
importo
Sintesi progetto
Soggetto attuatore
Denominazione Aggiudicatario
```



Alcuni esempi:

[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE "CUP Descrizione Categoria" = "PISTE CICLABILI" AND "Descrizione Regione" = "SICILIA"&view=[37.45087706042972,14.018554687500002],9](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE%20%22CUP%20Descrizione%20Categoria%22%20=%20%22PISTE%20CICLABILI%22%20AND%20%22Descrizione%20Regione%22%20=%20%22SICILIA%22&view=[37.45087706042972,14.018554687500002],9)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE "Descrizione Misura" = "Creazione di imprese femminili"](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE%20%22Descrizione%20Misura%22%20=%20%22Creazione%20di%20imprese%20femminili%22)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE "Descrizione Misura" = "Green communities"](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE%20%22Descrizione%20Misura%22%20=%20%22Green%20communities%22)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE "Descrizione Misura" = "Investimenti in infrastrutture idriche primarie per la sicurezza del l'approvvigionamento idrico"](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE%20"Descrizione%20Misura"%20=%20"Investimenti%20in%20infrastrutture%20idriche%20primarie%20per%20la%20sicurezza%20dell%27approvvigionamento%20idrico")



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE "Soggetto attuatore" = "DIPARTIMENTO PER LE POLITICHE GIOVANILI" AND "Descrizione Regione" = "SICILIA"&view=[37.45087706042972,14.018554687500002],9](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE%20"Soggetto%20attuatore"%20=%20"DIPARTIMENTO%20PER%20LE%20POLITICHE%20GIOVANILI"%20AND%20"Descrizione%20Regione"%20=%20"SICILIA"&view=[37.45087706042972,14.018554687500002],9)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE "Soggetto attuatore" = "FONDO EDIFICI DI CULTO"](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE%20%22Soggetto%20attuatore%22%20=%20%22FONDO%20EDIFICI%20DI%20CULTO%22)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE "Soggetto attuatore" like "METROPOLITANA"&view=[42.374778361114195,13.568115234375002],6](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS.html?filter=WHERE%20%22Soggetto%20attuatore%22%20like%20%22METROPOLITANA%22&view=[42.374778361114195,13.568115234375002],6)



## altre mappe PNRR Regis

Una mappa con tutti importi delle gare: 

[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_gare.html](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_gare.html)

Una mappa con solo importi aggiudicati:

[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_aggiudicate.html](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_aggiudicate.html)

Una mappa con tutti i finanziamenti e  lo stato di avanzamento:

[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_avanzamento.html](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_avanzamento.html)


