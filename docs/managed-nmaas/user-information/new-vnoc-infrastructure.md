# New nmaas vNOC Infrastructure

## Benefits of the new Infrastructure

After 5 years of service, the managed nmaas vNOC instance available at [nmaas.eu](https://nmaas.eu) is scheduled to be migrated to a completely new infrastructure, bringing with it many benefits and improvements. The user-facing changes that existing users should be aware of are:

- improved disk I/O speeds - allowing the monitoring of even more customer devices using I/O sensitive applications such as Zabbix, InfluxDB, and Prometheus.
- dual-stack networking - nmaas now supports IPv6 in addition to IPv4 both for client access to the deployed applications as well as for the site-to-site connection towards the customer devices.
- improved networking architecture - each customer domain is now allocated with a dedicated private IPv4 subnet range from which all outbound connections will occur, as well as a publicly routable IPv6 range, improving scalability and ensuring that no subnets conflicts will occur.
- new VPN connectivity options for client-access VPN profiles - eduVPN is now the recommended method for establishing client-access VPN connections. Since eduVPN supports both OpenVPN and Wireguard behind the scenes, it provides maximum flexibility regardless of the environment where it is used. Additionally, users can also use the self-service eduVPN portal to generate additional client access VPN profiles, as needed.
- Wireguard as the recommended site-to-site VPN protocol - Wireguard is now the recommended protocol for establishing site-to-site VPN connections between nmaas and the customers' environments. OpenVPN is still supported should it be requested, but Wireguard has proven itself to be faster while also simpler to configure.

## Frequently Asked Questions About the Migration

### When will the migration process start?

All administrators of an existing domain on [nmaas.eu](https://nmaas.eu) will be contacted individually by the nmaas team, beginning from October 2024. 

### Will there be any data loss?

One of the fundamental goals of the migration is to preserve all user data. In cases where some applications need to be upgraded before being migrated (due to them being outdated and no longer supported), the nmaas team will get in touch with the respective domain administrators as soon as possible.

### Can I continue to use the existing site-to-site VPN tunnels?

If there is already established site-to-site connectivity for a given domain, the same VPN technology can be used (e.g. Wireguard or OpenVPN), but the tunnels themselves will need to be reestablished with new information, since the subnets have changed on the nmaas side.

### Do I need to reconfigure the routing towards nmaas on my side?

Yes, when reestablishing the site-to-site VPN connection, it is very likely that routing changes will need to be performed on the customer side as well, since the nmaas subnets will have changed.

### Can I continue to use the existing client-access VPN tunnels?

No, once a given domain is migrated to the new infrastructure it is expected that all users that require access to the deployed applications within it will be using eduVPN as the client access VPN technology. Since eduVPN can use both Wireguard and OpenVPN behind the scenes, compatibility with all major computing platforms is guaranteed. The nmaas team has made this decision in order to simplify administration aspects, since the management of different overlapping client-access VPN solutions adds additional burden and is time-consuming.

### Will the URLs of my applications change?

No, the URLs will remain the same. E.g., if there is a Prometheus instance with the URL `prom.example.nmaas.eu` in the existing nmaas infrastructure, it will keep the same name once migrated to the new infrastructure. The IP address that it is resolved to though will change. 

### Where can I access the new nmaas vNOC instance?

The nmaas vNOC instance hosted on the new infrastructure will be accessible at [vnoc.nmaas.eu](https://vnoc.nmaas.eu). As part of the migration process, users will receive a personalized email when they will need to start using the [vnoc.nmaas.eu](https://vnoc.nmaas.eu) endpoint. Until that time, all activity is done via [https://nmaas.eu](https://nmaas.eu).

Hosting the vNOC instance using the `vnoc` subdomain also goes hand-in-hand with the new nmaas branding strategy centered around the different use-cases - [vNOC](../../use-cases/virtual-noc/vnoc-introduction.md) and [vLAB](../../use-cases/virtual-lab/vlab-introduction.md).