# NMaaS Installation Guide

## Requirements

To install NMaaS into an existing Kubernetes cluster, the following requirements must be met:

- Kubernetes version `>=1.16`
- Helm v3 support in the Kubernetes cluster
- Existing ingress controller, preferably with a default TLS certificate set (more information available below) 
- An integration with an external load-balancer or MetalLB for bare-metal deployments, so that IPs can be assigned to `LoadBalancer` services.

## NMaaS Components

NMaaS is comprised of multiple components, and a brief description for each one is provided below. 

### NMaaS Platform

NMaaS Platform is the central NMaaS component, exposing a REST API consumed by the NMaaS Portal. It stores the application catalog, the users, as well as information about any deployed applications. Upon a new request for an application deployment, it connects to the NMaaS Helm component and executes the necessary Helm command via an SSH connection. It also communicates with a self-hosted instance of GitLab, in order to provision boilerplate configuration files for the deployed application instances by the users, allowing them to make any additional configuration changes exclusively through Git.

**External dependencies: PostgreSQL database, self-hosted GitLab instance**

### NMaaS Portal

NMaaS Portal represents the front-end application of NMaaS that consumes the REST API offered by NMaaS Platform. NMaaS Portal is a Angular based application that is run in user's browser.

### NMaaS Helm

NMaaS Helm interacts with the Kubernetes API of the underlying cluster where NMaaS is deployed, and manages it through the Helm v3 client. As a a result, it requires the cluster-admin Kubernetes role. Whenever a new application is deployed, the NMaaS Platform opens an SSH connection to NMaaS Helm and executes the required Helm command.

### NMaaS Postfix

NMaaS Postfix is an in-cluster mail server that is used by any deployed applications to send emails to external destinations. It does not require any authentication before sending emails, and it can either be configured as a standalone mail server, or it can use a smart host, routing all outgoing emails through some other email server (e.g. Gmail).

!!! warning "NMaaS Postfix without a Smart Host"

    If NMaaS Postfix is not configured to use an external mail service for sending the emails, than most likely all outgoing emails will be marked as spam, and users will face delivery problems when sending alerts from their deployed applications.

### NMaaS Janitor

The NMaaS Janitor is a helper service that interacts with the self-hosted GitLab API, and deploys the boilerplate configuration templates within the Kubernetes cluster. NMaaS Janitor is also used to retrieve the status of Kubernetes services and load balancer IPs assigned to them. For this reason it also needs privileges to use the Kubernetes API, albeit not as permissive as NMaaS Helm.

### NMaaS SP

The NMaaS SP is an in-cluster SAML Proxy that allows for SSO user login based on SAML. The NMaaS SP component is composed of Apache HTTP server and a Shibboleth Service Provider (Shibboleth SP) software. NMaaS SP is initially configured to authenticate with eduGAIN as the federated Identify Provider but can be customized to work with any compliant IdP.

!!! warning "NMaaS SP is still in a Testing Phase"

    The in-cluster NMaaS SP was developed some time back but was never thoroughly tested. However NMaaS development team can provide guidelines on how to setup a NMaaS SAML Proxy on a dedicated VM. Such a setup is currently used for NMaaS production service. Nevertheless basic username and password based log in is available at all times.

## Installation 

The NMaaS installation is a two-step process - first an instance of GItLab must be deployed and configured, and then NMaaS itself. The two components cannot be deployed at the same time, since during the deployment process NMaaS requires a GitLab API key to be specified.

### GitLab Installation

GitLab can be deployed using the [official Helm chart](https://docs.gitlab.com/runner/install/kubernetes.html) whose source code is also [publicly available](https://gitlab.com/gitlab-org/charts/gitlab). Note that GitLab requires at least 8GB of memory to run. Also note that it requires both a PostgreSQL database and a Redis instance, both of which can either be externalized or deployed in-cluster, by the official chart.

!!! info "GitLab and an External Database"

    GitLab can use an external PostgreSQL instance, but during the deployment process either the root user must be specified, or the following extensions enabled in the target GitLab database:

    - btree_gist
    - pg_trgm

    This can be done using the following commands:

    ```bash
    create extension btree_gist;
    create extension pg_trgm;
    ```

!!! success "GitLab Version"

    `4.8.2` is the latest version of the GitLab chart that has been tested with the latest version of NMaaS. 


Bellow is a snippet of the mandatory parameters that must be specified during GitLab's deployment, so that it will be compatible with NMaaS. The complete list of supported value parameters is available in the [official GitLab Helm chart Git repository](https://gitlab.com/gitlab-org/charts/gitlab).

```yaml title="gitlab-values.yaml"
certmanager:
  install: false
nginx-ingress:
  enabled: false
prometheus:
  install: false
redis:
  install: true
postgresql:
  postgresqlUsername: gitlab
  install: true
  postgresqlDatabase: gitlabhq_production
  image:
    tag: 11.9.0
  usePasswordFile: false
  existingSecret: 'gitlab-postgresql'
  master:
    extraVolumeMounts:
      - name: custom-init-scripts
        mountPath: /docker-entrypoint-preinitdb.d/init_revision.sh
        subPath: init_revision.sh
    podAnnotations:
      postgresql.gitlab/init-revision: "1"
  metrics:
    enabled: true
    ## Optionally define additional custom metrics
    ## ref: https://github.com/wrouesnel/postgres_exporter#adding-new-metrics-via-a-config-file
gitlab-runner:
  install: false
global:
  edition: ce
  hosts:
    domain: <TLD> # (e.g. if nmaas.example.com is specified here, gitlab will be accessible under gitlab.nmaas.example.com)
    https: true
    ssh: ssh.nmaas.example.com # optional, if the SSH endpoint should differ from GitLab's access domain
  ingress:
    enabled: true
    configureCertmanager: false
    tls:
      enabled: true
      secretName: <MY_TLS_SECRET>
    path: /
    annotations:
      kubernetes.io/ingress.class: "nginx"
  initialRootPassword:
    secret: gitlab-root-password
    key: password
  ## configuration for external postgresql
  psql:
  ## the secret must be manually created
    password: {}
#        useSecret: true
#        secret: gitlab-db-password
#        key: password
#      host: psql-standalone-postgresql
#      port: 5432
#      username: gitlab
#      database: gitlab
  appConfig:
    defaultProjectFeatures:
      builds: false
  time_zone: UTC
  smtp:
    enabled: false
    address: smtp.mailgun.org
    port: 2525
    user_name: ""
    ## doc/installation/secrets.md#smtp-password
    password:
      secret: ""
      key: password
    # domain:
    authentication: "plain"
    starttls_auto: false
    openssl_verify_mode: "peer"
## doc/installation/deployment.md#outgoing-email
## Email persona used in email sent by GitLab
  email:
    from: ''
    display_name: GitLab
    reply_to: ''
    subject_suffix: ''
    smime:
      enabled: false
      secretName: ""
      keyName: "tls.key"
      certName: "tls.crt"
```

Note that the secrets whose names are specified in `.Values.postgresql.existingSecret` and `.Values.global.initialRootPassword.secret` must be manually created. These secrets contain the postgresql root and user passwords, as well as the initial root password to be used by GitLab, respectively. Below is a snippet that can be reused to create these secrets:

```bash
export NMAAS_NAMESPACE="nmaas-system"
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-postgresql --from-literal=postgresql-password=<POSTGRESQL_USER_PASSWORD> --from-literal=postgresql-postgres-password=<POSTGRESQL_ROOT_PASSWORD>
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-root-password --from-literal=password=<GITLAB_ROOT_PASSWORD>
```

Note that the built-in PostgreSQL chart that can be automatically deployed together with GitLab is based on Bitnami's PostgreSQL chart, so additional customization options can be seen from [Bitnami's GitHub page](https://github.com/bitnami/charts/tree/master/bitnami/postgresql).

In case an external PostgreSQL instance will be used then the secret specified in `.Values.global.psql.password.secret` must be created automatically. Also, keep in mind the warning given above, if a regular PostgreSQL user is specified, the `btree` and `trgm` extensions must be enabled beforehand.

!!! info "GitLab Email Sending"
    NMaaS does not rely on email sending via GitLab, so both the email and smtp sections in the value files can be left with their default values - unconfigured. However, users are free to customize these sections according to their own environments. 

Once all configuration parameters have been specified, GitLab can be installed using the following Helm v3 command:

```bash
export NMAAS_NAMESPACE="nmaas-system"
helm repo add gitlab https://charts.gitlab.io
helm install -f gitlab.yaml --namespace $NMAAS_NAMESPACE <RELEASE_NAME> --version 4.8.2 gitlab/gitlab
```

!!! warning "GitLab Deployment Duration"

    Please allow more than 15 minutes for GitLab to be deployed, depending on hardware configuration and current resource utilization.

Once GitLab has been deployed, it can be accessed by navigating to `gitlab.<TLD>`, where TLD is the value specified for the `.Values.global.hosts.domain` parameter. 

!!! danger "GitLab Public Exposure"

    Note that after deployment, by default, anyone can register to your newly deployed GitLab instance. This can be configured by logging in as the root GitLab user.

    Users are advised to determine whether public exposure of the GitLab web interface is needed at all. NMaaS' GitLab integration can work even if only public access to the GitLab SSH interface is provided, since repository cloning always relies on SSH as the transport protocol.

To create a GitLab API token that can be used by NMaaS, perform the following steps:

- Login to GitLab using the root account;
- Click on the avatar image in the top right corner and select `Settings`;
- From the left-hand navigation menu choose `Access Tokens`;
- Create a new access token with no expiration date by simply leaving the `Expires at` field empty, and assigning all available scopes;
- Write down the API token, it will be needed shortly.

#### SSH Access to GitLab Repositories

GitLab supports SSH access to any created repositories. If you want to allow your users to clone the repositories where their application configuration is stored, then you will have to alter the GitLab Shell service, and change its type to LoadBalancer, so that a routable IP address will be assigned to it.

### NMaaS Installation

The source code for the NMaaS Helm chart is publicly available on [nmaas-platform/nmaas-chart](https://github.com/nmaas-platform/nmaas-chart). The `README.md` file provides details on all the customizable `value` parameters for a given chart version.

The following manual steps must be performed before deploying NMaaS:

- Creating a private/public SSH keypair so that NMaaS Platform can access NMaaS Helm:

    ```bash
    #!/bin/bash
    export NMAAS_NAMESPACE="nmaas-system"
    tmpdir=$(mktemp -d)
    ssh-keygen -f $tmpdir/key -N ""
    
    # nmaas-helm-key-private should be replaced with {{ .Values.global.helmAccessKeyPrivate }}
    kubectl create secret generic nmaas-helm-key-private -n $NMAAS_NAMESPACE --from-file=id_rsa=$tmpdir/key
    
    # nmaas-helm-key-private should be replaced with {{ .Values.global.helmAccessKeyPublic }}
    kubectl create secret generic nmaas-helm-key-public -n $NMAAS_NAMESPACE --from-file=helm=$tmpdir/key.pub
    ```

- The secrets for the SP, API, and admin password:

    ```bash
    # Make sure to name the secrets with the same names that have been specified in the values file. The examples below use the defaults, and should be used if no changes have been made.
    export NMAAS_NAMESPACE="nmaas-system"
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-platform-admin --from-literal=password=<PASSWORD>
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-api-secret --from-literal=secret=<PASSWORD>
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-sp-secret --from-literal=secret=<SSO_SHARED_KEY>
    ```

- Create the NMaaS Janitor secret containing the GitLab API key, generated previously:

    ```bash
    export NMAAS_NAMESPACE="nmaas-system"
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-gitlab-janitor-token --from-literal=secret=<GITLAB_API_TOKEN>
    ```

Once the required secrets have been created, NMaaS can be deployed using the following command (make sure to deploy in the same namespace as GitLab):

```bash
export NMAAS_NAMESPACE="nmaas-system"
helm repo add nmaas https://artifactory.software.geant.org/artifactory/nmaas-helm
helm install -f values.yaml --namespace $NMAAS_NAMESPACE --version 1.0.0 nmaas nmaas/nmaas
```

It is recommended to use `nmaas-system` as the namespace where NMaaS and all associated components (PostgreSQL, GitLab) will be deployed.

!!! warning "NMaaS Deployment Time"
    Please allow at least 10 minutes for NMaaS to be fully deployed, depending on hardware configuration and resource utilization.

#### Verifying the Installation

You can verify that NMaaS has been successfully deployed by navigating to its ingress URL from your browser, logging in as the admin user and selecting `Settings -> Monitoring`. From this location, you can execute checks for all the required components of NMaaS. A fully functional installation should return a successful response for all monitors.

## Administrator Information

For more detailed instructions, refer to the [Domain Admin Guide](../guides/domain-admin-guide.md)

### Creating New Domains

Creating a new customer domain within NMaaS is a two-step process:

1. First, the new domain should be added from the NMaaS web interface. The following steps should be performed.
    - Login to the NMaaS Portal as the administrator user (the default administrator username is `admin` and the desired password is passed as a installation parameter);
    - Navigate to `Settings -> Domains`;
    - Click the `Add` button and enter the required parameters specific to the newly created domain:
        - `Name` - full name of given domain (e.g. `Test Domain`)
        - `Codename` - abbreviated name of the domain (e.g. `testdom`)
        - `Kubernetes namespace` *(Optional)* - a namespace dedicated for this domain to be created in the next step
        - `Kubernetes storage class` *(Optional)* - a specific storage class to be used for persistent volumes created in this domain (typically should be left blank)
        - `Kubernetes ingress class` *(Optional)* - a ingress class supported by the ingress controller deployed for this domain (should be left blank if a single common controller supports all the domains)
        - `External service domain` - a base URL for accessing all applications deployed in this domain (typically should contain the Codename and the URL of NMaaS itself, e.g. `testdom.nmaas.example.com`)
        - `DCN deployment type` - by default should be set to `Manual`
        - `DCN status` - by default should be set to `Configured`
        - `Customer networks` *(to be removed)* - list of network prefixes to which applications deployed in this domain should have access (thought this parameter is currently mandatory it is not used for any automated actions so any initial values can be provided) 
    - Click the `Submit` button to create the domain
2. Then, the following operations should be performed within the cluster:
    - Create a new Kubernetes namespace with the same name as the domain 
    - Create a new MetalLB range with the same name as the new customer domain, and set that addresses should not be automatically assigned. To accomplish this, the existing MetalLB ConfigMap can simply be edited to include the new configuration block. An example MetalLB `ConfigMap` is available below:

        ```yaml title="config.yaml"
        apiVersion: v1
        kind: ConfigMap
        metadata:
        namespace: metallb-system
        name: config
        data:
        config: |
            address-pools:
            - name: default-pool
            protocol: layer2
            addresses:
            - 192.168.1.100-192.168.1.254
            - name: domain1
            protocol: layer2
            addresses:
            - 192.168.2.100-192.168.2.254
            auto-assign: false    
        ```

        With the above configuration, whenever a LoadBalancer Kubernetes Service is created, it will be assigned an address from the default-pool, unless the `annotation metallb.universe.tf/address-pool: domain1` is present, in which case an address from the domain1 pool will be allocated. 

    - Deploy a new ingress controller in the new domain namespace, with an ingress class that will match the name of the domain. 

## Additional Documentation

An online user guide is available at [NMaaS User Guide](../guides/user-guide.md) page.

Information about the NMaaS applications deployment and configuration process and the NMaaS portfolio is available on the [NMaaS Tools](../nmaas-applications/general-app-deployment.md) page.

In case of any questions please contact the NMaaS Team at [nmaas@lists.geant.org](mailto:nmaas@lists.geant.org).