# Routinator

![Routinator Logo](img/routinator-logo.png){ align=right width="150" }

Routinator is a full-featured software package that can perform RPKI validation as a one-time operation and produce the result in formats such as CSV, JSON and RPSL, or run as a service that periodically downloads and verifies RPKI data.

Routinator offers an RTR server allowing routers supporting Origin Validation (port 3323) to connect to it to fetch verified RPKI data.

The built-in HTTP server offers a user interface and endpoints for the various file formats, as well as logging, status and Prometheus monitoring.