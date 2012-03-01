/*
 * Copyright (c) 2002-2012, Mairie de Paris
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
package fr.paris.lutece.plugins.gis.service;

import fr.paris.lutece.plugins.gis.business.View;
import fr.paris.lutece.plugins.gis.business.ViewHome;
import fr.paris.lutece.portal.service.template.AppTemplateService;
import fr.paris.lutece.portal.service.util.AppPathService;
import fr.paris.lutece.util.html.HtmlTemplate;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;


/**
 *
 * GisService
 *
 */
public class GisService
{
    // Markers
    private static final String MARK_VIEW = "view";
    private static final String BASE_URL = "base_url";
    private static final String MAP_NAME = "map_name";

    //Templates
    private static GisService _singleton = new GisService(  );

    /**
     * Initialize the GIS service
     *
     */
    public void init(  )
    {
        //TODO
    }

    /**
     * Returns the instance of the singleton
     *
     * @return The instance of the singleton
     */
    public static GisService getInstance(  )
    {
        return _singleton;
    }

    /**
     * Get the view from the map
     * @param strGisCode
     * @param parameters
     * @param request
     * @return
     */
    public String getView( String strGisCode, HashMap<String, String> parameters, HttpServletRequest request )
    {
        HashMap<String, Object> model = new HashMap<String, Object>(  );

        String strHtml = null;
        View view = ViewHome.findByCode( strGisCode );

        if ( view != null )
        {
            model.put( MARK_VIEW, view );
            model.put( BASE_URL, AppPathService.getBaseUrl( request ) );
            model.put( MAP_NAME, request.getParameter( MAP_NAME ) );

            HtmlTemplate template = AppTemplateService.getTemplate( view.getTemplateFile(  ), request.getLocale(  ),
                    model );
            strHtml = template.getHtml(  );
        }

        return strHtml;
    }
}
