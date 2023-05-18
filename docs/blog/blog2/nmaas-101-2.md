# [ #002 ] NMaaS-101 - "I can help! But... Please could you open these two doors?"I

n article [#001](./blog/blog1/nmaas-101-1/) your organisation has now a NMaaS domain and you are the domain manager for this domain. 

<div style="border: 3px solid gray; border-radius: 5px; padding-left: 20px;">

<h3 style="margin: 0.6em 0 0.4em;">Requirements</h3>
<li>Use existing or deploy out of band management VLAN dedicated to your equipment</li> 
<li> Use existing or deploy an OpenVPN client on a separate server or VM</li>
<li> Knowledge to implement OpenVPN tunnels</li>

</div>


## Overview

As it is now NMaaS is pretty useless for your organisation even if you deploy myriads of network management applications, and this is for 2 reasons:

1. There is no particular connectivity enabling communication between NMaaS and the equipment to be supervised in your network.
2. There is no particular connectivity enabling communication between your laptop and NMaaS network management application GUI.


## Article objective

In this article, we will expose what is needed in order to enable communication between the NMaaS service and your equipment in your network and what is the process to configure your VPN client in order to use NMaaS services.

Let's take the example of the RARE domain, described in article [#001](./blog/blog1/nmaas-101-1/), the objective is to:

- Check that you have an out of band management network enabling reachability to all your equipment
- Provide information required by the NMaaS team (list of users and also the internal out of band management subnet)
- Use existing or deploy a new OpenVPN client that has network reachability to the network above
- Establish a site to site OpenVPN tunnel towards the NMaaS OpenVPN server using the site to site OpenVPN profile (coming from the NMaaS team based on the information you provide)
- Configure a client to site OpenVPN tunnel towards the NMaaS OpenVPN server using the client to site OpenVPN profile (coming from the NMaaS team based on the information your provide)


## Diagram

#### RARE lab

![Diagram](img/blog-nmaas-101-2-1.png)

The picture above depicts the four p4 switches connected by 10G circuit on top of GÉANT backbone. Each switch has:

- One console port (aka BMC port) connected to an equipment it slef connected to DSL (ISDN or even RTC) broadband network management network
- Ethernet management port connected to the P4 Lab out of band management network. 

## [ #002 ] - Cookbook

<details>
<summary>Pré-requisites</summary>
<li> Network Administration knowledge </li>
If this management network does not exist beforehand, you should be able to implement or have it implemented by your network operation team. 

<li> Network Management network isolation </li>
This management network should be only used to convey network management traffic (i.e. no user traffic or user interaction). This is also called a Data Communication Network (<b>DCN</b>).
</details>

<details>
<summary>P4 switches out of band network management VPN</summary>
<img src="../img/blog-nmaas-101-2-2.png" width="550">
<p style="margin-top: 15px">
In the RARE network example, this network is a multipoint to multipoint L2 VPLS implemented on top of GÉANT backbone by GEANT OC team. All the switches have their management Ethernet ports connected to this VPLS MPLS VPN.
</p>

<div style="border: 3px solid lightyellow; border-radius: 5px; padding-left: 20px; margin-bottom: 20px">
In this particular case, the P4 Lab network span multiple countries, hence the VPLS implementation, it could have been a full mesh of L2VPN point to point tunnels or a L2 EVPN. Most of the case, in your organisation, the OOBM network is a simple 802.1q VLAN that spans your internal L2 network.

</div>
</details>

<details>
<summary>Required information for RARE support team</summary>
<li>Equipment IPv4 subnet</li>
In the example, all switches can be reached via their management ports inside 172.16.66.6.0/24 network in the VPLS VPN. This is required so that the NMaaS team can configure the proper routing within the NMaaS environment.

<li>List of users</li>
This includes the names and email addresses of the users that should be granted access. The NMaaS team uses this information to provision the VPN connection and to generate the necessary site-to-site and client-access VPN profiles.

</details>

<details>
<summary>How this information is used by the RARE support team</summary>
<li>Equipment IPv4 subnet</li>
This information will be configured at NMaaS VPN server level in order to enable routing between NMaaS service and the network used to manage your equipment.

<li>List of users</li>
This information will be used to create your OpenVPN profile. One profile specific to user.
</details>

<details>
<summary>Deploy an OpenVPN client in your out of band management VPN</summary>
<img src="../img/blog-nmaas-101-2-3.png" width="550">
In the RARE network example, the VPN client is a PfSense firewall using the built-in OpenVPN plugin to establish the site-to-site VPN connection between the management subnet and the NMaaS network.
<div style="border: 3px solid lightyellow; border-radius: 5px; padding-left: 20px; margin-bottom: 20px">
Once deployed you'll have to use the site to site OpenVPN profile provided by the NMaaS team in order to setup up the DCN VPN tunnel towards the NMaaS VPN server.
</div>

Once setup, you should have a full connectivity between the equipment and all the NMaaS services deployed in your domain.

<div style="border: 3px solid lightyellow; border-radius: 5px; padding-left: 20px; margin-bottom: 20px">
Your namespace is implemented inside a namespace that is specific to your domain, and your domain only. All domains are isolated between each other via this concept. This ensures that only people from your organization have access to your resources along with the deployed applications in the NMaaS environment.
</div>


</details>

<details>
<summary>Configure yout OpenVPN client on your laptop using provided NMaaS profile</summary>
<img src="../img/blog-nmaas-101-2-4.png" width="550">

Once setup, you should have a full connectivity between your laptop and all the NMaaS services deployed in your domain.

<div style="border: 3px solid lightyellow; border-radius: 5px; padding-left: 20px; margin-bottom: 20px">
Your namespace is implemented inside a namespace that is specific to your domain, and your domain only. All domains are isolated between each other via this concept. This ensures that only people from your organization have access to your resources along with the deployed applications in the NMaaS environment.
</div>



</details>