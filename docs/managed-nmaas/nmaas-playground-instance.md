# NMaaS Playground Instance

## Introduction

NMaaS Playground is an NMaaS central installation that can be used by anyone interested in testing latest versions of NMaaS.

It is available at [https://nmaas.geant.org](https://nmaas.geant.org). 

NMaaS Playground is deployed on GÉANT's infrastructure and is maintained by the NMaaS Team.

Any questions or requests related with using the NMaaS Playground should be directed to [nmaas@lists.geant.org](mailto:nmaas@lists.geant.org).

It is important to note that the NMaaS Playground is tailored to enable users to browse and deploy NMaaS tools right away without any unnecessary overhead. However, this implies that the user isolation, access and data security rules applied on this NMaaS installation are not so strict as in the case of the official NMaaS production service (e.g. no dedicated VPNs are deployed).

!!! warning Usage Disclaimer
    NMaaS Playground should be used only for testing purposes and not for monitoring of actual user equipment

For any information on how to use NMaaS refer the official NMaaS User Guide.

## Accessing the Playground

In order to use the Playground a new user should either fill in the registration form to create a local account in the system or use the Federated login option.

In both cases, the system administrator will have to manually add the new user to a Test domain that is pre-configured in the system.

NMaaS domain corresponds to an institution, team or project (e.g. NREN, end institution, team within the GÉANT Project) whose users will be able to deploy instances of tools available in the NMaaS portfolio in order to manage and/or monitor the equipment within that domain.

## Deploying NMaaS Tools

The main purpose of using the NMaaS Playground is to deploy and access test instances of NMaaS Tools. From more information about the tools currently supported by NMaaS refer to [the application list](../nmaas-applications/application-list.md).

Running a network management tool without any equipment that can be monitored would not present the full potential of NMaaS. Therefore a virtual user network with various types of devices has been deployed and connected to the Test domain.

While deploying a tool in the NMaaS Playground users can choose any subset of available devices to be monitored.

The following table presents all the equipment available in the virtual user network together with any relevant information that later on needs to be provided in the configuration wizard during deployment of particular tool.

For example when deploying new instance of the Oxidized application, the user will be asked to provide a list of IP addresses of devices to be interrogated and the SSH username and password to be used for accessing them. 

| Device Identifier | Device Type               | IP Address/URL | SSH Username/Password     | SNMP Version/Community |
|-------------------|---------------------------|----------------|---------------------------|------------------------|
| ...               | ...                       | ...            | ...                       | ...                    |
| vmx-31            | Virtual Juniper MX Router | 10.0.0.31      | `geant` / `geant123`      | v2c / `nmaas-public`   |
| vmx-c1            | Virtual Juniper MX Router | 10.0.0.1       | `geant` / `geant123`      | v2c / `nmaas-public`   |
| vmx-c2            | Virtual Juniper MX Router | 10.0.0.2       | `geant` / `geant123`      | v2c / `nmaas-public`   |

## Demo Instances of NMaaS Applications

A set of tools have been deployed by default in the Test domain and configured to monitor the resources of the virtual user network and servers.

Those tools are run for demo purposed and are reachable over the Internet. In the production setup, the user web interface of any deployed tool is only accessible from within a dedicated user VPN.

| Application | URL                                     | Login Credentials                        | Comments                                                                                                         | SNMP Version/Community |
|-------------|-----------------------------------------|------------------------------------------|------------------------------------------------------------------------------------------------------------------|------------------------|
| Oxidized    | https://oxi-virt-1.test.nmaas.geant.org | `admin`/`oxidized`                     | Configured 16 Juniper vMX routers which configuration is being backed up                                           | v2c / `nmaas-public`   |
| LibreNMS    | https://lib-virt-1.test.nmaas.geant.org | `admin`/`librenms`                     | Polling information from 16 routers                                                                                | v2c / `nmaas-public`   |
| Prometheus  | https://pro-virt-1.test.nmaas.geant.org | `admin`/`prometheus`                   | Added 3 target virtual machines with node exporter installed                                                       | v2c / `nmaas-public`   |
| Grafana     | https://gra-virt-1.test.nmaas.geant.org | `admin`/`grafana`                      | The `pro-virt-1` Prometheus instance is configured as data source. Default dashboard or node exporters is added.   |                        |
| Booked      | https://booked.test.nmaas.geant.org     | `admin`/`booked`                       |                                                                                                                    |                        |

## Gallery

![Oxidized example](./img/managed-nmaas-s01.png){ width="350" }
![LibreNMS example](./img/managed-nmaas-s02.png){ width="350" }
![Prometheus example](./img/managed-nmaas-s03.png){ width="350" }
![Grafana example](./img/managed-nmaas-s04.png){ width="350" }
![Booked example](./img/managed-nmaas-s05.png){ width="350" }
![SPA example](./img/managed-nmaas-s06.png){ width="350" }