# GitLab Installation

GitLab can be deployed using the [official Helm chart](https://docs.gitlab.com/charts) whose source code is also [publicly available](https://gitlab.com/gitlab-org/charts/gitlab). Note that GitLab requires at least 8GB of memory to run.

!!! warning "No More Bundled PostgreSQL/Redis/Object Storage"

    Unlike older versions of the chart, GitLab chart `10.3.1` no longer bundles PostgreSQL, Redis, or object storage (MinIO) as subcharts — GitLab itself does not supply these. A PostgreSQL instance and a Redis instance must each be deployed separately before installing GitLab, using GitLab's own external-database configuration options shown below. An S3-compatible object store is strongly recommended, but not essential, see [Object Storage](#object-storage). This guide only documents the GitLab-side values and secrets needed.

    If using a PostgreSQL instance with a non-root user, the following extensions must be enabled beforehand in the target GitLab database:

    - btree_gist
    - pg_trgm

    ```sql
    create extension btree_gist;
    create extension pg_trgm;
    ```

!!! success "GitLab Version"

    `10.3.1` is the latest version of the GitLab chart that has been tested with the latest version of nmaas.

The commands on this page assume that the namespace where GitLab (and later nmaas) is deployed is set in the following variable:

```bash
export NMAAS_NAMESPACE="nmaas-system"
```

GitLab needs to be told how to reach your PostgreSQL and Redis instances via Kubernetes secrets:

```bash
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-postgresql --from-literal=password=<POSTGRESQL_USER_PASSWORD>
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-redis --from-literal=redis-password=<REDIS_PASSWORD>
kubectl create secret generic -n $NMAAS_NAMESPACE gitlab-root-password --from-literal=password=<GITLAB_ROOT_PASSWORD>
```

## GitLab Values

Below is a snippet of the mandatory parameters that must be specified during GitLab's deployment, so that it will be compatible with nmaas. The object storage configuration is kept in a separate values file, described in the [Object Storage](#object-storage) section. The complete list of supported value parameters is available in the [official GitLab Helm chart Git repository](https://gitlab.com/gitlab-org/charts/gitlab).

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

!!! info "TLS Secret Must Exist in GitLab's Namespace"

    Classic `Ingress` TLS `secretName` references only support same-namespace secrets — this is a core Kubernetes `Ingress` limitation, not specific to GitLab or Cilium. Make sure `<MY_TLS_SECRET>` exists in the same namespace GitLab is deployed into before installing.

!!! warning "`global.gatewayApi.enabled: false` Alone Does Not Suppress Envoy Gateway"

    Setting `global.gatewayApi.enabled: false` disables Gateway API routing but does **not**, by itself, stop the chart from installing its bundled Envoy Gateway subchart — `global.gatewayApi.installEnvoy: false` must be set explicitly too, otherwise a stray `envoy-gateway` pod will get deployed.

Note that the secrets referenced by `global.initialRootPassword.secret`, `global.psql.password.secret`, and `global.smtp.password.secret` must be created manually, pointing at the credentials for whichever PostgreSQL and SMTP instances are deployed or configured for GitLab.

!!! info "GitLab Email Sending"
    nmaas does not rely on email sending via GitLab, so both the email and SMTP sections in the value files can be left with their default values - unconfigured. 

## Object Storage

GitLab stores files that are not part of Git repositories, such as uploads, LFS objects, CI artifacts, packages and container images, in object storage. Using an S3-compatible object store is strongly recommended, but not essential: nmaas only relies on Git repositories, which are stored by Gitaly on a persistent volume, and on the GitLab API and webhooks.

Choose one of the two configurations below and save it as `gitlab-object-storage.yaml`, which is passed to the GitLab installation together with `gitlab-values.yaml`.

### With Object Storage (Recommended)

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

```yaml title="gitlab-object-storage.yaml"
global:
  appConfig:
    object_store:
      enabled: true
      connection:
        secret: gitlab-rails-storage
        key: connection

registry:
  storage:
    secret: gitlab-registry-storage
    key: config
```

### Without Object Storage

For a quick evaluation setup, or for a GitLab instance dedicated solely to nmaas, GitLab can also be deployed without object storage. In this case, the following limitations apply:

- Files uploaded through the GitLab web interface or API, such as avatars, attachments in issues and merge requests, and project imports and exports, are stored inside the GitLab containers. They are lost whenever the GitLab pods are restarted, and are not shared between the GitLab pods, so these features do not work reliably.
- Git LFS, CI artifacts, the package registry and the container registry are not available.
- The backup utility included in the GitLab chart requires object storage. The GitLab PostgreSQL database and the Gitaly persistent volume have to be backed up by other means.
- This is not the configuration recommended by GitLab for Helm chart deployments.

None of these limitations affect nmaas itself. To deploy GitLab without object storage, disable the container registry and all object storage types:

```yaml title="gitlab-object-storage.yaml"
registry:
  enabled: false

global:
  registry:
    enabled: false
  appConfig:
    object_store:
      enabled: false
    artifacts:
      enabled: false
    lfs:
      enabled: false
    uploads:
      enabled: false
    packages:
      enabled: false
```

Object storage can also be added later, by replacing `gitlab-object-storage.yaml` with the configuration from the previous section and upgrading the GitLab release. Files uploaded while running without object storage are not migrated.

## Installing GitLab

Once all configuration parameters have been specified, GitLab can be installed using the following Helm v3 command:

```bash
helm repo add gitlab https://charts.gitlab.io
helm install -f gitlab-values.yaml -f gitlab-object-storage.yaml --namespace $NMAAS_NAMESPACE <RELEASE_NAME> --version 10.3.1 gitlab/gitlab
```

!!! warning "GitLab Deployment Duration"

    Please allow more than 15 minutes for GitLab to be deployed, depending on hardware configuration and current resource utilization.

Once GitLab has been deployed, it can be accessed by navigating to `gitlab.<TLD>`, where TLD is the value specified for the `.Values.global.hosts.domain` parameter. 

!!! danger "GitLab Public Exposure"

    Note that after deployment, by default, anyone can register to the newly deployed GitLab instance. This can be configured by logging in as the root GitLab user.

    Users are advised to determine whether public exposure of the GitLab web interface is needed at all. nmaas' GitLab integration can work even if only public access to the GitLab SSH interface is provided, since repository cloning always relies on SSH as the transport protocol.

## GitLab API Token

To create a GitLab API token that can be used by nmaas, perform the following steps:

- Login to GitLab using the root account;
- Click on the avatar image in the top right corner and select `Settings`;
- From the left-hand navigation menu choose `Access Tokens`;
- Create a new access token, assigning all available scopes and an expiration date;
- Write down the API token, it will be needed during nmaas installation.

!!! warning "GitLab API Token Expiration"

    Depending on the GitLab version and the instance settings, personal access tokens may be required to have an expiration date. Once the token expires, nmaas can no longer communicate with GitLab and application deployments fail, so make sure to rotate the token before it expires:

    1. Create a new access token as described above.
    2. Replace the token stored in the `nmaas-gitlab-api-token` secret (or update `global.gitlabApiToken.literal` and run `helm upgrade`, if the token is specified in the nmaas values file):

        ```bash
        kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-gitlab-api-token --from-literal=secret=<NEW_GITLAB_API_TOKEN> --dry-run=client -o yaml | kubectl apply -f -
        ```

    3. Restart nmaas Platform so that the new token is used:

        ```bash
        kubectl rollout restart deployment/nmaas-platform -n $NMAAS_NAMESPACE
        ```

## Allowing Webhooks to the Local Network

Every application deployment goes through nmaas registering a webhook on a GitLab project it creates, pointing at `http://nmaas-platform:<port>/api/v1/gitlab/webhooks/<id>` — an internal Kubernetes Service hostname. GitLab's SSRF-protection setting blocks webhooks targeting local/private network addresses **by default**, so without this change, every single application deployment will fail at the configuration step with `GITLAB: Invalid url given Unprocessable Entity` (`GitLabConfigHandler.addWebhookToProject`), no matter which application or domain.

To allow webhooks to the local network, log in as the GitLab root user and navigate to **Admin Area → Settings → Network → Outbound requests**, then enable **"Allow requests to the local network from webhooks and integrations"**. Enabling the adjacent "Allow requests to the local network from system hooks" setting is recommended as well.

The same settings can also be verified or changed via the API:

```bash
curl -X PUT "https://gitlab.<TLD>/api/v4/application/settings" \
  -H "PRIVATE-TOKEN: <GITLAB_ROOT_API_TOKEN>" \
  -d "allow_local_requests_from_web_hooks_and_services=true&allow_local_requests_from_system_hooks=true"
```

If nmaas uses an existing GitLab instance, these settings must be enabled by an administrator of that instance.

## SSH Access to GitLab Repositories

GitLab supports SSH access to any created repositories, allowing users to clone the repositories where their application configuration is stored. This is why the values above set the type of the GitLab Shell service to `LoadBalancer` (`gitlab.gitlab-shell.service.type`), so that a routable IP address is assigned to it. If SSH access to the repositories is not needed, this setting can be omitted.
