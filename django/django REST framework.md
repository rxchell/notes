## Fetch data from backend api

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
