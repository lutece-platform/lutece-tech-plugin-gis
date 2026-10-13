/*
 * Copyright (c) 2002-2014, Mairie de Paris
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *  1. Redistributions of source code must retain the above copyright notice
 *     and the following disclaimer.
 *
 *  2. Redistributions in binary form must reproduce the above copyright notice
 *     and the following disclaimer in the documentation and/or other materials
 *     provided with the distribution.
 *
 *  3. Neither the name of 'Mairie de Paris' nor 'Lutece' nor the names of its
 *     contributors may be used to endorse or promote products derived from
 *     this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * License 1.0
 */
package fr.paris.lutece.plugins.gis.web.xpage;

import fr.paris.lutece.plugins.gis.service.GisService;
import fr.paris.lutece.portal.service.template.AppTemplateService;
import fr.paris.lutece.portal.util.mvc.commons.annotations.View;
import fr.paris.lutece.portal.util.mvc.xpage.MVCApplication;
import fr.paris.lutece.portal.util.mvc.xpage.annotations.Controller;
import fr.paris.lutece.portal.web.xpages.XPage;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.servlet.http.HttpServletRequest;

import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Front office page displaying the GIS view named by the gis_code parameter.
 */
@RequestScoped
@Named( "gis.xpage.gis" )
@Controller( xpageName = "gis", securityTokenEnabled = true )
public class GisXPageApplication extends MVCApplication
{
    private static final long serialVersionUID = 1L;

    private static final String PARAMETER_GIS_CODE = "gis_code";
    private static final String PROPERTY_XPAGE_VIEW = "gis.xpage.view";
    private static final String PROPERTY_XPAGE_TITLE = "gis.xpage.title";
    private static final String PROPERTY_XPAGE_KEYWORD = "gis.xpage.keyword";
    private static final String PROPERTY_XPAGE_PATH_LABEL = "gis.xpage.pathLabel";
    private static final String VIEW_MAP = "map";
    private static final String TEMPLATE_NO_VIEW = "/skin/plugins/gis/xpage_no_view.html";

    @Inject
    private transient GisService _gisService;

    @Inject
    @ConfigProperty( name = PROPERTY_XPAGE_VIEW )
    private String _strXpageView;

    @Inject
    @ConfigProperty( name = PROPERTY_XPAGE_TITLE )
    private String _strXpageTitle;

    @Inject
    @ConfigProperty( name = PROPERTY_XPAGE_KEYWORD )
    private String _strXpageKeyword;

    @Inject
    @ConfigProperty( name = PROPERTY_XPAGE_PATH_LABEL )
    private String _strXpagePathLabel;

    /**
     * Returns the page of the GIS view, or a message when the code names no view.
     *
     * @param request
     *            the request
     * @return the page
     */
    @View( value = VIEW_MAP, defaultView = true )
    public XPage getMapPage( HttpServletRequest request )
    {
        String strContent = _gisService.getXPageView( request.getParameter( PARAMETER_GIS_CODE ), _strXpageView, request );

        if ( strContent == null )
        {
            strContent = AppTemplateService.getTemplate( TEMPLATE_NO_VIEW, request.getLocale( ) ).getHtml( );
        }

        XPage page = new XPage( );
        page.setContent( strContent );
        page.setTitle( _strXpageTitle );
        page.setKeyword( _strXpageKeyword );
        page.setPathLabel( _strXpagePathLabel );

        return page;
    }
}
