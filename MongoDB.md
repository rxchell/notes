## Debgguging MongoDB server connection 

### Verify that `Node` is listening on the port 
  ```
  lsof -i :5000
  ```

### `curl -v`: Verbose mode for `curl` command to print detailed info about HTTP request and response 
- Shows Request details (sent to the server with `>`):
    ```
    > GET /topics HTTP/1.1
    > Host: localhost:5000
    > User-Agent: curl/8.7.1
    > Accept: */*
    ```
- Connection info: Shows DNS resolution, IP used, port, connection success.
    ```
    * Host localhost:5000 was resolved.
    * Connected to localhost (::1) port 5000
    ```
- Response from server (with `<`): Shows HTTP status code (403 Forbidden), headers, and optionally the body.
    ```
    < HTTP/1.1 403 Forbidden
    < Content-Length: 0
    < Server: AirTunes/870.14.1
    ```
- Debug info from curl:
    ```
    * Connection #0 to host localhost left intact
    ```


