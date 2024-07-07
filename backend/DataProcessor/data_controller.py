from django.http import JsonResponse
from rest_framework.decorators import api_view
from datastream.models import G2PondData, G3PondData, G4PondData
from predictiondatastream.models import G2EcoliPredictionData, G3EcoliPredictionData, G2EnterococcusPredictionData, G3EnterococcusPredictionData
from UserManagement.models import Component
from .serializers import PondDataSerializer
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

@api_view(['POST'])
def create_component(request):
    if request.method == 'POST':
        data = request.data
        parameters = data.get('params', {})
        component_id = data.get('componentId')
        user_email = data.get('userEmail')
        #print(f"parameters: {parameters}")
        #print(f"component_id: {component_id}")
        #print(f"user_email: {user_email}")

        # Store the component ID, parameters, and user email
        component = Component.objects.create(user_email=user_email, component_id=component_id, parameters=parameters) # HQ: Need to check if can store

        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)
    else:
        return Response({ }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def fetch_component_metadata(request):
    if request.method == 'POST':
        # Get the user email from the request data
        user_email = request.data.get('userEmail')
        # Fetch the component by user email
        component = Component.objects(user_email=user_email)
        if component:
            # Serialize the component metadata into JSON format
            serialized_components_metadata = []
            for componentObj in component:
                serialized_components_metadata.append({
                'component_id': componentObj.component_id,
                'parameters': componentObj.parameters,
                # Include other fields of the Component model as needed
            })
            # Return the serialized component metadata as JSON response
            return Response({'status': 'success', 'data': serialized_components_metadata}, status=status.HTTP_200_OK)
        else:
            return Response({ }, status=status.HTTP_404_NOT_FOUND) 
    else:
        return Response({ }, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
def fetch_component_data(request):
    if request.method == 'POST':
        data = request.data
        print(f"data: {data}")
        # Extract component_id and parameters from data dictionary
        component_id = data['metaData']['component_id']
        parameters = data['metaData']['parameters']

        print(f"parameters: {parameters}")

        # Initialize a dictionary to store aggregated data for each pond
        aggregated_data = {}

        # Extract Parameters from parameters
        chart_type = parameters.get('Chart')
        pond_names = parameters.get('Pond', [])
        print(f"pond_names: {pond_names}")
        start_date_str = parameters.get('StartDate')
        end_date_str = parameters.get('EndDate')
        #start_time = parameters.get('StartTime')
        #end_time = parameters.get('EndTime')

        # Parse start date and end date strings into datetime objects & Convert datetime objects to the format expected by the database (e.g., "Apr 16, 2022")
        if (start_date_str != ''):
            start_date = datetime.strptime(start_date_str, "%d-%m-%Y")
            start_date_db_format = start_date.strftime("%b %d, %Y")
        if (end_date_str != ''):   
            end_date = datetime.strptime(end_date_str, "%d-%m-%Y")
            end_date_db_format = end_date.strftime("%b %d, %Y")

        # Define time intervals
        time_intervals = ['0700', '1000', '1300', '1500', '1800']
        # Convert start_time and end_time to comparable format
        #if (start_time != ''):
        #    start_time = datetime.strptime(start_time, '%I%p').strftime('%H%M')
        #if (end_time != ''):
        #    end_time = datetime.strptime(end_time, '%I%p').strftime('%H%M')

        # Extraction of Biology Data if Biology component (This is exclusive for Biology)
        if 'Biology' in component_id:
            
            if 'Line Graph' in chart_type:
                # Iterate for each pond
                for pond_name in pond_names:
                    # Filter includes date range for 'Line Graph'
                    pond_data_list = PondData.objects.filter(
                        pond_name=pond_name,
                        doc__date__gte=start_date_db_format,
                        doc__date__lte=end_date_db_format
                    ).order_by('doc__date')

                    # Initialize a dictionary to store the biology data for each date
                    pond_aggregated_data = {}

                    # Iterate for each Pond Data Object
                    for pond_data in pond_data_list:
                        # Obtain Biology Data Object
                        biology_data = pond_data.biology
                        if biology_data:
                            # Create a date key
                            date_key = pond_data.doc.date.strftime("%b %d, %Y")
                            if date_key not in pond_aggregated_data:
                                pond_aggregated_data[date_key] = []

                            # Append the biology data for the current date
                            pond_aggregated_data[date_key].append({
                                'Chlorophyta (GA)': biology_data.chlorophyta_GA,
                                'Cyanophyta (BGA)': biology_data.cyanophyta_BGA,
                                'Dinoflagelata': biology_data.dinoflagelata,
                                'Diatom': biology_data.diatom,
                                'Euglenophyta': biology_data.euglenophyta,
                                'Protozoa/Zooplankton': biology_data.protozoa_zooplankton,
                                'Total Plankton': biology_data.total_plankton,
                                'Total Vibrio Count (TVC)': biology_data.total_vibrio_count_TVC,
                                'Total Bacteria Count (TBC)': biology_data.total_bacteria_count_TBC,
                                'TVC/TBC ( % )': biology_data.TVC_TBC
                            })

                    # Store the extracted biology data for the current pond
                    aggregated_data[pond_name] = pond_aggregated_data

                # Print or use the extracted data
                for pond_name, pond_data in aggregated_data.items():
                    print(f"{pond_name}: {pond_data}")

            else:
                # HQ: Hard-coded latest date 
                latest_date = datetime.strptime("21-04-2022", "%d-%m-%Y")
                latest_date_db_format = latest_date.strftime("%b %d, %Y")

                # Iterate for each pond
                for pond_name in pond_names:
                    # Filter includes date range
                    pond_data_list = PondData.objects.filter(pond_name=pond_name, doc__date__exact=latest_date_db_format)
                    #print(f"pond_data_list (len): {pond_data_list.count()}")

                    # Initialize a dictionary to store the aggregated biology data for the current pond
                    pond_aggregated_data = {}

                    # Iterate for each Pond Data Object
                    for pond_data in pond_data_list:
                        # Obtain Biology Data Object
                        biology_data = pond_data.biology
                        if biology_data:

                            if biology_data.chlorophyta_GA is not None:
                                # Add chlorophyta_GA to the total for the current pond
                                pond_aggregated_data.setdefault('Chlorophyta (GA)', 0)
                                pond_aggregated_data['Chlorophyta (GA)'] += biology_data.chlorophyta_GA
                            if biology_data.cyanophyta_BGA is not None:
                                # Add cyanophyta_BGA to the total for the current pond
                                pond_aggregated_data.setdefault('Cyanophyta (BGA)', 0)
                                pond_aggregated_data['Cyanophyta (BGA)'] += biology_data.cyanophyta_BGA
                            if biology_data.dinoflagelata is not None:
                                # Add dinoflagelata to the total for the current pond
                                pond_aggregated_data.setdefault('Dinoflagelata', 0)
                                pond_aggregated_data['Dinoflagelata'] += biology_data.dinoflagelata
                            if biology_data.diatom is not None:
                                # Add diatom to the total for the current pond
                                pond_aggregated_data.setdefault('Diatom', 0)
                                pond_aggregated_data['Diatom'] += biology_data.diatom
                            if biology_data.euglenophyta is not None:
                                # Add euglenophyta to the total for the current pond
                                pond_aggregated_data.setdefault('Euglenophyta', 0)
                                pond_aggregated_data['Euglenophyta'] += biology_data.euglenophyta
                            if biology_data.protozoa_zooplankton is not None:
                                # Add protozoa_zooplankton to the total for the current pond
                                pond_aggregated_data.setdefault('Protozoa/Zooplankton', 0)
                                pond_aggregated_data['Protozoa/Zooplankton'] += biology_data.protozoa_zooplankton
                            if biology_data.total_plankton is not None:
                                # Add total_plankton to the total for the current pond
                                pond_aggregated_data.setdefault('Total Plankton', 0)
                                pond_aggregated_data['Total Plankton'] += biology_data.total_plankton
                            if biology_data.total_vibrio_count_TVC is not None:
                                # Add total_vibrio_count_TVC to the total for the current pond
                                pond_aggregated_data.setdefault('Total Vibrio Count (TVC)', 0)
                                pond_aggregated_data['Total Vibrio Count (TVC)'] += biology_data.total_vibrio_count_TVC
                            if biology_data.total_bacteria_count_TBC is not None:
                                # Add total_bacteria_count_TBC to the total for the current pond
                                pond_aggregated_data.setdefault('Total Bacteria Count (TBC)', 0)
                                pond_aggregated_data['Total Bacteria Count (TBC)'] += biology_data.total_bacteria_count_TBC
                            if biology_data.TVC_TBC is not None:
                                # Add TVC_TBC to the total for the current pond
                                pond_aggregated_data.setdefault('TVC/TBC ( % )', 0)
                                pond_aggregated_data['TVC/TBC ( % )'] += biology_data.TVC_TBC
                            # Add other conditions for different biology data similarly
                                
                # Store the aggregated biology data for the current pond in the aggregated data dictionary
                    aggregated_data[pond_name] = pond_aggregated_data                
                                                
                # Print or use the aggregated data
                for pond_name, pond_data in aggregated_data.items():
                    print(f"{pond_name}: {pond_data}")

        # Extraction of Chemical Data if Biology component (This is exclusive for Chemical)
        if 'Chemical' in component_id:

            if 'Line Graph' in chart_type:
                # Iterate for each pond
                for pond_name in pond_names:
                    # Filter includes date range for 'Line Graph'
                    pond_data_list = PondData.objects.filter(
                        pond_name=pond_name,
                        doc__date__gte=start_date_db_format,
                        doc__date__lte=end_date_db_format
                    ).order_by('doc__date')

                    # Initialize a dictionary to store the chemical data for each date
                    pond_aggregated_data = {}

                    # Iterate for each Pond Data Object
                    for pond_data in pond_data_list:
                        # Obtain Chemical Data Object
                        chemical_data = pond_data.chemical
                        if chemical_data:
                            # Create a date key
                            date_key = pond_data.doc.date.strftime("%b %d, %Y")
                            if date_key not in pond_aggregated_data:
                                pond_aggregated_data[date_key] = []

                            # Append the chemical data for the current date
                            pond_aggregated_data[date_key].append({
                                'TAN': chemical_data.TAN,
                                'Alkalinity': chemical_data.alkalinity,
                                'Calcium': chemical_data.calcium,
                                'Magnesium': chemical_data.magnesium,
                                'Potassium': chemical_data.potassium,
                                'Iron': chemical_data.iron,
                                'Nitrate (NO3)': chemical_data.nitrate_NO3,
                                'Nitrite (NO2)': chemical_data.nitrite_NO2,
                                'Amonia (NH3)': chemical_data.ammonia_NH3,
                                'Amonium (NH4)': chemical_data.ammonium_NH4,
                                'pH (Lab)': chemical_data.pH_lab,
                                'Carbonate (CO3)': chemical_data.carbonate_CO3,
                                'Bicarbonate (HCO3)': chemical_data.bicarbonate_HCO3,
                                'Total Hardness': chemical_data.total_hardness,
                                'Calcium Hardness': chemical_data.calcium_hardness,
                                'Magnesium Hardness': chemical_data.magnesium_hardness,
                                'Phosphate (PO4)': chemical_data.phosphate_PO4,
                                'Total Organic Matter (TOM)': chemical_data.total_organic_matter_TOM,
                                'Hydrogen Sulfide (H2S)': chemical_data.hydrogen_sulfide_H2S
                            })

                    # Store the extracted chemical data for the current pond
                    aggregated_data[pond_name] = pond_aggregated_data

                # Print or use the extracted data
                for pond_name, pond_data in aggregated_data.items():
                    print(f"{pond_name}: {pond_data}")

            else:
                # HQ: Hard-coded latest date 
                latest_date = datetime.strptime("21-04-2022", "%d-%m-%Y")
                latest_date_db_format = latest_date.strftime("%b %d, %Y")

                # Iterate for each pond
                for pond_name in pond_names:
                    # Filter includes date range
                    pond_data_list = PondData.objects.filter(pond_name=pond_name, doc__date__exact=latest_date_db_format)
                    #print(f"pond_data_list (len): {pond_data_list.count()}")

                    # Initialize a dictionary to store the aggregated chemical data for the current pond
                    pond_aggregated_data = {}

                    # Iterate for each Pond Data Object
                    for pond_data in pond_data_list:
                        # Obtain Chemical Data Object
                        chemical_data = pond_data.chemical
                        if chemical_data:

                            if chemical_data.TAN is not None:
                                # Add TAN to the total for the current pond
                                pond_aggregated_data.setdefault('TAN', 0)
                                pond_aggregated_data['TAN'] += chemical_data.TAN
                            if chemical_data.alkalinity is not None:
                                # Add cyanophyta_BGA to the total for the current pond
                                pond_aggregated_data.setdefault('Alkalinity', 0)
                                pond_aggregated_data['Alkalinity'] += chemical_data.alkalinity
                            if chemical_data.calcium is not None:
                                # Add calcium to the total for the current pond
                                pond_aggregated_data.setdefault('Calcium', 0)
                                pond_aggregated_data['Calcium'] += chemical_data.calcium
                            if chemical_data.magnesium is not None:
                                # Add magnesium to the total for the current pond
                                pond_aggregated_data.setdefault('Magnesium', 0)
                                pond_aggregated_data['Magnesium'] += chemical_data.magnesium
                            if chemical_data.potassium is not None:
                                # Add potassium to the total for the current pond
                                pond_aggregated_data.setdefault('Potassium', 0)
                                pond_aggregated_data['Potassium'] += chemical_data.potassium
                            if chemical_data.iron is not None:
                                # Add iron to the total for the current pond
                                pond_aggregated_data.setdefault('Iron', 0)
                                pond_aggregated_data['Iron'] += chemical_data.iron
                            if chemical_data.nitrate_NO3 is not None:
                                # Add nitrate_NO3 to the total for the current pond
                                pond_aggregated_data.setdefault('Nitrate (NO3)', 0)
                                pond_aggregated_data['Nitrate (NO3)'] += chemical_data.nitrate_NO3
                            if chemical_data.nitrite_NO2 is not None:
                                # Add nitrite_NO2 to the total for the current pond
                                pond_aggregated_data.setdefault('Nitrite (NO2)', 0)
                                pond_aggregated_data['Nitrite (NO2)'] += chemical_data.nitrite_NO2
                            if chemical_data.ammonia_NH3 is not None:
                                # Add ammonia_NH3 to the total for the current pond
                                pond_aggregated_data.setdefault('Amonia (NH3)', 0)
                                pond_aggregated_data['Amonia (NH3)'] += chemical_data.ammonia_NH3
                            if chemical_data.ammonium_NH4 is not None:
                                # Add ammonium_NH4 to the total for the current pond
                                pond_aggregated_data.setdefault('Amonium (NH4)', 0)
                                pond_aggregated_data['Amonium (NH4)'] += chemical_data.ammonium_NH4
                            if chemical_data.pH_lab is not None:
                                # Add pH_lab to the total for the current pond
                                pond_aggregated_data.setdefault('pH (Lab)', 0)
                                pond_aggregated_data['pH (Lab)'] += chemical_data.pH_lab
                            if chemical_data.carbonate_CO3 is not None:
                                # Add carbonate_CO3 to the total for the current pond
                                pond_aggregated_data.setdefault('Carbonate (CO3)', 0)
                                pond_aggregated_data['Carbonate (CO3)'] += chemical_data.carbonate_CO3
                            if chemical_data.bicarbonate_HCO3 is not None:
                                # Add bicarbonate_HCO3 to the total for the current pond
                                pond_aggregated_data.setdefault('Bicarbonate (HCO3)', 0)
                                pond_aggregated_data['Bicarbonate (HCO3)'] += chemical_data.bicarbonate_HCO3
                            if chemical_data.total_hardness is not None:
                                # Add total_hardness to the total for the current pond
                                pond_aggregated_data.setdefault('Total Hardness', 0)
                                pond_aggregated_data['Total Hardness'] += chemical_data.total_hardness
                            if chemical_data.calcium_hardness is not None:
                                # Add calcium_hardness to the total for the current pond
                                pond_aggregated_data.setdefault('Calcium Hardness', 0)
                                pond_aggregated_data['Calcium Hardness'] += chemical_data.calcium_hardness
                            if chemical_data.magnesium_hardness is not None:
                                # Add magnesium_hardness to the total for the current pond
                                pond_aggregated_data.setdefault('Magnesium Hardness', 0)
                                pond_aggregated_data['Magnesium Hardness'] += chemical_data.magnesium_hardness
                            if chemical_data.phosphate_PO4 is not None:
                                # Add phosphate_PO4 to the total for the current pond
                                pond_aggregated_data.setdefault('Phosphate (PO4)', 0)
                                pond_aggregated_data['Phosphate (PO4)'] += chemical_data.phosphate_PO4
                            if chemical_data.total_organic_matter_TOM is not None:
                                # Add total_organic_matter_TOM to the total for the current pond
                                pond_aggregated_data.setdefault('Total Organic Matter (TOM)', 0)
                                pond_aggregated_data['Total Organic Matter (TOM)'] += chemical_data.total_organic_matter_TOM
                            if chemical_data.hydrogen_sulfide_H2S is not None:
                                # Add hydrogen_sulfide_H2S to the total for the current pond
                                pond_aggregated_data.setdefault('Hydrogen Sulfide (H2S)', 0)
                                pond_aggregated_data['Hydrogen Sulfide (H2S)'] += chemical_data.hydrogen_sulfide_H2S
                            # Add other conditions for different biology data similarly
                                
                    # Store the aggregated chemical data for the current pond in the aggregated data dictionary
                    aggregated_data[pond_name] = pond_aggregated_data                
                                                
                # Print or use the aggregated data
                for pond_name, pond_data in aggregated_data.items():
                    print(f"{pond_name}: {pond_data}")
            
        
        # Extraction of Physical Data if Physical component (This is exclusive for Physical)
        if 'Physical' in component_id:
            # Initialize the aggregated data dictionary
            aggregated_data = {}

            # Filter includes date range for 'Line Graph'
            pond_data_list = PondData.objects.filter(
                pond_name__in=pond_names,  # Filter for multiple pond names
                doc__date__gte=start_date_db_format,
                doc__date__lte=end_date_db_format
            ).order_by('doc__date')

            # Iterate for each pond
            for pond_name in pond_names:
                # Initialize a dictionary to store the physical data for each date
                pond_aggregated_data = {}

                # Iterate for each Pond Data Object
                for pond_data in pond_data_list:
                    if pond_data.pond_name == pond_name:
                        # Obtain Physical Data Object
                        physical_data = pond_data.physical
                        if physical_data:
                            # Create a date key
                            date_key = pond_data.doc.date.strftime("%b %d, %Y")
                            if date_key not in pond_aggregated_data:
                                pond_aggregated_data[date_key] = []

                            # Extract and average the physical data within the specified time intervals
                            physical_data_entry = {}
                            for param_name, param_times in physical_data.to_mongo().items():
                                values = []
                                for time_interval in time_intervals:
                                    time_slot_format = "time_" + time_interval  # e.g., 'time_0700'
                                    time_slot_value = getattr(physical_data, param_name, None)
                                    value = getattr(time_slot_value, time_slot_format, None)
                                    if value is not None:
                                        values.append(value)

                                # Calculate the average if values are available
                                if values:
                                    average_value = sum(values) / len(values)
                                else:
                                    average_value = None  # Handle case where no values are available

                                physical_data_entry[param_name] = average_value

                            # Append the physical data entry for the current date
                            pond_aggregated_data[date_key].append(physical_data_entry)

                # Store the aggregated physical data for the current pond
                aggregated_data[pond_name] = pond_aggregated_data

            # Print or use the extracted data
            for pond_name, pond_data in aggregated_data.items():
                print(f"{pond_name}: {pond_data}")

        return Response({'status': 'success', 'componentId': component_id, 'aggregatedData': aggregated_data, 'chartType': chart_type }, status=status.HTTP_201_CREATED)
    else:
        return Response({ }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_component(request, component_id):
    if request.method == 'DELETE':
        try:
            # Find the component by its ID
            component = Component.objects.get(component_id=component_id)
            # Delete the component
            component.delete()
            return Response({'status': 'success'}, status=status.HTTP_202_ACCEPTED)
        except Component.DoesNotExist:
            return Response({ }, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({ }, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
def fetch_physical_pond_data(request):
    if request.method == 'POST':
        data = request.data
        pond_type = data.get('pondType')
        start_date_str = data.get('startDate')
        end_date_str = data.get('endDate')

        if not pond_type or not start_date_str or not end_date_str:
            return Response({ }, status=status.HTTP_400_BAD_REQUEST)

        # Parse start date and end date strings into datetime objects
        start_date = datetime.strptime(start_date_str, "%d-%m-%Y %H:%M")
        end_date = datetime.strptime(end_date_str, "%d-%m-%Y %H:%M")

        # Select the appropriate model based on pond type
        if pond_type == 'G2':
            model = G2PondData
        elif pond_type == 'G3':
            model = G3PondData
        elif pond_type == 'G4':
            model = G4PondData
        else:
            return Response({ }, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the pond data within the date range
        pond_data_list = model.objects.filter(timestamp__gte=start_date, timestamp__lte=end_date)

        # Serialize the pond data
        serialized_data = [
            {
                'timestamp': data.timestamp.strftime("%d-%m-%Y %H:%M:%S"),
                'temperature': data.temperature,
                'pH': data.pH,
                'salinity': data.salinity,
                'DO': data.DO
            }
            for data in pond_data_list
        ]

        return Response({'status': 'success', 'data': serialized_data}, status=status.HTTP_200_OK)
    else:
        return Response({ }, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
def fetch_prediction_pond_data(request):
    if request.method == 'POST':
        data = request.data
        pond_type = data.get('pondType')
        pathogen_type = data.get('pathogenType')
        start_date_str = data.get('startDate')
        end_date_str = data.get('endDate')

        if not pond_type or not start_date_str or not end_date_str:
            return Response({ }, status=status.HTTP_400_BAD_REQUEST)

        # Parse start date and end date strings into datetime objects
        start_date = datetime.strptime(start_date_str, "%d-%m-%Y %H:%M")
        end_date = datetime.strptime(end_date_str, "%d-%m-%Y %H:%M")

        # Select the appropriate model based on pond & pathogen type
        if pond_type == 'G2' and pathogen_type == 'Ecoli':
            model = G2EcoliPredictionData
        elif pond_type == 'G3' and pathogen_type == 'Ecoli':
            model = G3EcoliPredictionData
        elif pond_type == 'G2' and pathogen_type == 'Enterococcus':
            model = G2EnterococcusPredictionData
        elif pond_type == 'G3' and pathogen_type == 'Enterococcus':
            model = G3EnterococcusPredictionData
        else:
            return Response({ }, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the pond data within the date range
        pond_data_list = model.objects.filter(timestamp__gte=start_date, timestamp__lte=end_date)

        if pathogen_type == 'Ecoli':
            # Serialize the pond data
            serialized_data = [
                {
                    'timestamp': data.timestamp.strftime("%d-%m-%Y %H:%M:%S"),
                    'temperature': data.temperature,
                    'pH': data.pH,
                    'salinity': data.salinity,
                    'DO': data.DO,
                    'predicted_E_coli_concentration': data.predicted_E_coli_concentration,
                    'actual_E_coli_concentration': data.actual_E_coli_concentration
                }
                for data in pond_data_list
            ]
        elif pathogen_type == 'Enterococcus':
            # Serialize the pond data
            serialized_data = [
                {
                    'timestamp': data.timestamp.strftime("%d-%m-%Y %H:%M:%S"),
                    'temperature': data.temperature,
                    'pH': data.pH,
                    'salinity': data.salinity,
                    'DO': data.DO,
                    'predicted_Enterococcus_concentration': data.predicted_Enterococcus_concentration,
                    'actual_Enterococcus_concentration': data.actual_Enterococcus_concentration
                }
                for data in pond_data_list
            ]
        

        return Response({'status': 'success', 'data': serialized_data}, status=status.HTTP_200_OK)
    else:
        return Response({ }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
