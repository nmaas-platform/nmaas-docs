# nmaas Installation Guide

## Requirements

To install nmaas into an existing Kubernetes cluster, the following requirements must be met:

- Kubernetes version `>=1.23`
- Helm 3 CLI
- Existing ingress controller, preferably with a default TLS certificate set (see the [GitLab Installation](gitlab-installation.md) page for TLS details)
- A default `StorageClass` in the cluster, or a storage class set explicitly for the persistent volumes of nmaas Platform (`platform.persistence.storageClass`) and the in-cluster PostgreSQL database (`postgresql.primary.persistence.storageClass`)
- An integration with an external load-balancer or MetalLB for bare-metal deployments, so that IPs can be assigned to `LoadBalancer` services

## Installation 

The nmaas installation is a two-step process: first an instance of GitLab must be deployed and configured, and then nmaas itself. The two components cannot be deployed at the same time, since during the deployment process nmaas requires a GitLab API key to be specified.

!!! info "Connecting nmaas to an Existing GitLab Instance"

    If you already have a running GitLab instance, the GitLab installation step can be skipped. If the existing GitLab instance can be exclusively devoted to nmaas, only its address and access information need to be provided during the nmaas installation. On the other hand, if the GitLab instance is meant to be shared with other projects, two specific values need to be set during the nmaas installation (see [Using a Shared GitLab Instance](#using-a-shared-gitlab-instance)).

### GitLab Installation

The full GitLab installation instructions, including the required secrets, values file, API token creation, and the GitLab settings required before applications can be deployed, are available on the dedicated [GitLab Installation](gitlab-installation.md) page.

### nmaas Installation

The commands on this page assume that the following variables are set:

```bash
export NMAAS_NAMESPACE="nmaas-system"
export NMAAS_CHART_VERSION="2.1.0"
```

#### nmaas Values

The source code for the nmaas Helm chart is publicly available on [nmaas-platform/nmaas-chart](https://gitlab.software.geant.org/nmaas/nmaas-chart). The chart's `values.yaml` and `README.md` provide the full, authoritative list of configurable parameters for a given chart version — refer to those directly when preparing a custom values file.

!!! success "nmaas Version"

    `2.1.0` (chart version, application version `1.11.0`) is the latest version of nmaas that has been tested with this guide.

#### Secrets

The following secrets are required by nmaas. Each of them can either be created manually before the installation, or created by the chart from a value specified in the values file:

| Secret (default name) | Keys | Value to set instead of creating the secret manually |
|---|---|---|
| `nmaas-platform-admin` | `password` | `platform.adminPassword.literal` |
| `nmaas-api-secret` | `secret` | `platform.apiSecret.literal` |
| `nmaas-gitlab-api-token` | `secret` (the GitLab API token created during the GitLab installation) | `global.gitlabApiToken.literal` |
| `nmaas-jwt` | `jwtSigningKey`, `jwtResetKey` (each at least 96 characters long) | `platform.properties.jwt.signingKey.literal` and `platform.properties.jwt.resetKey.literal` |
| `nmaas-mcp-secret` (only if the nmaas MCP server is enabled, see below) | `nmaasPlatformToken` (an nmaas Platform API token) | `mcp.properties.nmaasPlatformToken.literal` |

Values specified in the values file are stored in the Helm release, so creating the secrets manually is recommended for production deployments. The commands below use the default secret names, which can be changed in the values file if needed:

```bash
kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-platform-admin --from-literal=password=<PASSWORD>
kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-api-secret --from-literal=secret=<PASSWORD>
kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-gitlab-api-token --from-literal=secret=<GITLAB_API_TOKEN>
kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-jwt \
  --from-literal=jwtSigningKey="$(openssl rand -base64 96 | tr -d '\n')" \
  --from-literal=jwtResetKey="$(openssl rand -base64 96 | tr -d '\n')"
```

!!! info "nmaas MCP Server"

    The [nmaas MCP server](../architecture.md#nmaas-mcp-server) is disabled by default. It authenticates to nmaas Platform with an nmaas Platform API token, read from the `nmaas-mcp-secret` secret, which can only be obtained once nmaas Platform is running. To enable the nmaas MCP server after nmaas has been installed, create the secret with the token, set `mcp.enabled: true` in the values file and upgrade the release:

    ```bash
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-mcp-secret --from-literal=nmaasPlatformToken=<NMAAS_PLATFORM_API_TOKEN>
    helm upgrade -f nmaas-values.yaml --namespace $NMAAS_NAMESPACE --version $NMAAS_CHART_VERSION nmaas nmaas/nmaas
    ```

#### Outgoing Email

nmaas Postfix delivers outgoing email directly to the recipients' mail servers by default. Set `postfix.properties.hostname` to a hostname within a domain you control; if it is left empty, `mailer.<global.nmaasDomain>` is used.

To relay all outgoing email through an upstream SMTP server instead, set `postfix.properties.smtp.enabled: true` together with the server address and credentials. The credentials can either be specified as literal values, or stored in the `nmaas-smtp-secret` secret (keys `smtpHost`, `smtpUsername` and `smtpPassword`) created before the installation:

```yaml
postfix:
  properties:
    smtp:
      enabled: true
      port: 587
      fromAddress: noreply@example.org
```

```bash
kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-smtp-secret --from-literal=smtpHost=<SMTP_HOST> --from-literal=smtpUsername=<SMTP_USERNAME> --from-literal=smtpPassword=<SMTP_PASSWORD>
```

TLS towards the upstream SMTP server is mandatory.

#### Using a Shared GitLab Instance

If the GitLab instance is shared with other projects, nmaas can create all of its projects within a dedicated top-level GitLab group, by setting the following values:

```yaml
platform:
  properties:
    gitlabSharedInstance: true
    gitlabTopLevelGroupName: <GITLAB_GROUP_NAME>
```

#### Deploying nmaas

Once the required secrets have been created, nmaas can be deployed using the following command. It is recommended to use `nmaas-system` as the namespace where nmaas and all associated components (PostgreSQL, and GitLab if it is deployed following this guide) will be deployed:

```bash
helm repo add nmaas https://artifactory.software.geant.org/artifactory/nmaas-helm
helm install -f nmaas-values.yaml --namespace $NMAAS_NAMESPACE --version $NMAAS_CHART_VERSION nmaas nmaas/nmaas
```

!!! warning "nmaas Deployment Time"
    Please allow at least 10 minutes for nmaas to be fully deployed, depending on hardware configuration and resource utilization.

#### Verifying the Installation

You can verify that nmaas has been successfully deployed by opening the nmaas ingress URL in your browser, logging in as the admin user and selecting `Settings -> Monitoring`. From this location, you can execute checks for all the required components of nmaas. A fully functional installation should return a successful response for all monitors.

!!! warning "GitLab Webhooks to the Local Network"

    Before the first application can be deployed, GitLab must allow webhooks to the local network, as described in [Allowing Webhooks to the Local Network](gitlab-installation.md#allowing-webhooks-to-the-local-network). Otherwise every application deployment fails at the configuration step.

## Administrator Information

### Creating New Domains

Creating a new customer domain within nmaas is a three-step process:

1. First, the new domain should be added from the nmaas web interface. The following steps should be performed.
    - Login to the nmaas Portal as the administrator user (the default administrator username is `admin` and the desired password is passed as an installation parameter);
    - Navigate to `Settings -> Domains`;
    - Click the `Add` button and enter the required parameters specific to the newly created domain:
        - `Name` - full name of the domain (e.g. `Test Domain`)
        - `Codename` - abbreviated name of the domain (e.g. `testdom`)
        - `Kubernetes namespace` *(Optional)* - a namespace dedicated for this domain to be created in the next step
        - `Kubernetes storage class` *(Optional)* - a specific storage class to be used for persistent volumes created in this domain (typically should be left blank)
        - `Kubernetes ingress class` *(Optional)* - an ingress class supported by the ingress controller deployed for this domain (should be left blank if a single common controller supports all the domains)
        - `External service domain` - a base URL for accessing all applications deployed in this domain (typically should contain the `Codename` and the URL of nmaas itself, e.g. `testdom.nmaas.example.com`)
        - `DCN deployment type` - by default should be set to `Manual`
        - `DCN status` - by default should be set to `Configured`
        - `Resource limits` *(Optional)* - set of parameters limiting the resources allocated for this domain (if 
          left blank, no limits are applied)
    - Click the `Submit` button to create the domain
2. Then, the following operations should be performed within the cluster:
    - Create a new Kubernetes namespace with the name set to `Codename` or `Kubernetes namespace` if set in previous 
      step
    - Create a new MetalLB address pool with the same name as the new customer domain, from which addresses are not automatically assigned. An example `IPAddressPool` and the corresponding `L2Advertisement` are available below:

        ```yaml title="domain1-pool.yaml"
        apiVersion: metallb.io/v1beta1
        kind: IPAddressPool
        metadata:
          name: domain1
          namespace: metallb-system
        spec:
          addresses:
            - 192.168.2.100-192.168.2.254
          autoAssign: false
        ---
        apiVersion: metallb.io/v1beta1
        kind: L2Advertisement
        metadata:
          name: domain1
          namespace: metallb-system
        spec:
          ipAddressPools:
            - domain1
        ```

        With the above configuration, addresses from the `domain1` pool are only assigned to `LoadBalancer` Kubernetes Services carrying the `metallb.universe.tf/address-pool: domain1` annotation. All other `LoadBalancer` Services keep receiving addresses from the existing address pools that allow automatic assignment.

        !!! info "MetalLB Configuration"

            This example uses the custom resources supported by MetalLB `0.13` and newer, and has not been validated against every MetalLB release. For more details, refer to the [MetalLB configuration documentation](https://metallb.io/configuration/).

    - Deploy a new ingress controller in the new domain namespace, with an ingress class that will match the name of the domain.
3. Finally, confirm the DCN configuration of the domain from the nmaas Portal (`Settings -> Domains -> edit the domain -> DCN configured` checkbox). Even with `DCN status` set to `Configured` in the domain creation form, applications deployed into the domain remain stuck at "Verifying secure connectivity to your equipment" until the DCN configuration is explicitly confirmed.

## Additional Documentation

An online user guide is available on the [nmaas User Guide](../guides/user-guide.md) page.

Information about the nmaas application deployment and configuration process and the nmaas portfolio is available on the [General Application Deployment](../nmaas-applications/general-app-deployment.md) page.
