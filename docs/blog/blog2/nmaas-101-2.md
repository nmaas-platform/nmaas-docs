# [ #002 ] NMaaS-101 - "I can help! But... Please could you open these two doors?"I

In article [#001](https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview) your organisation has now a NMaaS domain and you are the domain manager for this domain. 

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

Let's take the example of the RARE domain, described in article [#001](https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview), the objective is to:

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

<div style="border: 3px solid #fcfc91; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #ffffd1">
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
<div style="border: 3px solid #fcfc91; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #ffffd1">
Once deployed you'll have to use the site to site OpenVPN profile provided by the NMaaS team in order to setup up the DCN VPN tunnel towards the NMaaS VPN server.
</div>

Once setup, you should have a full connectivity between the equipment and all the NMaaS services deployed in your domain.

<div style="border: 3px solid #fcfc91; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #ffffd1">
Your namespace is implemented inside a namespace that is specific to your domain, and your domain only. All domains are isolated between each other via this concept. This ensures that only people from your organization have access to your resources along with the deployed applications in the NMaaS environment.
</div>


</details>

<details>
<summary>Configure yout OpenVPN client on your laptop using provided NMaaS profile</summary>
<img src="../img/blog-nmaas-101-2-4.png" width="550">

Once setup, you should have a full connectivity between your laptop and all the NMaaS services deployed in your domain.

<div style="border: 3px solid #fcfc91; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #ffffd1">
Your namespace is implemented inside a namespace that is specific to your domain, and your domain only. All domains are isolated between each other via this concept. This ensures that only people from your organization have access to your resources along with the deployed applications in the NMaaS environment.
</div>



</details>

## Verification

<details>
<summary>Check that your NMaaS domain is created and that you are the Domain Manager for your organization</summary>
In order to test your site-to-site VPN connectivity you can execute the following steps:

1. Try to access your private reverse proxy that will be responsible for providing web access to network management services deployed inside your NMaaS domain. You can first test the access to this proxy from your VPN concentrator. The IP address will be provided to you by the NMaaS team during the on-boarding process.
   1. Ensure that the correct routing table entries have been pushed to your concentrator during the VPN connection phase.
2. Try to access the same reverse proxy but this time from one of your client devices that you expect to be managed by NMaaS. In order for this test to work, you will have to configure the required routes on your devices so that traffic destined for NMaaS goes through your VPN concentrator. If you use the same device acting as a VPN concentrator as your default gateway in your network, then you are all set; if not, routing entries will have to be manually added or pushed to your client devices. Depending on the software being used on the VPN concentrator, the methods for configuring it as a router so that it will accept transit traffic will vary. The most common scenario, using a simple Linux VM would require enabling the ip forwarding option on your system and setting the necessary iptables FORWARDING rules.

Once setup, you should have a full connectivity between your laptop and all the NMaaS services deployed in your domain.

<div style="border: 3px solid #fcfc91; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #ffffd1">
<h4>Note on GUI-less devices</h4>
<p>Since it is expected that most of your devices that you would like to manage are only providing console access, reachability of the reverse proxy can be tested with various tools, such as curl https://<PROVIDED_IP_ADDRESS> or even establishing a TCP session to port 443 using the built-in telnet client: telnet <PROVIDED_IP_ADDRESS> 443. 

The telnet approach is expected to be more widely used since the majority of the devices in use today have a telnet client available.</p>
</div>

The same steps as above can be used to verify that you have access to your dedicated NMaaS domain while connected from your workstation using the client-to-site VPN. The reverse proxy IP address remains the same, and you can open your browser and navigate to the provided IP address where you should be greeted with a 404 HTTP page.

Congratulations! From this point on:

<li>You should have enabled full connectivity between your equipment and NMaaS service </li>
<li>You should have access to NMaaS service user interface via an interactive client to site OpenVPN access.</li>


</details>

<div style="border: 3px solid #fc7a7a; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #fdd7d7">
<h4>Note on GUI-less devices</h4>
<p>Since it is expected that most of your devices that you would like to manage are only providing console access, reachability of the reverse proxy can be tested with various tools, such as curl https://<PROVIDED_IP_ADDRESS> or even establishing a TCP session to port 443 using the built-in telnet client: telnet <PROVIDED_IP_ADDRESS> 443. 

The telnet approach is expected to be more widely used since the majority of the devices in use today have a telnet client available.</p>
</div>

## Conclusion

After performing all of the above steps you should be ready to deploy your first NMaaS application and start managing your network! We will see in the next article how to deploy our first NMaaS service and consider oxidized [CMDB](https://en.wikipedia.org/wiki/Configuration_management_database) software.

In this article you:

- Had a brief explanation regarding the mandatory connectivity required by NMaaS
- One is a permanent connectivity between the OOBM network and NMaaS services in which only network management information is conveyed, also called a Data Communication Network (DCN).
- The second one is an on demand connectivity enabled by an interactive VPN access.


<div style="border: 3px solid #9ef6a6; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #dbeed1">
<h4>[ #002 ] NMaaS-101 - key take-away
</h4>
<li>An existing OOBM network has to be implemented</li>
<li>PfSense/OpenVPN is used as OpenVPN server, you can also deploy a OpenVPN client</li>
<li>This manual step is a bit tedious but the good news is that it has to be configured only once. Once OpenVPN accesses are setup, they are valid for all NMaaS services available in the catalog.</li>

</div>