/** 
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/LayerSwitcher.js
 */

/**
 * Class: OpenLayers.GeolocalizationPanel
 *
 * Inherits from:
 *  - <OpenLayers.Control.LayerSwitcher>
 */
OpenLayers.Control.GeolocalizationPanel =
OpenLayers.Class(OpenLayers.Control.LayerSwitcher,{
	
	messages: null,
	
	searchForm: null,
	
    searchTextField: null,
    
    searchResultSpan: null,
    
    searchButton: null,
    
    draggableVectorLayer: null,
    
    markerLonLat: null,
    
    vectorLayer:null,
    
    graphicStyle:null,
        
    displayedFeature: null,
    
    radius: null,
    
    radiusGeometry: null,
    
    radiusFeature: null,
        
    mouseOverObserver:null,
    
    allowSelection: true,
    
    dragControl: null,
    
    selectControl: null,
    
    minZoomLevel: null,

    /**
     * Constructor
     */
    initialize: function (options, map){
    	OpenLayers.Control.prototype.initialize.apply(this, options);
    	    	
    	if ( undefined != options['messages'] ) { this.messages = options['messages']; }

    	this.graphicStyle = new OpenLayers.Style(options['style']);
    	this.radius = options['radius'];
    	this.minZoomLevel = options['minZoomLevel'];
    	
    	this.setMap(map);
    	
    	$("body").bind("GisInverseLocalization.start", $.proxy( 
    			function ( event ) {
    				this.map.events.register("click", this, this.getAddress);
    			},
    			this)
    		);
    	
    	$("body").bind("GisInverseLocalization.done", $.proxy( 
    			function ( event ) {
    				this.cleanFeatures();
    				if(this.searchTextField != null) {
        		        this.searchTextField.value = "";
    				}
    				this.map.events.unregister("click", this, this.getAddress);
    			},
    			this)
    		);
    },
    
    /**
     * Method: setMessages
     *
     * Properties:
     * messages - <Object>
     */ 
    setMessages: function(messages){
    	this.messages = messages;
    },
    
    /**
     * Method: addSubmitEvent
     *
     * Properties:
     * evt - <Event>
     */     
    addSubmitEvent: function(evt){
    	 OpenLayers.Event.stopObserving(this.div,"mouseover",this.mouseOverObserver);
	 	 $('.'+this.displayClass+'Form').submit($.proxy(this.getFeatures,this));
    },
     
    /**
     * Method: cleanFeatures
     */
    cleanFeatures: function( ){
    	
    	if( this.displayedFeature != null ) {
        	this.draggableVectorLayer.removeFeatures(this.displayedFeature);
        	//this.displayedFeature.destroy();    		
    	
    	}
    	
    	if( this.radiusFeature != null ) {
    		this.vectorLayer.removeFeatures(this.radiusFeature);
    		this.radiusFeature.destroy();
    	}
    },
    
    /**
     * Method: listenLocalizationDoneEvent
     * 
     * Properties:
	 * event <Event>
     */
    listenLocalizationDoneEvent: function( event )
    {
    	$("body").bind("GisLocalization.done", $.proxy( 
    			function ( event ) {
    				if(this.searchTextField != null) {
        				this.searchTextField.value = event.address;
    				}
    			},
    			this)
    		);
    },
    
    /**
     * Method: listenLocalizationSendEvent
     * 
     * Properties:
	 * event <Event>
     */
    listenLocalizationSendEvent: function( event )
    {
    	$("body").bind("GisLocalization.send",  
    			$.proxy( function ( event ) {
    				this.getGeolocalization ( event.address, this.getSRID() );
    			},
    			this)
    					
    	);
    },
    
    /**
     * Method: triggerLocalizationEvent
     * 
     * Properties:
     * lonLat: <OpenLayers.LonLat>
     * address: <String>
     */
    triggerLocalizationEvent: function( type,  lonLat, address )
    {
    	var event = jQuery.Event(type, {
    		'address':address,  		
    		'lonLat': {
    			lon:lonLat.lon,
    			lat:lonLat.lat
    		}
    	});  	
    	jQuery("body").trigger(event);	
    },
    
    /**
     * Method: addFeature
     * 
     * Properties:
     * lonLat - <Openlayers.LonLat>
     */
    addFeature: function( lonLat ){
    	    	
    	var point = new OpenLayers.Geometry.Point( lonLat.lon, lonLat.lat );
    	
    	this.displayedFeature = new OpenLayers.Feature.Vector( point, lonLat );   
    	this.radiusGeometry =  OpenLayers.Geometry.Polygon.createRegularPolygon(point, this.radius, 100);
    	this.radiusFeature = new OpenLayers.Feature.Vector(this.radiusGeometry);

    	this.draggableVectorLayer.addFeatures(this.displayedFeature);  	    
    	this.vectorLayer.addFeatures(this.radiusFeature);
    },
    
    /**
     * Method: addFeature
     * 
     * Properties:
     * lonLat - <LonLat>
     * 
     * Return: 
     * <Openlayers.LonLat>
     */    
    getLonLatFromString: function(lonLat){
    	var separator = lonLat.indexOf(',');
    	var lon = Number(lonLat.substring(0,separator));
    	var lat = Number(lonLat.substring(separator+1, lonLat.length));
    	
    	return new OpenLayers.LonLat( lon, lat );  	
    },
    
    /**
     * Method: drawFeatureOnSuccess
     * 
     * Properties
     * data - <String>
     */
    drawFeatureOnSuccess: function(data){
    	this.cleanFeatures();
    	
    	var address = '';
    	var lonlat = '';
    	if( data.indexOf("/") != -1)
    	{
			var dataArray = data.split("/");
	    	lonLat = this.getLonLatFromString(dataArray[dataArray.length-1]);
	    	address = dataArray[0];
    	}
    	else
    	{
    		lonLat = this.getLonLatFromString(data);
    	} 	
    	this.addFeature(lonLat);    	
    	this.triggerLocalizationEvent("GisLocalization.done", lonLat, address);
    },
    
    /**
     * Method: getGeolocalization
     * 
     * Properties
     * address <String>
     * srid <String>
     *
     */   
    getGeolocalization: function( address, srid )
    {
		$.ajax({
			  url: 'jsp/admin/plugins/gis/DoGeolocalization.jsp',
			  data: {address:address, srid:srid},
			  success: $.proxy( this.drawFeatureOnSuccess, this ),
			});
    },
    
    /**
     * Method: getFeature
     *
     */
    getFeatures: function() {

    	var addressFieldValue = $.trim($('.'+this.displayClass+'Field').val());	

    	if( addressFieldValue!= "" ){ 
    		//this.getGeolocalization( addressFieldValue, this.getSRID() ); 
    		var event =  jQuery.Event('GisLocalization.send', { address: addressFieldValue  });
    		$('body').trigger(event);
    	}

    	return false;
    },
    
    /**
     * Method: getSRID
     *
     */   
    getSRID: function() {
    	var srid = this.map.getProjectionObject().getCode();
    	return srid.substring(srid.indexOf(':')+1, srid.length);
    },
    
    /** 
     * Method: getAdress
     * 
     * Parameters:
     * evt - {Event} 
     */
    getAddress: function(evt) {
    	var lonLat = this.map.getLonLatFromPixel(evt.xy);
    	var srid = this.map.getProjectionObject().getCode();
    	srid = srid.substring(srid.indexOf(':')+1, srid.length);
    	$.ajax({
    		url: 'jsp/admin/plugins/gis/DoInverseGeolocalization.jsp',
    		data: {x:lonLat.lon.toString(), y:lonLat.lat.toString(), srid:srid},
    		success: $.proxy( this.drawFeatureOnSuccess, this),
    	});    	
    	return false;
    },

    /**
     * Method: setMap
     *
     * Properties:
     * map - {<OpenLayers.Map>}
     */
     setMap: function(map) {
         OpenLayers.Control.prototype.setMap.apply(this, arguments);

     	// create a new vector layer
     	this.draggableVectorLayer = new OpenLayers.Layer.Vector("Marker", {
     		displayInLayerSwitcher: false,
             styleMap: this.graphicStyle,
             rendererOptions: {zIndexing: true}
        });     	

     	// create a new vector layer
     	this.vectorLayer = new OpenLayers.Layer.Vector("MarkerLimit", {
     		 displayInLayerSwitcher: false,
             styleMap: new OpenLayers.StyleMap(
            		 new OpenLayers.Symbolizer.Point({
            			 		strokeColor:'#0066FF',
            			 		strokeOpacity:0.6,
            			 		strokeWidth:1.5,
            			 		fillColor:'#66CCFF',
            			 		fillOpacity:0.2
            		 })
             ),
             rendererOptions: {zIndexing: true}
        });
     	
     	// set center map on a feature added event
     	this.draggableVectorLayer.events.register("featureadded", this, function(evt) {
     		var bounds = this.draggableVectorLayer.getDataExtent();
     		this.map.setCenter(bounds.getCenterLonLat(),this.minZoomLevel, false);
     	});
     	
     	// Add a new layer to the map
     	this.map.addLayer(this.draggableVectorLayer);
     	this.map.addLayer(this.vectorLayer);
     	
        // Add a drag feature control to move features around.
     	this.dragControl = new OpenLayers.Control.DragFeature(this.draggableVectorLayer,{
     		onComplete: OpenLayers.Function.bindAsEventListener( 
     				function(feature, pixel){  
     					this.triggerLocalizationEvent("GisLocalization.dragComplete", this.markerLonLat,"");
     				},
     				this)
     	});
        this.map.addControl(this.dragControl);
		this.dragControl.activate();
		
        this.dragControl.handlers['drag'].stopDown = false;
        this.dragControl.handlers['drag'].stopUp = false;
        this.dragControl.handlers['drag'].stopClick = false;
        this.dragControl.handlers['feature'].stopDown = false;
        this.dragControl.handlers['feature'].stopUp = false;
        this.dragControl.handlers['feature'].stopClick = false;

        this.selectControl = new OpenLayers.Control.SelectFeature( this.draggableVectorLayer, {
        	   scope:this,        
               clickout: true, toggle: false,               
               multiple: false, hover: false
        });
        
        this.map.addControl( this.selectControl );
        var control = new OpenLayers.Handler.Hover(this.selectControl,
        		{
        			move:OpenLayers.Function.bindAsEventListener(
       	        		 function ( pixel ) {
       	        			 if( this.radiusFeature != null ){
	        	        		 var lonLat = new OpenLayers.LonLat(this.displayedFeature.geometry.x, this.displayedFeature.geometry.y);
	       	        			 if( this.radiusGeometry.intersects( new OpenLayers.Geometry.Point( lonLat.lon, lonLat.lat ) )){
	       	        				 this.markerLonLat = lonLat;
	       	        			 }else{
	       	        				this.displayedFeature.move(this.markerLonLat);	       	        				
	       	        			 }
       	        			 }
    	        		 },
    	        		 this)
        		},
        		{	
        			delay:100,
        			pixelTolerance:0,
        			stopMove:false
        		}
        );
        control.activate();
        this.map.addControl( this.selectControl );
        this.selectControl.activate();
     },
     
     /**
      * Method: redraw
      */
    redraw: function (){
    	// ignore
        return this.div;
    },
    
     
    /** 
     * Method: ignoreEvent
     * 
     * Parameters:
     * evt - {Event} 
     */
    ignoreEvent: function(evt) {
        OpenLayers.Event.stop(evt,true);
    },
    
    /**
     * Method: loadContents
     * Set up the labels and divs for the control
     */
     loadContents: function() {

    	 //configure main div 
    	 OpenLayers.Event.observe(this.div, "mouseup", this.ignoreEvent); 
    	 OpenLayers.Event.observe(this.div, "click",this.ignoreEvent);	        
    	 OpenLayers.Event.observe(this.div, "mousedown", this.ignoreEvent);  	        
    	 OpenLayers.Event.observe(this.div, "dblclick", this.ignoreEvent);
    	 OpenLayers.Event.observe(this.div, "keyup", this.ignoreEvent);
    	 OpenLayers.Event.observe(this.div, "keydown", this.ignoreEvent);
    	
    	 // layers list div       
    	 this.layersDiv = document.createElement("div");
    	 this.layersDiv.id = this.id + "_layersDiv";
    	 OpenLayers.Element.addClass(this.layersDiv, "layersDiv");    	
    	 
    	 this.searchTextField = document.createElement('input');
    	 this.searchTextField.setAttribute('type','text');
    	 this.searchTextField.setAttribute('name',this.displayClass+'Field');
    	 this.searchTextField.setAttribute('class',this.displayClass+'Field');
	        
    	 this.searchButton = document.createElement('input');
    	 this.searchButton.setAttribute('type','submit');
    	 this.searchButton.setAttribute('value', this.messages['gis.map.geolocalizationPanel.button']);
    	 this.searchButton.setAttribute('class',this.displayClass+'Button');    	 
    	        
    	 this.searchResultSpan = document.createElement('span');
    	 this.searchResultSpan.setAttribute('class',this.displayClass+'SpanResult');  
    	        	
    	 this.searchForm = document.createElement('form');
    	 this.searchForm.setAttribute('class',this.displayClass+'Form');
    	 this.searchForm.appendChild(this.searchTextField);
    	 this.searchForm.appendChild(this.searchButton);
    	 
    	 /*
    	  * TODO Maybe they is an other solution to do that.
    	  * Bind an event handler to the "submit" JavaScript event, after displaying the panel. 
    	  */
    	 this.mouseOverObserver = OpenLayers.Function.bindAsEventListener(this.addSubmitEvent,this);
    	 OpenLayers.Event.observe(this.div,"mouseover",this.mouseOverObserver);
    	        
    	 this.layersDiv.appendChild(this.searchForm);
    	 this.layersDiv.appendChild(this.searchResultSpan);
   	        
    	 this.div.appendChild(this.layersDiv);

    	 if(this.roundedCorner) {
    	            OpenLayers.Rico.Corner.round(this.div, {
    	                corners: "tr br",
    	                bgColor: "transparent",
    	                color: this.roundedCornerColor,
    	                blend: false
    	            });
                OpenLayers.Rico.Corner.changeOpacity(this.layersDiv, 0.75);
    	 }
    	
    	 var imgLocation = OpenLayers.Util.getImagesLocation();
    	 var sz = new OpenLayers.Size(18,18);       
    	
    	 // maximize button div
    	 var img = imgLocation + 'geolocalization-maximize.png';
    	 this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
    	                                    "OpenLayers_Control_MaximizeDiv",
    	                                    null,
    	                                    sz,
    	                                    img,
    	                                    "absolute");
    	 OpenLayers.Element.addClass(this.maximizeDiv, "maximizeDiv");
    	 this.maximizeDiv.style.display = "none";
    	 OpenLayers.Event.observe(this.maximizeDiv, "click",
    	            OpenLayers.Function.bindAsEventListener(this.maximizeControl, this)
    	 );
    	       
    	 this.div.appendChild(this.maximizeDiv);
    	
    	 // minimize button div
    	 var img = imgLocation + 'geolocalization-minimize.png';
    	 var sz = new OpenLayers.Size(18,18);       
    	 this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
    	                                    "OpenLayers_Control_MinimizeDiv",
    	                                    null,
    	                                    sz,
    	                                    img,
    	                                    "absolute");
    	 OpenLayers.Element.addClass(this.minimizeDiv, "minimizeDiv");
    	 this.minimizeDiv.style.display = "none";
    	 OpenLayers.Event.observe(this.minimizeDiv, "click",
    	            OpenLayers.Function.bindAsEventListener(this.minimizeControl, this)
    	 );
    	
    	 this.div.appendChild(this.minimizeDiv);
    },
    CLASS_NAME: "OpenLayers.Control.GeolocalizationPanel"
});