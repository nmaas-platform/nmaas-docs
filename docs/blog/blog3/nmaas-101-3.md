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



??? Oxidized application deployment

    - Once your domain is created and associated to your account, log into [https://nmaas.eu](https://nmaas.eu) as in [#001](https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview)
    - select Oxidized application 

    ![Select Oxidized](img/blog-nmaas-101-3-2.png)

    - select "Deploy" 

    ![Deploy](img/blog-nmaas-101-3-3.png)

    - choose a name for your service instance, in our case we chose: "p4-oxi-srv"

    ![Instance](img/blog-nmaas-101-3-4.png)


    !!! warning ""

        The name has a particular importance as it will dynamically create a FQDN for the NMaaS service in the form: **<service_name>.<domain>.nmaas.eu** In my example it is: **oxidized.rare.nmaas.eu**

    - fill in the mandatory basic configuration information

    ![Configuration](img/blog-nmaas-101-3-5.png)

    !!! warning ""

    - Oxidized access username
        \we chose: oxidized

    - Oxidized access password
        \we chose: oxidized

    - Device access username (login used by Oxidized to access the equipment via SSH)
        \we chose: rare

    - Device access password (password used to access the equipment via SSH)
        \we chose: rare

    - Device (IP address)
        \we chose: 172.16.26.103,172.16.26.105,172.16.26.108,172.16.26.109 

    !!! error "VPN Connectivity Warning"

        It is important to note that you'll be connected inside a dedicated VPN so you'll be isolated from the outside world as if you were running your own Out of band management network. So we can assume that your domain is secured.

    - Congratulation. You should have completed Oxidized deployment

    ![Configuration](img/blog-nmaas-101-3-6.png)



??? Oxidized application specific configuration

    In the RARE domain we had a specific requirement that requires a specific profiles for the RARE network equipment.

    We are using then NMaaS configuration feature (also refer to NMaaS configuration process), which actually will provide us the way to alter Oxidized configuration software.

    - From the NMaaS portal service instance page select "Update configuration" button </li>

    ![Deploy](img/blog-nmaas-101-3-7.png)

    - you should be provided a git command that will let you clone your Oxidized NMaaS configuration repository

    ![Deploy](img/blog-nmaas-101-3-8.png)

    ``` terminal title="From a terminal, clone oxidized configuration repository"
    cd rare-oxidized-210
 
    ls -l
    total 0
    drwxr-xr-x  4 loui  staff  128 Jul 30 11:10 base
    drwxr-xr-x  4 loui  staff  128 Jul 30 11:13 model
    ```




