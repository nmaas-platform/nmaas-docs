# Getting Started with ActiveMon

For the central nmaas instance to manage applications deployed on remote Kubernetes clusters, it must be able to communicate with the Kubernetes API server of each registered cluster. In the typical ActiveMon deployment model, this communication takes place over a VPN connection established between the central nmaas environment and the remote site hosting the Kubernetes cluster.

The VPN provides a secure management channel used for cluster health checks, application lifecycle operations and configuration updates. In most deployments, the server field in the kubeconfig submitted to nmaas therefore points to the VPN address of the remote cluster's control plane rather than to its public or local network address.

Alternative connectivity models are possible provided that the central nmaas instance has reliable and secure network access to the Kubernetes API server. Examples include private research network backbones, dedicated management networks, existing site-to-site connectivity between participating organizations or a securely exposed Kubernetes API server reachable over the public internet, for example through TLS-protected access with appropriate authentication and network restrictions.

The process of registering and managing remote clusters from the nmaas Portal is described in the [Domain Administrator Guide](https://docs.nmaas.eu/guides/domain-admin-guide/#managing-remote-clusters). The following sections focus on preparing the Kubernetes-side configuration required for onboarding a cluster, including the creation of the kubeconfig file that will be submitted to nmaas during the registration process.

## Adding a Remote Cluster to nmaas

To add a remote cluster to nmaas, a corresponding `kubeconfig` file needs to be created and submitted via the nmaas Portal. The steps below explain how to generate two types of `kubeconfig` files:

- give the central nmaas cluster access to only a specific namespace within your cluster;
- give the central nmaas cluster access to all namespaces within your cluster (`cluster-admin`).

You are free to choose the most suitable approach for your use-case.

### Creating a kubeconfig File for a Specific Namespace

- Create the namespace to which the `kubeconfig` will be restricted, e.g. `nmaas-external`.

```bash
kubectl create namespace nmaas-external
```

- Create a ServiceAccount.

```bash
kubectl create serviceaccount nmaas-external-admin -n nmaas-external
```

- Create a role granting full access to the namespace.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: nmaas-external-admin
  namespace: nmaas-external
rules:
  - apiGroups: ["*"]
    resources: ["*"]
    verbs: ["*"]
```

- Create a RoleBinding, connecting the Role to the ServiceAccount.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: nmaas-external-admin-binding
  namespace: nmaas-external
subjects:
  - kind: ServiceAccount
    name: nmaas-external-admin
    namespace: nmaas-external
roleRef:
  kind: Role
  name: nmaas-external-admin
  apiGroup: rbac.authorization.k8s.io
```

nmaas periodically executes a healthcheck for all registered clusters. This healthcheck uses the `cluster-info` command behind the scenes. For `cluster-info` to work it requires access to the list of services in the `kube-system` namespace, so that it can retrieve the URL of the API server. To fulfill this requirement, an additional role needs to be created that will be restricted only to listing the services in the `kube-system` namespace.

- Create a Role granting list access to services in `kube-system` namespace.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: nmaas-external-kube-system-services-reader
  namespace: kube-system
rules:
  - apiGroups: [""]
    resources: ["services"]
    verbs: ["list"]
```

- Create a RoleBinding that will connect the previously created ServiceAccount to the Role granting access to services in `kube-system`.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: nmaas-external-admin-kube-system-binding
  namespace: kube-system
subjects:
  - kind: ServiceAccount
    name: nmaas-external-admin
    namespace: nmaas-external
roleRef:
  kind: Role
  name: nmaas-external-kube-system-services-reader
  apiGroup: rbac.authorization.k8s.io
```

Apply the resource:

```bash
kubectl apply -f nmaas-external-admin-kube-system-binding.roleBinding.yaml
```


The final step is to construct the `kubeconfig` file itself.

- Generate a token for the ServiceAccount (long-lived)

```bash
TOKEN=$(kubectl create token nmaas-external-admin -n nmaas-external --duration=8760h)
```

- Get the cluster's CA cert and API server address

```bash
CLUSTER_NAME=$(kubectl config view --minify -o jsonpath='{.clusters[0].name}')
SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')

kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d > ca.crt
```

- Build the `kubeconfig`

```bash
kubectl config set-cluster nmaas-cluster \
  --server="$SERVER" \
  --certificate-authority=ca.crt \
  --embed-certs=true \
  --kubeconfig=nmaas-external.kubeconfig

kubectl config set-credentials nmaas-external-admin \
  --token="$TOKEN" \
  --kubeconfig=nmaas-external.kubeconfig

kubectl config set-context nmaas-external-context \
  --cluster=nmaas-cluster \
  --namespace=nmaas-external \
  --user=nmaas-external-admin \
  --kubeconfig=nmaas-external.kubeconfig

kubectl config use-context nmaas-external-context \
  --kubeconfig=nmaas-external.kubeconfig
```

- Test the config file

```bash
KUBECONFIG=$(readlink -e nmaas-external.kubeconfig) kubectl get pod
```

As a final step you will need to adjust the `server` address in the `kubeconfig` file, so that it corresponds to the VPN tunnel IP of your controller node, through which the central nmaas cluster will reach your remote cluster.

### Creating a kubeconfig File for Unrestricted Access to the Remote Cluster

In environments where nmaas is expected to deploy applications across multiple namespaces or manage cluster-wide resources, it may be preferable to provide unrestricted access to the remote cluster by granting the `cluster-admin` role to a dedicated ServiceAccount.

- Create a ServiceAccount that will be used by nmaas:

```bash
kubectl create serviceaccount nmaas-cluster-admin -n kube-system
```

- Create a `ClusterRoleBinding` that assigns the `cluster-admin` role to the ServiceAccount:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: nmaas-cluster-admin-binding
subjects:
  - kind: ServiceAccount
    name: nmaas-cluster-admin
    namespace: kube-system
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
```

Apply the resource:

```bash
kubectl apply -f nmaas-cluster-admin-binding.yaml
```

The final step is to construct the `kubeconfig` file itself.

- Generate a token for the ServiceAccount (long-lived)

```bash
TOKEN=$(kubectl create token nmaas-cluster-admin -n kube-system --duration=8760h)
```

- Get the cluster's CA cert and API server address

```bash
CLUSTER_NAME=$(kubectl config view --minify -o jsonpath='{.clusters[0].name}')
SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')

kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d > ca.crt
```

- Build the `kubeconfig`

```bash
kubectl config set-cluster nmaas-cluster \
  --server="$SERVER" \
  --certificate-authority=ca.crt \
  --embed-certs=true \
  --kubeconfig=nmaas-cluster-admin.kubeconfig

kubectl config set-credentials nmaas-cluster-admin \
  --token="$TOKEN" \
  --kubeconfig=nmaas-cluster-admin.kubeconfig

kubectl config set-context nmaas-cluster-admin-context \
  --cluster=nmaas-cluster \
  --user=nmaas-cluster-admin \
  --kubeconfig=nmaas-cluster-admin.kubeconfig

kubectl config use-context nmaas-cluster-admin-context \
  --kubeconfig=nmaas-cluster-admin.kubeconfig
```

- Test the config file

```bash
KUBECONFIG=$(readlink -e nmaas-cluster-admin.kubeconfig) kubectl get namespaces
```

As a final step you will need to adjust the `server` address in the `kubeconfig` file, so that it corresponds to the VPN tunnel IP of your controller node, through which the central nmaas cluster will reach your remote cluster.

The resulting `kubeconfig` grants full administrative access to the remote cluster and should therefore be treated as a sensitive credential. It is recommended to use the namespace-restricted approach described earlier whenever the monitoring application does not require cluster-wide permissions.

## Handling GitOps Updates

nmaas supports GitOps configuration updates for applications that store their configuration data in text-based files. 

During application deployment, the nmaas platform creates a dedicated Git repository for the given application. Any changes made to a file in the repository are automatically synced to the running pod. In case the application does not support automatic configuration reloads, the whole pod is restarted. To handle pod restarts after configuration changes, the additional component Stakater Reloader needs to be installed in the cluster. This component watches related ConfigMaps for changes and restarts the affected pods once they happen. The complete workflow is as follows:

- a user makes a change in a Git repository
- the Git repository sends a webhook towards the nmaas Platform
- the nmaas Platform fetches the latest changes and syncs the changes to the in-cluster ConfigMap
- Stakater Reloader detects that the ConfigMap has changed and restarts the affected pod(s).

The installation of the Stakater Reloader component is straightforward:

```bash
helm repo add stakater https://stakater.github.io/stakater-charts
helm repo update
helm install -n $namespace reloader stakater/reloader
```

## Application Network Options

Active monitoring applications often need control over the network interfaces they use. nmaas supports several networking options depending on the application and deployment environment:

- **Kubernetes Networking** uses the default cluster networking provided by the CNI plugin and is suitable for most latency measurements and lightweight monitoring scenarios.
- **Host Networking** attaches the application directly to the host network stack and is useful when measurements should originate from the node itself or when exposing well-known service ports.
- **Multus Networking** allows applications to use additional interfaces attached to physical networks, VLANs or dedicated measurement networks, making it suitable for advanced active monitoring deployments and high-performance throughput testing.

The following section describes an advanced networking scenario based on Multus and explains how it can be integrated with remote ActiveMon deployments.

### Advanced Network Topologies in Remote Clusters

It is possible that when using a remote cluster to host an active monitoring application, the remote node can also host additional services, apart from being a Kubernetes node. In such cases it is not always feasible to deploy containers using host networking, to avoid situations where multiple services bind to the same port (e.g., the perfSONAR Testpoint web server and a reverse proxy). The solution to this problem is Multus, a Kubernetes networking plugin.

Multus, among other things, allows cluster operators to assign multiple interfaces to a given Kubernetes pod, and these additional interfaces can be bridged to an actual interface on the host. In effect, the pod can receive a bridged network interface to the network, using its own IP address, or a MACVLAN interface, in a different VLAN.

The [official Multus repository](https://github.com/k8snetworkplumbingwg/multus-cni) provides instructions on how to install Multus in an existing Kubernetes cluster. When working with K3s, the installation instructions differ, as K3s stores the configuration files in different locations on the file system. The [K3s docs](https://docs.k3s.io/networking/multus-ipams) have a dedicated page on installing Multus in a K3s environment.

The process to install Multus in a K3s cluster is as follows:

- Create a Multus `HelmChart` file:

```yaml
apiVersion: helm.cattle.io/v1
kind: HelmChart
metadata:
  name: multus
  namespace: kube-system
spec:
  repo: https://rke2-charts.rancher.io
  chart: rke2-multus
  targetNamespace: kube-system
  valuesContent: |-
    config:
      fullnameOverride: multus
      cni_conf:
        confDir: /var/lib/rancher/k3s/agent/etc/cni/net.d
        binDir: /var/lib/rancher/k3s/data/cni/
        kubeconfig: /var/lib/rancher/k3s/agent/etc/cni/net.d/multus.d/multus.kubeconfig
        # Comment the following line when using rke2-multus < v4.2.202
        multusAutoconfigDir: /var/lib/rancher/k3s/agent/etc/cni/net.d
    manifests:
      dhcpDaemonSet: true
```

- Create the `HelmChart` resource using `kubectl create -f multus.helmChart.yaml --save-config`. 

Enabling the `dhcpDaemonSet` allows dynamic allocation of IP addresses, instead of requiring static configuration. However, the IP addresses assigned in this way are not persistent across pod restarts. To make the IP assignment peristent across restarts, the `Whereabouts` plugin can be used:

```yaml
helm install whereabouts oci://ghcr.io/k8snetworkplumbingwg/whereabouts-chart
```

The final step is to configure an appropriate `NetworkAttachmentDefinition`, e.g.:

```
apiVersion: "k8s.cni.cncf.io/v1"
kind: NetworkAttachmentDefinition
metadata:
  name: macvlan-default
  namespace: nmaas-external
spec:
  config: '{
      "cniVersion": "0.3.0",
      "type": "macvlan",
      "master": "ens192",
      "mode": "bridge",
      "ipam": {
        "type": "whereabouts",
        "range": "192.168.85.0/24",
        "range_start": "192.168.85.216",
        "range_end": "192.168.85.218",
        "routes": [
          { "dst": "0.0.0.0/5" },
          { "dst": "8.0.0.0/7" },
          { "dst": "10.0.0.0/11" },
          { "dst": "10.32.0.0/13" },
          { "dst": "10.40.0.0/15" },
          { "dst": "10.44.0.0/20" },
          { "dst": "10.44.20.0/22" },
          { "dst": "10.44.26.0/23" },
          { "dst": "10.44.28.0/22" },
          { "dst": "10.44.32.0/19" },
          { "dst": "10.44.64.0/18" },
          { "dst": "10.44.128.0/17" },
          { "dst": "10.45.0.0/18" },
          { "dst": "10.45.64.0/25" },
          { "dst": "10.45.64.144/28" },
          { "dst": "10.45.64.160/27" },
          { "dst": "10.45.64.192/26" },
          { "dst": "10.45.65.0/24" },
          { "dst": "10.45.66.0/23" },
          { "dst": "10.45.68.0/22" },
          { "dst": "10.45.72.0/21" },
          { "dst": "10.45.80.0/20" },
          { "dst": "10.45.96.0/19" },
          { "dst": "10.45.128.0/17" },
          { "dst": "10.46.0.0/15" },
          { "dst": "10.48.0.0/12" },
          { "dst": "10.64.0.0/10" },
          { "dst": "10.128.0.0/9" },
          { "dst": "11.0.0.0/8" },
          { "dst": "12.0.0.0/6" },
          { "dst": "16.0.0.0/4" },
          { "dst": "32.0.0.0/3" },
          { "dst": "64.0.0.0/2" },
          { "dst": "128.0.0.0/2" },
          { "dst": "192.0.0.0/9" },
          { "dst": "192.128.0.0/11" },
          { "dst": "192.160.0.0/13" },
          { "dst": "192.168.0.0/17" },
          { "dst": "192.168.128.0/18" },
          { "dst": "192.168.192.0/19" },
          { "dst": "192.168.224.0/20" },
          { "dst": "192.168.240.0/21" },
          { "dst": "192.168.248.0/32" },
          { "dst": "192.168.248.2/31" },
          { "dst": "192.168.248.4/30" },
          { "dst": "192.168.248.8/29" },
          { "dst": "192.168.248.16/28" },
          { "dst": "192.168.248.32/27" },
          { "dst": "192.168.248.64/26" },
          { "dst": "192.168.248.128/25" },
          { "dst": "192.168.249.0/24" },
          { "dst": "192.168.250.0/23" },
          { "dst": "192.168.252.0/22" },
          { "dst": "192.169.0.0/16" },
          { "dst": "192.170.0.0/15" },
          { "dst": "192.172.0.0/14" },
          { "dst": "192.176.0.0/12" },
          { "dst": "192.192.0.0/10" },
          { "dst": "193.0.0.0/8" },
          { "dst": "194.0.0.0/7" },
          { "dst": "196.0.0.0/6" },
          { "dst": "200.0.0.0/5" },
          { "dst": "208.0.0.0/4" },
          { "dst": "224.0.0.0/3" }
        ],
        "gateway": "192.168.85.1"
      }
    }'
```

The `range_start` and `range_end` properties define the start and end addresses of the range that will be assigned to pods. The routes section is not simply `0.0.0.0/0` to avoid the case where all traffic is simply routed to the default gateway, including internal Kubernetes traffic. Specifying `0.0.0.0/0`, breaks DNS resolution in certain cases. 

[This free tool](https://www.procustodibus.com/blog/2021/03/wireguard-allowedips-calculator/) can be used to calculate the network routes, subtracting the Kubernetes pod subnet in your cluster.

Once Multus and the Whereabouts plugin are installed, assigning an additional interface to a pod is simply a matter of passign the appropriate pod annotation, for example:

```
k8s.v1.cni.cncf.io/networks: macvlan-default
```

## Deploying perfSONAR Testpoint with Multus on a Remote Cluster

The perfSONAR Testpoint application included in the nmaas catalogue natively supports deployment on remote clusters, and can attach the desired Multus interface. The deployment wizard offers the following network configuration options:

- Kubernetes Networking (default)
- Host Networking
- Multus

If Multus is chosen as the networking option, a new input field appears that accepts the name of the NetworkAttachmentDefinition to be used.

Using this approach it is possible to deploy perfSONAR Testpoint on a remote node which has multiple interfaces and to explicitly select the interface to be used during tests.
