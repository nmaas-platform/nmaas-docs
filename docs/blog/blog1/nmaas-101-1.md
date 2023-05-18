# [ #001 ] NMaaS-101 - "Hello NMaaS !"

The main objective **[NMaaS 101]** series is to help you to get started with NMaaS service without any prior knowledge.

<div style="border: 3px solid gray; border-radius: 5px; padding-left: 20px;">

<h3 style="margin: 0.6em 0 0.4em;">Requirements</h3>
<li>Having an eduGain account</li> 
<li> Identified as NMaaS Domain Manager on behalf of your organisation</li>
<li> If you are not an NREN, have your local NREN endorsement for using NMaaS</li>

</div>

## Overview

Network Management as a Service (NMaaS) is a GÉANT service proposed to R&E institutions. It proposes the opportunity for any R&E organisation to subscribe and deploy Network Management tools in a cloud environment via an intuitive web portal. Most of GÉANT members have their own network management software suite. Some encompasses off the shelf tools, but others are using Open Source tools as per the [last SIG-NOC tools report](https://wiki.geant.org/display/SIGNOC/SIG-NOC+Tools+Survey+2019). But all the ~40 GÉANT community members are not equal in that perspective. Some have a fully integrated sophisticated network management system, usually sophistication implies also "home made" and some small NRENs have difficulties to maintain existing systems.

NMaaS target customer audience is:

- Small and Emerging NRENs

  Smaller NRENs may have **limited resources** to develop their own NMS

  By using a **shared and supported platform**, NRENs can focus on the monitoring and management of their service components

- Campuses

  NMaaS platform is ideally suited for **Campus Network Management**

- Small Organisations

  NMaaS supports the needs of institutional users, either on an NREN managed NMaaS platform or the centralised GÉANT platform.

- Distributed research projects

  It can be a global research project like LSST, SKA, JIVE etc. In our case I'll expose you the particular case of RARE, which is a GN4-3 research project.


<div style="border: 3px solid gray; border-radius: 5px; padding-left: 20px; background-color: #fcfcfc;">

<h3> Rare project brief description </h3>

<a href="https://wiki.geant.org/display/RARE">RARE</a> (<b>R</b>outer for <b>A</b>cademia, <b>R</b>esearch & <b>E</b>ducation) is an ongoing effort under the <a href="https://www.geant.org/Projects/GEANT_Project_GN4-3">GÉANT 3<sup>rd</sup> programme</a> which focus on determining if a routing software platform solution can fit R&E use cases. The project aims to integrate different pieces of software related to these building blocks:

<li> <b>control plane: RARE</b> uses <a href="http://freerouter.nop.hu/">FreeRouter</a> under the hood used as the control plane component </li>
<li> <b>data plane:</b> <a href="https://p4.org/">P4</a> is used to describe the behavioral model of <b>RARE</b> data plane </li>
<li> and <b>communication interface</b> between the control plane and data plane: Interface compliant to <a href="https://github.com/p4lang/p4runtime"> P4Runtime</a> specification ensure this function </li>

In order to validate the code produced by the RARE team we deployed a P4 Lab distributed aming various European countries:

<img src="../img/blog-nmaas-101-1-1.png" width="550">
 
<li> NMaaS is used as the platform to supervise all the P4 switches deployed in this Testbed.</li>
<li> We will see in subsequent articles how NMaaS platform proposition value is helping the RARE team to deploy and use Network Management Application.</li>
<li> NMaaS flexibility concept, enabled us to add supervision tools following KISS approach. </li>
<li> The NMaaS platform is step by step is becoming a turn key solution for P4 switch network monitoring and supervision.</li>

</div>


## Article objective

This article is meant to guide you and provide you the very first mandatory steps in order to create a NMaaS domain for your organization.

Let's take the example of the RARE domain, the objective is to:

- Explain how to trigger a domain creation
- How to access it

In the end you should have access the NMaaS portal specifically dedicated to your organization. i.e. your organization NMaaS domain.

## Diagram

![Diagram](img/blog-nmaas-101-1-2.png)


## [ #001 ] - Cookbook
<details>
<summary>Pré-requisites</summary>

<li> eduGain R&E IDP </li>
  
<div style="margin-left: 20px">
Your organization should be part of the eduGain R&E federated Identity provider.
</div>
<li>Designated as NMaaS domain manager internally by your organisation</li>
<div style="margin-left: 20px">
  Usually, this is CIO role, but at least you should have been granted the privileges to deploy applications on behalf of your institution.
</div>

</details>

<details>
<summary>First time login to nmaas.eu</summary>
<p>
<li> Via your favorite browser, go to nmaas.eu, you should be granted by a welcome page:</li>

<img src="../img/blog-nmaas-101-1-3.png" width="550">
<p>
<li> Click on "Login / Register" button and then "Federated login" </li>

<img src="../img/blog-nmaas-101-1-4.png" width="550">
<p>
<li> You should be now familiar with eduGain authentication system</li>

<img src="../img/blog-nmaas-101-1-5.png" width="550">
<p>
<li> You should be now familiar with national eduGain authentication system</li>

<img src="../img/blog-nmaas-101-1-6.png" width="550">
<p>
<li> During first login you are asked to submit additional account information and login again</li>

<img src="../img/blog-nmaas-101-1-7.png" width="550">
<p>
<li> At this point you should now have access to NMaaS portal but with no domain</li>

<img src="../img/blog-nmaas-101-1-8.png" width="550">
<p>
<li> At that precise point your connection attempt is logged by the NMaaS team and your email contact associated to your eduGain account</li>
<li> The final step is to send a mail to <a href="mailto:nmaas@lists.geant.org">nmaas@lists.geant.org</a> </li>

<p>
This mail should briefly present your organisation, eventually your project, mention the domain name (like RARE in my case) and have the endorsement of your local NREN.
<p>
With these information the NMaaS team should be able to:
<p>
<li> create the NMaaS domain you specified in your request </li>
<li> associate your eduGain account as Domain manager for your organisation </li>

</details>

## Verification

<details>
<summary>Check your NMaaS domain is created and that you are Domain manager for your organization</summary>

<img src="../img/blog-nmaas-101-1-9.png" width="550">

Congratulations! Your organisation has now a NMaaS domain and you are Domain manager for your organisation !

</details>




## Conclusion

In this article you:

- Had a brief introduction to the mandatory steps to complete in order to obtain a NMaaS domain
- NMaaS is for organisation that would like to outsource their network management maintenance activity
- As NRENs, we have the possibility to publish application via NMaaS portal
- NMaaS presents a community aspect where sharing knowledge and experience is at the heart of the concept

<div style="border: 3px solid #91c89c; border-radius: 5px; padding-left: 20px; background-color: #f3f9f4">

<h3> [ #001 ] NMaaS-101 - key take-away </h3>

<li> NMaaS is a way to subscribe and deploy easily Network Management application (for now) in the cloud
<li> NMaaS customer targets are small, medium R&E institutions that would like to outsource their network management</li> 
<li> Your organisation must have an eduGain Identity Provider</li> 
</div>
