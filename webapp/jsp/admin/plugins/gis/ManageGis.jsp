<%@ page errorPage="../../ErrorPage.jsp" %>
<jsp:include page="../../AdminHeader.jsp" />

<jsp:useBean id="gis" scope="session" class="fr.paris.lutece.plugins.gis.web.GisJspBean" />

<% gis.init( request , gis.RIGHT_MANAGE_GIS ); %>
<%= gis.getManageGis(request) %>

<%@ include file="../../AdminFooter.jsp" %>