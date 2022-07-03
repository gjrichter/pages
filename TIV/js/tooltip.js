/**
 * data broker for COVID-19 Italy Map
 * loads data fro ArcGis feature service
 * parses it into iXMaps data table
 */

window.ixmaps = window.ixmaps || {};
(function () {

		ixmaps.htmlgui_onTooltipDisplay = function(szText,evt) {
			
			console.log("hi")
			
			if (!window.document.getElementById("tooltip")){
				var div = document.createElement("div");
				div.setAttributeNS(null,"id","tooltip");
				document.activeElement.appendChild(div);
			}
			
			var szHtml = "";
			
			var width = window.innerWidth/4;
			
			var xPos = evt.clientX;
			var yPos = evt.clientY;
			
			var fontsize = 22/1200*window.innerWidth;
			
			szHtml += "<div id='tooltipDiv' style='position:absolute;left:"+xPos+"px;top:"+yPos+"px;font-family: arial narrow, system;font-size:"+fontsize+"px;color: #444;background: white;border: 0.5px solid black;border-radius: 5px;max-width:80%'>";
			
			szHtml += "<div style='margin:0.5em 0.5em'>"+szText+"</div>";
			
			szHtml += "<div id='chartDiv' style='margin:0.5em 1em;width:"+width+"px;overflow:hidden'><svg width='300' height='300' viewBox='0 0 5000 5000'><g id='getchartmenutarget' onmousemove='javascript:ixmaps.onMouseOver();' onmouseout='javascript:ixmaps.onMouseOut();' style='pointer-events:all'></g></svg></div>";

			szHtml += "</div>";
			
			console.log("hi-1")
			//ixmaps.setMapOverlayHTML(szHtml);
			
			window.document.getElementById("tooltip").innerHTML = szHtml;
			szId = evt.path[1].getAttributeNS(null,"id");
			var szIdA = szId.split(":");
			var szFlag = "VALUES|XAXIS|ZOOM|BOX|GRID";
			var themesA = ixmaps.getThemes();
			for ( var t=0; t<themesA.length; t++ ){
				var objTheme = themesA[t];
				if ( objTheme.szFlag.match(/PLOT/) ){
					console.log(objTheme.szFlag);
					objTheme.drawChart(window.document.getElementById("getchartmenutarget"), szIdA[0] + "::" + szIdA[2], 30, szFlag);
				}
			}
			console.log("hi-2")

			var SVGBox = window.document.getElementById("getchartmenutarget").getBBox();
			console.log(SVGBox);
			if (SVGBox && SVGBox.width && SVGBox.height) {
				var scale = Math.max(1, width / SVGBox.width);
				SVGBox.width *= scale;
				SVGBox.height *= scale;
				SVGBox.y -= 30;
				SVGBox.height += 60;

				var size = width;
				var width = size;
				var height = size / SVGBox.width * SVGBox.height;
				while (height > width) {
					height *= 0.9;
				}

				window.document.getElementById("getchartmenutarget").parentNode.setAttribute("width", width);
				window.document.getElementById("getchartmenutarget").parentNode.setAttribute("height", height);
				window.document.getElementById("getchartmenutarget").parentNode.setAttribute("viewBox", SVGBox.x + ' ' + SVGBox.y + ' ' + SVGBox.width + ' ' + SVGBox.height);
				
				xPos = xPos>window.innerWidth/2?(xPos-width-100):xPos+30;
				yPos = yPos>window.innerHeight/2?(yPos-width/2):(yPos+150);
				window.document.getElementById("tooltipDiv").style.left = xPos + "px";
				window.document.getElementById("tooltipDiv").style.top = yPos + "px";

			} else {
				window.document.getElementById("chartDiv").remove();
			}
			
			console.log("hi-3")
			return true;
		}
	
		ixmaps.htmlgui_onTooltipDelete = function(){
			ixmaps.setMapOverlayHTML("");
			window.document.getElementById("tooltip").innerHTML = "";
		}
		
		ixmaps.htmlgui_onItemOver = function(szId,evt) {
			if (szId.match(/mapbackground/)){
				return true;
			}
			__themeObj = ixmaps.getThemeObj(szId.split(":")[0]);
			try{
				var data = ixmaps.getData(szId);
				var szTooltip = " &rarr; "+ data[0].Country +": "+ data[0].Total + " Mio €";
			} catch (e) {
				var szTooltip = szId.split("::")[1];
			}
			ixmaps.htmlgui_onTooltipDisplay(szTooltip,evt);
			return true;
		}
		

})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------

