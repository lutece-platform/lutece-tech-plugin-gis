--
-- Dumping data for table core_admin_right
--
INSERT INTO core_admin_right (id_right,name,level_right,admin_url,description,is_updatable,plugin_name,id_feature_group,icon_url,documentation_url) VALUES
('GIS_MANAGEMENT','gis.adminFeature.gis_management.name',3,'jsp/admin/plugins/gis/ManageGis.jsp','gis.adminFeature.gis_management.description',0,'gis','APPLICATIONS','images/admin/skin/plugins/gis/gis.png',NULL);


--
-- Dumping data for table core_user_right
--
INSERT INTO core_user_right (id_right,id_user) VALUES ('GIS_MANAGEMENT',1);
INSERT INTO core_user_right (id_right,id_user) VALUES ('GIS_MANAGEMENT',2);

