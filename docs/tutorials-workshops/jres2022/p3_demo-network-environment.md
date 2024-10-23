# Part 3: Setting Up a Demo Network Environment

!!! note "Acknowledgement"

    These instructions are heavily based on the excellent blog posts and FreeRTR Docs written by [Fréderic Loui](https://twitter.com/FredericLoui) and the RARE team.

!!! note "Clarification"

    This guides assumes that a local deployment of nmaas already exists and that either you are working in the provided nmaas test VM or you have followed the [instructions to deploy nmaas from scratch locally](../deploying-local-kubernetes-cluster.md).

If there are existing network elements ready to be monitored by nmaas applications, then this part can be completely skipped. 

## Configuring VirtualBox

This tutorial will assume that VirtualBox is used, even though the discussion should be applicable to other virtualization software as well, with minor modifications.

The virtual machine where FreeRTR will be installed requires at least two network interfaces, one primary and one additional for each FreeRTR process. 

The addition of new interfaces can be easily accomplished from the VirtualBox VM settings screen, using the Network section. Each new interface is represented by a new tab, named `Adapter 1`, `Adapter 2`... For the new interface, choose `Attached to: NAT` and **make sure to select the NAT network created in [Part 1](./p1_local-kubernetes-cluster.md#creating-a-new-nat-network-in-virtualbox) and that Promiscuous Mode is set to Allow All** in the Advanced section. If Promiscuous Mode is not enabled, unfortunately pcapInt will not be able to work properly.

## Installing FreeRTR

1. To run a local installation of FreeRTR we must first install a Java distribution. Fortunately, this can be accomplished with a single command:

    ```bash
    apt update
    apt install default-jre-headless ethtool
    ```

    FreeRTR requires at least Java 8 and works with newer versions as well.

2. We are now ready to download FreeRTR:

    ```bash
    mkdir /opt/rtr
    cd /opt/rtr
    wget http://www.freertr.net/rtr.jar
    ```

3. To make our virtual router accessible from the local network we must install the FreeRTR net-tools as well. They come precompiled for convenience. Please refer to [RARE/FreeRouter-101 [ #002 ] - "Let me get out !"](https://wiki.geant.org/pages/viewpage.action?pageId=148083914) for instructions on building these from source.

    ```bash
    wget freerouter.nop.hu/rtr-$(uname -m).tar
    mkdir /opt/rtr/bin
    tar -xvf rtr-$(uname -m).tar -C /opt/rtr/bin
    ```

4. As discussed in [http://docs.freertr.net/guides/getting-started/001-hello-world/](http://docs.freertr.org/guides/getting-started/001-hello-world/), to enable basic functionality we need to create two TXT files: a hardware specification file and a software specification file. 

    ```txt title="r1-hw.txt"
    int eth1 eth 0000.1111.0001 127.0.0.1 1001 127.0.0.1 2001
    tcp2vrf 1123 v1 23
    ```

    The hardware specification file given above is used to declare the interfaces that we would like our router to have. The syntax is: `int <int_name> <int_type> <int_mac_addr> <ip_addr_socket_src> <ip_addr_udp_port_src> <ip_addr_socket_dest> <ip_addr_udp_port_dest>`.

    Note that by using the second line in the hardware specification file we have enabled remote reachability of port 23 (Telnet) by forwarding any TCP connection established towards `VM_IP:1123` toward `VRF_V1:23`. More information about VRFs will be given in the next steps. This allows easy remote configuration of our router even before we have bound it to a specific network interface of our VM.

    ```txt title="r1-sw.txt"
    hostname r1
    buggy
    !
    vrf def v1
    rd 1:1
    exit
    !
    prefix-list p4
    sequence 10 permit 0.0.0.0/0 ge 0 le 0
    exit
    !
    server telnet tel
    security protocol tel
    vrf v1
    exit
    !
    ipv4 route v1 0.0.0.0 0.0.0.0 192.168.1.1
    !
    int eth1
    desc r1@eth1 -> enp0s8
    lldp ena
    vrf for v1
    ipv4 addr 192.168.1.17 255.255.255.0
    ipv4 gateway-prefix p4
    no shutdown
    exit
    !
    !
    !
    sensor ifaces-hw
    path interfaces-hw/interface/counter
    prefix freertr-ifaces
    prepend iface_hw_byte_
    command sho inter hwsumm
    name 0 ifc=
    key name interfaces-hw/interface
    replace \. _
    column 1 name st
    column 1 replace admin -1
    column 1 replace down 0
    column 1 replace up 1
    column 2 name tx
    column 3 name rx
    column 4 name dr
    exit
    !
    sensor ifaces-hwp
    path interfaces-hwp/interface/counter
    prefix freertr-ifaces
    prepend iface_hw_pack_
    command sho inter hwpsumm
    name 0 ifc=
    key name interfaces-hwp/interface
    replace \. _
    column 1 name st
    column 1 replace admin -1
    column 1 replace down 0
    column 1 replace up 1
    column 2 name tx
    column 3 name rx
    column 4 name dr
    exit
    !
    sensor ifaces-sw
    path interfaces-sw/interface/counter
    prefix freertr-ifaces
    prepend iface_sw_byte_
    command sho inter swsumm
    name 0 ifc=
    key name interfaces-sw/interface
    replace \. _
    column 1 name st
    column 1 replace admin -1
    column 1 replace down 0
    column 1 replace up 1
    column 2 name tx
    column 3 name rx
    column 4 name dr
    exit
    !
    sensor ifaces-swp
    path interfaces-swp/interface/counter
    prefix freertr-ifaces
    prepend iface_sw_pack_
    command sho inter swpsumm
    name 0 ifc=
    key name interfaces-swp/interface
    replace \. _
    column 1 name st
    column 1 replace admin -1
    column 1 replace down 0
    column 1 replace up 1
    column 2 name tx
    column 3 name rx
    column 4 name dr
    exit
    !
    server prometheus r1
    sensor ifaces-hw
    sensor ifaces-hwp
    sensor ifaces-sw
    sensor ifaces-swp
    vrf v1
    exit
    ```

    Even though the software specification file is large, the most important parts that need to be adapted to the local environment are:

    - Adding a default route: `ipv4 route v1 0.0.0.0 0.0.0.0 192.168.1.1`
    - Configuring a static IP: `ipv4 addr 192.168.1.17 255.255.255.0`
    - The sensor directives need to be left as they are, since they configure the Prometheus Exporter which will be scrapped using an nmaas hosted Prometheus instance which we will deploy in the next part.

5. As a last step before starting the FreeRTR process, we need to bring up our second interface and disable hardware offloading:

    ```bash    
    INT_NAME=enp0s8
    ip link set $INT_NAME up promisc on
    /sbin/ethtool -K $INT_NAME rx off
    /sbin/ethtool -K $INT_NAME tx off
    /sbin/ethtool -K $INT_NAME sg off
    /sbin/ethtool -K $INT_NAME tso off
    /sbin/ethtool -K $INT_NAME ufo off
    /sbin/ethtool -K $INT_NAME gso off
    /sbin/ethtool -K $INT_NAME gro off
    /sbin/ethtool -K $INT_NAME lro off
    /sbin/ethtool -K $INT_NAME rxvlan off
    /sbin/ethtool -K $INT_NAME txvlan off
    /sbin/ethtool -K $INT_NAME ntuple off
    /sbin/ethtool -K $INT_NAME rxhash off
    ```

    As before, please make sure that the correct interface name is used.

6. Once the necessary changes are made to the hardware and software specification files, we are ready to start our first router:

    ```bash
    java -jar rtr.jar routersc r1-hw.txt r1-sw.txt
    ```

    This will open an interactive session from where we can further alter the running configuration of the router. Of course, access to the local network is still not possible. To enable two-way communication with the "outside" world, we need to bind the UDP socket to the network interface that we have configured in the previous section using the `pcapInit.bin` tool:

    ```bash
    ./pcapInt.bin enp0s8 2001 127.0.0.1 1001 127.0.0.1
    ```

    Please note that in the above command `enp0s8` needs to be replaced with the name of the additional network interface connected to the virtual machine. If reusing the hardware file posted above, the port numbers can remain unchanged.

7. Once started, you can try pinging your default gateway from FreeRTR itself:

    ```bash    
    ping <GATEWAY_IP> /vrf v1
    ```

    It should work without any issues.

The same steps can be repeated for another instance of the virtual router, this time choosing different socket ports in step 4, and adjusting the IP address in the software configuration file.

## Creating a SystemD Service

If automatic startup of the virtual devices is desired, a SystemD service unit can be created.

- Create a new file called `freertr@.service` in `/etc/systemd/system`.

    ```ini title="freertr@.service"
    [Unit]
    Description=Start a freeRTR instance for %I
    After=network.target
    
    [Service]
    EnvironmentFile=/etc/default/freertr@%i
    ExecStartPre=/opt/rtr/interface-config.sh ${INT_NAME}
    ExecStart=java -jar /opt/rtr/rtr.jar routers ${HW_PATH} ${SW_PATH}
    User=root 
    # Restart every >2 seconds to avoid StartLimitInterval failure
    RestartSec=5 
    Restart=always
    
    [Install]
    WantedBy=multi-user.target
    ```

- To enable automatic startup of the pcapInt tool as well, the following service unit needs to be created for each router instance, adjusting the `After=` parameter and the `EnvironmentFile` accordingly:

    ```ini title="pcap-freertr-r1.service" hl_lines="3 6"
    [Unit]
    Description=Start a PCAP freeRTR instance for %I
    After=freertr@r1.service
    
    [Service]
    EnvironmentFile=/etc/default/pcap-freertr-r1
    ExecStart=/opt/rtr/bin/pcapInt.bin ${INT_NAME} ${PORT1} 127.0.0.1 ${PORT2} 127.0.0.1
    User=root 
    # Restart every >2 seconds to avoid StartLimitInterval failure
    RestartSec=5 
    Restart=always
    StandardInput=tty
    TTYPath=/dev/tty2
    TTYReset=yes
    TTYVHangup=yes
    
    [Install]
    WantedBy=multi-user.target
    ```

    Please note that if multiple instances of pcapInit need to be started (e.g. for different virtual routers), then the `TTYPath` parameter will need to be incremented accordingly.

- The necessary environment variables that are referenced in these unit files can be created in `/etc/default`. An example is given below:

    ```ini title="/etc/default/freertr@r1"
    INT_NAME=enp0s8
    HW_PATH=/opt/rtr/r1-hw.txt
    SW_PATH=/opt/rtr/r1-sw.txt
    PORT1=2001
    PORT2=1001
    ```

    ```ini title="/etc/default/pcap-freertr-r1"
    INT_NAME=enp0s8
    PORT1=2001
    PORT2=1001
    ```

- Finally the newly created services can be enabled and started:

    ```bash
    systemctl enable --now freertr@r1
    systemctl enable --now pcap-freertr-r1
    ```

We are now ready to configure monitoring and configuration backup of our virtual router using tools from the nmaas catalog.