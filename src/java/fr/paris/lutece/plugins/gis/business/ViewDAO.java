/*
 * Copyright (c) 2002-2013, Mairie de Paris
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

import fr.paris.lutece.plugins.gis.service.GisPlugin;
import fr.paris.lutece.portal.service.util.AppPropertiesService;

import java.util.ArrayList;
import java.util.List;


/**
 * This class provides Data Access methods for View objects
 */
public final class ViewDAO implements IViewDAO
{
    private static final String REGEX_ID = "-?[0-9]+";
    public String GIS_VIEW = "gis.view.";
    public String GIS_VIEW_LIST = "list";
    public String GIS_VIEW_CODE = ".code";
    public String GIS_SERVERNAME = "serverName";
    public String GIS_FEATURENS = "featureNS";
    public String GIS_VIEW_AVAILABLEPARAMETERS = "availableParameters";
    public String GIS_VIEW_AVAILABLEPARAMETERSLAYERS = "availableParametersLayers";
    public String GIS_VIEW_AVAILABLEPARAMETERSSTYLES = "availableParametersStyles";
    public String GIS_VIEW_AVAILABLEPARAMETERSSTYLERULES = "availableParametersStyleRules";
    public String PARAMETER_SUFFIX_BASE_LAYERS = "layers.base";
    public String PARAMETER_SUFFIX_THEMATIC_LAYERS = "layers.thematic";
    public String PARAMETER_SUFFIX_SELECTABLE_LAYERS = "layers.selectable";
    public String PARAMETER_SUFFIX_STYLES = "styles";
    public String PARAMETER_SUFFIX_DEFAULT_STYLE_RULES = ".style.default.rules";
    public String PARAMETER_SUFFIX_SELECT_STYLE_RULES = ".style.select.rules";
    public String PARAMETER_SUFFIX_DEFAULT_STYLE_RULE = ".style.default.";
    public String PARAMETER_SUFFIX_SELECT_STYLE_RULE = ".style.select.";
    public String PARAMETER_SUFFIX_TEMPLATEFILE = ".templateFile";
    public String PARAMETER_SUFFIX_JSFILE = ".jsFile";
    public String PARAMETER_SUFFIX_PARAMETER = ".parameter.";

    public String getPluginName(  )
    {
        return GisPlugin.PLUGIN_NAME;
    }

    public View findById( Integer key )
    {
        View view = new View(  );
        view.setId( key );
        view.setTemplateFile( AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) +
                PARAMETER_SUFFIX_TEMPLATEFILE ) );
        view.setServerName( AppPropertiesService.getProperty( GIS_VIEW + GIS_SERVERNAME ) );
        view.setFeatureNS( AppPropertiesService.getProperty( GIS_VIEW + GIS_FEATURENS ) );

        view.setAvailableParameters( AppPropertiesService.getProperty( GIS_VIEW + GIS_VIEW_AVAILABLEPARAMETERS ) );
        view.setAvailableParametersLayers( AppPropertiesService.getProperty( GIS_VIEW +
                GIS_VIEW_AVAILABLEPARAMETERSLAYERS ) );
        view.setAvailableParametersStyles( AppPropertiesService.getProperty( GIS_VIEW +
                GIS_VIEW_AVAILABLEPARAMETERSSTYLES ) );
        view.setAvailableParametersStyleRules( AppPropertiesService.getProperty( GIS_VIEW +
                GIS_VIEW_AVAILABLEPARAMETERSSTYLERULES ) );

        view.setJsFile( AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) + PARAMETER_SUFFIX_JSFILE ) );

        //get Parameters
        String[] availableParameters = AppPropertiesService.getProperty( GIS_VIEW + GIS_VIEW_AVAILABLEPARAMETERS )
                                                           .split( "," );

        for ( String strKey : availableParameters )
        {
            view.putParameter( strKey,
                AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) + PARAMETER_SUFFIX_PARAMETER +
                    strKey, "" ) );
        }

        // Layers parameters
        String baseLayerList = AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) +
                PARAMETER_SUFFIX_PARAMETER + PARAMETER_SUFFIX_BASE_LAYERS, "" );
        String thematicLayerList = AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) +
                PARAMETER_SUFFIX_PARAMETER + PARAMETER_SUFFIX_THEMATIC_LAYERS, "" );
        String selectableLayerList = AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) +
                PARAMETER_SUFFIX_PARAMETER + PARAMETER_SUFFIX_SELECTABLE_LAYERS, "" );

        view.putParameter( PARAMETER_SUFFIX_BASE_LAYERS, baseLayerList );
        view.putParameter( PARAMETER_SUFFIX_THEMATIC_LAYERS, thematicLayerList );
        view.putParameter( PARAMETER_SUFFIX_SELECTABLE_LAYERS, selectableLayerList );

        String[] layers = ( baseLayerList + "," + thematicLayerList + "," + selectableLayerList ).split( "," );

        for ( String strLayerKey : layers )
        {
            String[] layersParameters = AppPropertiesService.getProperty( GIS_VIEW +
                    GIS_VIEW_AVAILABLEPARAMETERSLAYERS, "" ).split( "," );

            for ( String strKey : layersParameters )
            {
                view.putParameter( strLayerKey + "." + strKey,
                    AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) + PARAMETER_SUFFIX_PARAMETER +
                        strLayerKey + "." + strKey, "" ) );
            }

            String defaultRulesList = AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key )
                    + PARAMETER_SUFFIX_PARAMETER + strLayerKey + PARAMETER_SUFFIX_DEFAULT_STYLE_RULES, "" );

            String[] defaultRules = defaultRulesList.split( "," );

            for ( String strRuleKey : defaultRules )
            {
                String[] stylesParameters = AppPropertiesService.getProperty( GIS_VIEW +
                        GIS_VIEW_AVAILABLEPARAMETERSSTYLERULES, "" ).split( "," );

                for ( String strKey : stylesParameters )
                {
                    view.putParameter( strLayerKey + PARAMETER_SUFFIX_DEFAULT_STYLE_RULE + strRuleKey + "." + strKey,
                        AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) +
                            PARAMETER_SUFFIX_PARAMETER + strLayerKey + PARAMETER_SUFFIX_DEFAULT_STYLE_RULE + strRuleKey + "." +
                            strKey, "" ) );
                }
            }

            String selectRulesList = AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key )
                    + PARAMETER_SUFFIX_PARAMETER + strLayerKey + PARAMETER_SUFFIX_SELECT_STYLE_RULES, "" );
            String[] selectRules = selectRulesList.split( "," );

            for ( String strRuleKey : selectRules )
            {
                String[] stylesParameters = AppPropertiesService.getProperty(
                        GIS_VIEW + GIS_VIEW_AVAILABLEPARAMETERSSTYLERULES, "" ).split( "," );

                for ( String strKey : stylesParameters )
                {
                    view.putParameter(
                            strLayerKey + PARAMETER_SUFFIX_SELECT_STYLE_RULE + strRuleKey + "." + strKey,
                            AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key )
                                    + PARAMETER_SUFFIX_PARAMETER + strLayerKey + PARAMETER_SUFFIX_SELECT_STYLE_RULE
                                    + strRuleKey + "." + strKey, "" ) );
                }
            }
        }

        String styleList = AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) +
                PARAMETER_SUFFIX_PARAMETER + PARAMETER_SUFFIX_STYLES, "" );

        view.putParameter( PARAMETER_SUFFIX_STYLES, styleList );

        String[] styles = styleList.split( "," );

        for ( String strStylesKey : styles )
        {
            String[] stylesParameters = AppPropertiesService.getProperty( GIS_VIEW +
                    GIS_VIEW_AVAILABLEPARAMETERSSTYLES, "" ).split( "," );

            for ( String strKey : stylesParameters )
            {
                view.putParameter( strStylesKey + "." + strKey,
                    AppPropertiesService.getProperty( GIS_VIEW + String.valueOf( key ) + PARAMETER_SUFFIX_PARAMETER +
                        strStylesKey + "." + strKey, "" ) );
            }
        }

        return view;
    }

    public List<View> findAll(  )
    {
        List<View> viewsList = new ArrayList<View>(  );

        String[] listIdViews = AppPropertiesService.getProperty( GIS_VIEW + GIS_VIEW_LIST ).split( "," );

        for ( String strId : listIdViews )
        {
            viewsList.add( findById( Integer.parseInt( strId ) ) );
        }

        return viewsList;
    }

    public View findByCode( String strGisCode )
    {
        int nViewId = -1;
        String strViewId = AppPropertiesService.getProperty( GIS_VIEW + strGisCode );

        if ( ( strViewId != null ) && strViewId.matches( REGEX_ID ) )
        {
            nViewId = Integer.parseInt( strViewId );
        }
        else
        {
            return null;
        }

        return findById( nViewId );
    }
}
