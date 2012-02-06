(function($) {	 
    var map;
    var mapId;
	var server;
	var vectors;
	var drawControls;
	var selectedFeatureIds = new Array();
    //Variable Fonction 
    var maximizedMap = false;
	var mapWidth = "";
	var mapHeight = "";
	var mapPosition = "";
	var scrollTopValue = "";
	
	Array.prototype.remove=function(s){ 
		while (this.indexOf(s) != -1) {
			this.splice(this.indexOf(s), 1);
		}
	}  

	/*
	 * Public methods
	 */	
	
	/**
	 * Initialize the new map
	 * globalParameters : The global parameters (
	 * 		appProdUrl : The App production URL
	 * 		serverName : url of the server
	 * 		featureNS : The geoserver Namespace
	 * 		...
	 * ) 
	 * parameters : map of parameters (defined in properties)
	 */
    $.fn.initMap = function(globalParameters, parameters) {
		return this.each(function() {
			initMap(this.id, globalParameters, parameters);
		});
	}
	
	/**
     * Destroy the new map
     */
     $.fn.destroy = function() {
		triggerEvent("mapDestroyed");
		$("#"+mapId).removeClass('olMap');
        map.destroy();
    }
    
    /**
	 * return an Array containing the selected features ids
	 * attributeName : The name of the attribute to retrieve
	 */
    $.fn.getSelectedFeaturesIds = function(attributeName) {
		return selectedFeatureIds[attributeName]; 
	}
    
    /**
     * Get the coordinate of the feature in WKT format
     * 
     */
    $.fn.getWKT = function(feature) {
		return new OpenLayers.Format.WKT().write(feature);
	}
    
    /**
     * Add a new point on the point Layer layer whit the specified coordinates
     * pointObject : the point object
     * coordX : the X coordinate
     * coordY : the Y coordinate
     */
    $.fn.addPoint = function(pointObject, coordX, coordY) {
		return this.each(function() {
			addPoint(pointObject, coordX, coordY);
		});
	}
    
    
    /**
     * Add a new Features on the point Layer layer
     */
    $.fn.addFeaturesGeoJson = function(featurecollection) {
		return this.each(function() {
			addFeaturesGeoJson(featurecollection);
		});
	}
    
    /**
     * Add a new Features on the point Layer layer
     */
    $.fn.addFeaturesWKT = function(wkt) {
		return this.each(function() {
			addFeaturesWKT(wkt);
		});
	}
    
    /**
     * 
     */
    $.fn.toggleControl = function(value) { 
		return this.each(function() {
			toggleControl(value);
		});
	}
	/*
	 * Private methods
	 */	
    
    /*appProdUrl, serverName, featureNS
     * Initialize the new map with the informations specified in properties
     */
    function initMap(idMap, globalParameters, parameters){
		if ($("#"+idMap).attr('class').contains("olMap")){ 
			return false;
		}
		
    	var server = globalParameters['serverName']+parameters['wms'];
    	OpenLayers.ProxyHost = globalParameters['appProdUrl'] + "proxyGeoServer?url=";
    	//--------------------------------------
    	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
        // make OL compute scale according to WMS spec
        OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
    	mapId = idMap;

        var bounds;
        bounds = new OpenLayers.Bounds(
        		parameters['boundsLeft'], parameters['boundsBottom'],
        		parameters['boundsRight'], parameters['boundsTop']
            );
        var numZoomLevels= parseInt(parameters['numZoomLevels']);
        var options = {
        		controls: [],
        		numZoomLevels: numZoomLevels,
        		maxExtent: bounds,
        		projection: parameters['projection'],
                units: parameters['units'],
                maxResolution: parameters['maxResolution']
        };
        
        map = new OpenLayers.Map(idMap, options);

        var styles = initStyles(globalParameters, parameters);
        
        
        //Layers array defined in properties
        var layersNames = (parameters['layers.base'] + ((parameters['layers.thematic'] != '') ? "," : "") + parameters['layers.thematic'] + ((parameters['layers.selectable'] != '') ? "," : "") + parameters['layers.selectable']).split(",");
        var baseLayersNames = parameters['layers.base'].split(",");
        var selectableLayersNames = (parameters['layers.selectable'] + ((parameters['layers.thematic'] != '') ? "," : "") + parameters['layers.thematic']).split(",");
		var layers = new Array();
		var selectableLayers = new Array();
		
		$.each(layersNames, function(index, value) {
			//Convert the filter to the openLayer.filter format 
				if (parameters[layersNames[index] +'.ogcFilter'] != undefined) {
					/* 
					 * OGC Filter Json
					 * operator : {"logical":'or/and...', "criteria1":'filter1', "criteria2":'filter2'}
					 * filter : {"type":'equal_to/....', "property":'field', "value":'fieldValue'}
					 */
					//we have to add the logical operator AND if there is only one filter (no logical operator)
					
					parameters[layersNames[index] + '.filter'] = getOGCFilter(parameters[layersNames[index] + '.ogcFilter']);
				}
			
				if (parameters[layersNames[index] + '.type'] == 'wms') {
				
					//An object with key/value pairs representing the GetMap query string parameters and parameter values
					var htParameters = {};
					htParameters['layers'] = parameters[layersNames[index] + '.layer'];
					htParameters['format'] = parameters['format'];
					htParameters['tiled'] = parameters[layersNames[index] + '.tiled'];
					htParameters['transparent'] = (jQuery.inArray(value, baseLayersNames) != -1) ? 'false' : 'true';
					htParameters['isBaseLayer'] = (jQuery.inArray(value, baseLayersNames) == -1) ? false : true;
					
					if (parameters[layersNames[index] + '.cqlFilter'] != '') {
						htParameters['cql_Filter'] = parameters[layersNames[index] + '.cqlFilter'];
					}
					
					//Hashtable of extra options to tag onto the layer
					var htOptions = {};
					htOptions['buffer'] = 0;
					if (parameters[layersNames[index] + '.minScale'] != '') 
						htOptions['minScale'] = parameters[layersNames[index] + '.minScale'];
					if (parameters[layersNames[index] + '.maxScale'] != '') 
						htOptions['maxScale'] = parameters[layersNames[index] + '.maxScale'];
					htOptions['displayOutsideMaxExtent'] = true;
					
					// Display In LayerSwitcher
					htOptions['displayInLayerSwitcher'] = eval(parameters[layersNames[index] + '.displayInLayerSwitcher']) ? true : false;
					
					// Display in Legend
					htOptions['displayInLegend'] = eval(parameters[layersNames[index] + '.displayInLegend']) ? true : false;
					
					// Create the new WMS Layer
					layers[index] = new OpenLayers.Layer.WMS(parameters[layersNames[index] + '.name'], server, htParameters, htOptions);
				}
				if (parameters[layersNames[index] + '.type'] == 'wfs') {
				
					// allow testing of specific renderers via "?renderer=Canvas", etc
					var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
					renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
					
					var htParameters = {};
					var htParametersProtocol = {};
					htParametersProtocol['url'] = globalParameters['serverName'] + parameters['wfs'];
					htParametersProtocol['featureType'] = parameters[layersNames[index] + '.featureType'];
					htParametersProtocol['featureNS'] = globalParameters['featureNS'];
					if (parameters[layersNames[index] + '.cqlFilter'] != '') 
						htParametersProtocol['params'] = {
							CQL_FILTER: parameters[layersNames[index] + '.cqlFilter']
						};
					
					htParameters['strategies'] = [new OpenLayers.Strategy.BBOX()];
					htParameters['protocol'] = new OpenLayers.Protocol.WFS(htParametersProtocol);
					htParameters['renderers'] = renderer;
					
					// Scale
					if (parameters[layersNames[index] + '.minScale'] != '') 
						htParameters['minScale'] = parameters[layersNames[index] + '.minScale'];
					if (parameters[layersNames[index] + '.maxScale'] != '') 
						htParameters['maxScale'] = parameters[layersNames[index] + '.maxScale'];
					
					// Style
					if (parameters[layersNames[index] + '.style.default'] != '' || parameters[layersNames[index] + '.style.select'] != ''){
						var defaultStyle;
						var selectStyle;
						if (parameters[layersNames[index] + '.style.default'] != ''){
							defaultStyle = styles[parameters[layersNames[index] + '.style.default']];
						}
						if (parameters[layersNames[index] + '.style.select'] != ''){
							selectStyle = styles[parameters[layersNames[index] + '.style.select']];
						}
						
						var styleRules;
						if (parameters[layersNames[index] + '.style.default.rules'] != ''){
							styleRules = parameters[layersNames[index] + '.style.default.rules'].split(",");
						}
						
						if(styleRules != null){
							var ruleArray = new Array();
							ruleArray.push(new OpenLayers.Rule({
				                   elseFilter: true
				            }));
							$.each(styleRules, function(indexRule, valueRule) {
								var filter = getOGCFilter(parameters[layersNames[index] + '.style.default.' + valueRule + ".filter"]);
								var name = parameters[layersNames[index] + '.style.default.' + valueRule + ".name"];
								var symbolizer = getSymbolizer(globalParameters, parameters, parameters[layersNames[index] + '.style.default.' + valueRule + ".style"]);
								if(filter != '' && symbolizer != null){
									ruleArray.push(new OpenLayers.Rule({
										filter: filter,
										name: name,
										symbolizer: symbolizer
						               	}));
								}
							});
							
							defaultStyle.addRules(ruleArray);
						}
						htParameters['styleMap'] = new OpenLayers.StyleMap({
							"default": defaultStyle,
							"select": selectStyle
						});
						
					}
					
					// Filter 
					if (parameters[layersNames[index] + '.filter'] != '') 
						htParameters['filter'] = parameters[layersNames[index] + '.filter'];
					
					// Visibility 
					htParameters['visibility'] = eval(parameters[layersNames[index] + '.visibility']) ? true : false;
					
					// Display In LayerSwitcher
					htParameters['displayInLayerSwitcher'] = eval(parameters[layersNames[index] + '.displayInLayerSwitcher']) ? true : false;
					
					// Display in Legend
					htParameters['displayInLegend'] = eval(parameters[layersNames[index] + '.displayInLegend']) ? true : false;
					
					// Create the new WFS Layer
					layers[index] = new OpenLayers.Layer.Vector(parameters[layersNames[index] + '.name'], htParameters);
					
					//add some events for selectables layers
					if (jQuery.inArray(value, selectableLayersNames) != -1) {
						selectableLayers.push(layers[index]);
						var attributesToRetrieve = parameters[layersNames[index] + '.selectable.attributesToRetrieve'].split(",");
						$.each(attributesToRetrieve, function(key, value){
							selectedFeatureIds[value] = new Array();
						});
						layers[index].events.on({
							'featureselected': function(feature){
								var selectedFeature = this.selectedFeatures;
								var selectedFeatureNb;
								$.each(this.selectedFeatures, function(index){
									$.each(attributesToRetrieve, function(key, attrToRetrieve){
										selectedFeatureIds[attrToRetrieve].push(selectedFeature[index].attributes[attrToRetrieve]);
										selectedFeatureNb = selectedFeatureIds[attrToRetrieve].length;
									});
								});
								
								if (eval(parameters[layersNames[index] + '.selectable.popup']) && selectedFeatureNb == 1 && (selecthover.active || select.active)) {
									openPopup(feature.feature, mapId);
								}
								triggerEvent('featureselected');
							},
							'featureunselected': function(feature){
								$.each(attributesToRetrieve, function(key, attrToRetrieve){
									selectedFeatureIds[attrToRetrieve].remove(feature.feature.attributes[attrToRetrieve]);
								});
								
								if (eval(parameters[layersNames[index] + '.selectable.popup'])) {
									closePopup(feature.feature);
								}
								triggerEvent( 'featureunselected');
							},
							'featuremodified': function(feature){
								if(eval(parameters['control.modify'])){
				 					triggerEvent("featuremodified",feature.feature);
								}
							}
						});
					}
			}
			
			
			
		});

		map.addLayers(layers);
			 
		 
		
		// Setup controls
		
		if(eval(parameters['showPanZoomBar'])) {
 			map.addControl(new OpenLayers.Control.PanZoomBar({
 				position: new OpenLayers.Pixel(2, 15)
 			}));
		}
		
		if(eval(parameters['navigation'])) {
			map.addControl(new OpenLayers.Control.Navigation());
		}
		
		if(eval(parameters['layerSwitcher'])) {
			map.addControl(new OpenLayers.Control.LayerSwitcher());
		}
		
		if(eval(parameters['overviewMap'])) {
			map.addControl(new OpenLayers.Control.OverviewMap());
		}
		
		if(eval(parameters['keyboardNavigation'])) {
			map.addControl(new OpenLayers.Control.KeyboardDefaults());
		}
		if(eval(parameters['legend'])) {
			map.addControl(new OpenLayers.Control.Legend());
		}
		if(eval(parameters['control.scaleLine'])) {
			map.addControl(new OpenLayers.Control.ScaleLine());
		}  
		map.zoomToMaxExtent();
		
		mapWidth = $("#"+ mapId).width();
		mapHeight = $("#"+ mapId).height();
		mapPosition = $("#"+ mapId).position();
		
		var fullscreen = new OpenLayers.Control.Button({
			displayClass: "olControlFullscreen",
			trigger: toggleFullScreen, 
			title: parameters['control.fullscreen.title']
		});
		var printBtn = new OpenLayers.Control.Button({
			displayClass: "olControlPrint",
			trigger: printMap, 
			title: parameters['control.control.title']
		});
		var point= new OpenLayers.Control.DrawFeature(
			selectableLayers[0], OpenLayers.Handler.Point,
			{ 
					title:parameters['control.point.title'],
					'displayClass': 'olControlDrawFeaturePoint'
			}
		);
		var line= new OpenLayers.Control.DrawFeature(
			selectableLayers[0], OpenLayers.Handler.Path,
			{ 
					title:parameters['control.line.title'],
					'displayClass': 'olControlDrawFeatureLine'
			}
		);
		var polygon = new OpenLayers.Control.DrawFeature(
			selectableLayers[0], OpenLayers.Handler.Polygon,
			{ 
					title:parameters['control.polygon.title'],
					'displayClass': 'olControlDrawFeaturePolygon'
			});
		var modifyFeatureControl = new OpenLayers.Control.ModifyFeature(selectableLayers[0], {
                  clickout: false,
                  toggle: false,
                  title:parameters['control.modify.title'],
                  displayClass: "olControlModify"
             });
              
		var deleteFeatureControl = new OpenLayers.Control.SelectFeature(selectableLayers[0], {
                  clickout: false,
                  toggle: false,
				  multiple: false, 
				  hover: false,
                  title: parameters['control.delete.title'],
                  displayClass: "olControlDelete"
              });
		var selecthover= new OpenLayers.Control.SelectFeature(
				selectableLayers,
				{
					multiple: false, hover: true,
					toggleKey: "ctrlKey", // ctrl key removes from selection
					multipleKey: "shiftKey", // shift key adds to selection
					title:parameters['control.selecthover.title']
				}
			);
		var select = new OpenLayers.Control.SelectFeature(
				selectableLayers,
				{
					clickout: false, toggle: false,
					multiple: false, hover: false,
					toggleKey: "ctrlKey", // ctrl key removes from selection
					multipleKey: "shiftKey", // shift key adds to selection
					box: true,
					title:parameters['control.select.title']
				}
			);
			mouse = new OpenLayers.Control.MouseDefaults(
			 {title:parameters['control.mouse.title']});
			  

			point.events.register("featureadded", this, function(e) {
                    triggerEvent("featureadded",e.feature);
             });
			line.events.register("featureadded", this, function(e) {
                    triggerEvent("featureadded",e.feature); 
             });
			polygon.events.register("featureadded", this, function(e) {
                    triggerEvent("featureadded",e.feature); 
             });
			 
				
			// Bug Openlayers 2.10
			/*
			modifyFeatureControl.events.register("featuremodified", this, function(e) {
				if (confirm(parameters['control.modify.confirm'])) {
 					//selectableLayers.removeFeatures([e.feature]);
 					triggerEvent("featuremodified",e.feature);
 				} else {
 					modifyFeatureControl.unselect(e.feature);
 				}
 			});
 			*/ 
			deleteFeatureControl.events.register("featurehighlighted", this, function(e) {
				if (confirm(parameters['control.delete.confirm'])) {
					var result = triggerEvent("featuredeleted",e.feature);
					if (result.val != false){
						selectableLayers[0].removeFeatures([e.feature]);	
					}
 				} else {
 					deleteFeatureControl.unselect(e.feature);
 				}
 			}); 
			 
		var controlList = new Array(); 
		if(eval(parameters['control.print'])) {
			controlList.push(printBtn);
			
		}
		if(eval(parameters['control.fullscreen'])) {
			controlList.push(fullscreen);
		}
		if(eval(parameters['control.mouse'])) {
			controlList.push(mouse);
		}
		if(eval(parameters['control.select'])) {
			controlList.push(select);
		}
		if(eval(parameters['control.selecthover'])) {
			controlList.push(selecthover);
		}
		if(eval(parameters['control.point'])) {
			controlList.push(point);
		}
		if(eval(parameters['control.line'])) {
			controlList.push(line);
		}
		if(eval(parameters['control.polygon'])) {
			controlList.push(polygon);
		}
		if(eval(parameters['control.modify'])) {
			controlList.push(modifyFeatureControl);
		}
		if(eval(parameters['control.delete'])) {
			controlList.push(deleteFeatureControl);
		}
		 
		 var panel = new OpenLayers.Control.Panel({defaultControl: mouse});
		 panel.addControls(controlList); 
		 map.addControl(panel); 
		 
		 // Post treament for controls
		 if(eval(parameters['layerSwitcher'])) {
			$(".baseLbl").html(parameters['layerSwitcher.baseLayer.label']);
			$(".dataLbl").html(parameters['layerSwitcher.dataLayer.label']);
		 }

		// preload images
            var roots = parameters['imageUsed'].split(",");;
            var onImages = [];
            var offImages = [];
            for(var i=0; i<roots.length; ++i) {
                onImages[i] = new Image();
                onImages[i].src = parameters['imagePath'] + roots[i] + "_on.png";
                offImages[i] = new Image();
                offImages[i].src = parameters['imagePath'] + roots[i] + "_off.png";
            }
    }
/*
    
    // preload images
        (function() {
            var roots = parameters['imageUsed'].split(",");;
            var onImages = [];
            var offImages = [];
            for(var i=0; i<roots.length; ++i) {
                onImages[i] = new Image();
                onImages[i].src = parameters['imagePath'] + roots[i] + "_on.png";
                offImages[i] = new Image();
                offImages[i].src = parameters['imagePath'] + roots[i] + "_off.png";
            }
        })();
        
		*/
    /*
     * Add a new point on the vectors layer
     */
    function addPoint(layer,pointObject, coordX, coordY) {
    	pointObject = new OpenLayers.Feature.Vector(
    			new OpenLayers.Geometry.Point(coordX, coordY)
        );
			
    	layer.addFeatures(pointObject);
    }
    
    /*
     * Add a new features on the vectors layer
     */
    function addFeaturesGeoJson(layer,featurecollection) {
    	var geojson_format = new OpenLayers.Format.GeoJSON();
    	layer.addFeatures(geojson_format.read(featurecollection));
    }
    
    /*
     * Add a new features on the vectors layer
     */
    function addFeaturesWKT(layer,wkt) {
    	var wkt_format = new OpenLayers.Format.WKT();
    	layer.addFeatures(wkt_format.read(wkt));
    }
    
	
	/*
	 * Triggers
	 */
	function triggerEvent(name, param){
		$('body').trigger(name,[param]);
		return param; 
	}
	
	function onPopupClose(evt) {
	    // 'this' is the popup. 
		this.destroy();
	}

	function openPopup(feature, mapId) {
	    popup = new OpenLayers.Popup.Anchored(
	    		"featurePopup_"+mapId,
	            feature.geometry.getBounds().getCenterLonLat(),
	            new OpenLayers.Size(280, 65),
	            "&nbsp",
	            null,
	            true,
	            onPopupClose);
	    popup.setBorder("1px solid");
	    popup.minSize = new OpenLayers.Size(280, 65);
	    popup.autoSize = true;
	    popup.panMapIfOutOfView = true;
	    feature.popup = popup;
	    popup.feature = feature;
	    map.addPopup(popup);
	}
	
	function closePopup(feature) {
	    if (feature.popup) {
	        popup.feature = null;
	        map.removePopup(feature.popup);
	        feature.popup.destroy();
	        feature.popup = null;
	    }
	}

	function initStyles(globalParameters, parameters){
		var stylesNames = parameters['styles'].split(",");
		
		var styles = new Array();
		
		$.each(stylesNames, function(index, value) {
			var symbolizer = getSymbolizer(globalParameters, parameters, value);
			styles[value] = new OpenLayers.Style(symbolizer);
		});
		return styles;
	}
	
	function getSymbolizer(globalParameters, parameters, styleName){
		var htParameters = {};
		var toto = globalParameters['availableParametersStyles'].split(",");
		$.each(toto, function(index, value) {
			if(parameters[styleName + '.' + value] != ""){
				htParameters[value] = parameters[styleName + '.' + value];
			}
		});
		
		return htParameters;
	}
	
	/*
	 * Convert an OGC filter from String format to OpenLayers.Filter format
	 * 
	 */
	function getOGCFilter(stringFilter){
		var jsonFilter = jQuery.parseJSON(stringFilter);
		if (jsonFilter != null) {
			if (jsonFilter.logical == undefined) {
				stringFilter = '{"logical":"AND", "criteria1":' + stringFilter + ',"criteria2":""}';
				jsonFilter = jQuery.parseJSON(stringFilter);
			}
			return json2Filter(jsonFilter);
		}
		return '';
	}
	
	
	/* Convert a json to an OGC Filter
	 * OGC Filter Json
	 * operator : {"logical":'or/and...', "criteria1":'filter1', "criteria2":'filter2'}
	 * filter : {"type":'equal_to/....', "property":'field', "value":'fieldValue'}
	 */
	function json2Filter(jsonFilter){ 
		var operator = '';		
		if (jsonFilter.logical != undefined){
			switch (jsonFilter.logical) {
				case 'OR':
					operator = new OpenLayers.Filter.Logical({
						type: OpenLayers.Filter.Logical.OR
					});
					break;
				case 'AND':
					operator = new OpenLayers.Filter.Logical({
						type: OpenLayers.Filter.Logical.AND
					});
					break;
				case 'NOT':
					operator = new OpenLayers.Filter.Logical({
						type: OpenLayers.Filter.Logical.NOT
					});
					break;
			}
			if ($.trim(jsonFilter.criteria1) != '')
				operator.filters.push(json2Filter(jsonFilter.criteria1));
			if ($.trim(jsonFilter.criteria2) != '')
				operator.filters.push(json2Filter(jsonFilter.criteria2));
		}else{
			var filter = {};
			if (jsonFilter.type == 'IN'){
				var in_filter = new OpenLayers.Filter.Logical({type: OpenLayers.Filter.Logical.OR});
			
				var filterValues = jsonFilter.value.split(',');
				$.each(filterValues, function(key, value) {
					var filter={};
					filter['type'] = OpenLayers.Filter.Comparison.EQUAL_TO;
					filter['property'] = jsonFilter.property;
					filter['value'] = value; 
				    in_filter.filters.push(new OpenLayers.Filter.Comparison(filter)); 
				});
				return in_filter;
			}else{
				switch (jsonFilter.type) {
					case '==': //EQUAL_TO
						filter['type'] = OpenLayers.Filter.Comparison.EQUAL_TO;
						break;
					case '!=': //NOT_EQUAL_TO
						filter['type'] = OpenLayers.Filter.Comparison.NOT_EQUAL_TO;
						break;
					case '<': //LESS_THAN
						filter['type'] = OpenLayers.Filter.Comparison.LESS_THAN;
						break;
					case '>': //GREATER_THAN
						filter['type'] = OpenLayers.Filter.Comparison.GREATER_THAN;
						break;
					case '<=': //LESS_THAN_OR_EQUAL_TO
						filter['type'] = OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO;
						break;
					case '>=': //GREATER_THAN_OR_EQUAL_TO
						filter['type'] = OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO;
						break;
					case '..': //BETWEEN
						filter['type'] = OpenLayers.Filter.Comparison.BETWEEN;
						break;
					case '~': //LIKE
						filter['type'] = OpenLayers.Filter.Comparison.EQUAL_TO;
						break; 
					
				}
				filter['property'] = jsonFilter.property; 
				filter['value'] = jsonFilter.value;
				return  new OpenLayers.Filter.Comparison(filter);
			}

		}
		return operator;
	}
	function toggleFullScreen(){ 
		
         if  (maximizedMap) {
			jQuery("#"+mapId).animate({ left: mapPosition.left+"px", top: mapPosition.top+"px", height:mapHeight+"px", width:mapWidth+"px"  }, 00);
			jQuery("#"+mapId).css({ position: "relative", left: "0px", top: "0px" });
			$('html,body').animate({scrollTop: scrollTopValue}, '0');
			maximizedMap=false;

         }else{ 
			scrollTopValue = $(window).scrollTop();
            jQuery("#"+mapId).css({ position:"absolute", left: mapPosition.left+"px", top: mapPosition.top+"px"});
            jQuery("#"+mapId).animate({ left: "10px", top: "10px",height: (jQuery(window).height()-20) +"px", width: (jQuery(window).width()-20) +"px"  }, 600);
			$('html,body').animate({scrollTop: 0}, '600');
			maximizedMap=true;
         }
     
	}
	function printMap(){
		print();	
	}
     
})(jQuery);

