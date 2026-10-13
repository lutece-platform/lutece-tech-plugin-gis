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
package fr.paris.lutece.plugins.gis.web;

import fr.paris.lutece.portal.util.mvc.admin.MVCAdminJspBean;
import fr.paris.lutece.portal.util.mvc.admin.annotations.Controller;
import fr.paris.lutece.portal.util.mvc.commons.annotations.View;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Named;

/**
 * Back office page displaying the GIS map.
 */
@RequestScoped
@Named
@Controller( controllerJsp = "ManageGis.jsp", controllerPath = "jsp/admin/plugins/gis/", right = GisJspBean.RIGHT_MANAGE_GIS, securityTokenEnabled = true )
public class GisJspBean extends MVCAdminJspBean
{
    public static final String RIGHT_MANAGE_GIS = "GIS_MANAGEMENT";
    public static final String RIGHT_DISPLAY_MAP = "GIS_MANAGEMENT";

    private static final long serialVersionUID = 1L;

    private static final String PROPERTY_PAGE_TITLE_FEATURES = "gis.manage_features.pageTitle";
    private static final String TEMPLATE_HOME = "/admin/plugins/gis/manage_gis.html";
    private static final String VIEW_MANAGE_GIS = "manageGis";

    /**
     * Returns the GIS management page.
     *
     * @return the page
     */
    @View( value = VIEW_MANAGE_GIS, defaultView = true )
    public String getManageGis( )
    {
        return getPage( PROPERTY_PAGE_TITLE_FEATURES, TEMPLATE_HOME );
    }
}
