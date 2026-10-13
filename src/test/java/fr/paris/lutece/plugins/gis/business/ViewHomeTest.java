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
package fr.paris.lutece.plugins.gis.business;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

import fr.paris.lutece.test.LuteceTestCase;

/**
 * Tests the views read from the plugin properties.
 */
public class ViewHomeTest extends LuteceTestCase
{
    /**
     * Reads a view by its code and its parameters.
     */
    @Test
    public void testFindByCode( )
    {
        View view = ViewHome.findByCode( "CPL" );

        assertEquals( 1, view.getId( ) );
        assertEquals( "admin/plugins/gis/view1.html", view.getTemplateFile( ) );
        assertEquals( "js/plugins/gis/view1.js", view.getJsFile( ) );
        assertEquals( "", view.getServerName( ) );
        assertEquals( "EPSG:900913", view.getParameter( "projection" ) );
        assertEquals( "osm", view.getParameter( "layers.base" ) );
        assertEquals( "", view.getParameter( "layers.thematic" ) );
        assertEquals( "Open Street Map", view.getParameter( "osm.name" ) );
    }

    /**
     * An unknown code finds no view.
     */
    @Test
    public void testFindByUnknownCode( )
    {
        assertNull( ViewHome.findByCode( "UNKNOWN" ) );
    }

    /**
     * Lists the views declared in the properties.
     */
    @Test
    public void testFindAll( )
    {
        assertEquals( 1, ViewHome.findAll( ).size( ) );
    }
}
