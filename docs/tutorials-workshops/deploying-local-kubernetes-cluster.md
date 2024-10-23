# Deploying a Local Kubernetes Cluster

This tutorial will assume that nmaas is installed in a virtual machine that is completely isolated from any production environment. However, the discussed steps are applicable to bare-metal hardware as well, once the correct network strategy has been identified by the system administrator.

## Virtual Machine Prerequisites 

- Debian 12 or Ubuntu >= 22.04
- 12GB+ RAM
- 2+ VCPUs
- 60GB+ storage space

## Virtual Machine Setup

Although we will focus on VirtualBox, any virtualization software can be used, depending on the user's preference. Virtualbox 7 is an open-source virtualization software which can be downloaded for free from the [official website](https://www.virtualbox.org/wiki/Downloads).

After installation, additional network configuration needs to be done before a Kubernetes cluster can be set up. The following network configuration will make the nmaas deployment accessible by any host in the same local area network (bridged-mode). nmaas can be isolated from the local network by altering the network strategy and using NAT, host-only network adapaters or a combination of the two. Such customization is beyond the scope of this tutorial.

### Creating the Virtual Machine in VirtualBox

Create a regular virtual machine in VirtualBox, using the latest Debian 12 or Ubuntu 22.04 ISOs. Either the [desktop](https://releases.ubuntu.com/22.04/ubuntu-22.04.4-desktop-amd64.iso) or the [server](https://releases.ubuntu.com/22.04/ubuntu-22.04.4-live-server-amd64.iso) edition can be used. To conserve resources, it is recommended to use the server edition of Ubuntu. The following parameters need to be altered:

- Choose `Skip unattended installation` if you want to manually control the deployment process, similar to the default behavior in VirtualBox versions prior to 7.
- Allocate sufficient memory to the virtual machine. 12GB is the minimum amount which will support a complete nmaas installation, along with the possibility for deploying additional applications via the catalog.
- Allocate sufficient number of CPU cores, depending on the performance of your system.
- After the VM has been created, using the `Settings` option, adjust the following parameters:
    - In the `Network` configuration tab make sure to choose the `Bridged` adapter type.
    - If a Desktop version of Ubuntu is being installed, make sure to enable 3D acceleration in the `Display` tab.

### Configuring the Guest Operating System

Once the guest operating system has been installed, it will automatically acquire an IP address from the local DHCP server.

## Kubernetes Cluster Setup

In this section we discuss how to quickly get a Kubernetes cluster up and running using the lightweight K3s Kubernetes distribution.

### Kubernetes Deployment Using K3s

K3s is one of the many options to deploy full-fledged Kubernetes cluster in a matter of minutes. K3s is more lightweight than other Kubernetes distributions since it does not ship with unnecessary modules and is packaged as a single binary. K3s offers seamless scalability across multiple nodes and provides the ability to either use an embedded database for storing the cluster state or a relational one, such as PostgreSQL or MySQL.

- K3s can be installed with the following command:

    ```bash
    export INSTALL_K3S_VERSION=v1.29.7+k3s1
    curl -sfL https://get.k3s.io | sh -s - server \
    --tls-san nmmaas.internal \
    --disable=traefik \
    --flannel-backend=none \
    --disable-network-policy \
    --disable=servicelb \
    --write-kubeconfig-mode 664 \
    --cluster-cidr=10.136.0.0/16
    ```

    - `--tls-san` – can be specified multiple times to add additional names for which the automatically generated Kubernetes API certificates will be valid. If using a static IP address on your VM, make sure to replace the IP address with the IP address of your VM.
    - `--disable=traefik` – Traefik needs to be explicitly disabled since it ships by default with new K3s installations. We will use ingress-nginx as our ingress controller and will install it manually in a later step.
    - `--flannel-backend=none` – Flannel CNI needs to be explicitly disabled, since we will manually install Calico.
    - `--disable-network-policy` – we do not need the default network policy addon that enabled the use of Kubernetes NetworkPolicy objects, since Calico has built-in support for network policies.
    - `--disable=servicelb` – the preconfigured implementation for LoadBalancer service objects should be disabled, since we will manually install MetalLB.
    - `--write-kubeconfig-mode 664` – more permissive permissions are needed for the automatically generated kubeconfig file so that regular users, apart from root, can use the kubectl client as well.
    - `--clister-cidr=10.136.0.0/16` – a free subnet range which will be used as the pod network. Should be written down since it will be required in the Calico deployment as well.

- Another way of providing `kubectl` access to different users is to make a copy of the original kubeconfig file located in `/etc/rancher/k3s/k3s.yaml` into a directory and changing its permissions. Then, by exporting the `KUBECONFIG` environment variable, the kubectl client will be forced to use the newly created configuration:

    ```bash
    export KUBECONFIG=~/.kube/config
    ```

- Our cluster is still not in a Ready state, since we do not have a CNI plugin installed yet.

    ```bash
    kubectl get node -o wide
    ```

#### Addons Setup

##### CNI

- Calico can be manually installed by downloading the manifest file and setting the CALICO_IPV4POOL_CIDR parameter to the value set when deploying K3s.

    ```bash
    kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.1/manifests/tigera-operator.yaml
    mkdir -p ~/nmaas-deployment/manifests/calico
    curl -O --output-dir ~/nmaas-deployment/manifests/calico/ https://raw.githubusercontent.com/projectcalico/calico/v3.28.1/manifests/custom-resources.yaml
    ```

- Edit the downloaded `custom-resources.yaml` file (`~/nmaas-deployment/manifests/calico/custom-resources.yaml`) and change the `cidr` and `encapsulation` properties as below:

    ```yaml
    ...
    cidr: 10.136.0.0/16 # same range as the above K3s command
    encapsulation: VXLAN
    ...
    ```

- Once Calico has been installed, the node should transition to a `Ready` state.

    ```bash
    kubectl get node -o wide
    ```

##### DNS

CoreDNS is installed by default with K3s, so no need for any manual installation or configuration. Once Calico CNI has been deployed and the cluster has entered a `Ready` state, DNS resolution can be tested using the `dnsutil` pod, as described in the official Kubernetes documentation page.

```bash
kubectl apply -f https://k8s.io/examples/admin/dns/dnsutils.yaml
```

Once the Pod enters a ready state, we can open a shell session:

```bash
kubectl exec -it dnsutils -- /bin/sh
ping geant.org
```

##### Storage

An instance of local path provisioner is automatically installed when deploying K3s, which is sufficient for development single-node clusters such as ours.

```bash
# kubectl get storageclass
NAME                   PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
local-path (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   false                  45h
```

##### Helm

To install Helm, we need to first download the latest binary for our architecture and extract it to a location which is in the `PATH` system variable.

- Visit [https://github.com/helm/helm/releases](https://github.com/helm/helm/releases) and copy the download link for the latest release.
- Download the latest release locally

    ```bash
    cd $(mktemp -d)
    wget https://get.helm.sh/helm-v3.15.4-linux-amd64.tar.gz
    tar -xvzf helm-v3.15.4-linux-amd64.tar.gz
    sudo mv helm /usr/local/bin/helm
    sudo chmod +x /usr/local/bin/helm
    ```

- Test whether Helm has been successfully installed by executing `helm version`.

!!! Warning

    For helm to function properly, the `kube.config` file must be copied (or linked) to `~/.kube/config`. This can be done like so:

    ```bash
    ln -s /etc/rancher/k3s/k3s.yaml ~/.kube/config
    ```

##### Ingress Nginx

The last application that needs to be installed before we can move on to installing the nmaas components is Ingress Nginx. Since we have already configured Helm, the Ingress Nginx installation is simple.

- Customize the values.yaml file according to the local environment:

    ```yaml title="ingress-values.yaml"
    defaultBackend:
      enabled: true
    controller:
      hostPort:
        enabled: true
      config:
        log-format-upstream: '{"time": "$time_iso8601", "remote_addr": "$proxy_protocol_addr", "x-forward-for": "$proxy_add_x_forwarded_for", "request_id": "$req_id", "remote_user": "$remote_user", "bytes_sent": $bytes_sent, "request_time": $request_time, "status":$status, "vhost": "$host", "request_proto": "$server_protocol", "path": "$uri", "request_query": "$args", "request_length": $request_length, "duration": $request_time,"method": "$request_method", "http_referrer": "$http_referer", "http_user_agent": "$http_user_agent" }'
      kind: Deployment
      ingressClass: nginx
      scope:
        enabled: false
        namespace: default
      service:
        type: ClusterIP
      metrics:
        enabled: false
    ```

    In our case we have opted to use a Deployment instead of a DaemonSet for the deployment strategy. Additionally, we have selected a service type of `ClusterIP` and enabled `hostPort` so that the ingress controller can be reachable using the VMs LAN IP address. In this way we avoid using LoadBalancer addons, simplifying the single node nmaas deployment.

- Add the `ingress-nginx` Helm repository and install the application:

    ```bash    
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
    kubectl create namespace nmaas-system
    helm install -f ingress-values.yaml --namespace nmaas-system nmaas-ingress ingress-nginx/ingress-nginx
    ```

    We have chosen to install `ingress-nginx` in the `nmaas-system` namespace, which will house all the other nmaas components as well.

    !!! danger "Note About Helm Errors"
        
        When running the helm install command, Helm might throw an error about the cluster being unreachable. This is most likely because Helm looks for the kube.config file in the default location, but `--write-kubeconfig-mode 664` has been specified during the K3s installation, and the actual location is `/etc/rancher/k3s/k3s.yaml`.

        This can be fixed by simply executing:

        ```bash
        export KUBECONFIG='/etc/rancher/k3s/k3s.yaml'
        ```

- We can test the installed ingress by directly visiting the allocated LoadBalancer IP address in a browser. We should be presented with a generic `404-not found` page.

    ```bash
    curl --insecure https://localhost
    curl --insecure https://$VM_IP
    ```