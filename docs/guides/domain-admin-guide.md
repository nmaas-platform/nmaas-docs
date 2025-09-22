# Domain Admin Guide

## Domain Administrator Role

Before being able to deploy and/or access application instances via the nmaas Portal user needs to be assigned to a Domain.

!!! info 
    In order to apply for a new domain creation submit the form available at https://vnoc.nmaas.eu/about?type=NEW_DOMAIN_REQUEST.

Within a domain user can be granted one of three roles as described in the [nmaas User Guide](./user-guide.md). Domain needs to have at least one `Domain administrator`.

The initial assignment of that role in newly created domain is performed by administrators based on the received domain creation request.

Only domain administrator has the possibility of subscribing to applications for his domain and triggering the deployment of instances of those applications.

Additionally such user has access to some additional settings pages for his domain reachable from the Settings menu located on the top navigation bar.

## Viewing Domain Details

After clicking on the `Domains` button from the Settings menu user is directed to a view listing all the domains for which he is assigned the administrator role.

On this view only basic information about a given domain is displayed including the Codename, full `Name` and `Active` state indication. Domain details view can be displayed by clicking on the respective entry on the list.

Domain details view includes several sections:

- domain name and technical details related with Kubernetes and VPN configuration
- application properties indicating some custom application settings for this domain (comprising information if particular application available in the marketplace is available in this domain and what is the limit of storage space that can be requested for given application instances deployed in this domain)
- list of users assigned to this domain and their assigned roles


This view allows only for viewing the information and no data editions nor actions can be triggered from this view by domain administrators.

## Managing Domain Users

After clicking on the `Users` button from the `Settings` menu user is directed to a view listing all the users added to the domain that is currently selected on the top navigation bar.

Domain administrator can view some basic information about each of the users added to the domain including his currently assigned role, timestamp of last successful login and whether user account is currently active.

### Adding Users to a Domain

Domain administrator is able to add additional users to the domain he is managing and grant them appropriate role.

On the users list view domain administrator needs to open a dedicated view by clicking the `Add users to domain` button located in the top part of the view. Next, administrator is able to browse the list of available users and add the desired ones by clicking on the `Grant USER role` button from the actions menu (cogwheel icon) next to given user.

### Changing User Role in a Domain

In order to change user's role assigned in a domain the domain administrator needs to open the user details view by clicking on the respective entry on the users lists, select proper role from the drop down selector in the `Privileges` section and confirm the new assignment by clicking on the `Add/Update` button.

!!! info
    User is not allowed to update his own role in domain

### Removing User from a Domain

On users list view, users can be removed from particular domain by clicking on the `Remove from domain` button from the actions menu (cogwheel icon) next to given user.