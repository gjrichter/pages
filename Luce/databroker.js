
window.ixmaps = window.ixmaps || {};
window.ixmaps.themeDataObj_Luce = window.ixmaps.themeDataObj_Luce || {};

(function() {

	// --------------------------------------------------------------
	// create number of listings field
	// --------------------------------------------------------------

	ixmaps.themeDataObj_Luce.after = function(data){

		// the LAMPADA column is something like "SODIO AP 1500"

		// create column CONSUMO with numeric part of LAMPADA
		data.addColumn({'source':'LAMPADA','destination':'CONSUMO'},
			function(value){
				var xA = value.split(" ");
				var n = xA.pop();
				return(parseInt(n));
			});

		// create column TIPO with text part of LAMPADA
		data.addColumn({'source':'LAMPADA','destination':'TIPO'},
			function(value){
				var xA = value.split(" ");
				xA.pop();
				return(xA.join(" "));
			});

		return data;
	};
	
	
		ixmaps.htmlgui_colorScheme = function(objTheme){
			if ( objTheme.colorScheme == "user" ){
				for ( i=0; i<objTheme.szLabelA.length; i++){
					if ( objTheme.szLabelA[i].match(/LED/i) ){
						objTheme.colorScheme[i] = "#ddddff";
					}else
					if ( objTheme.szLabelA[i].match(/SODIO/i) ){
						objTheme.colorScheme[i] = "#ff9900";
					}else
					if ( objTheme.szLabelA[i].match(/mercurio/i) ){
						objTheme.colorScheme[i] = "#ffeeaa";
					}else
					if ( objTheme.szLabelA[i].match(/joduri/i) ){
						objTheme.colorScheme[i] = "#ffffff";
					}else
					if ( objTheme.szLabelA[i].match(/halo/i) ){
						objTheme.colorScheme[i] = "#ffffff";
					}else{
						objTheme.colorScheme[i] = "#ffffdd";
					}
				}
			}
		}
	

})();
