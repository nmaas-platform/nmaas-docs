# GitLab Installation

GitLab can be deployed using the [official Helm chart](https://docs.gitlab.com/charts) whose source code is also [publicly available](https://gitlab.com/gitlab-org/charts/gitlab). Note that GitLab requires at least 8GB of memory to run.

!!! warning "No More Bundled PostgreSQL/Redis/Object Storage"

    Unlike older versions of the chart, GitLab `10.3.1` no longer bundles PostgreSQL, Redis, or object storage (MinIO) as subcharts — GitLab itself does not supply these. A PostgreSQL instance, a Redis instance, and an S3-compatible object store must each be deployed and configured separately before installing GitLab, using GitLab's own external-database/external-storage configuration options shown below. This guide only documents the GitLab-side values and secrets needed.

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

## GitLab Values

Below is a snippet of the mandatory parameters that must be specified during GitLab's deployment, so that it will be compatible with nmaas. The complete list of supported value parameters is available in the [official GitLab Helm chart Git repository](https://gitlab.com/gitlab-org/charts/gitlab).

```yaml title="gitlab-values.yaml"
installCertmanager: false
nginx-ingress:
  enabled: false
prometheus:
  install: false
gitlab-runner:
  install: false
gitlab:
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

    Setting `global.gatewayApi.enabled: false` disables Gateway API routing but does **not**, by itself, stop the chart from installing its bundled Envoy Gateway subchart — `global.gatewayApi.installEnvoy: false` must be set explicitly too, otherwise a stray `envoy-gateway` pod will get deployed.

Note that the secrets referenced by `global.initialRootPassword.secret`, `global.psql.password.secret`, and `global.smtp.password.secret` must be created manually, pointing at the credentials for whichever PostgreSQL and SMTP instances are deployed or configured for GitLab.

!!! info "GitLab Email Sending"
    nmaas does not rely on email sending via GitLab, so both the email and SMTP sections in the value files can be left with their default values - unconfigured. 

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

    Note that after deployment, by default, anyone can register to the newly deployed GitLab instance. This can be configured by logging in as the root GitLab user.

    Users are advised to determine whether public exposure of the GitLab web interface is needed at all. nmaas' GitLab integration can work even if only public access to the GitLab SSH interface is provided, since repository cloning always relies on SSH as the transport protocol.

To create a GitLab API token that can be used by nmaas, perform the following steps:

- Login to GitLab using the root account;
- Click on the avatar image in the top right corner and select `Settings`;
- From the left-hand navigation menu choose `Access Tokens`;
- Create a new access token with no expiration date by simply leaving the `Expires at` field empty, and assigning all available scopes;
- Write down the API token, it will be needed during nmaas installation.

## SSH Access to GitLab Repositories

GitLab supports SSH access to any created repositories. If you want to allow your users to clone the repositories where their application configuration is stored, then you will have to alter the GitLab Shell service, and change its type to LoadBalancer, so that a routable IP address will be assigned to it.
