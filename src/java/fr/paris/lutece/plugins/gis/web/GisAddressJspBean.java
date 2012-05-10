package fr.paris.lutece.plugins.gis.web;


import java.rmi.RemoteException;

import javax.servlet.http.HttpServletRequest;

import fr.paris.lutece.plugins.gis.business.LonLat;
import fr.paris.lutece.plugins.gis.service.IAddressServiceFacade;
import fr.paris.lutece.portal.service.spring.SpringContextService;
import fr.paris.lutece.portal.web.admin.PluginAdminPageJspBean;

/**
 * 
 *
 */
public class GisAddressJspBean extends PluginAdminPageJspBean
{
	/**
	 * public static members
	 */
    public static final String RIGHT_MANAGE_GIS = "GIS_MANAGEMENT";

	/**
	 * private static members
	 */
	private static IAddressServiceFacade addressServiceFacade = null;
	
	/**
	 * Initializes private static members
	 */
	static{
		GisAddressJspBean.addressServiceFacade = (IAddressServiceFacade) 
				SpringContextService.getBean( "adresseServiceFacade" );
	};
	
	/**
	 * GetGeolocalization( ).
	 * 
	 * @param request The HTTP request.
	 * @return coordinates
	 * @throws RemoteException
	 */
	public String getGeolocalization(HttpServletRequest request) 
			throws RemoteException
	{
		// gets HTTP request parameters
		String address = request.getParameter("address").trim();
		String srid = request.getParameter("srid").trim();
		
		// does geolocalization
		LonLat lonLat =  addressServiceFacade.getGeolocalization(request, address, srid);
		
		return lonLat != null ? lonLat.toString() : "";
	}
	
	/**
	 * GetInverseGeolocalization( ).
	 * 
	 * @param request The HTTP request.
	 * @return a String address
	 * @throws RemoteException
	 */
	public String getInverseGeolocatization(HttpServletRequest request)
			throws RemoteException
	{
		// gets HTTP request parameters
		String x = request.getParameter("x"); 
		String y = request.getParameter("y");
		String srid = request.getParameter("srid").trim();
		
		String address = null;
		// checks parameters
		if ( ( x != null && x.length() != 0 )  && 
			 ( y != null && y.length() != 0 )
		){
			LonLat lonLat = new LonLat(Long.parseLong(x),Long.parseLong(y));
			// does inverse geolocalization
			address = addressServiceFacade.getInverseGeolocalization(request, lonLat, srid); 
		}
		
		return address;
	}
}
