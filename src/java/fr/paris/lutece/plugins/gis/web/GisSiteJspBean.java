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

import java.rmi.RemoteException;

import fr.paris.lutece.plugins.gis.service.GisAddressService;
import fr.paris.lutece.plugins.gis.service.GisService;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Front office map fragment and geolocalization, called by the site JSPs.
 */
@RequestScoped
@Named
public class GisSiteJspBean
{
    private static final String PARAMETER_GIS_CODE = "gis_code";

    @Inject
    private GisService _gisService;

    @Inject
    private GisAddressService _gisAddressService;

    /**
     * Returns the map fragment of the view named by the gis_code parameter.
     *
     * @param request
     *            the request
     * @return the map fragment, or null when the code is unknown
     */
    public String getMap( HttpServletRequest request )
    {
        return _gisService.getView( request.getParameter( PARAMETER_GIS_CODE ), null, request );
    }

    /**
     * Returns the coordinates of the address parameter.
     *
     * @param request
     *            the request
     * @return the coordinates as "longitude,latitude", or an empty string
     * @throws RemoteException
     *             if the address service fails
     */
    public String getGeolocalization( HttpServletRequest request ) throws RemoteException
    {
        return _gisAddressService.getGeolocalization( request );
    }

    /**
     * Returns the address at the x and y parameters.
     *
     * @param request
     *            the request
     * @return the address, or null
     * @throws RemoteException
     *             if the address service fails
     */
    public String getInverseGeolocalization( HttpServletRequest request ) throws RemoteException
    {
        return _gisAddressService.getInverseGeolocalization( request );
    }
}
