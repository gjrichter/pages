/**
 * data provider for OSM Overpass Queries
 */

window.ixmaps = window.ixmaps || {};
(function () {

    ixmaps.oldBounds = null;

    ixmaps.dataquery_flatgeobuffer = function (data, option) {

        ixmaps.setTitleBox("Overpass API &#8644;", "RGBA(95, 185, 135,0.5)");
        ixmaps.in_query = true;

        var bounds = ixmaps.oldBounds = ixmaps.getBoundingBox();

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
        var szUrl = "https://flatgeobuf.septima.dk/population_areas.fgb";
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

            })
            .error(function (e) {
                ixmaps.setTitleBox("error while loading", "RGBA(128,0,0,0.5)");
                ixmaps.setExternalData(null, {
                    name: option.name
                });
                ixmaps.in_query = false;
            });

    };

	// ---------------------------------------------------------------------
	// listen to map zoom or pan event and query new data
	// depending to the actual map bounds
	// ---------------------------------------------------------------------
	
	ixmaps.refreshTimeout = null;
	ixmaps.htmlgui_onZoomAndPan_old = ixmaps.htmlgui_onZoomAndPan;
	ixmaps.htmlgui_onZoomAndPan = function(nZoom){ 
		
		if (ixmaps.getZoom() < 12 ){
			ixmaps.setTitleBox("OSM: please zoom in or ask for <a style='pointer-events:all' href='javascript:ixmaps.refreshTheme(\"features\")'>refresh</a>");
			ixmaps.htmlgui_onZoomAndPan_old(nZoom);
			return;
		}
		
		if ( ixmaps.in_query ){
			ixmaps.setTitleBox("theme busy ...");
			ixmaps.htmlgui_onZoomAndPan_old(nZoom);
			return;
		}

		ixmaps.setTitleBox("query overpass ...","RGBA(95, 185, 135,0.5)");

		var bounds = ixmaps.getBoundingBox();
		if ( ixmaps.oldBounds ){
			if ( (bounds[0].lat >= ixmaps.oldBounds[0].lat) && 
				 (bounds[0].lng >= ixmaps.oldBounds[0].lng) &&
				 (bounds[1].lat <= ixmaps.oldBounds[1].lat) &&
				 (bounds[1].lng <= ixmaps.oldBounds[1].lng) 
			   ){
				ixmaps.htmlgui_onZoomAndPan_old(nZoom);
				ixmaps.setTitle("");
				return;
			}
		}else{
			return;
		}

		if ( ixmaps.refreshTimeout ){
			clearTimeout(ixmaps.refreshTimeout);
			ixmaps.refreshTimeout = null;
		}
		ixmaps.refreshTimeout = setTimeout('ixmaps.refreshTheme("features")',250);
		
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
