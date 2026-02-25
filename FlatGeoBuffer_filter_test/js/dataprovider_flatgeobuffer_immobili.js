/**
 * data provider for OSM Overpass Queries
 */

window.ixmaps = window.ixmaps || {};
(function () {

	const MIN_ZOOM = 12;

	let szThemeUrl = "";
	let szThemeNameA = [];

    let __oldBounds = null;

	// ---------------------------------------------------------------------
	// the data query function
	//
	// query the data from the flat geobuffer source
	// applying a spatial filter with the actual map bounds
	// ---------------------------------------------------------------------

    ixmaps.dataquery_flatgeobuffer = function (data, option) {

		szThemeNameA[option.theme.szName] = option.theme.szName;
		szThemeUrl = option.ext;
		
		if (!szThemeUrl) {
			ixmaps.setTitleBox("error while loading: no data url", "RGBA(128,0,0,0.5)");
			ixmaps.setExternalData(null, {
				name: option.name
			});
			return;
		}

        let bounds = __oldBounds = ixmaps.getBoundingBox();

		if (ixmaps.getZoom() < MIN_ZOOM ){
			ixmaps.setExternalData(new Data.Table(), {
				type: "jsonDB",
				name: option.name
			});
			__oldBounds = [{lat: 0, lng: 0}, {lat: 0, lng: 0}];
			ixmaps.in_query = false;
		}

        // Aggiungi 10% di padding
        let padding = 0.1;
        let width = bounds[1].lng - bounds[0].lng;
        let height = bounds[1].lat - bounds[0].lat;
        
        let bbox = [
            bounds[0].lng - width * padding,
            bounds[0].lat - height * padding,
            bounds[1].lng + width * padding,
            bounds[1].lat + height * padding
        ];

		ixmaps.setTitleBox("querying data ...");
		ixmaps.in_query = true;

		console.log("--------------------------------");
		console.log("bounds", bounds);
		console.log("bbox", bbox);
		console.log("--------------------------------");

        Data.feed({
                "source": szThemeUrl,
                "type": "fgb",
                "bbox": bbox
            }).load(function (mydata) {

				ixmaps.setTitle("");
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
                ixmaps.setTitle("");
            });

    };

	// ---------------------------------------------------------------------
	// listen to map zoom or pan event
	//
	// if the map bounds have changed, refresh the registered theme
	// so it will query new data with the new map bounds
	// ---------------------------------------------------------------------

	// Utility function per debounce
	let __debounce = function(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	};
	
	// Create debounced refresh function ONCE (reused across all zoom/pan events)
	let __debouncedRefresh = __debounce(() => {
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
		console.log("!!!!! refreshTheme !!!!!");
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
		console.log(szThemeNameA);
		for (let szThemeName in szThemeNameA) {
			ixmaps.refreshTheme(szThemeName);
		}
	}, 500);
	
	ixmaps.htmlgui_onZoomAndPan_old = ixmaps.htmlgui_onZoomAndPan;
	ixmaps.htmlgui_onZoomAndPan = function(nZoom){ 
		
		if (ixmaps.getZoom() < MIN_ZOOM ){
			ixmaps.htmlgui_onZoomAndPan_old(nZoom);
			return;
		}
		if ( ixmaps.in_query ){
			ixmaps.setTitleBox("theme busy ...");
			setTimeout(() => {
				ixmaps.htmlgui_onZoomAndPan(nZoom);
			},250);
			if ( ixmaps.htmlgui_onZoomAndPan_old ){	
				ixmaps.htmlgui_onZoomAndPan_old(nZoom);
			}
			return;
		}

		let bounds = ixmaps.getBoundingBox();
		if ( __oldBounds ){
			if ( (bounds[0].lat >= __oldBounds[0].lat) && 
				 (bounds[0].lng >= __oldBounds[0].lng) &&
				 (bounds[1].lat <= __oldBounds[1].lat) &&
				 (bounds[1].lng <= __oldBounds[1].lng) 
			   ){
				ixmaps.setTitle("");
				ixmaps.htmlgui_onZoomAndPan_old(nZoom);
				return;
			}
		}else{
			return;
		}
		console.log("3");

		__debouncedRefresh();
			
		console.log("4");
		__oldBounds = bounds;

		if ( ixmaps.htmlgui_onZoomAndPan_old ){	
			ixmaps.htmlgui_onZoomAndPan_old(nZoom);
		}
	};

})();
