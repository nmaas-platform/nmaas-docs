---
description: Get started with nmaas by either using one of the managed instances or deploying your own self-hosted instance
---
# Get Started

There are multiple options to get started with using nmaas, depending on the requirements and desired use-case. 

## Managed Instances

If your are part of an organization affiliated with your national NREN (National Research and Education Network), then you can get access to the managed nmaas instances hosted at [https://vnoc.nmaas.eu](https://vnoc.nmaas.eu) for the [vNOC use-case](use-cases/virtual-noc/vnoc-introduction.md) or at [https://vlab.dev.nmaas.eu](https://vlab.dev.nmaas.eu) for the [Virtual Lab use-case](use-cases/virtual-lab/vlab-introduction.md). Please use the contact forms on the respective instances to request access. Should the access request be approved, a dedicated domain will be set up on the appropriate instance. 

- [Request a domain on the vNOC instance for monitoring and management of network equipment](https://vnoc.nmaas.eu/about?type=NEW_DOMAIN_REQUEST)
- [Request a dedicated environment on the Virtual Lab instance for organizing small scale hands-on exercises](https://vlab.dev.nmaas.eu/about?type=VLAB_REQUEST)

## Self-Hosting nmaas

As open-source software, nmaas can be installed in any existing or new Kubernetes cluster either in the cloud or on-premise. Depending on the requirements, nmaas can be deployed in a single node environment for testing purposes or in a production, multi-node, Kubernetes cluster.

### Evaluating nmaas Using a Single-Node Local Cluster

Interested users can test nmaas locally in a VM by deploying a single-node MicroK8s or K3s Kubernetes cluster. A detailed step-by-step guide for deploying a single node Kubernetes cluster, as well as deploying nmaas and its dependencies is available as part of the tutorials given at the [JRES 2022](tutorials-workshops/jres2022/introduction.md) and [JRES 2024](tutorials-workshops/jres2024/introduction.md) conferences.

### Deploying nmaas on a Multi-Node Production Kubernetes Cluster

nmaas can be installed in any existing Kubernetes cluster by using its Helm chart. More information about the installation process, requirements, and configuration options is available in the dedicated [Installation Guide](self-hosted-nmaas/install-guide.md).

## Requesting Help

The nmaas team can be reached using on of the [contact methods](contact.md) in case assistance with an nmaas deployment is required.