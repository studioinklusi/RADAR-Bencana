import os
import csv
from PyQt5.QtCore import QCoreApplication, QVariant
from PyQt5.QtGui import QColor
from qgis.core import (
    QgsProcessing,
    QgsProcessingAlgorithm,
    QgsProcessingException,
    QgsProcessingParameterRasterLayer,
    QgsProcessingParameterFileDestination,
    QgsProcessingParameterEnum,
    QgsField,
    QgsVectorFileWriter,
    QgsVectorLayer,
    QgsProject,
    QgsProcessingUtils,
    QgsSymbol,
    QgsRendererCategory,
)
import processing

class CarbonStockEstimationRasters(QgsProcessingAlgorithm):
    INPUT_RASTER = 'INPUT_RASTER'
    SCHEMA = 'SCHEMA'
    OUTPUT_LAYER = 'OUTPUT_LAYER'
    OUTPUT_CSV = 'OUTPUT_CSV'
    NDVI_LAYER = 'NDVI_LAYER'
    NDMI_LAYER = 'NDMI_LAYER'
    DEM_LAYER = 'DEM_LAYER'
    CANOPY_LAYER = 'CANOPY_LAYER'

    def initAlgorithm(self, config=None):
        # Classification schema selector
        self.addParameter(
            QgsProcessingParameterEnum(
                self.SCHEMA,
                self.tr('Classification Schema'),
                options=['Dynamic World','ESRI World Cover'],
                defaultValue=0
            )
        )
        # Input raster
        self.addParameter(
            QgsProcessingParameterRasterLayer(
                self.INPUT_RASTER,
                self.tr('Input Classified Raster')
            )
        )
        # Output polygon layer
        self.addParameter(
            QgsProcessingParameterFileDestination(
                self.OUTPUT_LAYER,
                self.tr('Output Polygon Layer (GPKG or Shapefile)'),
                'GPKG files (*.gpkg);;ESRI Shapefile (*.shp)'
            )
        )
        # Output summary CSV
        self.addParameter(
            QgsProcessingParameterFileDestination(
                self.OUTPUT_CSV,
                self.tr('Output Summary CSV'),
                'CSV files (*.csv)'
            )
        )
        # Optional rasters
        for key, label in [
            (self.NDVI_LAYER, 'Optional NDVI Raster'),
            (self.NDMI_LAYER, 'Optional NDMI Raster'),
            (self.DEM_LAYER, 'Optional DEM Raster'),
            (self.CANOPY_LAYER, 'Optional Canopy Height Raster')
        ]:
            self.addParameter(
                QgsProcessingParameterRasterLayer(key, self.tr(label), optional=True)
            )

    def processAlgorithm(self, parameters, context, feedback):
        # Read parameters
        schema = self.parameterAsEnum(parameters, self.SCHEMA, context)
        input_raster = self.parameterAsRasterLayer(parameters, self.INPUT_RASTER, context)
        output_layer_path = parameters[self.OUTPUT_LAYER]
        output_csv = parameters[self.OUTPUT_CSV]
        ndvi_layer = self.parameterAsRasterLayer(parameters, self.NDVI_LAYER, context)
        ndmi_layer = self.parameterAsRasterLayer(parameters, self.NDMI_LAYER, context)
        dem_layer  = self.parameterAsRasterLayer(parameters, self.DEM_LAYER, context)
        canopy_layer = self.parameterAsRasterLayer(parameters, self.CANOPY_LAYER, context)

        # Define mappings based on schema
        if schema == 0:  # Dynamic World
            class_mapping = {0:'water',1:'trees',2:'grass',3:'flooded_vegetation',
                             4:'crops',5:'shrub_and_scrub',6:'built',7:'bare',8:'snow_and_ice'}
            carbon_values = {'water':0,'trees':150,'grass':10,'flooded_vegetation':100,
                             'crops':40,'shrub_and_scrub':30,'built':0,'bare':1,'snow_and_ice':0}
            label_map = {v:v.replace('_',' ').title() for v in carbon_values.keys()}
        else:  # ESRI World Cover
            class_mapping = {1:'water',2:'trees',4:'flooded_vegetation',5:'crops',
                             7:'built_area',8:'bare_ground',9:'snow_ice',10:'clouds',11:'rangeland'}
            carbon_values = {'water':0,'trees':150,'flooded_vegetation':100,'crops':40,
                             'built_area':0,'bare_ground':1,'snow_ice':0,'clouds':0,'rangeland':10}
            label_map = {
                'water':'Water','trees':'Trees','flooded_vegetation':'Flooded Vegetation',
                'crops':'Crops','built_area':'Built Area','bare_ground':'Bare Ground',
                'snow_ice':'Snow/Ice','clouds':'Clouds','rangeland':'Rangeland'
            }
            legend = [
                (1,'Water','#1A5BAB'),(2,'Trees','#358221'),
                (4,'Flooded Vegetation','#87D19E'),(5,'Crops','#FFDB5C'),
                (7,'Built Area','#ED022A'),(8,'Bare Ground','#EDE9E4'),
                (9,'Snow/Ice','#F2FAFF'),(10,'Clouds','#C8C8C8'),(11,'Rangeland','#C6AD8D')
            ]

        # Constants for calibration
        NDVI_ref, NDMI_ref, Canopy_ref, DEM_ref = 0.5, 0.5, 10.0, 100.0
        a, b, c, d = 0.2, 0.01, 0.0005, 0.15

        # Polygonize
        feedback.pushInfo(self.tr('Polygonizing raster...'))
        poly_res = processing.run('gdal:polygonize', {
            'INPUT': input_raster.source(), 'BAND':1, 'FIELD':'DN',
            'EIGHT_CONNECTEDNESS':False, 'EXTRA':'', 'OUTPUT':'TEMPORARY_OUTPUT'
        }, context=context, feedback=feedback)
        poly_layer = QgsVectorLayer(poly_res['OUTPUT'], 'polygons', 'ogr')
        if not poly_layer.isValid():
            feedback.reportError(self.tr('Polygonize failed'))
            return {}

        # Add attributes
        poly_layer.startEditing()
        poly_layer.dataProvider().addAttributes([
            QgsField('area_ha', QVariant.Double),
            QgsField('carbon', QVariant.Double),
            QgsField('class_name', QVariant.String)
        ])
        poly_layer.updateFields()
        idx_name = poly_layer.fields().indexOf('class_name')

        # Zonal stats helper
        def zstats(vl, rl, prefix):
            processing.run('qgis:zonalstatistics', {
                'INPUT_VECTOR': vl,
                'INPUT_RASTER': rl,
                'BAND':1, 'STATISTICS':[2], 'COLUMN_PREFIX':prefix
            }, context=context, feedback=feedback)

        # Compute zonal stats
        for layer, prefix in [(ndvi_layer,'ndvi_'),(ndmi_layer,'ndmi_'),(dem_layer,'dem_'),(canopy_layer,'canopy_')]:
            if layer:
                feedback.pushInfo(self.tr(f'Running zonal stats for {prefix}'))
                zstats(poly_layer, layer, prefix)

        total_carbon = 0.0
        summary = {}
        for feat in poly_layer.getFeatures():
            code = feat['DN']
            cls_key = class_mapping.get(code)
            if not cls_key:
                continue
            if cls_key in ('snow_ice','snow_and_ice'):
                cls_key = 'water'

            # Convert stats to float safely
            try:
                ndvi = float(feat['ndvi_mean'])
            except Exception:
                ndvi = NDVI_ref
            try:
                ndmi = float(feat['ndmi_mean'])
            except Exception:
                ndmi = NDMI_ref
            try:
                dem  = float(feat['dem_mean'])
            except Exception:
                dem = DEM_ref
            try:
                can  = float(feat['canopy_mean'])
            except Exception:
                can = Canopy_ref
            area_ha = feat.geometry().area() / 10000.0

            # Base carbon
            base_c = carbon_values.get(cls_key, 0)
            # Adjustment for water with vegetation or canopy
            if cls_key == 'water' and (ndvi > NDVI_ref or can > Canopy_ref):
                base_c = 1.0

            # Adjustment factor
            adjustment = (1 + a*(ndvi-NDVI_ref) + b*(can-Canopy_ref)
                          + c*(dem-DEM_ref) + d*(ndmi-NDMI_ref))
            carbon = base_c * area_ha * adjustment

            # Update attributes
            poly_layer.changeAttributeValue(feat.id(), idx_name, label_map.get(cls_key, cls_key.replace('_',' ').title()))
            poly_layer.changeAttributeValue(feat.id(), poly_layer.fields().indexOf('area_ha'), area_ha)
            poly_layer.changeAttributeValue(feat.id(), poly_layer.fields().indexOf('carbon'), carbon)

            total_carbon += carbon
            label = label_map.get(cls_key, cls_key.replace('_',' ').title())
            if label not in summary:
                summary[label] = {'area':0.0,'carbon':0.0}
            summary[label]['area'] += area_ha
            summary[label]['carbon'] += carbon

        poly_layer.commitChanges()
        # Add output layer to project even when using TEMPORARY_OUTPUT
        if output_layer_path == 'TEMPORARY_OUTPUT' or not output_layer_path:
            QgsProject.instance().addMapLayer(poly_layer)

        # Save output layer
        if output_layer_path != 'TEMPORARY_OUTPUT' and output_layer_path:
            err = QgsVectorFileWriter.writeAsVectorFormat(
                poly_layer, output_layer_path, 'UTF-8', poly_layer.crs(), 'GPKG'
            )
            if err != QgsVectorFileWriter.NoError:
                feedback.reportError(self.tr('Error writing polygon layer'))
            else:
                layer = QgsVectorLayer(output_layer_path, 'Carbon Polygons', 'ogr')
                QgsProject.instance().addMapLayer(layer)

        # Write CSV
        if output_csv == 'TEMPORARY_OUTPUT':
            output_csv = os.path.join(QgsProcessingUtils.tempFolder(), 'CarbonStockSummary.csv')
        with open(output_csv, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['Land Cover Class','Total Area (ha)','Carbon Stock (ton C)'])
            writer.writeheader()
            for lc, vals in summary.items():
                writer.writerow({
                    'Land Cover Class': lc,
                    'Total Area (ha)': '{:.2f}'.format(vals['area']),
                    'Carbon Stock (ton C)': '{:.2f}'.format(vals['carbon'])
                })
            writer.writerow({
                'Land Cover Class': 'Total',
                'Total Area (ha)': '{:.2f}'.format(sum(v['area'] for v in summary.values())),
                'Carbon Stock (ton C)': '{:.2f}'.format(total_carbon)
            })

        feedback.pushInfo(self.tr('Processing completed successfully'))
        return {self.OUTPUT_CSV: output_csv, 'TOTAL_CARBON': total_carbon}

    def name(self):
        return '2carbon_stock_estimation_raster'

    def displayName(self):
        return self.tr('2. Carbon Stock Estimation Raster')

    def group(self):
        return self.tr('SCALA 3: Mastering Carbon Stock')

    def groupId(self):
        return 'scala3'

    def tr(self, txt):
        return QCoreApplication.translate('Processing', txt)

    def shortHelpString(self):
        return self.tr(
            "Estimate carbon stock based on land cover with adjustments from NDVI, NDMI, DEM, and Canopy Height. Outputs include a polygon layer and a summary CSV.\n"
            "<i>This algorithm was prepared for the Cities Course: <strong>SCALA 3 2025</strong> "
            "and was authored by <strong>Firman Afrianto</strong>.</i><br/><br/>"
        )

    def createInstance(self):
        return CarbonStockEstimationRasters()
