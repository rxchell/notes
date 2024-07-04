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
