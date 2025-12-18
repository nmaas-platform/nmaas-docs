# NMAAS FAQ

The following nmaas-related questions are answered on this page:

- [How can I contact the nmaas Team members?](#how-can-i-contact-the-nmaas-team-members)
- [How can I test nmaas?](#how-can-i-test-nmaas)
- [How can I start monitoring my infrastructure with nmaas?](#how-can-i-start-monitoring-my-infrastructure-with-nmaas)
- [How can I request creation of new nmaas domain for my NREN / Institution / Project?](#how-can-i-request-creation-of-new-nmaas-domain-for-my-nreninstitutionproject)
- [How can I deploy nmaas on my own intrastructure?](#how-can-i-deploy-nmaas-on-my-own-infrastructure)
- [Where can I find nmaas User Guide?](#where-can-i-find-nmaas-user-guide)
- [Where can I find nmaas Administrator Guide?](#where-can-i-find-nmaas-administrator-guide)
- [What applications are currently supported by nmaas?](#what-applications-are-currently-supported-by-nmaas)
- [What type of VPNs are established by nmaas?](#what-type-of-vpns-are-established-by-nmaas)
- [What VPN solutions are supported by nmaas?](#what-vpn-solutions-are-supported-by-nmaas)
- [What are nmaas VPN requirements?](#what-are-nmaas-vpn-requirements)

## How can I contact the nmaas Team members?

The nmaas Team can be contacted either by:
<div style="margin-left: 20px">
<li>contact form available at <a href="http://nmaas.eu/about?type=CONTACT">http://nmaas.eu/about?type=CONTACT</a></li>
<li>email sent to <a href="mailto:nmaas@lists.geant.org">nmaas@lists.geant.org</a></li>
</div>

## How can I test nmaas?

In order to test nmaas you can request an account on either the [managed VNOC instance](https://vnoc.nmaas.eu/about) or the [managed VLAB instance](https://vlab.dev.nmaas.eu/about), depending on the use-case that you are interested in.

## How can I start monitoring my infrastructure with nmaas?
The GÉANT nmaas production service is available at [https://vnoc.nmaas.eu](https://vnoc.nmaas.eu) where users have the possibility to log in with their eduGAIN accounts.

However, in order to be able to deploy network management applications user needs to be assigned to a domain. 

In order to request new dedicated domain creation refer to question <i>"How can I request creation of new nmaas domain for my NREN/Institution/Project?"</i>

## How can I request creation of new nmaas domain for my NREN/Institution/Project?

In order to request a new nmaas domain on the GÉANT production service fill in and submit the form available at [https://vnoc.nmaas.eu/about?type=NEW_DOMAIN_REQUEST](https://vnoc.nmaas.eu/about?type=NEW_DOMAIN_REQUEST).

You will be requested to provide some basic information about the domain to be created and a brief justification of the request.

Your request will be reviewed by the nmaas Team and You will receive a reply as soon as possible.

In case of any issues, You can also email your request directly to nmaas@lists.geant.org.

## How can I deploy nmaas on my own infrastructure?

The complete information about the deployment of nmaas instance is available at [nmaas Installation Guide](self-hosted-nmaas/install-guide.md)).

What are the technical requirement for the underlying nmaas infrastructure?

The complete information about the requirements for the nmaas Kubernetes cluster are available at [nmaas Cluster Requirements](https://wiki.geant.org/display/NMAAS/NMaaS+Cluster+Requirements).

## Where can I find nmaas User Guide?
The nmaas User Guide is available at [nmaas User Guide](guides/user-guide.md).

## Where can I find nmaas Administrator Guide?
The nmaas Administrator guide is under preparation and an initial version is available at [nmaas Administrator Guide](guides/domain-admin-guide.md)

## What applications are currently supported by nmaas?
For the up to date information about the supported applications refer to page nmaas Tools.

It is also possible to browse all the applications in on nmaas Portal directly at [https://vnoc.nmaas.eu](https://vnoc.nmaas.eu).

## What type of VPNs are established by nmaas?
Two types of VPN connections are configured before a user is able to deploy and effectively used nmaas applications:

- **site-to-site VPN** connection as a secure tunnel from the customer's management VLAN to nmaas infrastructure, used for monitoring of the network equipment
- **client-access VPN** used by the network operators, from their own workstations, to access and configure the deployed network management applications within nmaas.

## What VPN solutions are supported by nmaas?
Currently, two site-to-site VPN technologies are actively supported: OpenVPN and WireGuard.

For client-access VPN we are using OpenVPN.

## What are nmaas VPN requirements?
To use nmaas, prospective customers require two VPN connections:

- site-to-site VPN connection, establishing a secure tunnel from the customer's management VLAN to nmaas, used for monitoring of the network equipment
- client-access VPN used by the network operators, from their own workstations, to access and configure the deployed network management applications within nmaas.

Currently, two site-to-site VPN technologies are actively supported: OpenVPN and WireGuard.

More details are available in the subsections below.

<details>
<summary>Site-to-site VPN setup...</summary>
<h3>Site-to-site VPN</h3>
In order to be able to use nmaas, a secure site-to-site tunnel connection is required that will be used for all the monitoring traffic between the network management applications deployed on the nmaas infrastructure and the customer's network devices. As mentioned above, two VPN technologies are currently actively supported for establishing a site-to-site VPN tunnel: OpenVPN and WireGuard. Any one of these can be chosen, depending on the customer's preference or existing networking stack. 
<h4>Required Information</h4>
No matter the chosen VPN technology, the nmaas team requires the following information before VPN connectivity can be established:
<div style="margin-left: 20px">
<li>a list of subnets in your local network that you would like to be reachable from nmaas. This is required so that we can configure the necessary routing rules and policies on our side. Most likely this will be your management VLAN(s)</li>
<li>the public IP of the device that you will use to establish the VPN connection</li>
</div>
If WireGuard is the chosen connection method, then information about the public keys will have to be exchanged between the customer and the nmaas team as well. 
<h4>Establishing the VPN connection</h4>
Once the necessary information has been exchanged, the nmaas team will provision the necessary VPN and the customer will be sent additional information on how to connect to it. This information will include:
<div style="margin-left: 20px">
<li>the VPN tunnel subnet used for interconnecting the customer's site to nmaas</li>
<li>the private subnet that has been assigned to the customer and that will be used as an IP pool for every deployed application through nmaas</li>
<li>a list of additional auxiliary subnets for which the necessary routing information will have to be added by the customer at their end</li>
</div>
If the customer does not have an existing network device that can be used for terminating the VPN connection, then a simple GNU/Linux virtual machine can be deployed, no matter the chosen VPN technology.  This virtual machine will act as a VPN client in terms of the site-to-site tunnel , and as a gateway towards the nmaas infrastructure for all the network devices in the customer's network. The customer must make sure that appropriate routing rules are configured so that traffic destined for the nmaas subnets goes through the VPN client, and not through the default gateway in this scenario.
<br><br>
<div style="border: 2px solid gray; border-radius: 5px; padding: 10px;">
The customer should make sure that the appropriate routing rules are configured in their network so that their VPN client acts as a gateway towards the nmaas' subnets.
</div>
<h4>Testing the VPN connection</h4>
After establishing the VPN connection, the client can perform a simple test to verify that everything is working as expected. The test involves accessing a special IP address on port 80. This special address is customer dependent and will be provided by the nmaas team during the registration process. Any command line utility that can open TCP sessions on an arbitrary port can be used for this test, depending on the platform that you are testing from.
<br>
Note that ICMP and echo requests are not supported on this IP, and ping is not expected to work.
</details>

<details>
<summary>Client-access VPN setup...</summary>
<h3>Client-access VPN</h3>
A client-access VPN connection is used for accessing and interacting with the deployed applications within nmaas. In order to provide greater security and isolation between the customers, by default, all applications deployed by nmaas are accessible only through the respective client-access profiles, and not publicly. However, the option for publicly exposing a given application is also possible. Currently, the preferred way for establishing the client-access connections is by using an OpenVPN tunnel, since it offers stable packages for all major operating systems.
<br>
The only information required before the client-access profiles can be generated is a list of individuals, along with their full names and email addresses that should have access to the new nmaas domain being created.
<h4>Testing the VPN connection</h4>
The client-access connection can be tested in a similar fashion to the site-to-site connection. The operator, after connecting to the nmaas VPN server can simply open a browser and type in the IP address provided by the nmaas team during the registration process.
</details>

<details>
<summary>Required information for the VPN profiles...</summary>
<h3>Required information for the VPN profiles</h3>
In conclusion, accessing nmaas requires two types of VPN connections: a site-to-site, and a client-access. 
<br>
Before the site-to-site profiles can be created, nmaas requires the following information:
<div style="margin-left: 20px">
<li>the public IP of the device that will act as the VPN client</li>
<li>a list of additional auxiliary subnets for which the necessary routing information will have to be added by the customer at their end</li>
</div><br>
Before the client-access profile can be created, the following information is needed:
<div style="margin-left: 20px">
<li>a list of individuals that need access to the applications deployed in the new nmaas domain, including their full names and email addresses.</li>
</div>
</details>
