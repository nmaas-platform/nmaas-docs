# Introduction

Interested users have the option of self-hosting the nmaas software on their own infrastructure. Depending on the environment, different guides are available:

- The [production installation guide](./install-guide.md) which provides instructions on installing nmaas on a full-fledged Kubernetes cluster involving multiple cluster nodes.
- For setting up a local nmaas VM suitable for experiments, interested users are encouraged to take a look at the nmaas tutorials presented at the JRES conference:
    - [JRES 2022 - GÉANT Network Management as a Service tutorial](../tutorials-workshops/jres2022/introduction.md)
    - [JRES 2024 - Orchestrated Deployment of Virtual Labs for Education](../tutorials-workshops/jres2024/introduction.md)

## nmaas Components

nmaas' architecture is made up of three primary components and three helper components.

The primary components have all been developed within the GÉANT project and these are: the nmaas Portal, the nmaas Platform, and the nmaas Janitor.

The helper components are represented as popular open-source software which has been packaged as Docker containers. These include: nmaas Helm, nmaas Postfix, and nmaas Service Provider (SP).

More details about the role that each of these components play are provided in the subsections below.

### nmaas Platform

nmaas Platform is the central nmaas component, exposing a REST API consumed by the nmaas Portal. It stores the application catalog, the users, as well as information about any deployed applications. Upon a new request for an application deployment, it connects to the nmaas Helm component and executes the necessary Helm command via an SSH connection. It also communicates with a self-hosted instance of GitLab, in order to provision boilerplate configuration files for the deployed application instances by the users, allowing them to make any additional configuration changes exclusively through Git.

**External dependencies: PostgreSQL database, self-hosted GitLab instance**

### nmaas Portal

nmaas Portal represents the front-end application of nmaas that consumes the REST API offered by nmaas Platform. nmaas Portal is an Angular based application that is run in user's browser.

### nmaas Janitor

The nmaas Janitor is a helper service that interacts with the self-hosted GitLab API, and deploys the boilerplate configuration templates within the Kubernetes cluster. nmaas Janitor is also used to retrieve the status of Kubernetes services and load balancer IPs assigned to them. For this reason it also needs privileges to use the Kubernetes API, albeit not as permissive as nmaas Helm.

### nmaas Helm

nmaas Helm interacts with the Kubernetes API of the underlying cluster where nmaas is deployed, and manages it through the Helm v3 client. As a a result, it requires the cluster-admin Kubernetes role. Whenever a new application is deployed, the nmaas Platform opens an SSH connection to nmaas Helm and executes the required Helm command.

### nmaas Postfix

nmaas Postfix is an in-cluster mail server that is used by any deployed applications to send emails to external destinations. It does not require any authentication before sending emails, and it can either be configured as a standalone mail server, or it can use a smart host, routing all outgoing emails through some other email server (e.g. Gmail).

!!! warning "nmaas Postfix without a Smart Host"

    If nmaas Postfix is not configured to use an external mail service for sending the emails, than most likely all outgoing emails will be marked as spam, and users will face delivery problems when sending alerts from their deployed applications.

### nmaas Service Provider (SP)

The nmaas SP is an in-cluster SAML Proxy that allows for SSO user login based on SAML. The nmaas SP component is composed of Apache HTTP server and a Shibboleth Service Provider (Shibboleth SP) software. nmaas SP is initially configured to authenticate with eduGAIN as the federated Identify Provider but can be customized to work with any compliant IdP.

!!! warning "nmaas SP is still in a Testing Phase"

    The in-cluster nmaas SP was developed some time back but was never thoroughly tested. However nmaas development team can provide guidelines on how to setup a nmaas SAML Proxy on a dedicated VM. Such a setup is currently used for nmaas production service. Nevertheless basic username and password based log in is available at all times.