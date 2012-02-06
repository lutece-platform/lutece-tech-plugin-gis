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

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;

import java.net.HttpURLConnection;
import java.net.URL;

import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * DOCUMENT ME!
 *
 * @author kGrellier
 */
public class ProxyGeoServer extends HttpServlet
{
    private ServletContext servletContext;
    private Logger log;

    public void init( ServletConfig servletConfig ) throws ServletException
    {
        servletContext = servletConfig.getServletContext(  );
        log = Logger.getLogger( ProxyGeoServer.class.getName(  ) );
    }

    public void doGet( HttpServletRequest request, HttpServletResponse response )
        throws ServletException, IOException
    {
        doPost( request, response );
    }

    public void doPost( HttpServletRequest request, HttpServletResponse response )
        throws ServletException, IOException
    {
        BufferedInputStream webToProxyBuf = null;
        BufferedOutputStream proxyToClientBuf = null;
        HttpURLConnection con;

        try
        {
            int statusCode;
            int oneByte;
            String methodName;
            String headerText;

            String urlString = request.getRequestURL(  ).toString(  );
            String queryString = request.getQueryString(  );

            urlString += ( ( queryString == null ) ? "" : ( "?" + queryString ) );
            urlString = request.getParameter( "url" );

            URL url = new URL( urlString );

            log.info( "Fetching >" + url.toString(  ) );

            con = (HttpURLConnection) url.openConnection(  );

            methodName = request.getMethod(  );
            con.setRequestMethod( methodName );
            con.setDoOutput( true );
            con.setDoInput( true );
            con.setFollowRedirects( false );
            con.setUseCaches( true );

            for ( Enumeration e = request.getHeaderNames(  ); e.hasMoreElements(  ); )
            {
                String headerName = e.nextElement(  ).toString(  );
                con.setRequestProperty( headerName, request.getHeader( headerName ) );
            }

            con.connect(  );

            if ( methodName.equals( "POST" ) )
            {
                BufferedInputStream clientToProxyBuf = new BufferedInputStream( request.getInputStream(  ) );
                BufferedOutputStream proxyToWebBuf = new BufferedOutputStream( con.getOutputStream(  ) );

                while ( ( oneByte = clientToProxyBuf.read(  ) ) != -1 )
                    proxyToWebBuf.write( oneByte );

                proxyToWebBuf.flush(  );
                proxyToWebBuf.close(  );
                clientToProxyBuf.close(  );
            }

            statusCode = con.getResponseCode(  );
            response.setStatus( statusCode );

            for ( Iterator i = con.getHeaderFields(  ).entrySet(  ).iterator(  ); i.hasNext(  ); )
            {
                Map.Entry mapEntry = (Map.Entry) i.next(  );

                if ( mapEntry.getKey(  ) != null )
                {
                    response.setHeader( mapEntry.getKey(  ).toString(  ),
                        ( (List) mapEntry.getValue(  ) ).get( 0 ).toString(  ) );
                }
            }

            webToProxyBuf = new BufferedInputStream( con.getInputStream(  ) );
            proxyToClientBuf = new BufferedOutputStream( response.getOutputStream(  ) );

            while ( ( oneByte = webToProxyBuf.read(  ) ) != -1 )
                proxyToClientBuf.write( oneByte );

            proxyToClientBuf.flush(  );
            proxyToClientBuf.close(  );

            webToProxyBuf.close(  );
            con.disconnect(  );
        }
        catch ( Exception e )
        {
            throw new ServletException(  );
        }
        finally
        {
        }
    }

    /*
     * public void doGet( HttpServletRequest req, HttpServletResponse res )
     * throws ServletException, IOException
     * {
     * String host = "ankou-ap-devic.mtrl.fr.sopra:80/geoserver/wms";
     * int port = 80;
     * final byte[] request = new byte[1024];
     * byte[] reply = new byte[4096];
     *
     * Socket server = null;
     * try
     * {
     *
     * final InputStream streamFromClient = req.getInputStream( );
     * final OutputStream streamToClient = res.getOutputStream( );
     *
     * // Get server streams.
     * String params = req.getParameter( "url" );
     * // URL url = new URL(
     * "http://ankou-ap-devic.mtrl.fr.sopra:80/geoserver/wms?" + params );
     * URL url = new URL( params );
     * URLConnection urlConnection = url.openConnection( );
     * urlConnection.setDoOutput( true );
     * urlConnection.getOutputStream( );
     *
     * final OutputStream streamToServer = urlConnection.getOutputStream( );
     * // a thread to read the client's requests and pass them
     * // to the server. A separate thread for asynchronous.
     * Thread t = new Thread( )
     * {
     * public void run( )
     * {
     * int bytesRead;
     * try
     * {
     * while ( ( bytesRead = streamFromClient.read( request ) ) != -1 )
     * {
     * streamToServer.write( request, 0, bytesRead );
     * streamToServer.flush( );
     * }
     * }
     * catch ( IOException e )
     * {
     * throw new TechnicalException( "Problème avec le proxy", e );
     * }
     *
     * // the client closed the connection to us, so close our
     * // connection to the server.
     * try
     * {
     * streamToServer.close( );
     * }
     * catch ( IOException e )
     * {
     * throw new TechnicalException( "Problème avec le proxy", e );
     * }
     * }
     * };
     *
     * // Start the client-to-server request thread running
     * t.start( );
     *
     * // Read the server's responses
     * // and pass them back to the client.
     * final InputStream streamFromServer = urlConnection.getInputStream( );
     * int bytesRead;
     * try
     * {
     * while ( ( bytesRead = streamFromServer.read( reply ) ) != -1 )
     * {
     * streamToClient.write( reply, 0, bytesRead );
     * streamToClient.flush( );
     * }
     * }
     * catch ( IOException e )
     * {
     * throw new TechnicalException( "Problème avec le proxy", e );
     * }
     *
     * // The server closed its connection to us, so we close our
     * // connection to our client.
     * streamToClient.close( );
     * }
     * catch ( IOException e )
     * {
     * System.err.println( e );
     * }
     * finally
     * {
     * try
     * {
     * if ( server != null )
     * server.close( );
     * }
     * catch ( IOException e )
     * {
     * throw new TechnicalException( "Problème avec le proxy", e );
     * }
     * }
     * }
     */
}
