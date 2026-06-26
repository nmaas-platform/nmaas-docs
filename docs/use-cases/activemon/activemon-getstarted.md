# Getting Started with ActiveMon

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

### Creating a kubeconfig File for Unrestricted Acess to the Remote Cluster

WIP.