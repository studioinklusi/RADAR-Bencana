from qgis.PyQt.QtCore import QCoreApplication, QVariant
from qgis.core import (
    QgsProcessing,
    QgsProcessingAlgorithm,
    QgsProcessingParameterVectorLayer,
    QgsProcessingParameterField,
    QgsProcessingParameterNumber,
    QgsProcessingParameterFileDestination,
    QgsProcessingParameterFeatureSink,
    QgsProcessingParameterBoolean,
    QgsFields,
    QgsField,
    QgsFeature,
    QgsFeatureSink,
    QgsVectorLayer,
    QgsProject,
    QgsProcessingContext
)
import csv
import processing

class CarbonStockComparisonShapefiles(QgsProcessingAlgorithm):
    """
    Compares carbon stock differences between two periods, optionally integrates spatial plan zones,
    computes CO₂ emissions/sequestration and economic valuation, exports CSV and SHP outputs.
    """
    INPUT_LAYER_A     = 'INPUT_LAYER_A'
    INPUT_LAYER_B     = 'INPUT_LAYER_B'
    FIELD_CARBON_A    = 'FIELD_CARBON_A'
    FIELD_CARBON_B    = 'FIELD_CARBON_B'
    BOUNDARY_LAYER    = 'BOUNDARY_LAYER'
    PLAN_LAYER        = 'PLAN_LAYER'
    PLAN_FIELD        = 'PLAN_FIELD'
    USE_RASTER        = 'USE_RASTER'
    RASTER_RESOLUTION = 'RASTER_RESOLUTION'
    CARBON_PRICE      = 'CARBON_PRICE'
    OUTPUT_CSV        = 'OUTPUT_CSV'
    OUTPUT_SHP        = 'OUTPUT_SHP'

    def initAlgorithm(self, config=None):
        # Carbon stock inputs
        self.addParameter(QgsProcessingParameterVectorLayer(
            self.INPUT_LAYER_A, self.tr('Carbon stock – Year A'),
            types=[QgsProcessing.TypeVectorAnyGeometry]))
        self.addParameter(QgsProcessingParameterField(
            self.FIELD_CARBON_A, self.tr('Field – Year A'),
            parentLayerParameterName=self.INPUT_LAYER_A,
            type=QgsProcessingParameterField.Numeric))
        self.addParameter(QgsProcessingParameterVectorLayer(
            self.INPUT_LAYER_B, self.tr('Carbon stock – Year B'),
            types=[QgsProcessing.TypeVectorAnyGeometry]))
        self.addParameter(QgsProcessingParameterField(
            self.FIELD_CARBON_B, self.tr('Field – Year B'),
            parentLayerParameterName=self.INPUT_LAYER_B,
            type=QgsProcessingParameterField.Numeric))
        # Boundary clip
        self.addParameter(QgsProcessingParameterVectorLayer(
            self.BOUNDARY_LAYER, self.tr('Clipping boundary'),
            types=[QgsProcessing.TypeVectorPolygon]))
        # Optional spatial plan
        planParam = QgsProcessingParameterVectorLayer(
            self.PLAN_LAYER, self.tr('Spatial plan layer (optional)'),
            types=[QgsProcessing.TypeVectorPolygon]
        )
        from qgis.core import QgsProcessingParameterDefinition
        planParam.setFlags(planParam.flags() | QgsProcessingParameterDefinition.FlagOptional)
        self.addParameter(planParam)
        fieldParam = QgsProcessingParameterField(
            self.PLAN_FIELD, self.tr('Zone attribute field (optional)'),
            parentLayerParameterName=self.PLAN_LAYER,
            type=QgsProcessingParameterField.Any
        )
        fieldParam.setFlags(fieldParam.flags() | QgsProcessingParameterDefinition.FlagOptional)
        self.addParameter(fieldParam)
        # Options
        self.addParameter(QgsProcessingParameterBoolean(
            self.USE_RASTER, self.tr('Use raster workflow'), defaultValue=False))
        self.addParameter(QgsProcessingParameterNumber(
            self.RASTER_RESOLUTION, self.tr('Raster resolution'),
            type=QgsProcessingParameterNumber.Double, defaultValue=30.0))
        self.addParameter(QgsProcessingParameterNumber(
            self.CARBON_PRICE, self.tr('Carbon price IDR/tCO₂'),
            type=QgsProcessingParameterNumber.Double, defaultValue=30000.0))
        # Outputs
        self.addParameter(QgsProcessingParameterFileDestination(
            self.OUTPUT_CSV, self.tr('Comparison CSV (temporary)'),
            fileFilter='CSV files (*.csv)', defaultValue=QgsProcessing.TEMPORARY_OUTPUT))
        self.addParameter(QgsProcessingParameterFeatureSink(
            self.OUTPUT_SHP, self.tr('Result shapefile'),
            QgsProcessing.TypeVectorAnyGeometry))

    def processAlgorithm(self, parameters, context: QgsProcessingContext, feedback):
        # Load inputs
        layerA = self.parameterAsVectorLayer(parameters, self.INPUT_LAYER_A, context)
        layerB = self.parameterAsVectorLayer(parameters, self.INPUT_LAYER_B, context)
        fA = self.parameterAsString(parameters, self.FIELD_CARBON_A, context)
        fB = self.parameterAsString(parameters, self.FIELD_CARBON_B, context)
        boundary = self.parameterAsVectorLayer(parameters, self.BOUNDARY_LAYER, context)
        # Load optional plan layer
        plan = None
        if parameters.get(self.PLAN_LAYER):
            plan = self.parameterAsVectorLayer(parameters, self.PLAN_LAYER, context)
        zoneField = None
        if plan:
            zoneField = self.parameterAsString(parameters, self.PLAN_FIELD, context)
        useR = self.parameterAsBool(parameters, self.USE_RASTER, context)
        res = self.parameterAsDouble(parameters, self.RASTER_RESOLUTION, context)
        price = self.parameterAsDouble(parameters, self.CARBON_PRICE, context)
        outCSV = self.parameterAsFileOutput(parameters, self.OUTPUT_CSV, context)

        # 1. Compute raw difference
        if useR:
            feedback.pushInfo(self.tr('Rasterizing layers...'))
            rA = processing.run('gdal:rasterize', {'INPUT': layerA, 'FIELD': fA, 'UNITS': 1,
                'WIDTH': res, 'HEIGHT': res, 'EXTENT': layerA.extent(), 'OUTPUT': 'TEMPORARY_OUTPUT'}, context=context)['OUTPUT']
            rB = processing.run('gdal:rasterize', {'INPUT': layerB, 'FIELD': fB, 'UNITS': 1,
                'WIDTH': res, 'HEIGHT': res, 'EXTENT': layerA.extent(), 'OUTPUT': 'TEMPORARY_OUTPUT'}, context=context)['OUTPUT']
            diff = processing.run('gdal:rastercalculator', {'INPUT_A': rB, 'BAND_A': 1,
                'INPUT_B': rA, 'BAND_B': 1, 'FORMULA': 'A-B', 'RTYPE': 5,
                'OUTPUT': 'TEMPORARY_OUTPUT'}, context=context)['OUTPUT']
            raw = processing.run('gdal:polygonize', {'INPUT': diff, 'BAND': 1,
                'FIELD': 'Delta_C', 'OUTPUT': 'TEMPORARY_OUTPUT'}, context=context)['OUTPUT']
        else:
            feedback.pushInfo(self.tr('Joining attributes by location...'))
            raw = processing.run('native:joinattributesbylocation', {'INPUT': layerA, 'JOIN': layerB,
                'PREDICATE': [0], 'JOIN_FIELDS': [fB], 'METHOD': 1,
                'DISCARD_NONMATCHING': False, 'OUTPUT': 'TEMPORARY_OUTPUT'}, context=context)['OUTPUT']
        rawL = raw if isinstance(raw, QgsVectorLayer) else QgsVectorLayer(raw, 'raw', 'ogr')

        # 2. Clip to boundary
        clipped = processing.run('native:clip', {'INPUT': rawL, 'OVERLAY': boundary,
            'OUTPUT': 'TEMPORARY_OUTPUT'}, context=context)['OUTPUT']
        # 3. Optional: Join with plan zones
        if plan:
            joined = processing.run('native:joinattributesbylocation', {'INPUT': clipped, 'JOIN': plan,
                'PREDICATE': [0], 'JOIN_FIELDS': [zoneField], 'METHOD': 1,
                'DISCARD_NONMATCHING': False, 'OUTPUT': 'TEMPORARY_OUTPUT'}, context=context)['OUTPUT']
            zonedL = joined if isinstance(joined, QgsVectorLayer) else QgsVectorLayer(joined, 'zoned', 'ogr')
        else:
            zonedL = clipped

        # 4. Calculate metrics and collect rows
        rows = []
        for feat in zonedL.getFeatures():
            dC = feat['Delta_C'] if useR else feat[fB] - feat[fA]
            co2 = dC * 44.0/12.0
            em = abs(co2) if dC < 0 else 0.0
            seq = co2 if dC > 0 else 0.0
            loss = em * price
            gain = seq * price
            zone = feat[zoneField] if plan else 'All'
            rows.append({
                'geometry': feat.geometry(), 'Feature_ID': feat.id(),
                'Plan_Zone': zone, 'Delta_C_tC': dC,
                'CO2_Emissions_tCO2': em, 'CO2_Sequestration_tCO2': seq,
                'Economic_Loss_IDR': loss, 'Economic_Gain_IDR': gain,
                'Carbon_A_tC': feat[fA] if not useR else None,
                'Carbon_B_tC': feat[fB] if not useR else None
            })

        # 5. Aggregate totals by plan zone for CSV
        zone_totals = {}
        for r in rows:
            zone = r['Plan_Zone']
            if zone not in zone_totals:
                zone_totals[zone] = {
                    'Total_Delta_C_tC': 0.0,
                    'Total_CO2_Emissions_tCO2': 0.0,
                    'Total_CO2_Sequestration_tCO2': 0.0,
                    'Total_Economic_Loss_IDR': 0.0,
                    'Total_Economic_Gain_IDR': 0.0
                }
            zone_totals[zone]['Total_Delta_C_tC'] += r['Delta_C_tC']
            zone_totals[zone]['Total_CO2_Emissions_tCO2'] += r['CO2_Emissions_tCO2']
            zone_totals[zone]['Total_CO2_Sequestration_tCO2'] += r['CO2_Sequestration_tCO2']
            zone_totals[zone]['Total_Economic_Loss_IDR'] += r['Economic_Loss_IDR']
            zone_totals[zone]['Total_Economic_Gain_IDR'] += r['Economic_Gain_IDR']

        # Write aggregated CSV
        csv_fields = ['Plan_Zone', 'Total_Delta_C_tC', 'Total_CO2_Emissions_tCO2',
                      'Total_CO2_Sequestration_tCO2', 'Total_Economic_Loss_IDR',
                      'Total_Economic_Gain_IDR']
        with open(outCSV, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=csv_fields)
            writer.writeheader()
            for zone, vals in zone_totals.items():
                row = {'Plan_Zone': zone}
                row.update(vals)
                writer.writerow(row)

        # 6. Create and populate shapefile per feature
        feat_fields = ['Feature_ID', 'Plan_Zone']
        if not useR:
            feat_fields += ['Carbon_A_tC', 'Carbon_B_tC']
        feat_fields += ['Delta_C_tC', 'CO2_Emissions_tCO2', 'CO2_Sequestration_tCO2', 'Economic_Loss_IDR', 'Economic_Gain_IDR']
        fieldsDef = QgsFields()
        for name in feat_fields:
            dtype = QVariant.Int if name == 'Feature_ID' else QVariant.String if name == 'Plan_Zone' else QVariant.Double
            fieldsDef.append(QgsField(name, dtype))
        sink, destId = self.parameterAsSink(
            parameters, self.OUTPUT_SHP, context, fieldsDef, zonedL.wkbType(), zonedL.sourceCrs())
        for r in rows:
            feat = QgsFeature()
            feat.setGeometry(r['geometry'])
            feat.setAttributes([r[n] for n in feat_fields])
            sink.addFeature(feat, QgsFeatureSink.FastInsert)

        return {self.OUTPUT_CSV: outCSV, self.OUTPUT_SHP: destId}

    def name(self):
        return '3carbon_stock_comparison_shp'

    def displayName(self):
        return self.tr('3. Carbon Stock Comparison & CO₂ Analysis')

    def shortHelpString(self):
        return self.tr(
            'Inputs: Carbon A & B shapefiles; boundary polygon; optional plan zones. '
            'Options: raster toggle; resolution; price. '
            'Steps: rasterize/join; clip; optional join; compute metrics; export CSV & SHP.\n'
            '<i>This algorithm was prepared for the Cities Course: <strong>SCALA 3 2025</strong> '
            'and was authored by <strong>Firman Afrianto</strong>.</i><br/><br/>'
            )

    def group(self):
        return self.tr('SCALA 3')

    def groupId(self):
        return 'scala3'

    def tr(self, text):
        return QCoreApplication.translate('Processing', text)

    def createInstance(self):
        return CarbonStockComparisonShapefiles()
