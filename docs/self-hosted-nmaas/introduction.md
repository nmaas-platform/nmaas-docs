# Introduction

Interested users have the option of self-hosting the NMaaS software on their own infrastructure. Depending on the environment, two guides are available:

- The [production installation guide](./install-guide.md) which provides instructions on installing NMaaS on a full-fledged Kubernetes cluster involving multiple cluster nodes.
- The [local installation guide](./local-dev-environment/introduction.md) which provides instructions on installing NMaaS for evaluation purposes in smaller environments, consisting even of a single Kubernetes node.

Note that apart from the infrastructure aspects, both guides share similarities when it comes to the actual NMaaS deployment, and can be consulted in parallel.

## NMaaS Components

NMaaS' architecture is made up of three primary components and three helper components.

The primary components have all been developed within the GEANT project and these are: the NMaaS Portal, the NMaas Platform, and the NMaaS Janitor.

The helper components are represented as popular open-source software which has been packaged as Docker containers. These include: NMaaS Helm, NMaaS Postfix, and NMaaS Service Provider (SP).

More details about the role that each of these components play are provided in the subsections below.

### NMaaS Platform

NMaaS Platform is the central NMaaS component, exposing a REST API consumed by the NMaaS Portal. It stores the application catalog, the users, as well as information about any deployed applications. Upon a new request for an application deployment, it connects to the NMaaS Helm component and executes the necessary Helm command via an SSH connection. It also communicates with a self-hosted instance of GitLab, in order to provision boilerplate configuration files for the deployed application instances by the users, allowing them to make any additional configuration changes exclusively through Git.

**External dependencies: PostgreSQL database, self-hosted GitLab instance**

### NMaaS Portal

NMaaS Portal represents the front-end application of NMaaS that consumes the REST API offered by NMaaS Platform. NMaaS Portal is a Angular based application that is run in user's browser.

### NMaaS Janitor

The NMaaS Janitor is a helper service that interacts with the self-hosted GitLab API, and deploys the boilerplate configuration templates within the Kubernetes cluster. NMaaS Janitor is also used to retrieve the status of Kubernetes services and load balancer IPs assigned to them. For this reason it also needs privileges to use the Kubernetes API, albeit not as permissive as NMaaS Helm.

### NMaaS Helm

NMaaS Helm interacts with the Kubernetes API of the underlying cluster where NMaaS is deployed, and manages it through the Helm v3 client. As a a result, it requires the cluster-admin Kubernetes role. Whenever a new application is deployed, the NMaaS Platform opens an SSH connection to NMaaS Helm and executes the required Helm command.

### NMaaS Postfix

NMaaS Postfix is an in-cluster mail server that is used by any deployed applications to send emails to external destinations. It does not require any authentication before sending emails, and it can either be configured as a standalone mail server, or it can use a smart host, routing all outgoing emails through some other email server (e.g. Gmail).

!!! warning "NMaaS Postfix without a Smart Host"

    If NMaaS Postfix is not configured to use an external mail service for sending the emails, than most likely all outgoing emails will be marked as spam, and users will face delivery problems when sending alerts from their deployed applications.

### NMaaS Service Provider (SP)

The NMaaS SP is an in-cluster SAML Proxy that allows for SSO user login based on SAML. The NMaaS SP component is composed of Apache HTTP server and a Shibboleth Service Provider (Shibboleth SP) software. NMaaS SP is initially configured to authenticate with eduGAIN as the federated Identify Provider but can be customized to work with any compliant IdP.

!!! warning "NMaaS SP is still in a Testing Phase"

    The in-cluster NMaaS SP was developed some time back but was never thoroughly tested. However NMaaS development team can provide guidelines on how to setup a NMaaS SAML Proxy on a dedicated VM. Such a setup is currently used for NMaaS production service. Nevertheless basic username and password based log in is available at all times.