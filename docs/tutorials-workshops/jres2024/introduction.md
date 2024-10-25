# JRES 2024

The nmaas Platform is a versatile open-source software that can be installed in any Kubernetes cluster, providing an easy-to-use multi-tenant environment for application deployment. With the latest introduced features, it is now also possible to use it for organizing hands-on virtual lab exercises in an education context. The aim of this tutorial is to showcase in detail how nmaas can be used for this new use-case, highlighting the core feature that make it possible. 

This tutorial is organized as follows:

- [Part 1](./p1_vlab-bulk-registration.md) showcases the steps that a virtual lab manager needs to take to create a new domain group and to register new lab participants in bulk.
- [Part 2](./p2_domain-groups-customization.md) is dedicated to the customization of the newly created domain group and the process of whitelisting applications for deployment is also presented.
- [Part 3](./p3_deploying-the-first-app.md) is focused on the lab participants' experience and provides an overview of the required steps for deploying a new application.
- [Part 4](./p4_complete-web-dev-vlab-scenario.md) provides an alternative approach to application deployments, where instead of the lab participants deploying the instances themselves, a virtual lab manager deploys them in bulk. With this approach it is also possible to share access details outside of nmaas, using a third-party system such as a learning management system (LMS).
- [Part 5](./p5_vlab-bulk-app-deployment.md) ties all of the previously showcased concepts together, providing a full featured demo of how a virtual lab centered around a web development course can be organized using nmaas.

To follow the tutorial access to an nmaas instance is required. This can be accomplished in multiple ways:

- By [deploying a local Kubernetes cluster](../deploying-local-kubernetes-cluster.md) and then [deploying an nmaas test instance](../deploying-nmaas-test-instance.md) in it.
- By requesting access to the [vlab.dev.nmaas.eu](https://vlab.dev.nmaas.eu) managed instance via the [contact form](https://vlab.dev.nmaas.eu/about?type=VLAB_REQUEST).
- By deploying nmaas on existing infrastructure, spanning multiple nodes (production grade setup).
- By downloading the ready-made all-in-one nmaas test VM image. Please note that this VM image does not have a `LoadBalancer` implementation installed and it is up to the user to install and configure one. More details about the all-in-one nmaas image are available on the [corresponding docs page](../all-in-one-vm-image.md).

!!! note 
    All JRES 2024 participants attending the tutorial live during the conference will get access to the [vlab.dev.nmaas.eu](https://vlab.dev.nmaas.eu) instance. More information and instructions will be provided on-site.
