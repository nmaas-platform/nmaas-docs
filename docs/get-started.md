---
description: Get started with nmaas by either using one of the managed instances or deploying your own self-hosted instance
---
# Get Started

There are multiple options to get started with using nmaas, depending on the requirements and desired use-case. 

## Managed Instances

If you are part of an organization affiliated with your national NREN (National Research and Education Network), then you can get access to the managed nmaas instances. The GÉANT project offers two managed instances of nmaas, dedicated to specific use-cases:

- nmaas Virtual NOC managed instance hosted at [https://vnoc.nmaas.eu](https://vnoc.nmaas.eu)
- nmaas Virtual Lab managed instance hosted at [https://vlab.dev.nmaas.eu](https://vlab.dev.nmaas.eu) 

### The Virtual NOC Managed Instance

The [nmaas Virtual NOC managed instance](https://vnoc.nmaas.eu) is aimed at NRENs or NREN end-institutions and provides an effortless way of getting started with basic network monitoring and management. Potential users can request on-boarding into the nmaas Virtual NOC managed instance by filling out the [New domain request](https://vnoc.nmaas.eu/about?type=NEW_DOMAIN_REQUEST) form.

### The Virtual Lab Managed Instance

The [nmaas Virtual Lab managed instance](https://vlab.dev.nmaas.eu) acts as a demo environment for testing features enabling the Virtual Lab use-case. It can support small-scale exercises with up to around 20 students. In the case of bigger courses, institutions are encouraged to deploy a nmaas instance locally, on their own infrastructure. Interested users in evaluating nmaas Virtual Lab on the managed instance can request nmaas team assistance by filling out the [vLAB request](https://vlab.dev.nmaas.eu/about?type=VLAB_REQUEST) form.

## Self-Hosting nmaas

As open-source software, nmaas can be installed in any existing or new Kubernetes cluster either in the cloud or on-premise. Depending on the requirements, nmaas can be deployed in a single node environment for testing purposes or in a production-grade, multi-node, Kubernetes cluster.

### Evaluating nmaas Using a Single-Node Local Cluster

Interested users can test nmaas locally in a VM by deploying a single-node MicroK8s or K3s Kubernetes cluster. A detailed step-by-step guide for deploying a single node Kubernetes cluster, as well as deploying nmaas and its dependencies is available as part of the tutorials given at the [JRES 2022](tutorials-workshops/jres2022/introduction.md) and [JRES 2024](tutorials-workshops/jres2024/introduction.md) conferences.

### Deploying nmaas on a Multi-Node Production Kubernetes Cluster

nmaas can be installed in any existing Kubernetes cluster by using its Helm chart. More information about the installation process, requirements, and configuration options is available in the dedicated [Installation Guide](self-hosted-nmaas/install-guide.md).

## Requesting Help

The nmaas team can be reached using one of the [contact methods](contact.md) in case assistance with a nmaas deployment is required.
