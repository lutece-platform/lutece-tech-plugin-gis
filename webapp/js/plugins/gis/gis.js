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
        
        if(eval(parameters['resolution.enabled'])) {
            var res = parameters['resolution.grid'].split(",");
            $.each(res, function(index, value) {
            	res[index] = parseFloat(value);
            });
            options['resolutions'] = res;
        }
        
        map = new OpenLayers.Map(idMap, options);

        var styles = initStyles(globalParameters, parameters);
        
        
        //Layers array defined in properties
        var layersNames = (parameters['layers.base'] + ((parameters['layers.thematic'] != '') ? "," : "") + parameters['layers.thematic'] + ((parameters['layers.selectable'] != '') ? "," : "") + parameters['layers.selectable']).split(",");
        var baseLayersNames = parameters['layers.base'].split(",");
        var selectableLayersNames = (parameters['layers.selectable'] + ((parameters['layers.thematic'] != '') ? "," : "") + parameters['layers.thematic']).split(",");
		var layers = new Array();
		var selectableLayers = new Array();
		var hasDisplayInLegend = false;
		var identifiableLayer = {};
		var opacityLayers = new Array();
		
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
				
				//Helper to get parameter from layer parameters, view parameters or global parameters
				var getParameter = function ( name ) {
					
					var exists = function (map, key) { return (map[key] != undefined && map[key] != ''); }
					
					var param = '';
					//layer parameters
					if ( exists(parameters,layersNames[index] + '.' + name) ){
						param = parameters[layersNames[index] + '.' + name]; 
					//view parameters
					}else if ( exists(parameters,name) ){
						param = parameters[name];
					//global parameters
					}else{
						param = globalParameters[name];
					}
					return param;
				}
				//Initialize request parameters
				var serverName = getParameter( 'serverName' );						
				var featureNS = getParameter( 'featureNS' );
				var wms = getParameter( 'wms' );
				var wfs = getParameter( 'wfs' );
				var format = getParameter( 'format' );
				
				//Initialize a new WMS Layer
				if (parameters[layersNames[index] + '.type'] == 'wms') {
					
					server = serverName + wms;
					
					//An object with key/value pairs representing the GetMap query string parameters and parameter values
					var htParameters = {};
					htParameters['layers'] = parameters[layersNames[index] + '.layer'];
					htParameters['format'] = format;
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
					
					if ( htOptions['displayInLegend']) { hasDisplayInLegend = true; }
					
					if (parameters[layersNames[index] + '.legendTitle'] != undefined &&
						parameters[layersNames[index] + '.legendTitle'] !=''
					){
						htOptions['legendTitle']=parameters[layersNames[index] + '.legendTitle'];
					}
					// GetLegendGraphic 
					if (htOptions['displayInLegend'] && !htParameters['isBaseLayer'] ) {
					
						htOptions['styleMap'] = new OpenLayers.StyleMap();
						var layer;
						
						if (parameters[layersNames[index] + '.legendGraphicLayer'] != undefined &&
							parameters[layersNames[index] + '.legendGraphicLayer'] != ''
						){
							layer = parameters[layersNames[index] + '.legendGraphicLayer'];
						} else {
							layer = parameters[layersNames[index] + '.layer'];
						}

						var legendGraphicWidth = parameters[layersNames[index] + '.legendGraphicWidth'];
						var width = (legendGraphicWidth != undefined && legendGraphicWidth!='')?legendGraphicWidth:"20";

						var legendGraphicHeight = parameters[layersNames[index] + '.legendGraphicHeight'];
						var height = (legendGraphicHeight != undefined && legendGraphicHeight!='')?legendGraphicHeight:"20";	

						var legendGraphicURI = server+'?SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&WIDTH='+width+'&HEIGHT='+height+'&LAYER='+layer;
						
						if (parameters[layersNames[index] + '.legendGraphicStyle'] != undefined &&
							parameters[layersNames[index] + '.legendGraphicStyle'] != ''
						){
							legendGraphicURI += '&STYLE='+parameters[layersNames[index] + '.legendGraphicStyle'];
						}
												
						htOptions['legendGraphicURI'] = legendGraphicURI;					
					}
					
					//SearchFeature	
					if( !htParameters['isBaseLayer']){
						htOptions['isSearchableLayer'] = eval(parameters[layersNames[index] + '.isSearchable']) ? true : false;
						//Initialize search feature options
						if( htOptions['isSearchableLayer'] ){
							htOptions['searchWFSParameters'] = { 
									url:serverName + parameters['wfs'],
									featureNS:featureNS,
									featureType:parameters[layersNames[index] + '.layer'],
									ogcFilterProperty:parameters[layersNames[index] + '.searchable.ogcFilterProperty'],
									featuresStyleName:parameters[layersNames[index] + '.searchable.layerStyle']
							};
						}
					}
					
					// Create the new WMS Layer
					layers[index] = new OpenLayers.Layer.WMS(parameters[layersNames[index] + '.name'], server, htParameters, htOptions);
					
					if ( !htParameters['isBaseLayer'] )
					{
						// GetFeatureInfo
						if ( eval(parameters[layersNames[index] + '.isIdentifiable']) )
						{
							identifiableLayer["url"] = server;
							identifiableLayer["layers"] = layers[index];
						}
					}
					
					if (jQuery.inArray(value, selectableLayersNames) != -1) {
						opacityLayers.push(layers[index]);
					}
				}
				
				// Initialize a new WFS layers
				if (parameters[layersNames[index] + '.type'] == 'wfs') {
					
					server = serverName + wfs;
					
					// allow testing of specific renderers via "?renderer=Canvas", etc
					var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
					renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
					
					var htParameters = {};
					var htParametersProtocol = {};
					htParametersProtocol['url'] = server;
					htParametersProtocol['featureType'] = parameters[layersNames[index] + '.featureType'];
					htParametersProtocol['featureNS'] = featureNS;
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
					
					if ( htParameters['displayInLegend'] ) { hasDisplayInLegend = true; }
					
					if (parameters[layersNames[index] + '.legendTitle'] != undefined &&
						parameters[layersNames[index] + '.legendTitle'] != ''
					){
						htParameters['legendTitle'] = parameters[layersNames[index] + '.legendTitle'];
					}
					
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

// HAL 14/01/2013 - Start
				// Initialize an openStreetMap layer
				if (parameters[layersNames[index] + '.type'] == 'osm') {
					layers[index] = new OpenLayers.Layer.OSM();
				}
// HAL 14/01/2013 - End

		
		});

		map.addLayers(layers);		 
		
		// Setup controls
		
		if(eval(parameters['showPanZoomBar'])) {
 			map.addControl(new OpenLayers.Control.PanZoomBar({
 				position: new OpenLayers.Pixel(2, 15)
 			}));
		}
				
		if(eval(parameters['navigation'])) {
			map.addControl(new OpenLayers.Control.Navigation({mouseWheelOptions: {interval: 800000, cumulative : false}}));
		}
		
		if( eval(parameters['layerSwitcher']) ) {
			map.addControl(new OpenLayers.Control.CustomLayerSwitcher());
		}
		
		// i18n helper
		function getI18NMessage(key) {
		
			return (
				(parameters['i18n'] != undefined && parameters['i18n'][key] != undefined) ?
				parameters['i18n'][key] : '${'+key+'} undefined'
			);
		}
		
		// Possibly add LayerSearchPanel		
		if (eval(parameters['layerSearchPanel'])) 
		{			
			var layerSearchPanel = new OpenLayers.Control.LayerSearchPanel();		
			
			layerSearchPanel.setMessages({
				'gis.map.layerSearchPanel.drop': getI18NMessage('gis.map.layerSearchPanel.drop'),
				'gis.map.layerSearchPanel.empty': getI18NMessage('gis.map.layerSearchPanel.empty'),
				'gis.map.layerSearchPanel.button': getI18NMessage('gis.map.layerSearchPanel.button'),
				'gis.map.layerSearchPanel.title': getI18NMessage('gis.map.layerSearchPanel.title')
			});
			
			map.addControl( layerSearchPanel );
		}
		
		
		
		// Defines localization Tool
		var options = {};
		
		options['messages'] = {
				'gis.map.geolocalizationPanel.button': getI18NMessage('gis.map.geolocalizationPanel.button'),
				'gis.map.geolocalizationPanel.title': getI18NMessage('gis.map.geolocalizationPanel.title')
		};
		
		options['minZoomLevel'] = parameters['geolocalizationPanel.minZoomLevel'];
		
		options['style'] = {
				externalGraphic: parameters['geolocalizationPanel.externalGraphic'],
				graphicHeight: Number( parameters['geolocalizationPanel.graphicHeight'] ),
				graphicWidth: Number( parameters['geolocalizationPanel.graphicWidth'] ),
				graphicXOffset: Number( parameters['geolocalizationPanel.graphicXOffset'] ),
				graphicYOffset: Number( parameters['geolocalizationPanel.graphicYOffset'] )
		};		
		options['radius'] = parameters['geolocalizationPanel.radius'];

		var geolocalizationPanel = new OpenLayers.Control.GeolocalizationPanel( options, map );
		geolocalizationPanel.listenLocalizationSendEvent();
		geolocalizationPanel.listenLocalisationCleanFeatureEvent();
		
		// Possibly add GeolocalizationPanel
		if (eval(parameters['geolocalizationPanel'])){		
			map.addControl( geolocalizationPanel );
		}
		
		if(eval(parameters['overviewMap'])) {
			map.addControl(new OpenLayers.Control.OverviewMap());
		}
		
		if(eval(parameters['keyboardNavigation'])) {
			map.addControl(new OpenLayers.Control.KeyboardDefaults());
		}	
		if(eval(parameters['legend']) && parameters['layers.thematic'] != '' && hasDisplayInLegend) {
			map.addControl(new OpenLayers.Control.Legend());
		}	
		if(eval(parameters['control.scaleLine'])) {
			var scaleLine = new OpenLayers.Control.ScaleLine();
			
			//Scale needs to be calculated for the SRID 4326
			if(map.getProjectionObject().getCode() == "EPSG:4326") {
				scaleLine.geodesic = true;
			}
			
			map.addControl(scaleLine);
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
		
		mouse = new OpenLayers.Control.MouseDefaults(
				 {title:parameters['control.mouse.title']});
		
		if(selectableLayers.length > 0) {
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
		}
		var controlList = new Array();
		
		//Inverse Geolocalization
		if(	eval( parameters['control.inverseGeolocalization'] ))
		{		
			var inverseGeoButton = new OpenLayers.Control.Button({
				autoActivate:false,
				displayClass: "olControlReverseGeocoding",
				type:OpenLayers.Control.TYPE_TOOL,
				title: parameters['control.inverseGeolocalization.title']
			});
			
			geolocalizationPanel.listenLocalizationDoneEvent();
			
			inverseGeoButton.events.register("activate", this, function(e) {
				if(map.zoom < parameters['control.inverseGeolocalization.minZoom']) 
				{
					inverseGeoButton.deactivate();
				}
				else 
				{
					inverseGeoButton.activate();
			    	jQuery("body").trigger(jQuery.Event("GisInverseLocalization.activate"));	
				}
				
			});
			
			inverseGeoButton.events.register("deactivate", this, function(e) {
		    	jQuery("body").trigger(jQuery.Event("GisInverseLocalization.desactive"));	
			});
			
			map.events.register("zoomend", this, function(e) {
				if(map.zoom < parameters['control.inverseGeolocalization.minZoom']) {
					inverseGeoButton.deactivate();
				}
			});
			
			controlList.push(inverseGeoButton);
		}
		 
		// Manages the mouse single click event to get features info from WMS layers.
		if(	eval( parameters['control.identify'] ) && 
			typeof( identifiableLayer['layers'] ) != 'undefined'
		) {     
	        var info = new OpenLayers.Control.WMSGetFeatureInfo({
	        	type:OpenLayers.Control.TYPE_TOOL,
	            url: identifiableLayer['url'],
	            layers: [identifiableLayer['layers']],
	            title: parameters['control.identify.title'],
	            queryVisible: true,
	            eventListeners: {
	                getfeatureinfo: function( event ) {
	                	
	                	var regex = /[.\s]*<body>[.\s<>\\]+<\/body>[.\s]*/gi;
	                	if( !regex.test(event.text.replace(' ','')) ) 
	                	{
	                		var featureInfoPopupId = "featureInfoPopup";
		                	for(var i=0; i<map.popups.length; i++){
		                		if( map.popups[i].id == featureInfoPopupId ) {
		                			map.popups[i].hide();
		                			map.removePopup(map.popups[i]);
		                			break;
		                		}
		                	}
			                map.addPopup( new OpenLayers.Popup.FramedCloud(
			                		featureInfoPopupId, 
			                		map.getLonLatFromPixel(event.xy),
			                		null,
			                		event.text,
				                    null,
				                    true
				           ));
		                }
		            },
		            deactivate: function ( event ) {
		                	   var featureInfoPopupId = "featureInfoPopup";
		                	   for(var i=0; i<map.popups.length; i++){
		                			 if( map.popups[i].id == featureInfoPopupId ) {
		                			         map.popups[i].hide();
		                			         map.removePopup(map.popups[i]);
		                			         break;
		                			      }
		                		}	
		            },	               
	            }
	        });
	        controlList.push(info);
		}

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
				$("#baseLbl").html(parameters['layerSwitcher.baseLayer.label']);
				$("#dataLbl").html(parameters['layerSwitcher.dataLayer.label']);
			}

		// preload images
            var roots = parameters['imageUsed'].split(",");
            var onImages = [];
            var offImages = [];
            for(var i=0; i<roots.length; ++i) {
                onImages[i] = new Image();
                onImages[i].src = parameters['imagePath'] + roots[i] + "_on.png";
                offImages[i] = new Image();
                offImages[i].src = parameters['imagePath'] + roots[i] + "_off.png";
            }
            
          //Create slider opacity for each thematics layer
    		$.each(opacityLayers, function(index,value){
    			var sliderId = "#slider_"+index;
    			var sliderOpacity = jQuery(sliderId);

    			opacityLayers[index].setOpacity(0.75);
    			sliderOpacity.slider({value:75, slide: function(event, ui) {
    				if (ui.value != 0) {
    					opacityLayers[index].setOpacity(ui.value/100);
    				} else {
    					opacityLayers[index].setOpacity(0);
    				}
    			}});
    		});
    		
    		//Catch Event Redraw
    		$("body").bind( "Map.redraw", function() {
    			/*
    			 * Redraw sliders
    			 */
    			$.each(opacityLayers, function(index,value){
    				var sliderId = "#slider_"+index;
    				var sliderOpacity = jQuery(sliderId);
    				
    				var currentOpacity = opacityLayers[index].opacity * 100;
    				
    				sliderOpacity.slider({
    					value:currentOpacity, 
    					slide: function(event, ui) {
    						if (ui.value != 0) {
    							opacityLayers[index].setOpacity(ui.value/100);
    						} else {
    							opacityLayers[index].setOpacity(0);
    						}
    					}
    				});
    			});
    		});  		
    		//Trigger an event when map is displayed.
    		$('body').trigger( 
    				jQuery.Event( 'GisMap.displayComplete',  {} ) 
    		);
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
		
		if (maximizedMap) {
			jQuery("#"+mapId).animate({ left: mapPosition.left+"px", top: mapPosition.top+"px", height:mapHeight+"px", width:mapWidth+"px"  }, 00);
			jQuery("#"+mapId).css({ position: "relative", left: "0px", top: "0px", 'z-index': '0' });
			$('html,body').animate({scrollTop: scrollTopValue}, '0');
			maximizedMap=false;
         }
         else { 
         
			scrollTopValue = $(window).scrollTop();
            jQuery("#"+mapId).css({ position:"absolute", left: mapPosition.left+"px", top: mapPosition.top+"px"});
            jQuery("#"+mapId).animate({'z-index': '100', left: "10px", top: "10px",height: (jQuery(window).height()-20) +"px", width: (jQuery(window).width()-20) +"px"  }, 600);
			$('html,body').animate({scrollTop: 0}, '600', null, function() {
				// Force refresh in case of missing tiles after maximize.
				map.updateSize();	
			});
			maximizedMap=true;
         }       
	}
	
	function printMap(){
		print();	
	}	
     
})(jQuery);