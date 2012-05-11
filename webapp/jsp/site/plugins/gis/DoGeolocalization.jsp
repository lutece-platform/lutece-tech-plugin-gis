<jsp:useBean id="gisAddress" scope="session" class="fr.paris.lutece.plugins.gis.web.GisAddressJspBean" />

<%= gisAddress.getGeolocalization(request) %>