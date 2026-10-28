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

GitLab can be deployed using the [official Helm chart](https://docs.gitlab.com/runner/install/kubernetes.html) whose source code is also [publicly available](https://gitlab.com/gitlab-org/charts/gitlab). Note that GitLab requires at least 8GB of memory to run.

!!! warning "No More Bundled PostgreSQL/Redis/Object Storage"

    Unlike older versions of the chart, GitLab `10.3.1` no longer bundles PostgreSQL, Redis, or object storage (MinIO) as subcharts — GitLab itself does not supply these. A PostgreSQL instance, a Redis instance, and an S3-compatible object store must each be deployed and configured separately before installing GitLab, using GitLab's own external-database/external-storage configuration options shown below. How you provide them (standalone in-cluster Helm charts, managed cloud services, existing infrastructure, etc.) is entirely up to you and left for you to configure — this guide only documents the GitLab-side values and secrets needed to point at whatever you choose.

    If using a PostgreSQL instance with a non-root user, the following extensions must be enabled beforehand in the target GitLab database:

    - btree_gist
    - pg_trgm

    ```bash
    create extension btree_gist;
    create extension pg_trgm;
    ```

!!! success "GitLab Version"

    `10.3.1` is the latest version of the GitLab chart that has been tested with the latest version of nmaas.

GitLab needs to be told how to reach your PostgreSQL/Redis instances and object storage via Kubernetes secrets:

```bash
export NMAAS_NAMESPACE="nmaas-system"
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-postgresql --from-literal=password=<POSTGRESQL_USER_PASSWORD>
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-redis --from-literal=redis-password=<REDIS_PASSWORD>
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-root-password --from-literal=password=<GITLAB_ROOT_PASSWORD>
```

The object storage connection details are passed as secrets containing GitLab-specific config formats, not plain key/value pairs. Consult GitLab's own object storage documentation for the exact set of buckets it expects to find (LFS, artifacts, uploads, packages, container registry, and optionally backups):

```yaml title="rails-storage-connection.yaml"
provider: AWS
region: us-east-1
aws_access_key_id: <OBJECT_STORAGE_ACCESS_KEY>
aws_secret_access_key: <OBJECT_STORAGE_SECRET_KEY>
aws_signature_version: 4
endpoint: "<OBJECT_STORAGE_ENDPOINT>"
path_style: true
```

```yaml title="registry-storage-connection.yaml"
s3:
  bucket: gitlab-registry-storage
  accesskey: <OBJECT_STORAGE_ACCESS_KEY>
  secretkey: <OBJECT_STORAGE_SECRET_KEY>
  region: us-east-1
  regionendpoint: "<OBJECT_STORAGE_ENDPOINT>"
  pathstyle: true
  v4auth: true
```

```bash
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-rails-storage --from-file=connection=rails-storage-connection.yaml
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-registry-storage --from-file=config=registry-storage-connection.yaml
```

#### GitLab Values

Below is a snippet of the mandatory parameters that must be specified during GitLab's deployment, so that it will be compatible with nmaas. The complete list of supported value parameters is available in the [official GitLab Helm chart Git repository](https://gitlab.com/gitlab-org/charts/gitlab).

```yaml title="gitlab-values.yaml"
installCertmanager: false
nginx-ingress:
  enabled: false
prometheus:
  install: false
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
    class: "cilium" # substitute your own ingress class if not using Cilium
  gatewayApi:
    enabled: false # this guide uses classic Ingress throughout, not Gateway API - see note below
    installEnvoy: false
    configureCertmanager: false
  initialRootPassword:
    secret: gitlab-root-password
    key: password
  psql:
    host: gitlab-postgresql
    port: 5432
    username: gitlab
    database: gitlabhq_production
    password:
      useSecret: true
      secret: gitlab-postgresql
      key: password
  redis:
    host: gitlab-redis-master
    port: 6379
    auth:
      enabled: true
      secret: gitlab-redis
      key: redis-password
  appConfig:
    defaultProjectFeatures:
      builds: false
    object_store:
      enabled: true
      connection:
        secret: gitlab-rails-storage
        key: connection
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

registry:
  storage:
    secret: gitlab-registry-storage
    key: config
```

!!! info "TLS Secret Must Exist in GitLab's Namespace"

    Classic `Ingress` TLS `secretName` references only support same-namespace secrets — this is a core Kubernetes `Ingress` limitation, not specific to GitLab or Cilium. Make sure `<MY_TLS_SECRET>` exists in the same namespace GitLab is deployed into before installing.

!!! warning "`global.gatewayApi.enabled: false` Alone Does Not Suppress Envoy Gateway"

    Setting `global.gatewayApi.enabled: false` disables Gateway API routing but does **not**, by itself, stop the chart from also installing its bundled Envoy Gateway subchart — `global.gatewayApi.installEnvoy: false` must be set explicitly too, otherwise a stray `envoy-gateway` pod gets deployed for no reason.

Note that the secrets referenced by `global.initialRootPassword.secret`, `global.psql.password.secret`, and `global.smtp.password.secret` must be created manually, pointing at the credentials for whichever PostgreSQL and SMTP instances you deployed or configured for GitLab. Keep in mind the warning given above — if a regular (non-root) PostgreSQL user is used, the `btree_gist` and `pg_trgm` extensions must be enabled beforehand.

!!! info "GitLab Email Sending"
    nmaas does not rely on email sending via GitLab, so both the email and smtp sections in the value files can be left with their default values - unconfigured. However, users are free to customize these sections according to their own environments. 

Once all configuration parameters have been specified, GitLab can be installed using the following Helm v3 command:

```bash
export NMAAS_NAMESPACE="nmaas-system"
helm repo add gitlab https://charts.gitlab.io
helm install -f gitlab-values.yaml --namespace $NMAAS_NAMESPACE <RELEASE_NAME> --version 10.3.1 gitlab/gitlab
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

#### nmaas Values

The source code for the nmaas Helm chart is publicly available on [nmaas-platform/nmaas-chart](https://gitlab.software.geant.org/nmaas/nmaas-chart). The chart's `values.yaml` and `README.md` provide the full, authoritative list of configurable parameters for a given chart version — refer to those directly when preparing your own values file.

!!! success "nmaas Version"

    `2.0.6` (chart version, application version `1.10.0`) is the latest version of nmaas that has been tested with this guide.

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

- Create the JWT signing secret. This is **required but undocumented in the chart's own `values.yaml` comments** — `platform.properties.jwt.secretName` (default `nmaas-jwt`) must already exist before install; the chart does not generate it automatically, and install simply fails with `secret "nmaas-jwt" not found` if it's skipped. Each key must be at least 96 characters:

    ```bash
    export NMAAS_NAMESPACE="nmaas-system"
    openssl rand -base64 96 | tr -d '\n' > jwtSigningKey
    openssl rand -base64 96 | tr -d '\n' > jwtResetKey
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-jwt --from-file=jwtSigningKey=jwtSigningKey --from-file=jwtResetKey=jwtResetKey
    ```

- Create the SMTP secret for the `nmaas-postfix` component. This is required regardless of whether real external SMTP relay is needed; if not, placeholder values are sufficient:

    ```bash
    export NMAAS_NAMESPACE="nmaas-system"
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-smtp-secret --from-literal=smtpHost=localhost --from-literal=smtpUsername=nmaas --from-literal=smtpPassword=unused
    ```

Once the required secrets have been created, nmaas can be deployed using the following command (make sure to deploy in the same namespace as GitLab):

```bash
export NMAAS_NAMESPACE="nmaas-system"
helm repo add nmaas https://artifactory.software.geant.org/artifactory/nmaas-helm
helm install -f nmaas-values.yaml --namespace $NMAAS_NAMESPACE --version 2.0.6 nmaas nmaas/nmaas
```

It is recommended to use `nmaas-system` as the namespace where nmaas and all associated components (PostgreSQL, GitLab) will be deployed.

!!! warning "nmaas Deployment Time"
    Please allow at least 10 minutes for nmaas to be fully deployed, depending on hardware configuration and resource utilization.

#### Verifying the Installation

You can verify that nmaas has been successfully deployed by navigating to its ingress URL from your browser, logging in as the admin user and selecting `Settings -> Monitoring`. From this location, you can execute checks for all the required components of nmaas. A fully functional installation should return a successful response for all monitors.

!!! danger "GitLab Must Allow Local-Network Webhooks Before Any Application Can Be Deployed"

    Every application deployment goes through nmaas registering a webhook on a GitLab project it creates, pointing at `http://nmaas-platform:<port>/api/v1/gitlab/webhooks/<id>` — an internal Kubernetes Service hostname. GitLab's SSRF-protection setting blocks webhooks targeting local/private network addresses **by default**, so without this change, every single application deployment will fail at the configuration step with `GITLAB: Invalid url given Unprocessable Entity` (`GitLabConfigHandler.addWebhookToProject`), no matter which application or domain. Fix it once, as GitLab root:

    **Admin Area → Settings → Network → Outbound requests → enable "Allow requests to the local network from webhooks and integrations"** (and, while there, the adjacent "Allow requests to the local network from system hooks" is worth enabling too).

    This can also be verified/set via the API:

    ```bash
    curl -X PUT "https://gitlab.<TLD>/api/v4/application/settings" \
      -H "PRIVATE-TOKEN: <GITLAB_ROOT_API_TOKEN>" \
      -d "allow_local_requests_from_web_hooks_and_services=true&allow_local_requests_from_system_hooks=true"
    ```

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

!!! danger "DCN Configured Must Be Manually Confirmed"

    Even with `DCN status` set to `Configured` in the domain creation form above, applications deployed into the domain will hang indefinitely at "Verifying secure connectivity to your equipment" unless the domain's DCN configuration is also explicitly confirmed after the domain is created. This is a genuine manual checkpoint in nmaas's deployment workflow, not a bug — it exists to let an operator confirm the domain's network connectivity is actually in place before nmaas proceeds with app deployments.

    Confirm it via the Portal (`Settings -> Domains -> edit the domain -> DCN configured` checkbox), or via the API:

    ```bash
    curl -X PATCH "https://<nmaas-host>/api/domains/<DOMAIN_ID>/dcn?configured=true" \
      -H "Authorization: Bearer <TOKEN>"
    ```

## Additional Documentation

An online user guide is available at [nmaas User Guide](../guides/user-guide.md) page.

Information about the nmaas applications deployment and configuration process and the nmaas portfolio is available on the [nmaas Tools](../nmaas-applications/general-app-deployment.md) page.

In case of any questions please contact the nmaas Team at [nmaas@lists.geant.org](mailto:nmaas@lists.geant.org).