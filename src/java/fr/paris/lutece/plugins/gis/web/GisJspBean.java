/*
 * Copyright (c) 2002-2008, Mairie de Paris
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
package fr.paris.lutece.plugins.gis.web;

import fr.paris.lutece.plugins.gis.service.GisService;
import fr.paris.lutece.portal.service.message.SiteMessageException;
import fr.paris.lutece.portal.service.security.UserNotSignedException;
import fr.paris.lutece.portal.service.template.AppTemplateService;
import fr.paris.lutece.portal.web.admin.PluginAdminPageJspBean;
import fr.paris.lutece.util.html.HtmlTemplate;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;


public class GisJspBean extends PluginAdminPageJspBean
{
    ////////////////////////////////////////////////////////////////////////////
    // Constants

    // Right
    public static final String RIGHT_MANAGE_GIS = "GIS_MANAGEMENT";
    public static final String RIGHT_DISPLAY_MAP = "GIS_MANAGEMENT";

    // Parameters
    private static final String PARAMETER_GIS_CODE = "gis_code";

    // I18n
    private static final String PROPERTY_PAGE_TITLE_FEATURES = "gis.manage_features.pageTitle";

    // Templates
    private static final String TEMPLATE_HOME = "/admin/plugins/gis/manage_gis.html";

    /**
     * Returns the Gis HTML code for a given view
     *
     * @param request The HTTP request.
     * @param nMode The current mode. [not implemented]
     * @throws UserNotSignedException
     * @throws SiteMessageException occurs when a site message need to be
     *             displayed
     */
    public String getMap( HttpServletRequest request )
    {
        String strViewCode = request.getParameter( PARAMETER_GIS_CODE );

        return GisService.getInstance(  ).getView( strViewCode, null, request );
    }

    /**
     * Returns the Gis HTML management page
     *
     * @param request The HTTP request.
     * @param nMode The current mode. [not implemented]
     * @throws UserNotSignedException
     * @throws SiteMessageException occurs when a site message need to be
     *             displayed
     */
    public String getManageGis( HttpServletRequest request )
    {
        setPageTitleProperty( PROPERTY_PAGE_TITLE_FEATURES );

        HashMap rootModel = new HashMap(  );
        HtmlTemplate templateList = AppTemplateService.getTemplate( TEMPLATE_HOME, getLocale(  ), rootModel );

        return getAdminPage( templateList.getHtml(  ) );
    }
}
