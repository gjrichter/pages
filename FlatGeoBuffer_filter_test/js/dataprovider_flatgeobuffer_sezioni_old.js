/**
 * data provider for OSM Overpass Queries
 */

window.ixmaps = window.ixmaps || {};
(function () {

	const MIN_ZOOM = 10;

    ixmaps.oldBounds = null;

    ixmaps.dataquery_flatgeobuffer = function (data, option) {

        //ixmaps.setTitleBox("Overpass API &#8644;", "RGBA(95, 185, 135,0.5)");

		var bounds = ixmaps.oldBounds = ixmaps.getBoundingBox();

		if (ixmaps.getZoom() < MIN_ZOOM ){
			//ixmaps.setTitleBox("please zoom in or ask for <a style='pointer-events:all' href='javascript:ixmaps.refreshTheme(\"features\")'>refresh</a>");
			ixmaps.setExternalData(new Data.Table(), {
				type: "jsonDB",
				name: option.name
			});
			ixmaps.oldBounds = [{lat: 0, lng: 0}, {lat: 0, lng: 0}];
			ixmaps.in_query = false;
			return;
		}


        // Aggiungi 10% di padding
        var padding = 0.1;
        var width = bounds[1].lng - bounds[0].lng;
        var height = bounds[1].lat - bounds[0].lat;
        
        var bbox = [
            bounds[0].lng - width * padding,
            bounds[0].lat - height * padding,
            bounds[1].lng + width * padding,
            bounds[1].lat + height * padding
        ];

		ixmaps.setTitleBox("querying data ...");
		ixmaps.in_query = true;

		var szUrl = "http://data.ixmaps.com.s3.amazonaws.com/TestData/istat_basi_territoriali_2021_indicatore_joined.fgb";
        var myfeed = Data.feed({
                "source": szUrl,
                "type": "fgb",
                "bbox": bbox
            }).load(function (mydata) {

                    ixmaps.setExternalData(mydata, {
                        type: "jsonDB",
                        name: option.name
                    });
                    ixmaps.in_query = false;
                    ixmaps.setTitle("");

            })
            .error(function (e) {
                ixmaps.setTitleBox("error while loading", "RGBA(128,0,0,0.5)");
                ixmaps.setExternalData(null, {
                    name: option.name
                });
                ixmaps.in_query = false;
                ixmaps.setTitle("");
            });

    };

	// ---------------------------------------------------------------------
	// listen to map zoom or pan event and query new data
	// depending to the actual map bounds
	// ---------------------------------------------------------------------
	
	ixmaps.refreshTimeout = null;
	ixmaps.htmlgui_onZoomAndPan_old = ixmaps.htmlgui_onZoomAndPan;
	ixmaps.htmlgui_onZoomAndPan = function(nZoom){ 

		if (ixmaps.getZoom() < MIN_ZOOM ){
			//ixmaps.setTitleBox("please zoom in or ask for <a style='pointer-events:all' href='javascript:ixmaps.refreshTheme(\"features\")'>refresh</a>");
			ixmaps.htmlgui_onZoomAndPan_old(nZoom);
			return;
		}
		
		if ( ixmaps.in_query ){
			ixmaps.setTitleBox("theme busy ...");
			ixmaps.htmlgui_onZoomAndPan_old(nZoom);
			return;
		}

		console.log("before return");
		console.log(ixmaps.oldBounds);
		//ixmaps.setTitleBox("query overpass ...","RGBA(95, 185, 135,0.5)");

		var bounds = ixmaps.getBoundingBox();
		if ( ixmaps.oldBounds ){
			if ( (bounds[0].lat >= ixmaps.oldBounds[0].lat) && 
				 (bounds[0].lng >= ixmaps.oldBounds[0].lng) &&
				 (bounds[1].lat <= ixmaps.oldBounds[1].lat) &&
				 (bounds[1].lng <= ixmaps.oldBounds[1].lng) 
			   ){
				ixmaps.setTitle("");
				ixmaps.htmlgui_onZoomAndPan_old(nZoom);
				return;
			}
		}else{
			return;
		}
		console.log("before timeout");
		if ( ixmaps.refreshTimeout ){
			clearTimeout(ixmaps.refreshTimeout);
			ixmaps.refreshTimeout = null;
		}
		console.log("refresh");
		ixmaps.refreshTimeout = setTimeout(() => {
			console.log("--------------------------------");
			console.log(ixmaps);
			console.log("--------------------------------");
			console.log("ixmaps.getThemes()", ixmaps.getThemes());
			ixmaps.refreshTheme("sezioni_2021");
			ixmaps.refreshTheme("choropleth");
			ixmaps.refreshTheme("chart_sezioni_2021");
		}, 250);
		ixmaps.oldBounds = bounds;
		ixmaps.htmlgui_onZoomAndPan_old(nZoom);
		};


})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------
