# Client-side and server side 
-**Client side**: As light as possible to make it efficient. 
-**Server side**: Does all the calculations and data processing so that data is ready to be received by the frontend

# Sequence Diagram
## ETL (extract, transform, log)
- sensor data -> ETL
- as **extracted** data comes in, the metadata is **LOGGED** (to ensure that the data is accurate)
  - might want to log alerts too 
- **TRANSFORM** the data so that the processed data is ready when the client calls for it
  - examples: get alerts, find pattern, check for anomaly 

## API
Example of an api: `fetch dataVisualisation_sensor from DDYY to DDYY`

3 parameters:
1. data type eg dataVisualisation
2. sensor eg which sensor
3. time period 
