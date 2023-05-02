# ItaliaDomani - dati da ReGIS

Una mappa configurabile per visualizzare l'impatto territoriale dei progetti PNRR

Fonte: <a href="https://www.italiadomani.gov.it/content/sogei-ng/it/it/catalogo-open-data.html?orderby=%40jcr%3Acontent%2FobservationDateInEvidence&sort=desc" target="_blank">ItaliaDomani - Open Data PNRR</a>  

<iframe id="map" width="1024px" height="840" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="http://localhost/ixmaps/deploy/rc-exp/ixmaps/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22misura%22%20=%20%22Creazione%20di%20imprese%20femminili%22">


La mappa sopra è un esempio come includere la visualizzazione PNRR configurabile in un documento. 
Qui il codice per includere la mappa in una pagina HTML:

```javascript
<iframe id="map" width="1024px" height="840" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="http://localhost/ixmaps/deploy/rc-exp/ixmaps/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22misura%22%20=%20%22Creazione%20di%20imprese%20femminili%22">
```



## come configurare la mappa

Il  link principale alla pagina HTML con la mappa è: 

http://localhost/ixmaps/deploy/rc-exp/ixmaps/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html

poi si può aggiungere un filtro sui campi del dataset e una posizione per la mappa.

### filtri

I filtri possono essere definiti simile al linguaggio SQL:

- WHERE "campo" = "valore" o 
- WHERE "campo" like "valore"

esempio:

-  filter=WHERE%20%22misura%22%20=%20%22Creazione%20di%20imprese%20femminili%22

filtri possono comprendere più di un campo:

- WHERE "campo1" = "valore1" AND "campo2" = "valore2"



Alcuni esempi:

[]()

[http://localhost/ixmaps/deploy/rc-exp/ixmaps/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22categoria%22%20=%20%22PISTE%20CICLABILI%22%20AND%20%22Descrizione%20Regione%22%20=%20%22SICILIA%22&view=[37.45087706042972,14.018554687500002],9](http://localhost/ixmaps/deploy/rc-exp/ixmaps/pages/PNRR/index_embed_Open_Data_PNRR_Dati_Universo_REGIS_III.html?filter=WHERE%20%22categoria%22%20=%20%22PISTE%20CICLABILI%22%20AND%20%22Descrizione%20Regione%22%20=%20%22SICILIA%22&view=[37.45087706042972,14.018554687500002],9)

il progetto (json) per la mappa si trova  <a href="https://github.com/gjrichter/viz/blob/master/Amministratori/ixmaps_project_ammcom_pointer_diff.json" target="_blank">qui</a>, 

