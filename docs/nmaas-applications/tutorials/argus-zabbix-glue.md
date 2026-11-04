# Argus Zabbix Glue

## Introduction

[Argus Zabbix Glue](https://github.com/Uninett/zabbix-argus-glue) (`zabbix-argus-glue`) is a [glue service](https://argus-server.readthedocs.io/en/latest/integrations/glue-services/index.html) developed by Uninett that synchronizes [Zabbix](https://www.zabbix.com/) problems with [Argus](https://github.com/Uninett/Argus) incidents:

- problems raised in Zabbix are created as incidents in Argus;
- resolved problems close the matching Argus incidents.

The service uses a hybrid push and poll design. A webhook receiver accepts problem events sent by Zabbix in near real time, and a reconciliation poller periodically compares open problems in Zabbix with the incidents in Argus to fix anything the webhook missed. A full synchronization is performed on startup.

!!! note "Requirements"
    Argus Zabbix Glue requires **Zabbix 7.2 or later**, because the webhook setup relies on the `{EVENT.TIMESTAMP}` macro, which was introduced after the 7.0 LTS release. You also need a running Argus instance and API tokens for both Argus and Zabbix.

!!! info "Upstream status"
    The project is in early development. Acknowledgement sync from Argus back to Zabbix is planned upstream but not yet implemented, so the `ack_enabled` and `close_enabled` options currently have no effect.

## Deployment on nmaas

Deploying Argus Zabbix Glue follows the same process as any other application in the nmaas catalog:

1. Subscribe your domain to the Argus Zabbix Glue application from the `Applications` page.
2. Deploy a new instance, providing a unique name for it.
3. Fill in the configuration wizard (described below) and click `Apply configuration`.
4. Wait for the deployment to complete.

Before deploying, make sure that you have:

- an Argus API token for the Argus user that the incidents will be created as;
- a Zabbix API token with read access to problems, hosts and triggers;
- a webhook secret, i.e. a random string shared between Zabbix and the glue service (for example the output of `openssl rand -hex 32`).

!!! note "Providing User SSH Key"
    Upload your public SSH key on the Profile page **before** deploying the application. You will need it to clone the configuration Git repository after deployment.

### Configuration Wizard

The values entered in the wizard are used to generate the `zabbixargus.toml` configuration file, which is stored in a dedicated Git repository created for the application instance.

- `Access options` - `VPN` (default) keeps the webhook endpoint reachable only from inside the nmaas network. Choose this when your Zabbix server runs on nmaas or can reach the instance over the VPN. `Public` exposes the `/webhook` endpoint to the Internet, which is only needed when Zabbix runs elsewhere.
- `Argus API URL` - Argus API endpoint, including `/api/v2`, e.g. `https://argus.example.com/api/v2`.
- `Argus API token` - Token of the Argus user that the incidents are created as.
- `Zabbix URL` - Base URL of the Zabbix frontend, **not** the API endpoint, e.g. `https://zabbix.example.com`. For Apache-based Zabbix installations, this usually includes the `/zabbix` path prefix.
- `Zabbix API token` - Zabbix API token with read access to problems, hosts and triggers.
- `Webhook secret` - Shared secret checked against every incoming webhook request. The Zabbix media type must send the same value (see [Connecting Zabbix to Argus Zabbix Glue](#connecting-zabbix-to-argus-zabbix-glue)). It is required when the service is public. With VPN access you can leave it empty to turn the check off, but setting a secret is still recommended.
- `Source instance name` - Added to every Argus incident as the `source_instance` tag, so incidents from several Zabbix instances can be told apart. Defaults to `zabbix`.
- `Minimum severity` - Only problems at or above this Zabbix severity are synchronized.
- `Host groups filter [Optional]` - Comma-separated list of Zabbix host groups to synchronize, matched exactly, e.g. `Linux servers, Network devices/Core`. Leave empty to synchronize all host groups.
- `Reconciliation interval (seconds)` - How often Zabbix and Argus are compared. Defaults to `120`.
- `Prefix incident descriptions with the hostname` - Prepends `hostname: ` to incident descriptions that do not already contain it.
- `Add host groups as tags to Argus incidents` - Adds the Zabbix host groups of the affected host as tags on the Argus incident.

### Changing the Configuration After Deployment

The configuration wizard is used only for the **initial** deployment. Make any later change through the instance's Git repository, following the standard nmaas [GitOps workflow](../general-app-deployment.md):

1. Open the application instance page and click `Configure` to see the Git clone command.
2. Clone the repository locally, using the SSH key you uploaded to your profile.
3. Edit `config/zabbixargus.toml`, then commit and push your changes.
4. Wait a couple of minutes. nmaas picks up the new configuration and the glue service restarts with it automatically.

The Git repository also gives you access to options that are not in the wizard, for example:

- `[webhook] allowed_ips` - an IP allowlist for incoming webhook requests, e.g. `["10.0.0.5/32"]`. This is especially useful when the service is exposed publicly;
- `[severity] mapping` - a custom mapping from Zabbix severities (0-5) to Argus levels (1-5);
- `[tags] zabbix_tag_allow` / `zabbix_tag_block` - which Zabbix tags are copied to Argus incidents;
- `[tags] static` - extra tags added to every incident.

See the upstream [`zabbixargus.example.toml`](https://github.com/Uninett/zabbix-argus-glue/blob/master/zabbixargus.example.toml) for a commented list of all available options.

!!! warning
    Leave `[webhook] port = 8080` and `listen = "0.0.0.0"` unchanged. The Kubernetes service and health probes of the nmaas deployment expect the service on that port.

## Connecting Argus to Zabbix

The glue service creates incidents in Argus on behalf of an Argus source system. Make sure that:

- a source system representing your Zabbix instance exists in Argus, and that the user whose API token you entered in the wizard belongs to it;
- the source system's `base_url` contains the full path prefix of the Zabbix frontend. Incident detail links point back to the Zabbix problem page using relative URLs (e.g. `tr_events.php?triggerid=...&eventid=...`). For Apache-based Zabbix installations this is typically `https://zabbix.example.com/zabbix/`, while Nginx-based installations usually use `https://zabbix.example.com/`.

Refer to the [Argus documentation](https://argus-server.readthedocs.io/) for details on managing source systems and API tokens.

## Connecting Zabbix to Argus Zabbix Glue

To send problems to the glue service in real time, Zabbix needs a webhook media type, a user that the media type is assigned to, and a trigger action. The steps below follow the [upstream Webhook setup documentation](https://github.com/Uninett/zabbix-argus-glue#webhook-setup) of the zabbix-argus-glue project. Check it for the most up-to-date instructions.

### Webhook URL

The URL that Zabbix should post to depends on the access option chosen during deployment:

- **VPN**: use the in-cluster hostname shown on the application instance page, with port `8080` and the `/webhook` path, e.g. `http://<instance-hostname>:8080/webhook`. Use this if your Zabbix server is also deployed on nmaas.
- **Public**: use the public address shown on the application instance page, followed by `/webhook`, e.g. `https://<public-hostname>/webhook`.

### 1. Create a Webhook Media Type

In Zabbix, go to `Alerts` → `Media types` → `Create media type` and configure:

- **Name**: `Argus`
- **Type**: `Webhook`
- **Parameters**:

| Name            | Value                                                |
|-----------------|------------------------------------------------------|
| `glue_url`      | the webhook URL from the [section above](#webhook-url) |
| `secret`        | the webhook secret set during deployment             |
| `eventid`       | `{EVENT.ID}`                                         |
| `value`         | `{EVENT.VALUE}`                                      |
| `severity`      | `{EVENT.NSEVERITY}`                                  |
| `hostname`      | `{HOST.NAME}`                                        |
| `name`          | `{EVENT.NAME}`                                       |
| `timestamp`     | `{EVENT.TIMESTAMP}`                                  |
| `triggerid`     | `{TRIGGER.ID}`                                       |
| `tags`          | `{EVENT.TAGSJSON}`                                   |
| `update_status` | `{EVENT.UPDATE.STATUS}`                              |
| `update_action` | `{EVENT.UPDATE.ACTIONJSON}`                          |
| `update_user`   | `{USER.FULLNAME}`                                    |

- **Script**:

```javascript
var params = JSON.parse(value),
    req = new HttpRequest(),
    payload = {};

req.addHeader('Content-Type: application/json');
req.addHeader('X-Webhook-Secret: ' + params.secret);

payload.eventid = params.eventid;
payload.value = params.value;
payload.severity = params.severity;
payload.hostname = params.hostname;
payload.name = params.name;
payload.timestamp = params.timestamp;
payload.triggerid = params.triggerid;
payload.tags = params.tags;
payload.update_status = params.update_status;
payload.update_action = params.update_action;
payload.update_user = params.update_user;

var resp = req.post(params.glue_url, JSON.stringify(payload));

if (req.getStatus() < 200 || req.getStatus() >= 300) {
    throw 'Request failed with status ' + req.getStatus()
        + ': ' + resp;
}

return 'OK';
```

_Source: [zabbix-argus-glue README](https://github.com/Uninett/zabbix-argus-glue#1-create-a-webhook-media-type)._

### 2. Assign the Media Type to a User

Zabbix sends alerts through users, so create a dedicated service account or use an existing user. Go to `Users` → `Users` and create or edit a user:

- **Username**: e.g. `argus-glue`
- **Role**: a User-type role with the problem-update actions enabled is enough. Avoid `Super admin`, because a service account that holds credentials should not have full configuration rights.
- **Groups**: a user group with read access to the hosts you want to synchronize. Acknowledgement sync back to Zabbix, once available upstream, will additionally need read-write access to those host groups.
- **Media** tab → `Add`:
    - **Type**: `Argus`
    - **Send to**: `argus` (required by Zabbix but ignored by webhooks)
    - **Enabled**: checked

!!! tip "Resolving \"Inaccessible user\" in update notifications"
    Update notifications carry `{USER.FULLNAME}`, the name of the person who acknowledged or commented on a problem. Zabbix only reveals a user's name to accounts that share at least one user group with them. Otherwise the macro resolves to the literal string `Inaccessible user`. To make names resolve without widening the service account's access, create a user group with no permissions (e.g. `argus-visibility`) and add both the `argus-glue` account and every operator who acknowledges problems to it. See the [upstream README](https://github.com/Uninett/zabbix-argus-glue#resolving-inaccessible-user-in-update-notifications) for details.

### 3. Create a Trigger Action

Go to `Alerts` → `Actions` → `Trigger actions` → `Create action`:

- **Name**: `Send to Argus`
- **Conditions**: adjust to match the problems you want to synchronize.
- **Operations** → `Add`:
    - **Send to users**: the user from step 2
    - **Send only to**: `Argus`
    - Check **Custom message** and set any non-empty subject and body (e.g. `{EVENT.NAME}` / `{EVENT.ID}`). Zabbix requires a message to be defined even though webhooks ignore it.
- **Recovery operations** → `Add`: the same settings as above, including a custom message.
- **Update operations** → `Add`: the same settings as above. This forwards acknowledgements, comments and severity changes.

## Testing the Integration

### Quick Webhook Check

To check that the glue service accepts webhook requests, send a test event with `curl` from a host that can reach the webhook URL. Replace the URL and secret with your own values:

```bash
curl -X POST https://<public-hostname>/webhook \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Secret: your-secret' \
  -d '{
    "eventid": "12345",
    "value": "1",
    "severity": "4",
    "hostname": "web01.example.com",
    "name": "High CPU usage on web01",
    "timestamp": "1745326800",
    "triggerid": "678",
    "tags": "[{\"tag\": \"application\", \"value\": \"nginx\"}]"
  }'
```

A matching incident should appear in Argus. Because the test event does not exist in Zabbix, a later reconciliation run will usually close it as stale. Zabbix must report at least one open problem for this to happen, otherwise close it manually in Argus.

### End-to-End Test with a Dummy Trigger

To test the full path from Zabbix to Argus, create a test problem that you can raise and resolve on demand with `zabbix_sender`. You don't need a real monitored device for this.

1. **Create a test host.** Go to `Data collection` → `Hosts` → `Create host`:
    - **Host name**: `TestHost`
    - **Host groups**: any group, e.g. a new `Test` group. If you set a `Host groups filter` for the glue service, use a group from that list.
    - No interface is needed.
2. **Create a trapper item.** Open `TestHost` → `Items` → `Create item`:
    - **Name**: `Dummy alert`
    - **Type**: `Zabbix trapper`
    - **Key**: `test.trap`
    - **Type of information**: `Numeric (unsigned)`
    - **Allowed hosts**: leave empty, or enter the IP address of the machine you will send values from.
3. **Create a trigger.** Open `TestHost` → `Triggers` → `Create trigger`:
    - **Name**: `Dummy trigger fired on {HOST.NAME}`
    - **Severity**: a severity that is at or above the glue service's `Minimum severity` and matches the conditions of your `Send to Argus` action, e.g. `High`.
    - **Expression**: `last(/TestHost/test.trap)=1`
    - **Tags** (optional): `test` = `alert`, if you want to scope a separate action to this trigger.
    - Leave the recovery settings at their defaults, so the problem resolves when the value is no longer `1`.
4. **Check the trigger action.** Make sure the `Send to Argus` action from [step 3](#3-create-a-trigger-action) matches this trigger, for example with the condition `Host` = `TestHost` or tag `test` = `alert`. It must have both an operation and a recovery operation that send through the `Argus` media type.
5. **Raise the problem.** On the Zabbix server, or on any machine with the `zabbix-sender` package installed, run:

    ```bash
    zabbix_sender -z <zabbix_server_ip> -s "TestHost" -k test.trap -o 1
    ```

    A successful send reports `processed: 1; failed: 0`. The `-s` value must match the host name exactly, including case.

6. **Check the results:**
    - in Zabbix, the problem appears under `Monitoring` → `Problems`;
    - under `Reports` → `Action log`, the alert to the `Argus` media type is shown as sent, not failed;
    - in Argus, a new open incident appears for `TestHost`, tagged with `source_instance=<your source instance name>`.
7. **Resolve the problem** to test recovery:

    ```bash
    zabbix_sender -z <zabbix_server_ip> -s "TestHost" -k test.trap -o 0
    ```

    The problem is resolved in Zabbix and the matching Argus incident is closed.

When you're done, disable or delete `TestHost` so the test trigger doesn't produce incidents later.

If no incident appears in Argus:

- if the action log shows the alert as **failed**, check the error message. It usually means Zabbix can't reach the webhook URL, or the secret doesn't match;
- if the alert was sent but no incident was created, check the application logs on the nmaas instance page for webhook or Argus API errors;
- if no alert was sent at all, the trigger action conditions don't match the test trigger.

Even without the webhook, the reconciliation poller creates the incident within the configured `Reconciliation interval`. An incident that appears only after that delay means the poller works but the webhook path doesn't.

## Further Reading

- [zabbix-argus-glue on GitHub](https://github.com/Uninett/zabbix-argus-glue): upstream source code, README and configuration reference
- [Argus glue services documentation](https://argus-server.readthedocs.io/en/latest/integrations/glue-services/index.html)
- [nmaas general application deployment and GitOps workflow](../general-app-deployment.md)
