# Example Workflows

The nmaas team has prepared a set of example workflows to help new users get started with the nmaas Metrics use-case. These workflows focus on:

- web page data scraping
- information retrieval from GitLab (via REST API)
- statistical analysis of self-hosted nmaas instances (via REST API)

All collected data is stored in a single PostgreSQL database using a flexible schema enabled by the [JSONB column type](https://www.postgresql.org/docs/current/datatype-json.html).

The sections below demonstrate the end-to-end usage of the nmaas Metrics use-case in practice, from application deployment and configuration to workflow design and data visualization.

## Application Deployment

The four [core nmaas Metrics applications](./metrics-introduction.md#nmaas-metrics-in-practice) (PostgreSQL, Adminer, N8n, Metabase) can be deployed in any new or existing nmaas domain. The video below demonstrates the application deployment process, including any required configuration steps.

![type:video](https://www.youtube.com/watch?v=QpNyalHUCN0)

## Application Configuration

Once the core nmaas Metrics applications are deployed, they can be configured to interact with one another. Adminer is used to connect to the PostgreSQL database so that the initial database schema is created, then the first (admin) users are provisioned for both N8n and Metabase, and finally PostgreSQL is added as a datasource to both tools.

The video below provides a visual walkthrough of this process.

![type:video](https://www.youtube.com/watch?v=91I8Xcpe64g)

## Workflows

With the applications deployed and configured, the next step is to design the initial workflows. N8n provides built-in support for hundreds of integrations, simplifying the creation of data-retrieval workflows. If a given external system is not supported, the generic [HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) node can be used instead (as in the case for nmaas data fetching).

The following video implements the three demo nmaas Metrics workflows (web page scraping, GitLab, and nmaas information retrieval), along with a detailed explanation of how the JSONB column can be used when implementing other workflows from scratch. 

![type:video](https://www.youtube.com/watch?v=JRgdBTJES3k)

The source code for the presented workflows can be downloaded from the following links:

1. [HTML extraction](https://static.nmaas.eu/metrics/html.json)
2. [GitLab](https://static.nmaas.eu/metrics/gitlab.json)
3. [Self-hosted nmaas](https://static.nmaas.eu/metrics/nmaas.json)

## Visualizations

The final step is to visualize the obtained data through dashboards. This is accomplished using the Metabase business analytics application, which directly connects to the same PostgreSQL datasource. Using the visual query builder, users are not required to write SQL queries by hand. Additionally, storing all acquired data as JSON documents eases the visualization process, eliminating any complicated joins across multiple tables.

The final video in the nmaas Metrics series provides an overview of how a unified dashboard can be created in Metabase using a variety of visualization options.

![type:video](https://www.youtube.com/watch?v=t_3eJsV2MmM)
