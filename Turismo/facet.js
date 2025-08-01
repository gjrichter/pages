/** 
 * @fileoverview This file provides functions for facet filtering
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 * @copyright CC BY SA
 * @license MIT
 */

ixmaps = ixmaps || {};
ixmaps.data = ixmaps.data || {};

(function () {
	
	// ===========================================
	//
	// h e l p e r
	//
	// ===========================================

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

	__facetFilterA = [];
	__rangesA = [];

	// ===========================================
	//
	// create filter facets from theme data
	//
	// ===========================================

	ixmaps.data.getFacets = function (szFilter,szDiv,szFieldsA,szId,szMap,fFlag) {
		
		facetsA = [];

		var fTest = true;
		var sliderA = [];

		console.log("=== make statistic facets === "+szId);
		
		var szThemeId = ixmaps.filterThemeId = szId;
	
		// theme object
		// ------------------------------------
		var objTheme = ixmaps.data.objTheme = ixmaps.map(szMap||"map").theme(szThemeId).obj;
		var objThemeDefinition = ixmaps.data.objThemeDefinition = ixmaps.getThemeDefinitionObj(null,szThemeId);

		// create data object from theme data
		// ------------------------------------
		var mydata = new Data.Table(null);
		mydata.table = objTheme.objTheme.dbTable;
		mydata.fields = objTheme.objTheme.dbFields;
		mydata.records = objTheme.objTheme.dbRecords;

		// GR 23.02.2018 take only rows which are on the map
		// -------------------------------------------------
		records = [];
		try	{
			for ( i in objTheme.indexA ){
				if ( objTheme.itemA[objTheme.indexA[i]].dbIndex ){
					records.push(mydata.records[objTheme.itemA[objTheme.indexA[i]].dbIndex]);
				}
				if ( objTheme.itemA[objTheme.indexA[i]].dbIndexA ){
					for ( a in objTheme.itemA[objTheme.indexA[i]].dbIndexA ) {
						records.push(mydata.records[objTheme.itemA[objTheme.indexA[i]].dbIndexA[a]]);
					}
				}
			}
		}
		// maybe the data is not ready, then we repeat
		catch (e){
			setTimeout("ixmaps.data.makeFacets('"+szFilter+"','"+szDiv+"')",1000);
			console.log("error data not ready !!!");
			return;
		}

		mydata.records = records;
		
		__facetFilterA = [];
		
		// if we have already a filter on the map,
		// filter data before creating facets
		// ------------------------------------
		if (szFilter && szFilter.match(/WHERE/)) {
			mydata = mydata.select(szFilter);

			// get filter parts
			// ----------------
			var szPartsA = szFilter.split('WHERE ')[1].split('AND');
			// test if BETWEEN x AND y and join two parts around AND
			for ( i=0; i<szPartsA.length; i++ ){
				if ( szPartsA[i].match(/BETWEEN/) ){
					szPartsA[i] = szPartsA[i] + "AND" + szPartsA[i+1];
					szPartsA.splice(i+1,1);
				}
			}
			// set filter parts
			// ----------------
			szPartsA.forEach(function(x){
				__facetFilterA.push(x);
			});
		}

		// make facets from data fields
		// ----------------------------

		var a, u;
		
		szFieldsA = szFieldsA || mydata.columnNames();
		
		for ( i in szFieldsA ){
			if (szFieldsA[i] == "geometry"){
				szFieldsA.splice(i, 1);
			}
		}

		var v = null;
		if (objThemeDefinition.style.sizefield) {
			if (ixmaps.data.fShowFacetValues) {
				v = mydata.column(objThemeDefinition.style.sizefield).values();
				v = v.map(function(value){var x = __scanValue(value);return (isNaN(x)?0:x);})
			}
			$("#facets-counts-values").show();
		}
		for (var i = 0; i < szFieldsA.length; i++) {
			
			var szField = szFieldsA[i];
			
			console.log(szField);
			
			if (!mydata.column(szField)){
				continue;
			}
			
			a = mydata.column(szField).values();
			console.log(a);
			// test for only numeric values
			// ----------------------------
			fNumeric = true;
			a.every(function (x) {
				if (x.length && (x != "undefined") && (x != '""') && (x != "''") && (x != "NaN") && (x != "NULL") && isNaN(__scanValue(x))) {
					fNumeric = false;
				}
				return fNumeric;
			}); 
			if (fFlag && fFlag.match(/NONUMERIC/)){
				fNumeric = false;
			}
			// test if field already part of the active query 
			// ------------------------------------------
			var fActiveFacet = false;
			__facetFilterA.forEach(function (szFilter, index) {
				if ((szFilter.split("\"")[1] == szField) && ((szFilter.split("\"")[2] == " is ")||(szFilter.split("\"")[2] == " = "))) {
					fActiveFacet = true;
				}
			});
			
			console.log("a)");

			// test for unique values 
			// -----------------------

			// first test maximal 250 values at the beginning 

			a.length = Math.min(a.length, 250);
			u = a.filter(__onlyUnique);

			// if we have many unique values and they are numbers,
			// make a numerique facet, if they are texts, skip field
			// -----------------------------------------------------
			if ((a.length >= 250) && (u.length >= (a.length / 5))) {

				if (fNumeric) {

					a = mydata.column(szField).values();
					var sum = 0;
					a = a.map(function (x) {
						x = __scanValue(x);
						sum += x||0;
						return (x);
					});
					a.sort(function (a, b) {
						return (a-b);
					});
					var facet = {};
					facet.id = szField;
					facet.min = a[0];
					facet.max = a[a.length - 1];
					facet.sum = sum;
					facet.values = a;
					facet.data = a;
					facetsA.push(facet);

				} else {
					// make input field to define filter 
					// ------------------------------------------
					var facet = {};
					facet.id = szField;
					facet.type = "textual";
					facet.example = a[0];

					if (fActiveFacet) {

						// add value list in any case 
						// ---------------------------
						facet.values = a;
						// count values
						var valuesCount = {};
						var nCount = {};
						a.forEach(function (x) {
							valuesCount[x] = (valuesCount[x] || 0) + 1;
                            nCount++;
						});
						facet.nCount = nCount;
						facet.valuesCount = valuesCount;
						facet.uniqueValues = a.length;
					}

					facetsA.push(facet);
				}
				continue;
			};

			// ok, data with many different values done
			// lets get all! unique values
			// -----------------------------------------

			a = mydata.column(szField).values();

			// get unique values array
			u = __getUniqueValues(a);

			// if less than 50 unique values, make text or number facet
			// --------------------------------------------------------

			if (u.length < 50 && !__rangesA[szField] && !fNumeric) {

				// count values
				var valuesCount = {};
				var nCount = 0;
				var nValuesSum = 0;
				a.forEach(function (x) {
					valuesCount[x] = (valuesCount[x] || 0) + (v?Number(v[nCount]):1);
					nValuesSum += (v?Number(v[nCount]):1);
                    nCount++;
				});

				if (fNumeric) {
					u = u.map(function (x) {
						return Number(x);
					});
					u.sort(function (a, b) {
						return ((a > b) ? 1 : -1);
					});
				} else {
					u.sort();
					u.sort(function (a, b) {
						return ((valuesCount[a] < valuesCount[b]) ? 1 : -1);
					});
				}

				var facet = {};
				facet.id = szField;
				facet.values = u;
				facet.nCount = nCount;
				facet.nValuesSum = nValuesSum;
				facet.valuesCount = valuesCount;
				facet.uniqueValues = u.length;

				if ((u.length >= 1) || fActiveFacet) {
					facet.type = "textual";
				}

				facetsA.push(facet);

			}
			else {

				// more than 50 unique values

				if ( fNumeric ) {
					if ( u.length > 0 ) {

						// if more than 3 values, make min/max range filter
						// ------------------------------------------
						a = mydata.column(szField).values();
						var min = Number.MAX_VALUE;
						var max = (-Number.MAX_VALUE);
						var fNaN = false;
						var sum = 0;
						a = a.map(function (x) {
							x = __scanValue(x);
							min = Math.min(min, x||min);
							max = Math.max(max, x||max);
							sum += x||0;
							return (x);
						});
						var facet = {};
						facet.id = szField;
						facet.min = min; //a[0];
						facet.max = max; //a[a.length-1];
						facet.sum = sum;
						facet.data = a;
						facet.uniqueValues = u.length;
						facet.type = "numeric";
						facetsA.push(facet);
						
					}else{
						
						// make input field to define filter 
						// ------------------------------------------
						var facet = {};
						facet.id = szField;
						facet.type = "categorical";
						if (u.length < 200) {
							// add value list
							// ---------------
							facet.values = u;
							var valuesCount = {};
							var nCount = 0;
							a.forEach(function (x) {
								valuesCount[x] = (valuesCount[x] || 0) + 1;
								nCount++;
							});
							u.sort(function (a, b) {
								return ((valuesCount[a] < valuesCount[b]) ? 1 : -1);
							});
							facet.nCount = nCount;
							facet.valuesCount = valuesCount;
							facet.uniqueValues = u.length;
						}
						facetsA.push(facet);
						
					}

				} else {

					// if not numeric, make input field to define filter 
					// ------------------------------------------
					var facet = {};
					facet.id = szField;
					facet.type = "textual";
					if (u.length < 200) {
						// add value list
						// ---------------
						facet.values = u;
						var valuesCount = {};
						var nCount = 0;
						var nValuesSum = 0;
						a.forEach(function (x) {
							valuesCount[x] = (valuesCount[x] || 0) + (v?Number(v[nCount]):1);
  							nValuesSum += (v?Number(v[nCount]):1);
                            nCount++;
						});
						u.sort(function (a, b) {
							return ((valuesCount[a] < valuesCount[b]) ? 1 : -1);
						});
						facet.nCount = nCount;
						facet.nValuesSum = nValuesSum;
						facet.valuesCount = valuesCount;
						facet.uniqueValues = u.length;
					}
					facetsA.push(facet);
				}
			}
		}
		console.log("=== make statistic facets - end ===");
		return facetsA;
	};

	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------

