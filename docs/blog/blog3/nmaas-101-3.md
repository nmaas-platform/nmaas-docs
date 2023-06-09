# [ #003 ] NMaaS-101 - "My name is Oxidized and I'm a nifty configuration management tool"

In article [#001](https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview) and [#002](https://docs.nmaas.eu/blog/blog2/nmaas-101-2/#overview) you essentially created a NMaaS domain and enabled connectivity between your dedicated and isolated domain to your out of band management equipment network.

<div style="border: 3px solid gray; border-radius: 5px; padding-left: 20px;">

<h3 style="margin: 0.6em 0 0.4em;">Requirements</h3>
<li>Completed #001</li> 
<li>Completed #002</li>
<li>Basic knowledge related to configuration management</li>

</div>

## Overview

We are going to deploy our first NMaaS service for your organisation: Oxidized

## Article objective

This is done in 2 steps:

- Oxidized application deployment via the NMaaS portal
- Oxidized configuration specific to RARE domain

## Diagram

NMaaS portal: Oxidized
![Diagram](img/blog-nmaas-101-3-1.png)

## [#003] - Cookbook

??? Pré-requisites

    - Having completed [#001](https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview)
    - Having completed [#002](https://docs.nmaas.eu/blog/blog2/nmaas-101-2/#overview)

<details>
<summary>Pré-requisites</summary>
<li> Having completed <a href="https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview">#001</a> </li>

<li> Having completed <a href="https://docs.nmaas.eu/blog/blog2/nmaas-101-2/#overview">#002</a></li>
</details>

<details>
<summary>Oxidized application deployment</summary>
<li>Once your domain is created and associated to your account, log into <a href="https://nmaas.eu">https://nmaas.eu</a> as in <a href="https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview">#001</a>  </li>

<li>select Oxidized application </li>

<img src="../img/blog-nmaas-101-3-2.png" width="550">

<li>select "Deploy" </li>

<img src="../img/blog-nmaas-101-3-3.png" width="550">

<li>choose a name for your service instance, in our case we chose: "p4-oxi-srv" </li>

<img src="../img/blog-nmaas-101-3-4.png" width="550">


<div style="border: 3px solid #fcfc91; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #ffffd1">
The name has a particular importance as it will dynamically create a FQDN for the NMaaS service in the form: <b><service_name>.<domain>.nmaas.eu </b>

In my example it is: <b>oxidized.rare.nmaas.eu</b>
</div>

<li>fill in the mandatory basic configuration information</li>

<img src="../img/blog-nmaas-101-3-5.png" width="550">

<div style="border: 3px solid #fcfc91; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #ffffd1">
<li>Oxidized access username</li>
we chose: oxidized

<li>Oxidized access password</li>
we chose: oxidized

<li>Device access username (login used by Oxidized to access the equipment via SSH)</li>
we chose: rare

<li>Device access password (password used to access the equipment via SSH)</li>
we chose: rare

<li>Device (IP address)</li>
we chose: 172.16.26.103,172.16.26.105,172.16.26.108,172.16.26.109 

</div>

<div style="border: 3px solid #fc7a7a; border-radius: 5px; padding-left: 20px; margin-bottom: 20px; margin-top: 15px; background-color: #fdd7d7">
<h4>VPN Connectivity Warning</h4>
<p> It is important to note that you'll be connected inside a dedicated VPN so you'll be isolated from the outside world as if you were running your own Out of band management network. So we can assume that your domain is secured.</p>
</div>

<li>Congratulation. You should have completed Oxidized deployment</li>

<img src="../img/blog-nmaas-101-3-6.png" width="550">


</details>

<details>
<summary>Oxidized application specific configuration</summary>

In the RARE domain we had a specific requirement that requires a specific profiles for the RARE network equipment.

We are using then NMaaS configuration feature (also refer to NMaaS configuration process), which actually will provide us the way to alter Oxidized configuration software.
<li>From the NMaaS portal service instance page select "Update configuration" button </li>

<img src="../img/blog-nmaas-101-3-7.png" width="550">

<li>you should be provided a git command that will let you clone your Oxidized NMaaS configuration repository</li>

<img src="../img/blog-nmaas-101-3-8.png" width="550">



</details>

