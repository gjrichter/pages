/**
 * data broker for COVID-19 Italy Map
 * loads data fro ArcGis feature service
 * parses it into iXMaps data table
 */

window.ixmaps = window.ixmaps || {};
(function () {
	
	var __fTooltipPin = false;
	var __fTooltipPinned = false;

	ixmaps.htmlgui_onTooltipDisplay = function (evt,szText) {
		
		console.log("hi")
		console.log(evt)
		
		if (!szText || szText.length<=0){
			return;
		}

		if (!window.document.getElementById("tooltip")) {
			var div = document.createElement("div");
			div.setAttributeNS(null, "id", "tooltip");
			document.activeElement.appendChild(div);
		}

		var szHtml = "";

		var width = Math.min(400,window.innerWidth / 2);
		var height = window.innerHeight / 2;

		var xPos = evt.clientX;
		var yPos = evt.clientY;

		if(evt.type == 'touchstart' || evt.type == 'touchmove' || evt.type == 'touchend' || evt.type == 'touchcancel'){
			var touch = evt.touches[0] || evt.changedTouches[0];
			xPos = touch.pageX;
			yPos = touch.pageY;
		} else if (evt.type == 'mousedown' || evt.type == 'mouseup' || evt.type == 'mousemove' || evt.type == 'mouseover'|| evt.type=='mouseout' || evt.type=='mouseenter' || evt.type=='mouseleave') {
			xPos = evt.clientX;
			yPos = evt.clientY;
		}			

		var fontsize = Math.min(14,Math.max(11,(22 / 1200 * window.innerWidth)));

		szHtml += "<div id='tooltipDiv' style='position:absolute;left:" + xPos + "px;top:" + yPos + "px;font-family: arial narrow, system;font-size:" + fontsize + "px;color: #444;background: white;border: 0.5px solid black;border-radius: 5px;margin-top:0.7em;margin-right:0.7em;'>";
		console.log(szText);
		szHtml += "<div style='margin:0.5em 0.5em;max-width:"+width+"px;max-height:"+height+"px;overflow:auto'>" + szText + "</div>";

		szHtml += "<div id='chartDiv' style='margin:0.5em 1em;width:" + width + "px;overflow:hidden'><svg width='300' height='300' viewBox='0 0 5000 5000'><g id='getchartmenutarget' onmousemove='javascript:ixmaps.onMouseOver();' onmouseout='javascript:ixmaps.onMouseOut();' style='pointer-events:all'></g></svg></div>";

		if (__fTooltipPin) {
			szHtml += "<div onclick='ixmaps.htmlgui_deleteItemPinned()' style='position:absolute;top:-0.5em;right:-0.5em;font-size:16px;color:white;background:#444444;padding:0 0.25em;border-radius:1em;cursor:pointer;'>&Cross;</div>"
			__fTooltipPinned = true;
		}
		
		szHtml += "</div>";

		console.log("hi-1")
		//ixmaps.setMapOverlayHTML(szHtml);
		
		
		
		

		window.document.getElementById("tooltip").innerHTML = szHtml;
		szId = evt.path[1].getAttributeNS(null, "id");
		var szIdA = szId.split(":");
		var szFlag = "VALUES|XAXIS|ZOOM|BOX|GRID";
		var themesA = ixmaps.getThemes();
		for (var t = 0; t < themesA.length; t++) {
			var objTheme = themesA[t];
			if (objTheme.szFlag.match(/PLOT/)) {
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

			xPos = xPos > window.innerWidth / 2 ? (xPos - width - 100) : xPos + 30;
			yPos = yPos > window.innerHeight / 2 ? (yPos - width / 2) : (yPos + 150);
			window.document.getElementById("tooltipDiv").style.left = xPos + "px";
			window.document.getElementById("tooltipDiv").style.top = yPos + "px";

		} else {
			window.document.getElementById("chartDiv").remove();
			var width = window.document.getElementById("tooltipDiv").clientWidth;
			var height = window.document.getElementById("tooltipDiv").clientHeight;
			xPos = xPos > window.innerWidth / 2 ? (xPos - width - 30) : xPos + 30;
			yPos = yPos > window.innerHeight / 3 ? (yPos - height +150) : (yPos + 20);
			window.document.getElementById("tooltipDiv").style.left = xPos + "px";
			window.document.getElementById("tooltipDiv").style.top = yPos + "px";
		}

		if (ixmaps.getMapTypeId().match(/dark/i)) {
			window.document.getElementById("tooltipDiv").style.setProperty("background-color", "#333");
		}
		
		console.log("hi-3")
		

		return true;
	}

	ixmaps.htmlgui_onTooltipDelete = function () {
		if (__fTooltipPinned){
			return false;
		}
		ixmaps.setMapOverlayHTML("");
		window.document.getElementById("tooltip").innerHTML = "";
		return true;
	}

	ixmaps.htmlgui_onItemOver = function (evt,szId) {
		
		if (__fTooltipPinned){
			return true;
		}

					// helper function which transforms NAME -> Name
					// ----------------------------------------------
					__toLowerName = function(szName){
						var nome_cA = szName.split(" ");
						for ( i in nome_cA ){
							nome_cA[i] = nome_cA[i].substr(0,1)+nome_cA[i].substr(1).toLowerCase();
							nome_cA[i] = nome_cA[i].replace("a'","à");
							nome_cA[i] = nome_cA[i].replace("o'","ò");
							nome_cA[i] = nome_cA[i].replace("u'","ù");
							nome_cA[i] = nome_cA[i].replace("i'","ì");
							nome_cA[i] = nome_cA[i].replace("e'","è");
						}
						return nome_cA.join(" ");
					};
					// ----------------------------------------------
		
		
		__themeObj = ixmaps.getThemeObj(szId.split(":")[0]);
		var data = ixmaps.getData(szId);
		var szHtml = "<div style='font-size:18px;max-width:400px'>";


		var normal = "#aaaaaa";
		var highLight = "#000000";
		var highLightBg = "#e8e8e8";

		if (ixmaps.getMapTypeId().match(/dark/i)) {
			//$("#container").css("background-color", "#333");
			//$("#container").css("color", "#ddd");
			normal = "#bbbbbb";
			highLight = "#ffffff";
			highLightBg = "#808080";
		}
		var suffix = "";


					if ( !szId.match(/chart/i))	{
						
						var obj = ixmaps.embeddedSVG.window.SVGDocument.getElementById(szId);

						// get theme chart if present
						// --------------------------
						var szChartId = szId.match(/::/) ? szId : obj.parentNode.getAttribute("id");
						var szIdA = szChartId.split("#");
						if (szIdA.length > 1) {
							var szIdAA = szIdA[1].split(/\b::\b/);
							szChartId = szIdA[0] + "::" + szIdAA[1];
							szTitle = szIdAA[1];
						}
						szId = ixmaps.getThemes()[1].szId + ":" + szChartId + ":chartgroup";
						
					}			

					var themeObj = ixmaps.getThemeObj(szId.split(":")[0]);
					
					var szHtml = "";
					var szTitle = "";
					
					var data = ixmaps.map().getData(szId);
					if (data) {
						
						var nMaxHeight = window.innerHeight - 200;

						var eta = 0;
						var nF = 0;
						var nM = 0;

						szTitle += "<section>";
						szTitle += "<div style='height:0.1em'></div>"
						szTitle += "<div style='margin:-2.5em 1em 1em 1em'><h4>" + themeObj.szTitle + "</h4></div>"
						szTitle += "<div style='margin:1em 1em 1em 1em'><h3>" + data[0].desc_ente + "</h3></div>"
						szTitle += "</section>";

						szHtml += "<section >";

						szHtml += "<table style='margin:0em 1em 0em 1em;font-family: arial narrow, system;'>";


						for (a in data) {
							if (data[a].sesso == 'F') {
								var nome_c = __toLowerName(data[a].nome_c);
								var cogn_c = __toLowerName(data[a].cogn_c);

								var link = "https://www.google.com/search?q=%22"+nome_c + "++" + cogn_c +"%22++politiche++2022";
								var linkW = "https://it.wikipedia.org/wiki/"+nome_c + "_" + cogn_c +"";
								var linkE = "https://www.ecosia.org/search?method=index&q="+nome_c + "%20" + cogn_c +"+politiche+2022";

								var bgColor = "#fff4f4";

								szHtml += 
									"<tr style='background:"+bgColor+"'><td style='width:80%'>";
								szHtml += 
									"<a style='color:#666666;text-decoration:none;' href='"+link+"' 	target='_blank'>" + nome_c + " " + cogn_c +"</a>";
								szHtml += 
									"<a href='"+link+"' target='_blank' style='text-decoration:none;'> <img src='https://upload.wikimedia.org/wikipedia/commons/0/0b/Search_Icon.svg' height='14px' title='cerca sul Web'></a>";
								szHtml += 
									"<a href='"+linkE+"' target='_blank' style='text-decoration:none;'> <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Ecosia-like_logo.svg/1200px-Ecosia-like_logo.svg.png' height='14px' title='cerca su Ecosia'></a>";
								szHtml += 
									"<a href='"+linkW+"' target='_blank' style='text-decoration:none;'> <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/OOjs_UI_icon_logo-wikipedia.svg/640px-OOjs_UI_icon_logo-wikipedia.svg.png' height='14px' title='cerca su Wikipedia'></a>";
								szHtml += 
									"</td><td style='font-size:1em;'>" + data[a].eta + " anni</td></tr><tr><td style='font-size:0.6em;width:80%;padding-bottom:0.5em'>" + data[a].desc_lista || data[a].coalizione || "" + "</a></td></tr>";
								eta += data[a].eta;
								nF++;
							}
						}
						for (a in data) {
							if (data[a].sesso == 'M') {
								var nome_c = __toLowerName(data[a].nome_c);
								var cogn_c = __toLowerName(data[a].cogn_c);

								var link = "https://www.google.com/search?q=%22"+nome_c + "++" + cogn_c +"%22++politiche++2022";
								var linkW = "https://it.wikipedia.org/wiki/"+nome_c + "_" + cogn_c +"";
								var linkE = "https://www.ecosia.org/search?method=index&q="+nome_c + "%20" + cogn_c +"+politiche+2022";

								var bgColor = "#f0f0ff";

								szHtml += 
									"<tr style='background:"+bgColor+"'><td style='width:80%'>";
								szHtml += 
									"<a style='color:#666666;text-decoration:none;' href='"+link+"' 	target='_blank'>" + nome_c + " " + cogn_c +"</a>";
								szHtml += 
									"<a href='"+link+"' target='_blank' style='text-decoration:none;'> <img src='https://upload.wikimedia.org/wikipedia/commons/0/0b/Search_Icon.svg' height='14px' title='cerca sul Web'></a>";
								szHtml += 
									"<a href='"+linkE+"' target='_blank' style='text-decoration:none;'> <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Ecosia-like_logo.svg/1200px-Ecosia-like_logo.svg.png' height='14px' title='cerca su Ecosia'></a>";
								szHtml += 
									"<a href='"+linkW+"' target='_blank' style='text-decoration:none;'> <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/OOjs_UI_icon_logo-wikipedia.svg/640px-OOjs_UI_icon_logo-wikipedia.svg.png' height='14px' title='cerca su Wikipedia'></a>";
								szHtml += 
									"</td><td style='font-size:1em;'>" + data[a].eta + " anni</td></tr><tr><td style='font-size:0.6em;width:80%;padding-bottom:0.5em'>" + data[a].desc_lista || data[a].coalizione || "" + "</a></td></tr>";
								eta += data[a].eta;
								nM++;
							}
						}

						szHtml += "</table>";
						szHtml += "</section>";

						szTitle += "<section>";
						szTitle += "<div style='margin:-1em 1em 0em 1em'><h4 style='font-size:1.1em'>" + nF + " Donne / " + nM + " Uomini, età media: " + Math.floor(eta / data.length * 10) / 10 + "<h4></div>"
						szTitle += "<div style='height:0.1em'></div>"
						szTitle += "</section>";
						
						szHtml = szTitle + szHtml;

				
					}
					
		ixmaps.htmlgui_onTooltipDisplay(evt,szHtml);
		return true;
	}

	ixmaps.htmlgui_onItemClick = function (evt,szId) {
		__fTooltipPinned = false;
		__fTooltipPin = true;
		return ixmaps.htmlgui_onItemOver(evt,szId);
	}
	ixmaps.htmlgui_deleteItemPinned = function () {
		__fTooltipPinned = false;
		__fTooltipPin = false;
		ixmaps.setMapOverlayHTML("");
		window.document.getElementById("tooltip").innerHTML = "";
		ixmaps.clearHighlight();
	}

	
	

})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------
