# Introduction to nmaas Metrics

nmaas Metrics is an nmaas use-case centered around [applications](../../nmaas-applications/application-list.md) for collecting, consolidating, and visualizing data from multiple systems. It allows the creation of unified dashboards, enabling organizations to monitor project progress, track service KPIs and SLA compliance, analyze infrastructure performance, and measure user engagement in real time. By integrating data from source code repositories, CI/CD pipelines, monitoring systems, APIs, and other external services, it transforms distributed operational data into clear, actionable insights.

## nmaas Metrics in Practice

The nmaas Metrics use-case is centered around 4 core applications now available in the nmaas catalogue:

- [Metabase](https://www.metabase.com/) - a business analytics application capable of connecting to local and remote [datasources](https://www.metabase.com/data-sources/) (e.g., PostgreSQL, MySQL, ClickHouse, MondoDB...) to visualize data.
- [N8n](https://n8n.io/) - a workflow management system offering a visual workflow builder, allowing users to construct data fetching, cleaning, enrichment, and persistence to a Metabase supported datastore.
- [PostgreSQL](https://www.postgresql.org/) - a database management system for persisting the various data obtained via N8n workflows and to be visualized by Metabase.
- [Adminer](https://www.adminer.org/) - A web based database management tool with support for PostgreSQL instances.
- [Trino](https://trino.io/) - an adapter application providing an SQL-like interface for interaction with different types of databases (e.g., Prometheus).


Founded on top of the extensible [nmaas application catalogue](../../nmaas-applications/application-list.md), the above applications present a viable set of relevant tools to implement comprehensive monitoring of KPIs, development activity, or external services. 

### Example Usage

#### Monitoring Key Performance Indicators

nmaas Metrics allows you to track all your key performance indicators within a single, unified dashboard. These capabilities are not only theoretical - they are actively used by the nmaas Team in day-to-day operations to support data-driven management and transparency. By integrating with external systems, you can:

- Monitor development activity in source code management platforms such as GitLab, gaining visibility into contributions, workload distribution, and potential bottlenecks.
- Track application deployments and user registrations by consuming data from the nmaas Platform API, helping you understand adoption trends and service growth.
- Oversee content publishing schedules through RSS integrations, ensuring regular communication and timely updates.
- Log presentations, outreach activities, or other organizational events via custom data ingestion endpoints, keeping a clear record of dissemination efforts. 

By bringing together data from multiple sources into a cohesive analytics layer, nmaas Metrics transforms scattered operational information into structured insights that support informed decision-making and continuous improvement.

The [example workflows](example-workflows.md) page provides more details on how the nmaas Team has adopted nmaas Metrics for day-to-day monitoring of internal KPIs, including the source-code for the data fetching and data transformation workflows.

#### AI-Enhanced Data Workflows

Beyond traditional metrics collection and visualization, nmaas Metrics can power intelligent, AI-enhanced workflows that automate analysis and reporting tasks. By combining N8n automation with large language model (LLM) capabilities, organizations can move from simple data aggregation to smart data processing.

Typical examples of supported automation include:

- Incoming data streams from monitoring systems, ticketing platforms, or APIs can be automatically validated, cleaned, and enriched before being stored.
- AI models can classify incidents, summarize large log datasets, detect anomalies in KPI trends, or generate executive-ready performance summaries on a scheduled basis.

This approach enables teams to reduce manual reporting effort, improve data quality, and gain faster insights from complex datasets. Instead of simply visualizing what happened, AI-enhanced workflows help explain why it happened and automatically prepare clear, actionable summaries for technical teams and management alike.

## How Can I Get Started with nmaas Metrics?

If you are NREN or an institution under an NREN and you would like to use the managed nmaas instance provided by the GÉANT project, [get in touch with us](../../contact.md). Users interested in self-hosting nmaas are welcome to visit the dedicated pages for deploying nmaas on their [own infrastructure](../../self-hosted-nmaas/introduction.md).

Detailed video tutorials showcasing the deployment of the core applications backing the nmaas Metrics use-case are also available on YouTube.
