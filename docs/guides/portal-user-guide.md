# Application Manager Guide

!!! warning Work in Progress
    This guide is currently a work in progress. Some sections might be missing or contain incomplete information.

## 1. NMaaS Domains

A domain in NMaaS corresponds to a dedicated and isolated tenant environment created within the system for particular institution, project, team or in general a group of users.

!!! info
    User can be assigned to multiple domains

!!! info
    In order to apply for a new domain creation submit the form available at https://nmaas.eu/about?type=NEW_DOMAIN_REQUEST.

## 2. Introduction to NMaaS user roles

NMaaS specifies user roles on two levels: global (system) level and user domain level.

Roles on each level can be assigned independently. 

### 2.1. Global level roles

The *Guest* default global role assigned to each user after successful account registration or first federated login allows the user to browse, comment and rate the offered applications (even without being assigned to any of the domains).

The remaining roles on the global level are:

 - *Operator* - allows the user to view domain details and update status of particular DCN network upon its manual configuration or de-configuration
 - *Application manager* - allows the user to add new applications and/or application versions to the offer through dedicated form built in the Portal as well as manage applications for which the System administrator assigned user as an owner
 - *System administrator* - gives the user the complete system administration rights in the Portal (including user, domain and application management)

!!! info
    For Application manager and System administrator user guides visit [NMaaS Application Manager Guide](https://docs.nmaas.eu/guides/application-manager-guide/) and NMaaS System Admin Guide

### 2.2 Domain level roles 

There are three user roles defined at the domain level:

 - *Guest* - a basic role in given domain that allows the user to view the list of subscribed applications and currently deployed application instances however user is not allowed to view details any of running application instances
 - *User* - with this role user is allowed to view details of running application instances including the access and configuration options
 - *Domain administrator* - gives full control over the application subscriptions and application instances (including deployment, configuration and access) within given domain, also allows for user role management (within the scope of particular domain)

These roles are assigned per user domain. A single user may have different roles assigned in multiple domains.

!!! info 
    On the domain level, a higher role always includes all the permissions specified for all underlying lower level roles

!!! info 
    In order to access the applications running within a particular domain user needs to connect to a dedicated VPN that is being set up independently of the user account within the Portal

## 3. NMaaS Portal

NMaaS web-based graphical user interface can be accessed by browsing to address https://nmaas.eu.

![NmaaS portal](./img/user-guide-s01.png)

NMaaS landing page contains a basic set of information about the NMaaS concept and the service. User is required to log in to gain access to the actual application market.

NMaaS Portal in available in four languages including English, French, German and Polish (though still not all texts might be properly translated in languages apart from English).

### 3.1 About

The About page available from the top bar menu contains information about current and past NMaaS software versions and a contact form being the preferred way of reaching out to the NMaaS team regarding any subject.

## 4. User login 

The user login form is available on the right side of the top bar menu.

![Login](./img/user-guide-s02.png)

There are two login options to enter the Portal. First is to fill in credentials of a local user account created in the system: username and password. And then clicking the *Login* button.

The second option is to use already existing account from one of the IdPs federated under eduGAIN. After clicking on the *Federated login* button, user will be redirected to the eduGAIN authorization page. If performed for the first time, user is asked to provide additional information about his account including mandatory and unique username and email address.

Users with accounts created directly in the system through the registration form are able to recover their password by clicking on the *Forgot password* link. A new input field will be displayed to provide the email address used during the registration to which a reset password link will be sent.

!!! info
    The federated login option is preferred and should be used whenever possible

## 5. User Registration

For creating local account user has to select the *Register* tab in the login window.

![Registry](./img/user-guide-s03.png)

Registration form contains several mandatory fields, which are: *Username, Password, Confirm password* and valid *Email address*.

Entered *Username* has to be at least 3 letters long.

User also has to confirm that he read the NMaaS Privacy Notice text.

There are also few optional fields, namely *First name, Last name* and *Domain selection*.

After submitting the registration form, user has to wait for the account being activated by the administrator. User will be notified with an email that his account is active.

A user needs to be assigned a specific role within particular domain in order to be able to view and deploy application instances in this domain.

## 6. Application market

After user account has been activated by the NMaaS administrator (in the case when the user submitted the registration form) he is able to log in and is granted a basic access to the main NMaaS applications view. Same access rights are granted to users that log in through eduGAIN for the first time.

![Application market](./img/user-guide-s04.png)

On the *Applications* tab all of the applications supported by NMaaS are enlisted. Applications can be filtered by tags and sorted by few criteria. User can also search them by name.

Single application tile consists of the logo, name, brief description and current rating of the application. Clicking on a tile redirects the user to the application’s details page.

!!! info
    User needs to verify or select a proper Domain from the selector located on the top bar menu

## 7. Application subscriptions and instances 

Once a user is granted a role inside a particular Domain he is able to view the content of the *Subscriptions* tab. This view comprises applications subscribed for his domain by a Domain administrator. Only these applications can be further deployed in the NMaaS cloud within the scope of particular domain.

In order to subscribe to a given application user needs to open the details view of chosen application and click the *Subscribe* button.

!!! info
    Subscribe option is only available for users with the *Domain administrator* role

The third tab present on the top navigation bar named *Instances* contains information about all the application instances deployed within user’s domain. By default the displayed list of application instances only includes instances deployed by given user. It is possible to display all instances in given domain by selecting *All* in the *Show* selector. In addition it is possible to display all the instances that were already undeployed and which are hidden by default.

Application instances are described by custom Name assigned during deployment, name of the *Application*, selected *Version* of the application, user being the *Owner* of this instance (user who initiated the deployment), *Deployment time* and current *State*.
