<%@ page errorPage="../../ErrorPage.jsp" %>

<jsp:useBean id="gis" scope="session" class="fr.paris.lutece.plugins.gis.web.GisJspBean" />

<% gis.init( request, gis.RIGHT_DISPLAY_MAP ); %>
<%= gis.getMap ( request ) %>

