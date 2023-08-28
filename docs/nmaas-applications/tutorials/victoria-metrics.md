# Victoria Metrics

![Victoria Metrics Logo](img/victoria-metrics-logo.png){ align=right width="150" }

VictoriaMetrics is a highly scalable high-performance database that can be used as an external long-term storage for Prometheus metrics.

It can also completely replace Prometheus and perform the polling by itself, using a configuration format that is compatible with existing Prometheus deployments.

Apart from Prometheus, it can also substitute InfluxDB, OpenTSDB, and Graphite, as a result of providing compatible interfaces for these protocols. <

Stored metrics can be easily visualized by Grafana, by adding the VictoriaMetrics instance as a Prometheus datastore.

No matter what protocol is used to store data in VictoriaMetrics, it is queried using the same web endpoint, and only a single datasource is required in Prometheus.

Another feature of VictoriaMetrics is to use advanced PromQL expressions, not available in the Prometheus implementation.

More details about this can be obtained from the [official documentation page](https://github.com/VictoriaMetrics/VictoriaMetrics/wiki/MetricsQL).