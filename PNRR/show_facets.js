/** 
 * @fileoverview This file provides functions for facet filtering
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 * @copyright CC BY SA
 * @license MIT
 */

ixmaps = window.ixmaps || {};
ixmaps.data = window.ixmaps.data || {};

(function () {

	// ===========================================
	//
	// h e l p e r
	//
	// ===========================================

	/**
	 * Create a distribution of data values for histograms  
	 * @param szMapDiv the id of the div, where to create the SVG map
	 * @param options javascript object with the creation options
	 * @type object
	 * @return the new ixmaps object
	 */
	var __getScatterArray = function (data, nMin, nMax, nTicks, szFlag) {

		var nValuePos = 0;
		var nCountMax = 0;
		var dValue = 0;
		var a;
        
		if (szFlag.match(/LOG/)) {
			dValue = nMin ? 0 : 0.1;
			nMin = Math.log(nMin + dValue);
			nMax = Math.log(nMax + dValue);
		}

		var nPop = (nMax - nMin ) / (nTicks-1);

		var nPopA = [];
		var nTickA = [];
		var nTickVal = nMin;
		for (var i = 0; i < nTicks + 1; i++) {
			nPopA[i] = 0;
			nTickA[i] = Math.floor(szFlag.match(/LOG/) ? (Math.exp(nTickVal)) : nTickVal);
			nTickVal += nPop

		}
		data.forEach(function (value) {
			var xValue = value;
			if (typeof (xValue) == 'number') {
				if (szFlag.match(/LOG/)) {
					xValue = Math.log(xValue + dValue);
				}
				nPos = Math.max(0, Math.min(nTicks - 1, Math.floor((xValue - nMin) / nPop)));
				nPopA[nPos]++;
				nCountMax = Math.max(nCountMax, nPopA[nPos]);
			}
		});

		return { min: nTickA, count: nPopA };
	};

	// get unique values array via filter
	var __onlyUnique = function (value, index, self) {
		return self.indexOf(value) === index;
	};

	// get unique values array via named array
	var __getUniqueValues = function(a) {
		var u = [];
		for ( var i in a ){
			u[String(a[i])] = 1;
		}
		var retA = [];
		for ( var v in u ){
			retA.push(v);
		}
		return retA;
	};

	// get numbers from formatted values like 235 678.98 or 235.678,98
	var __scanValue = function (nValue) {
		if (String(nValue).match(/:/)){
			return "date";
		} else
		// strips blanks inside numbers (e.g. 1 234 456 --> 1234456)
		if (String(nValue).match(/,/)) {
			return parseFloat(String(nValue).replace(/\./gi, "").replace(/,/gi, "."));
		} else {
			return parseFloat(String(nValue).replace(/ /gi, ""));
		}
	};

	// ===========================================
	//
	// facet filter handling 
	//
	// ===========================================

	var __facetFilterA = [];
	var __rangesA = [];

	// -----------------------------------------------
	// set the selected facet filter
	// if this filter is already active, clear filter
	// -----------------------------------------------
	__setFacetFilter = function (szFilter) {

		// if new filter given, add to filter array (delete existent filter of the same data column)
		if (szFilter.length) {

			// get filter without WHERE 
			szFilter = szFilter.split(/WHERE /)[1];

			// add, or remove filter, if exists  
			__facetFilterA.filter(function (value, index, self) {
				return !(szFilter.split(/"/)[1] == value.split(/"/)[1]);
			});

			__facetFilterA.push(szFilter);
		}

		// make final filter from actual parts stored in __facetFilterA
		szFilter = __facetFilterA.length ? ("WHERE " + __facetFilterA.join(" AND ")) : null;

		// show filter in input field
		$("#query").val(szFilter);

		// filter items on map
		var objTheme = ixmaps.getThemeObj();
		var objThemesA = ixmaps.getThemes();
		for ( a in objThemesA ){
			objTheme = objThemesA[a];
			if ( objTheme.szFlag.match(/CHART|CHOROPLETH/) ){
                if ( szFilter ){
                    ixmaps.changeThemeStyle(null,objTheme.szId, "filter:" + (szFilter || " "), "set");
                }else{
                    ixmaps.changeThemeStyle(null,objTheme.szId, "filter", "remove");
                }
            }
		}

	};

	// -------------------------------------------------------------------------
	// set a range filter for a data field
	// if a range is already active on this data field, remove this range before
	// --------------------------------------------------------------------------
	__setRangeFilter = function (szField, szRange, min, max) {
		rangeA = szRange.split(",");
		szFilter = "WHERE \"" + szField + "\" BETWEEN " + rangeA[0] + " AND " + rangeA[1];
		// delete filter with same field
		__facetFilterA = __facetFilterA.filter(function (value, index, self) {
			return !(value.split("\"")[1] == szField);
		});
		__setFacetFilter(szFilter);
	};

	// -------------------------------------------------------------------------
	// set a input field filter
	// --------------------------------------------------------------------------
	__setFilter = function (szField, szFilter) {
		szQuery = "WHERE \"" + szField + "\" like \"" + szFilter + "\"";
		// delete filter with same field
		__facetFilterA = __facetFilterA.filter(function (value, index, self) {
			return !(value.split("\"")[1] == szField);
		});
		__setFacetFilter(szFilter.length?szQuery:"");
	};

	// -----------------------------------------------
	// remove all filter of one data field
	// -----------------------------------------------
	__removeFacets = function (szField) {
		__facetFilterA = __facetFilterA.filter(function (value, index, self) {
			return !(value.split("\"")[1] == szField);
		});
		__setFacetFilter("");
	};

	var __makeHistogram = function (id, szRange) {

		var rangeA = szRange.split(",");

		var facet = null;

		for (i in facetsA) {
			if (facetsA[i].id == id) {
				facet = facetsA[i];
			}
		}

		if (facet && facet.data) {

			var objThemeDefinition = ixmaps.getThemeDefinitionObj();
			var objTheme = ixmaps.getThemeObj();

			var fOnMap = false;
			if ((objThemeDefinition.field == facet.id)) {
				fOnMap = true;
			}

			var min = __rangesA[facet.id].min;
			var max = __rangesA[facet.id].max;
			var sliderId = facet.id;
			var nTicks = Math.min(40, (max - min + 1));
			nTicks = (nTicks >= 5) ? nTicks : 40;
            var nStep = pop = (max - min) / nTicks;
            if ( nStep > 1 && nStep < 2 ) {
                nTicks = max - min +1;                     
            }

			var szScale = ((max - min) < 40) ? "" : "LOG";
			var fDiscret = (nTicks == max-min);

			var barA = __getScatterArray(__rangesA[facet.id].data, min, max, nTicks, szScale);
			var maxHeight = 0;
			barA.count.forEach(function (height) {
				maxHeight = Math.max(maxHeight, height);
			});
			var scale = 75 / maxHeight;
			var width = 210 / nTicks;
			szHtml = "";

			for (b = 0; b < barA.count.length - 1; b++) {
				var height = barA.count[b];
				var bMin = barA.min[b];
				var bMax = fDiscret?barA.min[b]:barA.min[b + 1];
				var color = ((bMax >= rangeA[0]) && (bMin <= rangeA[1])) ? "#888" : "#ddd";

				if (fOnMap) {
					//color = objTheme.partsA[0].color;
					objTheme.partsA.forEach(function (part) {
						if (bMin >= part.min) {
							color = part.color;
						}
					});
				}
				var szFilter = "ixmaps.filterThemeItems(null, null, '', { field: '"+facet.id+"', min: "+bMin+", max: "+bMax+" }";
				var szHighlight = "$(this).css('background','#880000');"+szFilter;
				var szClearHighlight = "$(this).css('background','');ixmaps.filterThemeItems(null,null,'','remove');"
                bMin = ixmaps.__formatValue(bMin, 2, "BLANK");
			    bMax = ixmaps.__formatValue(bMax, 2, "BLANK");
 				szHtml += "<div style='display:inline-block;width:" + width + "px;background-color:" + color + ";height:" + (1 + (height * scale)) + "px;' data-toggle='tooltip' title='" + (bMin + ' - ' + bMax) + " onmouseover='" + szHighlight + "' onmouseout='" + szClearHighlight + "'></div>";
			}
			szHtml += "</div>";

			$("#" + sliderId + "histogram").html(szHtml);
		}
	};

	__oldFilter = "";

	// ---------------------------------------------------
	// highlight map theme items by query
	// select data by query and create list of theme items 
	// highlight this item on the map
	// ---------------------------------------------------

	__HighlightFacetItems = function (szField, szValue) { console.log("__HighlightFacetItems");
		var objTheme = ixmaps.getThemeObj();
		__oldFilter = objTheme.szFilter;
		if ( objTheme && ( objTheme.szFlag.match(/AGGREGATE/) || objTheme.szFlag.match(/MULTI/)) ){
			if ( __oldFilter.match(/WHERE/) ){
				ixmaps.filterThemeItems(null, null, __oldFilter + ' AND "'+szField+'" = "'+szValue+'"', 'set');
			}else{
				ixmaps.filterThemeItems(null, null, 'WHERE "'+szField+'" = "'+szValue+'"', 'set');
			}
		}else{
			ixmaps.filterThemeItems(null, null, "", { field: szField, txt: szValue });
		}
		return;

		// theme
		// ------------------------------------
		var objThemeDefinition = ixmaps.getThemeDefinitionObj();
		var objTheme = ixmaps.getThemeObj();

		// theme data
		// ------------------------------------
		var szData = objThemeDefinition.style.dbtable;
		var dataObj = eval("ixmaps.embeddedSVG.window." + (szData || "themeDataObj"));

		// create data object from theme data
		// ------------------------------------
		var mydata = new Data.Table(dataObj);

		// create highlight item list
		// -----------------------------------
		var layer = null;
		for (item in objTheme.itemA) {
			layer = item.split("::")[0];
		}

		var valuesA = [];
		var x = mydata.select(szQuery);
		var lookupA = objThemeDefinition.style.lookupfield.split("|");
		lookupA.forEach(function (id) {
			valuesA.push(x.column(id).values());
		});

		var itemA = [];
		for (k = 0; k < valuesA[0].length; k++) {
			var itemJ = [];
			for (kk = 0; kk < valuesA.length; kk++) {
				itemJ.push(valuesA[kk][k]);
			}
			itemA.push(layer + "::" + itemJ.join(','));
		}

		ixmaps.highlightThemeItems(null, itemA.join("|"), '|');
	};

	// ===========================================
	//
	// create the html facet list
	//
	// ===========================================

	ixmaps.data.showFacets = function (szFilter,szDiv,facetsA) {

		console.log(" *** step: 0 ***");
		var fTest = true;
		var sliderA = [];

		var objThemeDefinition = ixmaps.data.objThemeDefinition;
		var objTheme = ixmaps.data.objTheme;

		var szHtml = "";
		szHtml += "<div id='list-facets' class='list-group' style='width:100%;margin-bottom:5em;'>";

		$("#"+(szDiv||"facets")).html(szHtml);
		
		console.log(" *** step: 1 ***");

		// create an array of the filter to pass them to the executing function
		// to avoid problems with special characters " and '
		__queryA = [];

		// check if we have already a filter defined
		// and facets are elements of the filter
		var nSelectA = [];
		for (var i = 0; i < facetsA.length; i++) {
			__facetFilterA.forEach(function (szFilter) {
				if (szFilter.split("\"")[1] == facetsA[i].id) {
					nSelectA.push(i);
				}
			});
		}
		/**
		// if yes, get the selected facet to the top of the list
		nSelectA.forEach(function (nSelect) {
			var toTop = facetsA.slice(nSelect, nSelect + 1);
			facetsA.splice(nSelect, 1);
			facetsA.splice(0, 0, toTop[0]);
		});
		**/
	console.log(" *** step: 2 ***");
		for (var i = 0; i < facetsA.length; i++) {

			var fActiveFacet = false;
			var szActiveFilter = null;
            
            // replace all non word characters with underscore
			var szSafeId = facetsA[i].id.replace(/ |\W/g, "_");

			__facetFilterA.forEach(function (szFilter, index) {
				if (szFilter.split("\"")[1] == facetsA[i].id) {
					fActiveFacet = true;
					szActiveFilter = szFilter;
				}
			});

			szHtml += fActiveFacet ? "<div class='facet-active'>" : "<div class='facet'>";

			// ------------------------------
			// facet header - with fieldname
			// ------------------------------

			var bgColor = fActiveFacet ? "#884444" : "#888888";

			var szMin = ixmaps.__formatValue(facetsA[i].min, 2, "BLANK");
			var szMax = ixmaps.__formatValue(facetsA[i].max, 2, "BLANK");

			szHtml += fActiveFacet ? "<a href='javascript:__removeFacets(\"" + (facetsA[i].id) + "\");' style='color:white' >" : "";
			szHtml += "<div style='font-family:arial;font-size:1.1em;text-align:left;padding:0.5em 0.5em 0.5em 0.5em;margin:1em 0 0.4em 0;background:" + bgColor + ";border-radius:5px;color:white'>";
			szHtml += facetsA[i].id;
            
			if(facetsA[i].data &&
               facetsA[i].data.length &&
               !isNaN(facetsA[i].min) &&
               !isNaN(facetsA[i].max) &&
               (facetsA[i].min < facetsA[i].max) ){
 				szHtml += (typeof (facetsA[i].min) != "undefined") ? ((facetsA[i].min != facetsA[i].max) ? (": " + szMin + " - " + szMax) : (": " + szMin)) : "";
			}
            
			szHtml += fActiveFacet ? "<span style='float:right;margin-right:0em;padding-top:0.1em;'><i class='icon shareIcon share_bitly icon-cancel-circle' title='Share a short link' tabindex='-1'></i></span>" : "";
			szHtml += "</div>";
			szHtml += fActiveFacet ? "</a>" : "";

			if (facetsA[i].type == "textual") {
				var placeholder = "Search for..." + ( (!facetsA[i].values)?(" (e.g. "+(facetsA[i].example||" ")+")"):"" );
				var value = "";
				if (fActiveFacet) {
					value = placeholder = szActiveFilter.split("\"")[3];
				}
				szHtml += '<div class="input-group" style="margin-bottom:0.5em" >';
				szHtml += '<input id="' + (szSafeId + "query") + '" type="text" class="form-control" style="background:transparent;border:none" value="' + value + '" placeholder="' + placeholder + '"';
				szHtml += 'onKeyUp="if(event.which == 13){var value = $(\'#' + (szSafeId + "query") + '\').val();__setFilter(\'' + facetsA[i].id + '\',value);}">';
				szHtml += '<span class="input-group-btn">';
				szHtml += '<button class="btn btn-search" type="button" onclick="var value = $(\'#' + (szSafeId + "query") + '\').val();__setFilter(\'' + facetsA[i].id + '\',value);"><i class="icon shareIcon share_bitly icon-search" title="Search by text" tabindex="-1"></i> </button>';
				szHtml += '</span></input>';
				szHtml += '</div>'
			}

	console.log(" *** step: 3 ***");
			// ---------------------------------
			// facet content
			// ---------------------------------

			if (typeof (facetsA[i].min) != "undefined" && 
				 !isNaN(facetsA[i].min)				   &&
				 !isNaN(facetsA[i].max)				   &&
				 (facetsA[i].min < facetsA[i].max)	   ){

				// ---------------------------------
				// continous value facet
				// make min/max slider
				// ---------------------------------

	console.log(" *** step: 3.1 ***");
				if (!__rangesA[facetsA[i].id] || !fActiveFacet) {
					__rangesA[facetsA[i].id] = { min: facetsA[i].min, max: facetsA[i].max, data: facetsA[i].data, id: facetsA[i].id };
				}

				var min = __rangesA[facetsA[i].id].min;
				var max = __rangesA[facetsA[i].id].max;
				var szMin = ixmaps.__formatValue(__rangesA[facetsA[i].id].min, 2, "BLANK");
				var szMax = ixmaps.__formatValue(__rangesA[facetsA[i].id].max, 2, "BLANK");

				var href = "#";
				var bgColor = "#eeeeee";
				var szCount = "";

				// make histogram
				// ---------------------------------

				if (facetsA[i].data) {

	console.log(" *** step: 3.11 ***");
					console.log(objThemeDefinition);
					var fOnMap = false;
					if ((objThemeDefinition.field == facetsA[i].id)) {
						fOnMap = true;
					}

					var sliderId = szSafeId;
					var nTicks = Math.min(40, (max - min + 1));
					nTicks = (nTicks >= 5) ? nTicks : 40;
                    
                    var nStep = pop = (max - min) / nTicks;
                    if ( nStep > 1 && nStep < 2 ) {
                        nTicks = max - min;                     
                    }
	console.log(" *** step: 3.2 ***");

					var szScale = ((max - min) < 40) ? "" : "LOG";

					var barA = __getScatterArray(__rangesA[facetsA[i].id].data, min, max, nTicks, szScale);
					var maxHeight = 0;
					barA.count.forEach(function (height) {
						maxHeight = Math.max(maxHeight, height);
					});
					var fDiscret = (nTicks == max-min+1);
					var scale = 75 / maxHeight;
					var width = 210 / nTicks;
					szHtml += '<div style="background:#eeeeee;margin-top:0.4em;border-radius:5px;">'

					szHtml += '<div id="' + sliderId + 'histogram" style="padding-top:2em">';
					for (b = 0; b < barA.count.length - 1; b++) {
						var height = barA.count[b];
						var bMin = barA.min[b];
						var bMax = fDiscret?barA.min[b]:barA.min[b + 1];
						var szbMin = ixmaps.__formatValue(bMin, bMin < 100 ? 2 : 0, "BLANK");
						var szbMax = ixmaps.__formatValue(bMax, bMax < 100 ? 2 : 0, "BLANK");
						var fActive = ((bMax >= facetsA[i].min) && (bMin <= facetsA[i].max));
						var color = fActive ? "#888" : "#ddd";
						if (fOnMap) {
							//color = objTheme.partsA[0].color;
							objTheme.partsA.forEach(function (part) {
								if (bMin >= part.min) {
									color = part.color;
								}
							});
						}

						var szTooltip = 
                            fDiscret?String(bMin):ixmaps.__formatValue(bMin, 2, "BLANK") + ' - ' + ixmaps.__formatValue(bMax, 2, "BLANK");
						var szFilter = "ixmaps.filterThemeItems(null, null, \"\", { field: \""+facetsA[i].id+"\", min: "+bMin+", max: "+bMax+" });";
						var szHighlight = "__origBg=$(this).css(\"background\");$(this).css(\"background\",\"#880000\");";//+szFilter;
						var szClearHighlight = "$(this).css(\"background\",__origBg);";//ixmaps.filterThemeItems(null,null,\"\",\"remove\");"
						var szHighlight = "$(this).css(\"border\",\"solid #ffffff 0.5px\");";//+szFilter;
						var szClearHighlight = "$(this).css(\"border\",\"\");";//ixmaps.filterThemeItems(null,null,\"\",\"remove\");"
						var szRange = "__setRangeFilter(\""+facetsA[i].id+"\", \""+bMin+","+bMax+"\", 0, 0)";

						szHtml += "<div style='display:inline-block;width:" + width + "px;background-color:" + color + ";height:" + (1 + (height * scale)) + "px;' ";
						szHtml += " data-toggle='tooltip' title='" + szTooltip + "' onClick='" + szRange + "'"; 
						szHtml += fActive?(" onmouseover='" + szHighlight + "' onmouseout='" + szClearHighlight + "'>"):">";
						szHtml += "</div>";
						//szHtml += "<div style='display:inline-block;width:" + width + "px;background-color:" + color + ";height:" + (1 + (height * scale)) + "px;' data-toggle='tooltip' title='" + (szbMin + ' - ' + szbMax) + "'></div>";
					}
					szHtml += "</div>";

	console.log(" *** step: 3.3 ***");
					// make slider
					// ---------------------------------

					sliderA.push({ id: sliderId, field: facetsA[i].id, scale: szScale, min: min, max: max, ticks: nTicks });
					szHtml += '<div style="margin:0em 0em 0.5em 0em;background:#eee;border-radius:5px;height:2.5em;padding-top:0.5em"><span class="minvalue">' + szMin + '</span> <input id="' + sliderId + '" type="text" class="span2" value="" data-slider-min="' + min + '" data-slider-max="' + max + '" data-slider-step="5" data-slider-value="[' + facetsA[i].min + ',' + facetsA[i].max + ']"/> <span class="maxvalue">' + szMax + '</span></div>';

					szHtml += '</div>'
				}
			} else
	console.log(" *** step: 3.2 ***");
				if (facetsA[i].values) {

					// ---------------------------------
					// unique value facet
					// ---------------------------------

					szHtml += '<div>'

					// if more than 20 items, clip list to 10
					// --------------------------------------
					var maxII = (facetsA[i].values.length<12)?facetsA[i].values.length:10;
					
					console.log(facetsA[i].values.length +" items, clipped to "+maxII)

					for (var ii = 0; ii <facetsA[i].values.length; ii++) {

						if (facetsA[i].values[ii] != " ") {

							// make the facet filter 
							var szQuery = "WHERE \"" + facetsA[i].id + "\" = \"" + facetsA[i].values[ii] + "\"";

							// make href, pass filter by filter array to avoid " or ' conflicts
							__queryA.push(szQuery);
							var href = "javascript:__setFacetFilter(__queryA[" + (__queryA.length - 1) + "]);";

							// how often is the value in the column
							var nCount = facetsA[i].valuesCount ? facetsA[i].valuesCount[facetsA[i].values[ii]] : null;
                            var nMaxCount = facetsA[i].nValuesSum || facetsA[i].nCount;
                            
							var bgColor = "#eeeeee";
							var szCount = ixmaps.__formatValue(nCount, 0, "BLANK") + " " + (ixmaps.data.fShowFacetValues?(objTheme.szUnits||""):""); //String(nCount || "");

							if ((objThemeDefinition.field == facetsA[i].id)) {
								bgColor = objTheme.colorScheme[objTheme.nStringToValueA[facetsA[i].values[ii]] - 1];
								//href = "javascript:ixmaps.markThemeClass('" + objTheme.szId + "'," + (objTheme.nStringToValueA[facetsA[i].values[ii]] - 1) + ");";
							}

							// facet button with one unique value
							// -----------------------------------
							//szHtml += '<a href="'+href+'" onmouseover="'+szHighlight+'" onmouseout="'+szClearHighlight+'" >';
							szHtml += '<a href="' + href + '">';
							szHtml += '<div class="input-group" style="margin-bottom:0.5em;width:100%">';
							if ((objThemeDefinition.field == facetsA[i].id)) {
								szHtml += '<span class="input-group-addon" id="btnGroupAddon" style="background:' + bgColor + '"></span>';
							}
							var szText = facetsA[i].values[ii];
							if (facetsA[i].type == "textual") {
								if (fActiveFacet) {
									value = szActiveFilter.split("\"")[3].replace("\/","\\\/");
									var szTextA = eval("szText.split(/"+value+"/i)");
									szText = szTextA.join("<span style='background:#ffff00'>"+value+"</span>");
								}
							}
							szHtml += '<button type="button" class="btn btn-block btn-secondary " style="width:100%"><span style="margin-left:-0em;float:left;white-space:normal;text-align:left">' + szText + '</span><span class="badge badge-primary badge-pill pull-right" style="top:0.1em;right:0.2em;float:right;text-align:right" onmouseover=\'' + szHighlight + '\' onmouseout=\'' + szClearHighlight + '\'>' + szCount + '</span></button>';
                            
                            var nWidth = (100/nMaxCount*nCount);
							console.log("100/"+nMaxCount+"*"+nCount);
                            if ( !isNaN(nWidth) && (nWidth<100) && (facetsA[i].uniqueValues > 2) ) {
                                szHtml += '<div style="position:relative;top:0.25em;left:0.1em;background:rgba(208,208,208,1);line-height:0.4em;width:'+nWidth+'%;border-radius:0 0.5em 0.5em 0">&nbsp;</div>';                               
                                }
                                
							szHtml += '</div>';
							szHtml += '</a>';
						}

						// clip list to max itema
						// --------------------------------------
						if ( ii == maxII ){
							szHtml += '</div>';
							szHtml += '<div id="'+(szSafeId+"plus")+'" style="display:none">';
						}

					}

					szHtml += '</div>';
					szHtml += '<div>';

					// if list clipped, make butto to expand 
					// --------------------------------------
					if ( facetsA[i].values.length > maxII ){
						szHtml += '<a ><button type="button" class="btn btn-default " style="padding:0.2em 0.5em" onclick="$(this).hide();$(\'#'+(szSafeId+"plus")+'\').toggle();">+ '+(facetsA[i].values.length-maxII)+'</button></a>';
					}

					szHtml += "</div>";
				} else {
					szHtml += '(too many values)';
				}
			szHtml += "</div>";
		}
		szHtml += "</div>";
	console.log(" *** step: 5 ***");
		
		//console.log(szHtml);

		$("#"+(szDiv||"facets")).html(szHtml);
		
		return;

		sliderA.forEach(function (x) {

			$("#" + x.id + "histogram").css("margin-left", ($("#" + x.id).prev().offset().left + $("#" + x.id).prev().width()) + "px");

			var nStep = ((x.max - x.min) == x.ticks)?1:Math.min(1, Math.pow(10, Math.floor(Math.log((x.max - x.min) / 100))));

			var mySlider = $("#" + x.id).slider({
				step: nStep,
				tooltip_split: true,
				tooltip_position: "bottom",
				scale: (x.scale == "LOG") ? 'logarithmic' : 'linear'
			}).on("slideStop", function () {
				__setRangeFilter(x.field, $(this).context.value, $(this).attr("data-slider-min"), $(this).attr("data-slider-max"));
			}).on("slide", function () {
				__makeHistogram($(this).attr("id"), $(this).context.value);
			});
		});
	console.log(" *** step: 6 ***");

		$('[data-toggle="tooltip"]').tooltip();
	};

	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------
