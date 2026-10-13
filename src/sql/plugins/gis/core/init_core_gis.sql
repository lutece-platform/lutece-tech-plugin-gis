-- liquibase formatted sql
-- changeset gis:init_core_gis.sql
-- preconditions onFail:MARK_RAN onError:WARN
-- precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM core_admin_right WHERE id_right = 'GIS_MANAGEMENT'
--
-- Dumping data for table core_admin_right
--
INSERT INTO core_admin_right (id_right,name,level_right,admin_url,description,is_updatable,plugin_name,id_feature_group,icon_url,documentation_url) VALUES
('GIS_MANAGEMENT','gis.adminFeature.gis_management.name',3,'jsp/admin/plugins/gis/ManageGis.jsp','gis.adminFeature.gis_management.description',0,'gis','APPLICATIONS','ti ti-map',NULL);


--
-- Dumping data for table core_user_right
--
INSERT INTO core_user_right (id_right,id_user) VALUES ('GIS_MANAGEMENT',1);
INSERT INTO core_user_right (id_right,id_user) VALUES ('GIS_MANAGEMENT',2);


-- changeset gis:init_core_gis-rev1.sql
-- preconditions onFail:MARK_RAN onError:WARN
UPDATE core_admin_right SET icon_url = 'ti ti-map' WHERE id_right = 'GIS_MANAGEMENT' AND ( icon_url IS NULL OR icon_url = '' OR icon_url = 'images/admin/skin/plugins/gis/gis.png' );
