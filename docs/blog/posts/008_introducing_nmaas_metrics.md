---
authors: 
  - korvoj
date: 2026-05-18
slug: introducing-nmaas-metrics
categories:
    - Use-Cases
---

The nmaas open-source platform has been extended with a new full-fledged use-case, nmaas Metrics. nmaas Metrics combines the well-known nmaas features such as multitenancy, simple application deployment, and full lifecycle management with four new catalogue entries focused on continuous data collection and visualization. Using PostgreSQL, n8n, Metabase, and Trino, nmaas users can retrieve data from virtually any system, transform it, and visualize it through rich dashboards. n8n acts as the workflow orchestration layer responsible for data retrieval, transformation, and persistence into PostgreSQL, while Metabase provides the visualization layer.

The ultimate goal of nmaas Metrics is not only to visualize business analytics data such as key performance indicators, but also to integrate continuous infrastructure telemetry and monitoring data into the same dashboards. Since the scale and storage requirements of monitoring data differ significantly from traditional analytics workloads, Trino is used as an abstraction layer that exposes an SQL-like interface to many popular time-series databases such as Prometheus. This allows Metabase to act as a unified visualization layer with access to data from multiple external storage systems.

To demonstrate the capabilities of the nmaas Metrics use-case and how it can be used in practice, the nmaas team has prepared a series of walkthrough videos. The videos cover the initial application setup, configuration, creation of data acquisition workflows, and data visualization. The videos can be accessed through the [nmaas Metrics YouTube playlist](https://www.youtube.com/playlist?list=PLELuOn8jN3IL8QCupof7P8GXNbX7_9UD0).

nmaas Metrics is available to all existing nmaas users through the production instance hosted at [vnoc.nmaas.eu](https://vnoc.nmaas.eu), as well as to all users of self-hosted nmaas deployments. If you are interested in trying nmaas Metrics, please submit a domain request using the appropriate [contact form](https://vnoc.nmaas.eu/about). 

More details about the nmaas Metrics use-case, including example usage and descriptions of how the nmaas team uses it in day-to-day operations to track KPIs, are available on [metrics.docs.nmaas.eu](https://metrics.docs.nmaas.eu/). Technical details and example workflows are available on the [nmaas Docs](https://docs.nmaas.eu/use-cases/metrics/metrics-introduction/).
