# nmaas Installation Guide

## Requirements

To install nmaas into an existing Kubernetes cluster, the following requirements must be met:

- Kubernetes version `>=1.16`
- Helm v3 support in the Kubernetes cluster
- Existing ingress controller, preferably with a default TLS certificate set (see the [GitLab Installation](gitlab-installation.md) page for TLS details)
- An integration with an external load-balancer or MetalLB for bare-metal deployments, so that IPs can be assigned to `LoadBalancer` services

## Installation 

The nmaas installation is a two-step process: first an instance of GitLab must be deployed and configured, and then nmaas itself. The two components cannot be deployed at the same time, since during the deployment process nmaas requires a GitLab API key to be specified.

!!! info "Connecting nmaas to an Existing GitLab Instance"

    If you already have a running GitLab instance, the GitLab installation step can be skipped. If the existing GitLab instance can be exclusively devoted to nmaas, only its address and access information need to be provided during the nmaas installation. On the other hand, if the GitLab instance is meant to be shared with other projects, two specific values need to be set during the nmaas installation (see the dedicated section below).

### GitLab Installation

The full GitLab installation instructions, including the required secrets, values file, and API token creation, are available on the dedicated [GitLab Installation](gitlab-installation.md) page.

### nmaas Installation

#### nmaas Values

The source code for the nmaas Helm chart is publicly available on [nmaas-platform/nmaas-chart](https://gitlab.software.geant.org/nmaas/nmaas-chart). The chart's `values.yaml` and `README.md` provide the full, authoritative list of configurable parameters for a given chart version — refer to those directly when preparing a custom values file.

!!! success "nmaas Version"

    `2.0.6` (chart version, application version `1.10.0`) is the latest version of nmaas that has been tested with this guide.

The following manual steps must be performed before deploying nmaas:

- Creating secrets for the API and admin password:

    ```bash
    # Make sure to name the secrets with the same names that have been specified in the values file. The examples below use the defaults, and should be used if no changes have been made.
    export NMAAS_NAMESPACE="nmaas-system"
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-platform-admin --from-literal=password=<PASSWORD>
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-api-secret --from-literal=secret=<PASSWORD>
    ```

- Creating the secret containing the previously generated GitLab API key:

    ```bash
    export NMAAS_NAMESPACE="nmaas-system"
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-gitlab-api-token --from-literal=secret=<GITLAB_API_TOKEN>
    ```

- Creating the JWT signing secret. This is **required but undocumented in the chart's own `values.yaml` comments** — 
  `platform.properties.jwt.secretName` (default `nmaas-jwt`) must already exist before install; the chart does not generate it automatically, and install will fail with `secret "nmaas-jwt" not found` if it's skipped. Each key must be at least 96 characters:

    ```bash
    export NMAAS_NAMESPACE="nmaas-system"
    openssl rand -base64 96 | tr -d '\n' > jwtSigningKey
    openssl rand -base64 96 | tr -d '\n' > jwtResetKey
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-jwt --from-file=jwtSigningKey=jwtSigningKey --from-file=jwtResetKey=jwtResetKey
    ```

- Creating the SMTP secret for the `nmaas-postfix` component. This is required regardless of whether real external 
  SMTP relay is needed; if not, placeholder values are sufficient:

    ```bash
    export NMAAS_NAMESPACE="nmaas-system"
    kubectl create secret generic -n $NMAAS_NAMESPACE nmaas-smtp-secret --from-literal=smtpHost=localhost --from-literal=smtpUsername=nmaas --from-literal=smtpPassword=unused
    ```

Once the required secrets have been created, nmaas can be deployed using the following command (make sure to deploy in the same namespace as GitLab). It is recommended to use `nmaas-system` as the namespace where nmaas and all associated components (PostgreSQL, GitLab) will be deployed:

```bash
export NMAAS_NAMESPACE="nmaas-system"
helm repo add nmaas https://artifactory.software.geant.org/artifactory/nmaas-helm
helm install -f nmaas-values.yaml --namespace $NMAAS_NAMESPACE --version 2.0.6 nmaas nmaas/nmaas
```

!!! warning "nmaas Deployment Time"
    Please allow at least 10 minutes for nmaas to be fully deployed, depending on hardware configuration and resource utilization.

#### Verifying the Installation

You can verify that nmaas has been successfully deployed by opening the nmaas ingress URL in your browser, logging in as the admin user and selecting `Settings -> Monitoring`. From this location, you can execute checks for all the required components of nmaas. A fully functional installation should return a successful response for all monitors.

!!! danger "GitLab Must Allow Local-Network Webhooks Before Any Application Can Be Deployed"

    Every application deployment goes through nmaas registering a webhook on a GitLab project it creates, pointing at `http://nmaas-platform:<port>/api/v1/gitlab/webhooks/<id>` — an internal Kubernetes Service hostname. GitLab's SSRF-protection setting blocks webhooks targeting local/private network addresses **by default**, so without this change, every single application deployment will fail at the configuration step with `GITLAB: Invalid url given Unprocessable Entity` (`GitLabConfigHandler.addWebhookToProject`), no matter which application or domain. To allow for Local-Network webhooks, log in as GitLab root:

    **Admin Area → Settings → Network → Outbound requests → enable "Allow requests to the local network from webhooks and integrations"** (and, while there, the adjacent "Allow requests to the local network from system hooks" is worth enabling too).

    This can also be verified/set via the API:

    ```bash
    curl -X PUT "https://gitlab.<TLD>/api/v4/application/settings" \
      -H "PRIVATE-TOKEN: <GITLAB_ROOT_API_TOKEN>" \
      -d "allow_local_requests_from_web_hooks_and_services=true&allow_local_requests_from_system_hooks=true"
    ```

## Administrator Information

### Creating New Domains

Creating a new customer domain within nmaas is a two-step process:

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

        !!! warning "Legacy MetalLB Configuration"

            The `ConfigMap`-based example above is kept from earlier versions of this guide and applies only to MetalLB releases older than `0.13`. Newer MetalLB releases ignore this `ConfigMap` and are configured exclusively through custom resources (`IPAddressPool` with `autoAssign: false`, together with an `L2Advertisement`). This step has not been re-validated against current MetalLB releases. For the equivalent configuration, refer to the [MetalLB configuration documentation](https://metallb.io/configuration/) and the [ConfigMap-to-CRD migration guide](https://metallb.io/configuration/migration_to_crds/).

    - Deploy a new ingress controller in the new domain namespace, with an ingress class that will match the name of the domain.

!!! danger "DCN Configured Must Be Manually Confirmed"

    Even with `DCN status` set to `Configured` in the domain creation form above, applications deployed into the domain will remain stuck at "Verifying secure connectivity to your equipment" unless the domain's DCN configuration is also explicitly confirmed after the domain is created.

    Confirm it via the Portal (`Settings -> Domains -> edit the domain -> DCN configured` checkbox).

## Additional Documentation

An online user guide is available on the [nmaas User Guide](../guides/user-guide.md) page.

Information about the nmaas application deployment and configuration process and the nmaas portfolio is available on the [nmaas Tools](../nmaas-applications/general-app-deployment.md) page.
