package fr.paris.lutece.plugins.gis.web.xpage;

import javax.servlet.http.HttpServletRequest;

import fr.paris.lutece.plugins.gis.service.GisService;
import fr.paris.lutece.portal.service.message.SiteMessageException;
import fr.paris.lutece.portal.service.plugin.Plugin;
import fr.paris.lutece.portal.service.security.UserNotSignedException;
import fr.paris.lutece.portal.service.util.AppPropertiesService;
import fr.paris.lutece.portal.web.xpages.XPage;
import fr.paris.lutece.portal.web.xpages.XPageApplication;

/**
 * 
 * Basic XPageApplication implementation for the Lutece GIS plugin
 *
 */
public class GisXPageApplication implements XPageApplication{

    /**
     * HTTP-request parameter
     */
    private static final String PARAMETER_GIS_CODE 			= "gis_code";
    
    /**
     * Properties
     */
    private static final String PROPERTY_XPAGE_VIEW 		= "gis.xpage.view";
    private static final String PROPERTY_XPAGE_TITLE 		= "gis.xpage.title";
    private static final String PROPERTY_XPAGE_KEYWORD 		= "gis.xpage.keyword";
    private static final String PROPERTY_XPAGE_PATH_LABEL 	= "gis.xpage.pathLabel";
    
    
	private static GisService gisService = null;
	
	/**
	 * Initializes private static members
	 */
	static {
		gisService = GisService.getInstance(  );
	}
	    
    
	@Override
	/**
	 * {@inheritDoc}
	 */
	public XPage getPage(HttpServletRequest request, int nMode, Plugin plugin)
			throws UserNotSignedException, SiteMessageException {
		  
		String strXpageView = AppPropertiesService.getProperty( PROPERTY_XPAGE_VIEW );
        String strXpageTitle = AppPropertiesService.getProperty( PROPERTY_XPAGE_TITLE );
        String strXpageKeyword = AppPropertiesService.getProperty( PROPERTY_XPAGE_KEYWORD );
        String strXpagePathLabel = AppPropertiesService.getProperty( PROPERTY_XPAGE_PATH_LABEL );
        
        String strContent = gisService.getXPageView( 
        		request.getParameter( PARAMETER_GIS_CODE ), strXpageView, request );
                
        return  GisXPageApplication.buildXPage( strContent, strXpageTitle, strXpageKeyword, strXpagePathLabel );
	}

	/**
	 * Builds an XPage object based on the given parameters.
	 * 
	 * @param content @see fr.paris.lutece.portal.web.xpages#_strContent
	 * @param title @see fr.paris.lutece.portal.web.xpages#_strTitle
	 * @param keyword @see fr.paris.lutece.portal.web.xpages#_strKeyword
	 * @param pathLabel @see fr.paris.lutece.portal.web.xpages#_strPathLabel
	 * @return The XPage 
	 */
	private static final XPage buildXPage(String content, String title, String keyword, String pathLabel)
	{
		XPage xPage = new XPage();
		xPage.setContent(content);
		xPage.setTitle(title);
		xPage.setKeyword(keyword);
		xPage.setPathLabel(pathLabel);
		return xPage ;
	}
}
