# All-in-one nmaas VM Image

An all-in-one VirtualBox VM image with an installed single node K3s Kubernetes cluster and a deployment of nmaas is available for download. The goal of this image is to be able to get a local nmaas environment suitable for basic experiments as fast as possible. The installed software includes:

- Single node K3s cluster
- GitLab
- nmaas
- Stakater Reloader component for automatic restarting of containers that have mounted a ConfigMap that has changed
- Ingress Nginx

Most notably, the all-in-one VM image does not include a LoadBalancer implementation and it is up to the user to install and configure one. As a result, the deployment of some applications in the catalog that rely on `LoadBalancer` type Services will not work (e.g., PostgreSQL). Users are advised to install [MetalLB manually](https://metallb.universe.tf/installation/) and [configure](https://metallb.universe.tf/configuration/) it depending on their local environment and network setup. 

The access details for the nmaas VM are:
    - OS Login:
        - Username: `nmaas`
        - Password: `password`
    - GitLab
        - Username: `root`
        - Password: `nmaasPassword123`
    - nmaas
        - Username: `admin`
        - Password: `saamn`

The VM image is based on the lightweight Ubuntu distribution Lubuntu and has a full user interface. By default it uses a NAT type VirtualBox adapter, so it can be deployed even in restrictive networks. Access to the GitLab instance, nmaas itself, and any applications deployed from nmaas is possible via the built-in Mozilla Firefox web browser. Upon first launching the browser, the user will see that quick access links are already available for these locations in the bookmark toolbar.
