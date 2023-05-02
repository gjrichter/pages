# ItaliaDomani - dati da ReGIS

Una mappa configurabile per visualizzare l'impatto territoriale dei progetti PNRR

Fonte: <a href="https://www.italiadomani.gov.it/content/sogei-ng/it/it/catalogo-open-data.html?orderby=%40jcr%3Acontent%2FobservationDateInEvidence&sort=desc" target="_blank">ItaliaDomani - Open Data PNRR</a>  

<iframe id="map" width="1024px" height="840" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22misura%22%20=%20%22Creazione%20di%20imprese%20femminili%22"></iframe>


La mappa sopra è un esempio come includere la visualizzazione PNRR configurabile in un documento. 
Qui il codice per includere la mappa in una pagina HTML:

```javascript
<iframe id="map" width="1024px" height="840" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22misura%22%20=%20%22Creazione%20di%20imprese%20femminili%22"></iframe>
```



## come configurare la mappa

Il  link principale alla pagina HTML con la mappa è: 

https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html

poi si può aggiungere un filtro sui campi del dataset e una posizione per la mappa.

### filtri

I filtri possono essere definiti simile al linguaggio SQL:

- WHERE "campo" = "valore" o 
- WHERE "campo" like "valore"

esempio:

-  filter=WHERE "misura" = "Creazione di imprese femminili"

filtri possono comprendere più di un campo:

- WHERE "campo1" = "valore1" AND "campo2" = "valore2"



Alcuni esempi:

[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE "categoria" = "PISTE CICLABILI" AND "Descrizione Regione" = "SICILIA"&view=[37.45087706042972,14.018554687500002],9](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22categoria%22%20=%20%22PISTE%20CICLABILI%22%20AND%20%22Descrizione%20Regione%22%20=%20%22SICILIA%22&view=[37.45087706042972,14.018554687500002],9)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE "misura" = "Creazione di imprese femminili"](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22misura%22%20=%20%22Creazione%20di%20imprese%20femminili%22)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE "misura" = "Green communities"](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22misura%22%20=%20%22Green%20communities%22)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE "misura" = "Investimenti in infrastrutture idriche primarie per la sicurezza del l'approvvigionamento idrico"](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20"misura"%20=%20"Investimenti%20in%20infrastrutture%20idriche%20primarie%20per%20la%20sicurezza%20dell%27approvvigionamento%20idrico")



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE "soggetto" = "DIPARTIMENTO PER LE POLITICHE GIOVANILI" AND "Descrizione Regione" = "SICILIA"&view=[37.45087706042972,14.018554687500002],9](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20"soggetto"%20=%20"DIPARTIMENTO%20PER%20LE%20POLITICHE%20GIOVANILI"%20AND%20"Descrizione%20Regione"%20=%20"SICILIA"&view=[37.45087706042972,14.018554687500002],9)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE "soggetto" = "FONDO EDIFICI DI CULTO"](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22soggetto%22%20=%20%22FONDO%20EDIFICI%20DI%20CULTO%22)



[https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE "soggetto" like "METROPOLITANA"&view=[42.374778361114195,13.568115234375002],6](https://gjrichter.github.io/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22soggetto%22%20like%20%22METROPOLITANA%22&view=[42.374778361114195,13.568115234375002],6)









il progetto (json) per la mappa si trova  <a href="https://github.com/gjrichter/viz/blob/master/Amministratori/ixmaps_project_ammcom_pointer_diff.json" target="_blank">qui</a>, 

