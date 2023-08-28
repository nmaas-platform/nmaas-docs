# WiFiMon

![WiFiMon Logo](img/wifimon-logo.png){ align=right }

WiFiMon is a WiFi network monitoring and performance verification system.

It is capable of detecting performance issues, to visualise the workload of the network, and to provide technical information about the WiFi network (e.g. signal strength, link quality, bit rate, etc.).

## Additional installation information

The final installation step requires loading the appropriate Kibana visualizations and dashboards:

- Download file `kibana-import-v150.ndjson`` from http://83.97.95.167/deb/kibana-import-v150.ndjson
- In Kibana UI, select `Management -> Stack Management` from the menu on the left
- Select `Kibana -> Saved Objects`
- Select `import` and upload file `kibana-import-v150.ndjson`

