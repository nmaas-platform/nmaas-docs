# [ #004 ] NMaaS-101 - "Prometheus"

In article [#001](https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview) and [#002](https://docs.nmaas.eu/blog/blog2/nmaas-101-2/#overview) you essentially created a NMaaS domain and enabled connectivity between your dedicated and isolated domain to your out of band management equipment network.

<div style="border: 3px solid gray; border-radius: 5px; padding-left: 20px;">

<h3 style="margin: 0.6em 0 0.4em;">Requirements</h3>
<li>Completed #001</li> 
<li>Completed #002</li>
<li>Basic knowledge related to configuration management</li>

</div>

## Overview

In this post, we are going to deploy an interesting and popular Metric collector in the micro-service world: Prometheus. For those who would like an introduction to Prometheus, please refer to this [post](https://wiki.geant.org/pages/viewpage.action?pageId=154995651) from the [RARE project blog](https://wiki.geant.org/pages/viewrecentblogposts.action?key=RARE).

## Article objective

This is done in 2 steps:

- Prometheus application deployment via the NMaaS portal
- Prometheus configuration specific to RARE domain  

## Diagram

NMaaS portal: Oxidized
![Diagram](img/blog4-1.png)

## [#003] - Cookbook

??? note "Pré-requisites"

    - Having completed [#001](https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview)
    - Having completed [#002](https://docs.nmaas.eu/blog/blog2/nmaas-101-2/#overview)

??? note "Prometheus application deployment"

    - Once your domain is created and associated to your account, log into [https://nmaas.eu](https://nmaas.eu) as in [#001](https://docs.nmaas.eu/blog/blog1/nmaas-101-1/#overview)
    - select Prometheus application 

    ![Select Oxidized](img/blog4-1.png)

    - select "Deploy"

    ![Instance](img/blog4-2.png)

    - choose a name for your service instance, in our case we chose: "prm"

     !!! warning ""

        The name has a particular importance as it will dynamically create a FQDN for the NMaaS service in the form: **<service_name>.<domain>.nmaas.eu** In my example it is: **prm.rare.nmaas.eu**

    - Click on configure (blue bottom on the lefthand side) information

    ![Instance](img/blog4-3.png)

    ![Instance](img/blog4-4.png)

    !!! warning ""
        
        - Prometheus access username

            we chose: **prometheus**

        - Prometheus access password

            we chose: **prometheus**

        - Global scrape
        
            As per [RARE blog article](https://wiki.geant.org/pages/viewpage.action?pageId=154995651): **15s**

        - Global evaluation

            As per [RARE blog article](https://wiki.geant.org/pages/viewpage.action?pageId=154995651): **30s**

        - Jobs

            Job name: **router**

        -Device (IP address)
            we chose:  **192.168.0.1:9001**

    - Apply configuration

    ![Configuration](img/blog4-5.png)

    !!! error "VPN Connectivity Warning"

        It is important to note that you'll be connected inside a dedicated VPN so you'll be isolated from the outside world as if you were running your own Out of band management network. So we can assume that your domain is secured.

    - Prometheus micro-service status will be update to "**Activation in progress**"

    ![INPROGRESS](img/blog4-6.png)

    - After few minutes the deployment status will be set to "**Active**"

    ![INPROGRESS](img/blog4-7.png)

    **Congratulation. You should have completed Prometheus deployment**

