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
package fr.paris.lutece.plugins.gis.service;

import java.rmi.RemoteException;
import java.util.Locale;

import fr.paris.lutece.plugins.gis.business.LonLat;
import fr.paris.lutece.portal.service.i18n.I18nService;
import fr.paris.lutece.portal.service.util.AppLogService;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Geolocalization and inverse geolocalization through the address facade a module provides.
 */
@ApplicationScoped
public class GisAddressService
{
    private static final String PROPERTY_ERROR = "gis.plugin.error";
    private static final String PARAMETER_ADDRESS = "address";
    private static final String PARAMETER_SRID = "srid";
    private static final String PARAMETER_X = "x";
    private static final String PARAMETER_Y = "y";

    @Inject
    private Instance<IAddressServiceFacade> _addressServiceFacade;

    /**
     * Returns the address facade, or null when no module provides one.
     *
     * @return the address facade or null
     */
    private IAddressServiceFacade getAddressFacade( )
    {
        if ( _addressServiceFacade.isResolvable( ) )
        {
            return _addressServiceFacade.get( );
        }

        AppLogService.error( I18nService.getLocalizedString( PROPERTY_ERROR, Locale.getDefault( ) ) );

        return null;
    }

    /**
     * Geolocalizes the address of the request.
     *
     * @param request
     *            the request carrying the address and srid parameters
     * @return the coordinates as "longitude,latitude", or an empty string
     * @throws RemoteException
     *             if the address service fails
     */
    public String getGeolocalization( HttpServletRequest request ) throws RemoteException
    {
        String strAddress = request.getParameter( PARAMETER_ADDRESS );
        String strSrid = request.getParameter( PARAMETER_SRID );
        IAddressServiceFacade facade = getAddressFacade( );

        if ( strAddress == null || strSrid == null || facade == null )
        {
            return "";
        }

        LonLat lonLat = facade.getGeolocalization( request, strAddress.trim( ), strSrid.trim( ) );

        return ( lonLat != null ) ? lonLat.toString( ) : "";
    }

    /**
     * Finds the address at the coordinates of the request.
     *
     * @param request
     *            the request carrying the x, y and srid parameters
     * @return the address, or null
     * @throws RemoteException
     *             if the address service fails
     */
    public String getInverseGeolocalization( HttpServletRequest request ) throws RemoteException
    {
        String strX = request.getParameter( PARAMETER_X );
        String strY = request.getParameter( PARAMETER_Y );
        String strSrid = request.getParameter( PARAMETER_SRID );

        if ( strX == null || strX.isEmpty( ) || strY == null || strY.isEmpty( ) || strSrid == null )
        {
            return null;
        }

        IAddressServiceFacade facade = getAddressFacade( );

        if ( facade == null )
        {
            return null;
        }

        LonLat lonLat = new LonLat( Double.parseDouble( strX ), Double.parseDouble( strY ) );

        return facade.getInverseGeolocalization( request, lonLat, strSrid.trim( ) );
    }
}
