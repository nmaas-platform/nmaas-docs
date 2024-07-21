# nmaas Installation Guide

## Requirements

To install nmaas into an existing Kubernetes cluster, the following requirements must be met:

- Kubernetes version `>=1.16`
- Helm v3 support in the Kubernetes cluster
- Existing ingress controller, preferably with a default TLS certificate set (more information available below)
- An integration with an external load-balancer or MetalLB for bare-metal deployments, so that IPs can be assigned to `LoadBalancer` services

## nmaas Components

nmaas is comprised of multiple components, and a brief description for each one is provided in the [self-hosting introduction](./introduction.md) page.

## Installation 

The nmaas installation is a two-step process - first an instance of GItLab must be deployed and configured, and then nmaas itself. The two components cannot be deployed at the same time, since during the deployment process nmaas requires a GitLab API key to be specified.

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

    `8.2.0` is the latest version of the GitLab chart that has been tested with the latest version of nmaas. 


Bellow is a snippet of the mandatory parameters that must be specified during GitLab's deployment, so that it will be compatible with nmaas. The complete list of supported value parameters is available in the [official GitLab Helm chart Git repository](https://gitlab.com/gitlab-org/charts/gitlab).

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
gitlab-runner:
  install: false
gitlab-shell:
  service:
    type: LoadBalancer
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
    class: "nginx"
  initialRootPassword:
    secret: gitlab-root-password
    key: password
  ## configuration for external PostgreSQL (set postgresql.enabled to false if used)
  # psql:
  #   password:
  #     secret: gitlab-db-password
  #     key: password
  #   host: psql-standalone-postgresql
  #   port: 5432
  #   username: gitlab
  #   database: gitlab
  appConfig:
    defaultProjectFeatures:
      builds: false
  time_zone: UTC
  ## use an external smtp server for outgoing email (optional)
  smtp:
    enabled: false
    address: smtp.example.com
    port: 587
    user_name: "noreply@example.com"
    ## doc/installation/secrets.md#smtp-password
    password:
      secret: "gitlab-smtp-password"
      key: password
    # domain:
    authentication: "login"
    starttls_auto: true
    openssl_verify_mode: "peer" # or none
## doc/installation/deployment.md#outgoing-email
## Email persona used in email sent by GitLab
  email:
    from: 'noreply@example.com'
    display_name: GitLab
    reply_to: 'support@example.com'
    smime:
      enabled: false
```

Note that the secrets whose names are specified in `.Values.postgresql.existingSecret` (for internal PostgreSQL), `.Values.global.initialRootPassword.secret` , `.Values.global.psql.password.secret` (for external PostgreSQL), and `.Values.global.smtp.password.secret` must be manually created. These secrets contain the PostgreSQL root and user passwords, the initial root password to be used by GitLab, as well as SMTP server credentials. Below is a snippet that can be reused to create such secrets:

```bash
export NMAAS_NAMESPACE="nmaas-system"
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-postgresql --from-literal=postgresql-password=<POSTGRESQL_USER_PASSWORD> --from-literal=postgresql-postgres-password=<POSTGRESQL_ROOT_PASSWORD>
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-root-password --from-literal=password=<GITLAB_ROOT_PASSWORD>
```

Note that the built-in PostgreSQL chart that can be automatically deployed together with GitLab is based on Bitnami's PostgreSQL chart, so additional customization options can be seen from [Bitnami's GitHub page](https://github.com/bitnami/charts/tree/master/bitnami/postgresql).

In case an external PostgreSQL instance will be used then the secret specified in `.Values.global.psql.password.secret` must be created automatically. Also, keep in mind the warning given above, if a regular PostgreSQL user is specified, the `btree` and `trgm` extensions must be enabled beforehand.

!!! info "GitLab Email Sending"
    nmaas does not rely on email sending via GitLab, so both the email and smtp sections in the value files can be left with their default values - unconfigured. However, users are free to customize these sections according to their own environments. 

Once all configuration parameters have been specified, GitLab can be installed using the following Helm v3 command:

```bash
export NMAAS_NAMESPACE="nmaas-system"
helm repo add gitlab https://charts.gitlab.io
helm install -f gitlab.yaml --namespace $NMAAS_NAMESPACE <RELEASE_NAME> --version 8.2.0 gitlab/gitlab
```

!!! warning "GitLab Deployment Duration"

    Please allow more than 15 minutes for GitLab to be deployed, depending on hardware configuration and current resource utilization.

Once GitLab has been deployed, it can be accessed by navigating to `gitlab.<TLD>`, where TLD is the value specified for the `.Values.global.hosts.domain` parameter. 

!!! danger "GitLab Public Exposure"

    Note that after deployment, by default, anyone can register to your newly deployed GitLab instance. This can be configured by logging in as the root GitLab user.

    Users are advised to determine whether public exposure of the GitLab web interface is needed at all. nmaas' GitLab integration can work even if only public access to the GitLab SSH interface is provided, since repository cloning always relies on SSH as the transport protocol.

To create a GitLab API token that can be used by nmaas, perform the following steps:

- Login to GitLab using the root account;
- Click on the avatar image in the top right corner and select `Settings`;
- From the left-hand navigation menu choose `Access Tokens`;
- Create a new access token with no expiration date by simply leaving the `Expires at` field empty, and assigning all available scopes;
- Write down the API token, it will be needed shortly.

#### SSH Access to GitLab Repositories

GitLab supports SSH access to any created repositories. If you want to allow your users to clone the repositories where their application configuration is stored, then you will have to alter the GitLab Shell service, and change its type to LoadBalancer, so that a routable IP address will be assigned to it.

### nmaas Installation

The source code for the nmaas Helm chart is publicly available on [nmaas-platform/nmaas-chart](https://gitlab.software.geant.org/nmaas/nmaas-chart). The `README.md` file provides details on all the customizable `value` parameters for a given chart version.

The following manual steps must be performed before deploying nmaas:

- Creating a private/public SSH keypair so that nmaas Platform can access nmaas Helm:

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

- Create the nmaas Janitor secret containing the GitLab API key, generated previously:

    ```bash
    export NMAAS_NAMESPACE="nmaas-system"
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-gitlab-api-token --from-literal=secret=<GITLAB_API_TOKEN>
    ```

Once the required secrets have been created, nmaas can be deployed using the following command (make sure to deploy in the same namespace as GitLab):

```bash
export NMAAS_NAMESPACE="nmaas-system"
helm repo add nmaas https://artifactory.software.geant.org/artifactory/nmaas-helm
helm install -f values.yaml --namespace $NMAAS_NAMESPACE --version 1.2.11 nmaas nmaas/nmaas
```

It is recommended to use `nmaas-system` as the namespace where nmaas and all associated components (PostgreSQL, GitLab) will be deployed.

!!! warning "nmaas Deployment Time"
    Please allow at least 10 minutes for nmaas to be fully deployed, depending on hardware configuration and resource utilization.

#### Verifying the Installation

You can verify that nmaas has been successfully deployed by navigating to its ingress URL from your browser, logging in as the admin user and selecting `Settings -> Monitoring`. From this location, you can execute checks for all the required components of nmaas. A fully functional installation should return a successful response for all monitors.

## Administrator Information

For more detailed instructions, refer to the [Domain Admin Guide](../guides/domain-admin-guide.md)

### Creating New Domains

Creating a new customer domain within nmaas is a two-step process:

1. First, the new domain should be added from the nmaas web interface. The following steps should be performed.
    - Login to the nmaas Portal as the administrator user (the default administrator username is `admin` and the desired password is passed as a installation parameter);
    - Navigate to `Settings -> Domains`;
    - Click the `Add` button and enter the required parameters specific to the newly created domain:
        - `Name` - full name of given domain (e.g. `Test Domain`)
        - `Codename` - abbreviated name of the domain (e.g. `testdom`)
        - `Kubernetes namespace` *(Optional)* - a namespace dedicated for this domain to be created in the next step
        - `Kubernetes storage class` *(Optional)* - a specific storage class to be used for persistent volumes created in this domain (typically should be left blank)
        - `Kubernetes ingress class` *(Optional)* - a ingress class supported by the ingress controller deployed for this domain (should be left blank if a single common controller supports all the domains)
        - `External service domain` - a base URL for accessing all applications deployed in this domain (typically should contain the Codename and the URL of nmaas itself, e.g. `testdom.nmaas.example.com`)
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

An online user guide is available at [nmaas User Guide](../guides/user-guide.md) page.

Information about the nmaas applications deployment and configuration process and the nmaas portfolio is available on the [nmaas Tools](../nmaas-applications/general-app-deployment.md) page.

In case of any questions please contact the nmaas Team at [nmaas@lists.geant.org](mailto:nmaas@lists.geant.org).