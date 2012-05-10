<jsp:useBean id="gisAddress" scope="session" class="fr.paris.lutece.plugins.gis.web.GisAddressJspBean" />

<% gisAddress.init( request , gisAddress.RIGHT_MANAGE_GIS ); %>
<%= gisAddress.getInverseGeolocatization(request) %>