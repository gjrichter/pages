/**
 * =============================================================================
 * FILE: dataprovider_flatgeobuffer_spatial_filter.js
 * PATH: /ixmaps/pages/test/js/
 * =============================================================================
 * 
 * FILE INFORMATION
 * ----------------
 * Description: Data provider module for ixmaps that handles FlatGeoBuffer data 
 *              themes with spatial querying and bounding box filtering.
 * 
 * Purpose: Provides spatial data querying functionality for mapping applications
 *          using FlatGeoBuffer format with dynamic bounding box filtering based 
 *          on map viewport. Implements zoom-level restrictions and auto-refresh 
 *          on map pan/zoom events.
 * 
 * Context: General-purpose spatial data provider for dynamic map-based querying
 *          in ixmaps applications with bounding box filtering.
 * 
 * =============================================================================
 * TECHNICAL DETAILS
 * -----------------
 * 
 * Key Features:
 * - Spatial data querying from FlatGeoBuffer (.fgb) sources
 * - Bounding box filtering with configurable padding (10%)
 * - Minimum zoom level enforcement (MIN_ZOOM = 12)
 * - Automatic refresh on map pan/zoom events with debouncing (250ms)
 * - Bounds change detection to prevent unnecessary queries
 * - Loading state management and error handling
 * 
 * Dependencies:
 * - ixmaps: Main mapping framework (window.ixmaps)
 * - Data.feed: FlatGeoBuffer data loader
 * - Map bounding box and zoom level APIs
 * 
 * Data Flow:
 * 1. Query trigger → get map bounds
 * 2. Apply spatial padding to bounding box
 * 3. Fetch FGB data via Data.feed with bbox filter
 * 4. Load data into ixmaps external data store
 * 5. Listen for map events and refresh on bounds change
 * 
 * Event Handling:
 * - Overrides ixmaps.htmlgui_onZoomAndPan to detect bounds changes
 * - Implements debouncing to prevent excessive queries
 * - Validates zoom level before performing queries
 * 
 * Spatial Filtering:
 * - Bounding box coordinates: [minLng, minLat, maxLng, maxLat]
 * - Padding multiplier: 0.1 (10% buffer around viewport)
 * 
 * =============================================================================
 * CODE STRUCTURE
 * --------------
 * 
 * Constants:
 *   - MIN_ZOOM: Minimum zoom level to enable data queries (12)
 * 
 * Global Variables:
 *   - szThemeUrl: URL of the FlatGeoBuffer data source
 *   - szThemeName: Name of the active theme
 *   - __oldBounds: Previous bounding box for change detection
 * 
 * Functions:
 *   - ixmaps.dataquery_flatgeobuffer(): Main query function
 *   - ixmaps.htmlgui_onZoomAndPan(): Overridden map event handler
 * 
 * =============================================================================
 * USAGE EXAMPLE
 * -------------
 * 
 * // Theme configuration in HTML:
 * ixmaps.onThemeLoad = function(data, options) {
 *     ixmaps.dataquery_flatgeobuffer(data, options);
 * };
 * 
 * // Theme option structure:
 * {
 *     theme: { szName: "theme_name" },
 *     ext: "path/to/data.fgb",
 *     name: "data_theme_name"
 * }
 * 
 * =============================================================================
 * VERSION HISTORY
 * ---------------
 * [Current] - Initial implementation for spatial filtering with FlatGeoBuffer
 * 
 * =============================================================================
 * AUTHORS & METADATA
 * ------------------
 * Created: [Date to be filled]
 * Modified: [Date to be filled]
 * Author: [Author to be filled]
 * Project: ixmaps - Spatial data provider
 * License: [License to be filled]
 * 
 * =============================================================================
 * NOTES
 * -----
 * - File extends ixmaps namespace and runs in IIFE wrapper
 * - Implements async data loading with loading indicators
 * - Error handling includes user feedback via title box
 * - Query state managed through ixmaps.in_query flag
 * 
 * =============================================================================
 */

window.ixmaps = window.ixmaps || {};
(function () {

	const MIN_ZOOM = 12;

	let szThemeUrl = "";
	let szLayerA = [];

    let __oldBounds = null;

	// ---------------------------------------------------------------------
	// the data query function
	//
	// query the data from the flat geobuffer source
	// applying a spatial filter with the actual map bounds
	// ---------------------------------------------------------------------

    ixmaps.dataquery_flatgeobuffer = function (data, option) {

		szLayerA[option.theme.origDef.layer] = option.theme.origDef.layer;
		szThemeUrl = option.ext;

        let bounds = __oldBounds = ixmaps.getBoundingBox();

		if (ixmaps.getZoom() < MIN_ZOOM ){
			ixmaps.setExternalData(new Data.Table(), {
				type: "jsonDB",
				name: option.name
			});
			__oldBounds = [{lat: 0, lng: 0}, {lat: 0, lng: 0}];
			ixmaps.in_query = false;
			return;
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
	
	ixmaps.refreshTimeout = null;
	ixmaps.htmlgui_onZoomAndPan_old = ixmaps.htmlgui_onZoomAndPan;
	ixmaps.htmlgui_onZoomAndPan = function(nZoom){ 
		
		if (ixmaps.getZoom() < MIN_ZOOM ){
			ixmaps.htmlgui_onZoomAndPan_old(nZoom);
			return;
		}
		
		if ( ixmaps.in_query ){
			ixmaps.setTitleBox("theme busy ...");
			ixmaps.htmlgui_onZoomAndPan_old(nZoom);
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

		if ( ixmaps.refreshTimeout ){
			clearTimeout(ixmaps.refreshTimeout);
			ixmaps.refreshTimeout = null;
		}
		ixmaps.refreshTimeout = setTimeout(() => {
			var themeA = ixmaps.getThemes();
			for (let theme of themeA){
				for (let szLayer in szLayerA){
					if ( theme.origDef.layer === szLayer ){
						ixmaps.refreshTheme(theme.szName);
					}
				}
			}
		}, 250);
		
		__oldBounds = bounds;
		ixmaps.htmlgui_onZoomAndPan_old(nZoom);
	};


})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------
