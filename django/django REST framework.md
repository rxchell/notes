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

