# Introduction to nmaas Virtual Lab

nmaas Virtual Lab is a new use-case for the nmaas Platform aimed at educational communities. The core idea is to leverage the existing nmaas platform functionality of on-demand application deployment and repurpose it in a learning context. This approach would allow nmaas to be further used in the process of both formal, supervised, education (e.g., university courses), as well as for informal, and self-paced education (MOOCs, short demos, tutorials). During the initial planning, a number of scenarios have been envisioned, including:

- deployment of randomized, black-box containers for studying common software vulnerabilities;
- offloading of resource-intensive workloads on a centralized and powerful Kubernetes cluster, including JupyterLab servers, data processing pipelines, and simulations;
- creation of personalized, portable development environments with all necessary services included, such as a web-based integrated development environments (IDEs), relational databases, message queues, application servers, etc...
- making use of limited compute resources to serve as many users as possible through the deployment of ephemeral containers that are active only while used and paused when idle. Reactivation can be attempted at any point in time, preserving all previous data.

The overall use-case along with its distinct scenarios has the potential to bring a number of benefits to both learners and educators. In the subsections below we elaborate on the underlying nmaas Virtual Lab features which make these benefits possible in more details.

## nmaas Virtual Lab from the Perspective of Educators

Organizing hands-on exercises where all students can participate is often a challenging and time-consuming task for educators. It entails hardware provisioning, configuration, application deployment, user management, per tenant isolation, and integration with existing platforms, such as learning management systems (LMS) and grading systems. Depending on the subject area and technical proficiency of the educators and supporting staff, this manual approach does not scale for moderate and large groups of students. To overcome these issues, nmaas will implement the following features, with the end-goal of making the organization of hands-on exercises by educators as effortless as possible:

- centralized provisioning and management of user profiles together with support for bulk user imports from LMS exports;
- individual, isolated, workspace (domain) for each and every user where they can deploy available applications on-demand, without interference from other participants;
- shared domains between multiple users for scenarios where team work is expected;
- personalized catalog of applications for each user through the introduction of domain groups. Each domain group can contain one or more domains, precisely specifying what applications are available for deployment by the users. This allows the same - nmaas instance to be reused for multiple courses at the same, where each user can be enrolled into multiple courses, and would have access only to previously whitelisted applications;
- bulk deployment of application instances across multiple domains for scenarios where the application deployment should not be done by the users themselves.

## nmaas Virtual Lab from the Perspective of Learners

Due to the challenging nature of organizing hands-on exercises, learners are usually required to deploy the necessary applications on their own workstations, either directly or in an isolated environment through the use of containers or virtual machines. This approach requires that each participant not only have the necessary hardware resources, but also to posses the required technical know-how for setting up and debugging the environment, which is usually not the main focus of the exercise itself. To make hands-on exercises more accessible to all learners, no matter their background or area of study, nmaas will offer the following features:

- an accessible web portal where users can login and gain access to a curated catalog of applications they can explore;
- a simple deployment of application instances through the use of a deployment wizard which visually guides the user through the necessary steps;
- minimizing hardware requirements for the personal workstations of learners, since all software runs on a central infrastructure and is remotely accessible from anywhere;
an isolated environment for experimenting, where depending on the application catalog, users can explore additional software on their own time, apart from what is required in the context of specific learning modules.

## The Road Ahead

The vision for nmaas Virtual Lab is to make it as easy as possible to deploy and use, both from the educators and learners perspective. By leveraging the possibility to add custom applications to the catalog, it is expected that each deployment will have a unique set of deployable applications. Through the introduction of catalog federation, it should be possible for different institutions to share their application templates, fostering collaboration, and knowledge exchange, bringing added value to the whole nmaas ecosystem. It should be recognized that nmaas does not necessarily have to be limited to organizing hands-on exercises for learners. As a result of its multi-tenancy, a single nmaas instance can also be used by the educators themselves, making use of the compute capacity for running resource intensive processing pipelines or Jupyter notebooks. It can also be used by the supporting staff for easy deployment and management of network services which, of course, is the original use-case of nmaas (now known as nmaas for Virtual NOC).

## Demos

The first video below demonstrates the deployment process of an application from a trainee's perspective.

![type:video](https://static.nmaas.eu/techex23/03-app-deployment.mp4)

The second video below showcases how nmaas Virtual Lab can be used as a remote development environment for various programming languages (Python in this particular case).

![type:video](https://static.nmaas.eu/techex23/05-remote-dev-environment.mp4)