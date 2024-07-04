# Fetch data from backend api

## Eg 1 fetch physical pond data 

http://localhost:8000/api/fetch-physical-pond-data/

<img width="1150" alt="Screenshot 2024-07-04 at 11 02 54" src="https://github.com/rxchell/notes/assets/133939424/b6b0dbab-fbb2-4339-8a44-d018dfedd7c8">

<img width="1152" alt="Screenshot 2024-07-04 at 11 06 02" src="https://github.com/rxchell/notes/assets/133939424/e36291e4-0986-46d2-baa7-c29d202f146b">

</br></br>

### Input

```
{
    "pondType": "G2",
    "startDate": "27-06-2024 06:20",
    "endDate": "27-06-2024 06:23"
}
```

</br>

### Response
```
{
    "status": "success",
    "data": [
        {
            "timestamp": "04-07-2024 03:12:52",
            "temperature": 29.33,
            "pH": 7.97,
            "salinity": 30.15,
            "DO": 12.28
        },
        {
            "timestamp": "04-07-2024 03:13:52",
            "temperature": 26.28,
            "pH": 7.04,
            "salinity": 26.9,
            "DO": 4.53
        }
    ]
}
```

<br></br>

## Eg 2 fetch prediction pond data 
- for error handling for fetching data:
- if data is fetched successful, the status: 'success',
- otherwise, there will be no status at all> then can display fail to fetch

http://localhost:8000/api/fetch-prediction-pond-data/

<img width="1164" alt="Screenshot 2024-07-04 at 11 41 56" src="https://github.com/rxchell/notes/assets/133939424/c795e2a9-4eae-48e0-8eff-4a2dc351a144">

</br></br>

### Input

```
{
    "pondType": "G2",
    "pathogenType": "Ecoli",
    "startDate": "27-06-2024 07:50",
    "endDate": "27-06-2024 07:55"
}
```

</br>

### Response
```
{
    "status": "success",
    "data": [
        {
            "timestamp": "04-07-2024 03:12:52",
            "temperature": 29.02,
            "pH": 7.38,
            "salinity": 21.55,
            "DO": 5.69,
            "predicted_E_coli_concentration": 2.6327580783018236,
            "actual_E_coli_concentration": 2.76617811
        }
    ]
}
```


```
MAKE THE PREDICTION AND WEBSOCKET CORRECTLY RETURN 2 GRAPHS
ecoli graph:
G2 E_coli_concentration
G2 actual_E_coli_concentration
G3 E_coli_concentration
G3 actual_E_coli_concentration

enterecoccus graph:
G2 Enterococcus_concentration
G2 actual_Enterococcus_concentration
G3 Enterococcus_concentration
G3 actual_Enterococcus_concentration

API (DONT CHANGE) (TO SHOW DATA FROM THE PAST 30 MINUTES FOR EACH GRAPH)
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



for prediction, the input structure is this
11:11
{
    "pondType": "G2",
    "pathogenType": "Ecoli",
    "startDate": "27-06-2024 07:50",
    "endDate": "27-06-2024 07:55"
}
11:13
and the response for prediction:
{
    "status": "success",
    "data": [
        {
            "timestamp": "04-07-2024 03:12:52",
            "temperature": 29.02,
            "pH": 7.38,
            "salinity": 21.55,
            "DO": 5.69,
            "predicted_E_coli_concentration": 2.6327580783018236,
            "actual_E_coli_concentration": 2.76617811
        }
    ]
}



COMBINE THE DATA FROM THE LAST 30 MINUTES(fetchPredictedPondData AND THE REALTIME (WEBSOCKET) into the same line
```

