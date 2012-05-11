<%@ page errorPage="../../ErrorPagePortal.jsp" %>

<jsp:useBean id="gis" scope="session" class="fr.paris.lutece.plugins.gis.web.GisJspBean" />

<%= gis.getMap ( request ) %>

