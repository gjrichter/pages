/*********************************************************************
layer_compare.js

$Comment: provides JavaScript layer definitions for ixmaps
$Source : layer_compare.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: layer.js 8 2025-01-11 08:14:02Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: layer_compare.js,v $
**********************************************************************/


(function () {

    var regione = "R" + String(ixmaps.regione);
    var filter = "WHERE PROCOM like \"" + ixmaps.procom + "\" ";
    var filter_compare = "WHERE PROCOM.2 like \"" + ixmaps.procom + "\" AND P1.2 > 10 AND P1.1 > 10";

    //filter = "";
    // ------------------------------------------------------------------------
    // data query and processing 
    // ------------------------------------------------------------------------

    query_data = function (theme, options) {

        var broker = new Data.Broker()

            .addSource("https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2011/" + options.name + "_indicatori_2011_sezioni.csv.gz", "csv")
            .addSource("https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2021/" + options.name + "_indicatori_2021_sezioni.csv.gz", "csv")

            .realize(
                function (dataA) {

                    var data_2011 = dataA[0];
                    var data_2021 = dataA[1];

                    data_2011 = data_2011.select("WHERE SEZ2011 NOT 8888888");
                    data_2021 = data_2021.select("WHERE SEZ21_ID NOT 8888888");

                    var merger = new Data.Merger()
                        .addSource(data_2011, {
                            lookup: "SEZ2011"
                        })
                        .addSource(data_2021, {
                            lookup: "SEZ21_ID"
                        })
                        .realize(
                            function (mergedTable) {
                                ixmaps.setExternalData(mergedTable, {
                                    type: "dbtable",
                                    name: options.name
                                });
                            });
                });
    };

    query_data_procom = function (theme, options) {
        
        var broker = new Data.Broker()

            .addSource("https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2011/" + options.name.substr(0,3) + "_indicatori_2011_sezioni.csv.gz", "csv")
            .addSource("https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2021/" + options.name.substr(0,3) + "_indicatori_2021_sezioni.csv.gz", "csv")

            .realize(
                function (dataA) {

                    var data_2011 = dataA[0];
                    var data_2021 = dataA[1];

                    //data_2011 = data_2011.select("WHERE SEZ2011 NOT 8888888");
                    //data_2021 = data_2021.select("WHERE SEZ21_ID NOT 8888888");

                    data_2011 = data_2011.condense({
                        lead: "PROCOM",
                        keep: "PROCOM"
                    });
                    data_2021 = data_2021.condense({
                        lead: "PROCOM",
                        keep: "PROCOM"
                    });

                    console.log(data_2011);
                    console.log(data_2021);

                    var merger = new Data.Merger()
                        .addSource(data_2011, {
                            lookup: "PROCOM"
                        })
                        .addSource(data_2021, {
                            lookup: "PROCOM"
                        })
                        .realize(
                            function (mergedTable) {
                                //mergedTable = mergedTable.select("WHERE P1.2 > 0");
                                ixmaps.setExternalData(mergedTable, {
                                    type: "dbtable",
                                    name: options.name
                                });
                            });
                });
    };

     query_data_procom_all = function (theme, options) {
        
        var broker = new Data.Broker()

            .addSource("https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2011/all_indicatori_2011_procom.csv.gz", "csv")
            .addSource("https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2021/all_indicatori_2021_procom.csv.gz", "csv")

            .realize(
                function (dataA) {

                    var data_2011 = dataA[0];
                    var data_2021 = dataA[1];

                    //data_2011 = data_2011.select("WHERE SEZ2011 NOT 8888888");
                    //data_2021 = data_2021.select("WHERE SEZ21_ID NOT 8888888");

                    var merger = new Data.Merger()
                        .addSource(data_2011, {
                            lookup: "PROCOM"
                        })
                        .addSource(data_2021, {
                            lookup: "PROCOM"
                        })
                        .realize(
                            function (mergedTable) {
                                //mergedTable = mergedTable.select("WHERE P1.2 > 0");
                                ixmaps.setExternalData(mergedTable, {
                                    type: "dbtable",
                                    name: options.name
                                });
                            });
                });
    };
    
    process_data = function (data) {
        return data.select("WHERE SEZ21_ID NOT 88888");
    }

    // ------------------------------------------------------------------------
    // data position layer (poligoni delle sezioni)  
    // ------------------------------------------------------------------------

    __georef_sez2021 = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                url: "https://s3.eu-central-1.amazonaws.com/maps.ixmaps.com/Istat/basi_territoriali_2021/" + regione + "_21_P.topojson.gz",
                type: "topojson"
            })
            .type("FEATURE|CLIPTOVIEW|LOCKED")
            .binding({
                id: "SEZ21_ID",
                size: "SHAPE_Area"
            })
            .filter("WHERE PRO_COM like \"" + String(ixmaps.procom) + "\" ")
            .style({
                colorscheme: ["none"],
                opacity: "1",
                linecolor: "none",
                linewidth: "0.1",
                featureupper: "1:150000",
                name: "sezioni"
            })
        );
    };

    __georef_sez2011 = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2011", layer => layer
            .data({
                url: "https://s3.eu-central-1.amazonaws.com/maps.ixmaps.com/Istat/basi_territoriali_2011/" + regione + "_11_P.topojson.gz",
                type: "topojson"
            })
            .type("FEATURE")
            .binding({
                id: "SEZ2011",
                size: "Shape_Area"
            })
            .filter("WHERE PRO_COM like \"" + String(ixmaps.procom) + "\" ")
            .style({
                colorscheme: ["none"],
                opacity: "1",
                linecolor: "none",
                linewidth: "0.3",
                name: "sezioni"
            })
        );
    };

    /* 1. centroids of 2011, by curtesy of Andrea Borruso */
    __georef_urban = () => {
        return ixmaps.layer("ITALIA_Comuni_2022", layer => layer
            .data({
                url: "https://raw.githubusercontent.com/aborruso/centroidiurbanfabric/master/output/ElencoUnitaAmministrative2011.geojson",
                type: "geojson"
            })
            .binding({
                id: "PRO_COM",
                position: "geometry"
            })
            .type("FEATURES|NOLEGEND")
            .style({
                colorscheme: ["none"],
                linecolor: "none",
                linewidth: "1",
                scale: "0.0001"
            })
        );
    };

    /* 2. last istat data (2022), for changes since 2011 */
    __georef = () => {
        return ixmaps.layer("ITALIA_Comuni_2022", layer => layer
            .data({
                url: "https://s3.eu-central-1.amazonaws.com/maps.ixmaps.com/Istat/comuni_2022/Com01012022_s_WGS84.topojson.gz",
                type: "topojson"
            })
            .binding({
                id: "PRO_COM_T",
                position: "geometry"
            })
            .type("FEATURES|NOLEGEND")
            .style({
                colorscheme: ["none"],
                linecolor: "none",
                linewidth: "0.3",
                sizefield: "Shape_Area"
            })
        );
    };


    // ------------------------------------------------------------------------
    // data visualizzation layer 
    // - using above defined data query function and position layer
    // ------------------------------------------------------------------------

    /**
     ** general population change
     **/
    
    __sez2021_pop_choropleth = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                url: "https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2021/" + regione + "_indicatori_2021_sezioni.csv.gz",
                type: "csv",
                process: process_data.toString(),
                name: regione+"_DatiCPA_2021"
            })
            //.filter("WHERE SEZ21_ID NOT 8888888")
            .type("CHOROPLETH|HEADTAIL|DENSITY|ZEROISVALUE|DOPACITY")
            .binding({
                value: "P1",
                alpha: "P1",
                position: "SEZ21_ID",
                tonumber: true
            })
            .style({
                colorscheme: [
                        "8",
                        "#F2d246",
                        "#100050",
                        "3colors",
                        "#CC4878"
                    ],
                units: "",
                alphafield100: "$density$",
                dopacitypow: "2",
                dopacityscale: "1",
                fillopacity: 1,
                showdata: true,
                nodatacolor: "RGB(255,253,216)",
                chartupper: "1:150000",
                name: "choropleth"
            })
            .meta({
                name: "choropleth",
                title: "Densità popolazione",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez2021_eta_choropleth = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                url: "https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2021/" + regione + "_indicatori_2021_sezioni.csv.gz",
                type: "csv",
                process: process_data.toString(),
                name: regione+"_DatiCPA_2021"
            })
            .filter(filter)
            .type("CHOROPLETHE|DOMINANT|DEVIATION|DOPACITY|HORZ|SIMPLELEGEND")
            .binding({
                value: "P14|P15|P16|P17|P18|P19|P20|P21|P22|P23|P24|P25|P26|P27|P20|P29",
                value100: "P83",
                alpha: "P83",
                position: "SEZ21_ID",
                tonumber: true
            })
            .style({
                colorscheme: [
                        "16",
                        "RGB(143,244,0)",
                        "RGB(150,120,149)",
                        "RGB(116,188,200)",
                        "2colors"
                    ],
                label: [
                        "meno di 5",
                        "5 - 9",
                        "10 - 14",
                        "15 - 19",
                        "20 - 24",
                        "25 - 29",
                        "30 - 34",
                        "35 - 39",
                        "40 - 44",
                        "45 - 49",
                        "50 - 54",
                        "55 - 59",
                        "60 - 64",
                        "65 - 69",
                        "70 - 74",
                        "> 74"
                    ],
                units: "%",
                alphafield100: "$density$",
                dopacitypow: 1.5,
                dopacityscale: 0.8,
                name: "choropleth"
           })
            .meta({
                name: "choropleth",
                title: "Grado istruzione predominante",
                tooltip: "<h2 style='margin-top:0'>{{theme.title}}</h2>{{theme.item.chart}}"

            })
        );
    };

        __sez2021_edu_choropleth = () => {
            let regione = "R" + String(ixmaps.regione);
            return ixmaps.layer("sezioni_2021", layer => layer
                .data({
                    url: "https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2021/" + regione + "_indicatori_2021_sezioni.csv.gz",
                    type: "csv",
                    process: process_data.toString(),
                    name: regione+"_DatiCPA_2021"
                })
                .type("CHOROPLETHE|DOMINANT|DOPACITY|HORZ|SIMPLELEGEND")
                .binding({
                    value: "P90|P89|P88|P87|P86",
                    value100: "P83",
                    alpha: "P83",
                    position: "SEZ21_ID",
                    tonumber: true
                })
                .filter(filter)
                .style({
                    colorscheme: [
                        "red",
                        "orange",
                        "#00cccc",
                        "green",
                        "yellow"
                    ],
                    label: [
                        "titoli terziari",
                        "diploma di scuola superiore",
                        "licenza media",
                        "licenza elementare",
                        "senza titolo di studio"
                    ],
                    units: "%",
                    alphafield100: "$density$",
                    dopacitypow: 1,
                    dopacityscale: 2,
                    name: "choropleth"
                })
                .meta({
                    name: "choropleth",
                    title: "Grado istruzione predominante",
                    tooltip: "<h2 style='margin-top:0'>{{theme.title}}</h2>{{theme.item.chart}}"
                
                })
            );
        };


        __sez2011_stranieri_choropleth = () => {
            let regione = "R" + String(ixmaps.regione);
            return ixmaps.layer("sezioni_2011", layer => layer
                .data({
                    url: "https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2011/" + regione + "_indicatori_2011_sezioni.csv.gz",
                    type: "csv",
                    name: regione+"_DatiCPA_2011"
                })
                .type("CHOROPLETHE|DOMINANT|DOPACITY|HORZ|SIMPLELEGEND")
                .binding({
                    value: "ST9|ST10|ST11|ST12|ST13",
                    alpha: "ST15",
                    position: "SEZ2011",
                    tonumber: true
                })
                .filter(filter)
                .style({
                    colorscheme: [
                        "#00A8E6",
                        "#FFAD01",
                        "#E901AF",
                        "#99FE00",
                        "cyan"
                    ],
                    label: [
                        "Europa",
                        "Africa",
                        "America",
                        "Asia",
                        "Oceania"
                    ],
                    units: "",
                    alphafield100: "$density$",
                    dopacitypow: 1.5,
                    dopacityscale: 2.5,
                    name: "choropleth"
                })
                .meta({
                    name: "choropleth",
                    title: "Provenienza stranieri predominante",
                    tooltip: "<h2 style='margin-top:0'>{{theme.title}}</h2>{{theme.item.chart}}"
                
                })
            );
        };

        __sez2021_stranieri_choropleth = () => {
            let regione = "R" + String(ixmaps.regione);
            return ixmaps.layer("sezioni_2021", layer => layer
                .data({
                    url: "https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2021/" + regione + "_indicatori_2021_sezioni.csv.gz",
                    type: "csv",
                    name: regione+"_DatiCPA_2021"
                })
                .type("CHOROPLETHE|DOMINANT|DOPACITY|HORZ|SIMPLELEGEND")
                .binding({
                    value: "ST16|ST19",
                    value100: "P1",
                    alpha: "ST1",
                    position: "SEZ21_ID",
                    tonumber: true
                })
                .filter(filter)
                .style({
                    colorscheme: [
                        "#00A8E6",
                        "#FFAD01"
                    ],
                    label: [
                        "Unione Europea",
                        "Extra-EU"
                    ],
                    units: "%",
                    alphafield100: "P1",
                    dopacitypow: 1,
                    dopacityscale: 1,
                    name: "choropleth"
                })
                .meta({
                    name: "choropleth",
                    title: "Provenienza stranieri predominante",
                    tooltip: "<h2 style='margin-top:0'>{{theme.title}}</h2>{{theme.item.chart}}"
                
                })
            );
        };


    __sez2021_pop_100_circle = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                url: "https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2021/" + regione + "_indicatori_2021_sezioni.csv.gz",
                type: "csv",
                process: process_data.toString(),
                name: regione+"_DatiCPA_2021"
            })
            .type("CHART|SYMBOL|AGGREGATE|SUM")
            .binding({
                value: "P1",
                position: "SEZ21_ID",
                tonumber: true
            })
            .filter(filter)
            .style({
                colorscheme: [
					"#952D44"],
                fillopacity: "0.5",
                shadow: "false",
                symbols: [
					"circle"],
                linecolor: "black",
                units: "",
                align: "center",
                scale: "0.5",
                valuescale: "1",
                gridwidth: "10px",
                aggregationlower: "1:50000",
                valuesupper: "1:50000"
            })
            .meta({
                title: "Popolazione 2021",
                snippet: "n° abitanti aggregati",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}"

            })
        );
    };

    __sez2011_pop_100_circle = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2011", layer => layer
            .data({
                url: "https://s3.eu-west-1.amazonaws.com/data.ixmaps.com/ISTAT/Censimenti/2011/" + regione + "_indicatori_2011_sezioni.csv.gz",
                type: "csv",
                name: regione+"_DatiCPA_2021"
            })
            .type("CHART|SYMBOL|AGGREGATE|SUM")
            .binding({
                value: "P1",
                position: "SEZ2011",
                tonumber: true
            })
            .filter(filter)
            .style({
                colorscheme: [
					"#999999"],
                fillopacity: "0.2",
                shadow: "false",
                symbols: [
					"circle"],
                linecolor: "black",
                units: "",
                align: "center",
                scale: "0.5",
                valuescale: "1",
                gridwidth: "10px",
                aggregationlower: "1:50000",
                valuesupper: "1:50000"
            })
            .meta({
                title: "Popolazione 2021",
                snippet: "n° abitanti aggregati",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|BAR|POINTER|SMALLARROW|SIZE|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P1.1|P1.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                colorscheme: [
                        "red",
                        "#9A384E"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                gridwidth: "10px",
                aggregationlower: "1:50000",
                scale: "2",
                fillopacity: 1,
                fadenegative: 0.3,
                normalsizevalue: "1000",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_user = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|USER|SIZE|3D|DIFFERENCE|AGGREGATE|RELOCATE|SUM|VALUES|SIMPLELEGEND|NOOUTLIER")
            .binding({
                value: "P1.1|P1.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                userdraw: "arrowChart",
                colorscheme: [
                        "red",
                        "#9A384E"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                chartupper: "1:150000",
                //aggregationlower: "1:30000",
                scale: "1",
                sizepow: "1.5",
                fillopacity: 1,
                fadenegative: 1,
                linewidth: "0.5",
                normalsizevalue: "1000",
                valuecolor: "black",
                minvaluesize: "2",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_user_grid = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|SYMBOL|AGGREGATE|SUM|GRIDSIZE|SIMPLELEGEND")
            .binding({
                value: "P1.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                symbols: "hexagon",
                colorscheme: [
                        "none"
                    ],
                units: "",
                valuecolor:"rgba(0,0,0,0.1)",
                linecolor: "#ffffff",
                showdata: true,
                gridwidth:"50px",
                chartupper: "1:150000",
                chartlower: "1:10000",
                scale: "1"
            })
            .meta({
                name: "chart_grid",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_user_procom = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("ITALIA_Comuni_2022", layer => layer
            .data({
                query: query_data_procom.toString(),
                type: "ext",
                name: regione+"condensed"
            })
            .type("CHART|USER|SIZE|3D|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P1.1|P1.2",
                position: "PROCOM.1",
                tonumber: true
            })
            .filter("WHERE P1.2 > 10 AND P1.1 > 10")
            .style({
                userdraw: "arrowChart",
                colorscheme: [
                        "red",
                        "#9A384E"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationfield: "PROCOM.1",
                chartlower: "1:150000",
                scale: "5",
                sizepow: "2",
                fillopacity: 1,
                fadenegative: 0.3,
                xxnormalsizevalue: "1000",
                valuecolor: "black",
                minvaluesize: "5",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart_procom",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_user_procom_all = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("ITALIA_Comuni_2022", layer => layer
            .data({
                query: query_data_procom_all.toString(),
                type: "ext",
                name: regione+"condensed"
            })
            .type("CHART|USER|SIZE|3D|DIFFERENCE|AGGREGATE|RELOCATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P1.1|P1.2",
                position: "PROCOM.1",
                tonumber: true
            })
            //.filter("WHERE P1.2 > 10 AND P1.1 > 10")
            .style({
                userdraw: "arrowChart",
                colorscheme: [
                        "red",
                        "#9A384E"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                 "1:1","PROCOM.1",
                 "1:100000", "25px",    
                 "1:2000000","PROVINCIA.1",
                 "1:7000000","REGIONE.1"
                ],
                xxxgridwidth: "50px",
                chartlower: "1:150000",
                scale: "1",
                sizepow: "2",
                fillopacity: 1,
                fadenegative: 0.3,
                normalsizevalue: "500",
                chartlower: "1:100000",
                valuecolor: "black",
                minvaluesize: "5",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart_procom_all",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_user_procom_all_grid = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("ITALIA_Comuni_2022", layer => layer
            .data({
                query: query_data_procom_all.toString(),
                type: "ext",
                name: regione+"condensed"
            })
            .filter("WHERE P1.2 > 10 AND P1.1 > 10")
            .type("CHART|SYMBOL|AGGREGATE|SUM|GRIDSIZE|SIMPLELEGEND")
            .binding({
                value: "P1.2",
                position: "PROCOM.1",
                tonumber: true
            })
            .style({
                symbols: "hexagon",
                colorscheme: [
                        "none"
                    ],
                units: "",
                valuecolor:"rgba(0,0,0,0.1)",
                linecolor: "#aaaaaa",
                linewidth: "10",
                showdata: true,
                gridwidth:"50px",
                chartlower: "1:500000",
                scale: "1"
            })
            .meta({
                name: "chart_grid_all",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    /**
     ** age specific population change
     **/

    __sez_2011_2021_pop_arrow_eta_meno_5 = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|USER|SIZE|DIFFERENCE|AGGREGATE|RELOCATE|CLIPTOGEOBOUNDS|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P14.1|P14.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                userdraw: "arrowChart",
                colorscheme: [
                        "#F3838B",
                        "#93F30B"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                xxaggregationlower: "1:30000",
                scale: "1",
                sizepow: "1.5",
                fillopacity: 1,
                fadenegative: 0.1,
                valuecolor: "#008800",
                linecolor: "#008800",
                linewidth: 0.8,
                normalsizevalue: "100",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_eta_5_9 = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|BAR|POINTER|ARROW|SIZE|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P15.1|P15.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                colorscheme: [
                        "#dd0044",
                        "#43C30B"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                aggregationlower: "1:30000",
                scale: "1",
                fillopacity: 1,
                fadenegative: 0.003,
                linecolor: "white",
                linewidth: 0.8,
                normalsizevalue: "100",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_eta_piu_75 = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|BAR|POINTER|SMALLARROW|SIZE|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P29.1|P29.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                colorscheme: [
                        "#dd0044",
                        "#aa44aa"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                aggregationlower: "1:30000",
                scale: "1",
                fillopacity: 1,
                fadenegative: 0.003,
                minvaluesize: 1,
                linecolor: "white",
                linewidth: 0.5,
                normalsizevalue: "100",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_eta_piu_75_peaks = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|USER|NONEGATIVE|3D|SIZE|SHADOW|GRADIENT|DIFFERENCE|AGGREGATE|RELOCATE|CLIPTOGEOBOUNDS|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P29.1|P29.2",
                position: "SEZ2011.1",
                label: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                userdraw: "arrowChart",
                colorscheme: [
                        "#dd0044",
                        "#aa44aa"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                aggregationlower: "1:30000",
                scale: "1",
                sizepow: "1.5",
                fillopacity: 1,
                fadenegative: 0.003,
                linecolor: "white",
                linewidth: 0.5,
                minvaluesize: 1,
                valuecolor: "black",
                normalsizevalue: "100",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_edu_terzo = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|USER|SIZEP1|SHADOW|3D|GRADIENT|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P47.1|P90.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                userdraw: "arrowChart",
                colorscheme: [
                        "#dd0044",
                        "#dd0044"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                aggregationlower: "1:30000",
                scale: "1",
                fillopacity: 1,
                fadenegative: 0.003,
                valuecolor: "#880022",
                linecolor: "white",
                linewidth: 0.3,
                normalsizevalue: "500",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_edu_media = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|USER|SIZEP1|SHADOW|3D|GRADIENT|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P49.1|P88.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                userdraw: "arrowChart",
                colorscheme: [
                        "#dd0044",
                        "#54DCDA"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                aggregationlower: "1:30000",
                scale: "1",
                fillopacity: 1,
                fadenegative: 0.003,
                linecolor: "white",
                linewidth: 0.2,
                normalsizevalue: "500",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_edu_elementare = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|USER|SIZEP1|SHADOW|3D|GRADIENT|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P50.1|P87.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                userdraw: "arrowChart",
                colorscheme: [
                        "#dd0044",
                        "#54A952"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                aggregationlower: "1:30000",
                scale: "1",
                fillopacity: 1,
                fadenegative: 0.003,
                linecolor: "white",
                linewidth: 0.2,
                normalsizevalue: "500",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_edu_senzaxxx = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|BAR|POINTER|ARROW|SIZE|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P51.1|P91.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                colorscheme: [
                        "#dd0044",
                        "#54A952"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                aggregationlower: "1:30000",
                scale: "1",
                fillopacity: 1,
                fadenegative: 0.003,
                linecolor: "white",
                linewidth: 1,
                normalsizevalue: "100",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_edu_senza = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|SYMBOL|SIZE|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND")
            .binding({
                value: "P50.1|P87.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                colorscheme: [
                        "#dd0044",
                        "#54A952"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                symbols: [
                   "../../../../pages/DataVizi/Censimenti/up-arrow.svg"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                aggregationlower: "1:30000",
                scale: "1",
                fillopacity: 1,
                fadenegative: 0.003,
                linecolor: "white",
                linewidth: 1,
                normalsizevalue: "100",
                rangecentervalue: "0",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };

    __sez_2011_2021_pop_arrow_stranieri = () => {
        let regione = "R" + String(ixmaps.regione);
        return ixmaps.layer("sezioni_2021", layer => layer
            .data({
                query: query_data.toString(),
                type: "ext",
                name: regione
            })
            .type("CHART|USER|SIZEP1|SHADOW|3D|GRADIENT|DIFFERENCE|AGGREGATE|SUM|VALUES|SIMPLELEGEND|NOOUTLIER")
            .binding({
                value: "ST1.1|ST1.2",
                position: "SEZ2011.1",
                tonumber: true
            })
            .filter(filter_compare)
            .style({
                userdraw: "arrowChart",
                colorscheme: [
                        "red",
                        "#4488dd"
                    ],
                label: [
                    "decrescità",
                    "crescità"
                ],
                units: "",
                showdata: true,
                aggregationscale: [
                    "1:1", "1",
                    "1:10000", "50px"
                ],
                chartupper: "1:150000",
                aggregationlower: "1:30000",
                scale: "1",
                fillopacity: 1,
                fadenegative: 0.3,
                valuecolor: "#880022",
                linecolor: "white",
                linewidth: 0.3,
                normalsizevalue: "500",
                rangecentervalue: "0",
                minvaluesize: "1",
                nodatacolor: "RGB(255,253,216)"
            })
            .meta({
                name: "chart",
                title: "Differenza popolazione straniera 2011-2021",
                tooltip: "{{theme.title}}: {{theme.item.value}}{{theme.item.chart}}{{theme.item.data}}"

            })
        );
    };


})();

// -----------------------------
// EOF
// -----------------------------
