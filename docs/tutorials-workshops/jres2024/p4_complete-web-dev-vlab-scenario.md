# Complete Remote Web Development Virtual Lab Scenario

In this part of the tutorial, we will continue with the deployment of the additional applications required to complete the remote web development virtual lab scenario.

## Deploying MailDev

The next application to be deployed is MailDev. As it is also a simple application without too many configuration options during runtime, the only possibility is to enable web authentication using the nmaas application deployment wizard. Ticking this checkbox would require HTTP basic authentication before accessing the web UI. No matter what is selected, the SMTP interface always works without any authentication.

![MailDev Deployment Wizard](./img/16-maildev-deployment.png)

The application access details modal shows instructions on how to connect to both the web interface of the application, as well as the SMTP interface for sending dummy emails during development.

![MailDev Access Methods](./img/17-maildev-access-methods.png)

## Deploying Valkey

Valkey is a caching solution and is a direct fork of Redis. In this scenario we will be using it to cache the daily quote obtained from the database, reducing the load on the PostgreSQL instance. The only configuration parameter for Valkey exposed by the nmaas application wizard is the authentication password.

![Valkey Deployment Wizard](./img/18-valkey-password.png)

As Valkey does not offer a web interface, the only presented access method after its deployment is an external IP address that can be used for accessing the service both from other applications hosted on nmaas, as well as from the virtual lab participants' workstations. 

## Deploying VS Code Server

The final application that will be deployed as part of the remote web development virtual lab scenario is the integrated development environment - VS Code.

When using a VS Code instance on nmaas the user can write, compile, and run the code on the same hardware where nmaas is hosted, thus removing any hardware performance constraints that would have been applicable if the lab participants were trying to develop on their own, potentially resource limited, workstations. As the development tools for various programming languages differ, during the deployment process the virtual lab participant is asked to select the desired flavor which depends on the programming language that will be used. Currently supported flavors are Java and Python, but more can easily be added in the future, by customizing the set of preinstalled software available in the VS Code container.

![VS Code Deployment Wizard](./img/19-vscode-deployment.png)

After the application is deployed and has entered a running state, the lab participant can login to the web interface using the password specified during deployment time. The web interface is absolutely the same as the VS Code's local version.

![VS Code Web Interface](./img/20-vscode-web-interface.png)

## Setting up VS Code

As we will be building the demo random quotes application using the Flask Python framework, a couple of prerequisites need to be satisfied.

1. Create a new directory that will house the project's files.
    ```bash
    mkdir demo-project
    ```
2. Create a new Python virtual environment using the `Terminal` option from the VS Code web interface.
    ```bash
    python3 -m venv venv
    ```
3. Activate the newly created Python virtual environment.
    ```bash
    source venv/bin/activate
    ```
4. Open the newly created directory as a VS Code project using the `Open Folder` option in VS Code.
5. Create a new Python file called `main.py`.
6. Enter a sample Python expression, such as:
    ```python
    print('Hello world')
    ```
7. To run and debug Python files we will need the official Python VS Code extension. This extension can be installed by clicking the `F1` keyboard key, and searching for the expression `extensions install`. Choose the `Extensions: Install Extensions` result and search for `Python`.

    ![Installation of the Python Extension in VS Code](./img/21-python-extension-install.png)

8. After the extension has been installed, returning to the `main.py` file should provide the option to run it directly by clicking on the new `Play` button in the top right corner.

![Running a Python File in VS Code](./img/22-python-run-file.png)

## Developing the Demo Application

The complete source code for the random quotes application is provided below. It can be pasted directly into a file using a VS Code editor hosted on nmaas and it can integrate with PostgreSQL, Valkey, and MailDev instances also hosted on nmaas.

```python
from flask import Flask, jsonify
from redis import Redis
import records
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)

# Redis and PostgreSQL connection details
REDIS_HOST = '172.18.130.58'
REDIS_PORT = 6379
REDIS_PASSWORD = 'mysecret'
POSTGRESQL_URI = 'postgresql://alfred:mysecret@id5202-postgresql-60:5432/alfred'
# Initialize Redis and PostgreSQL connections
redis_client = Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD)
db = records.Database(POSTGRESQL_URI)
SMTP_HOST = '172.18.130.57'
SMTP_PORT = 1025
EMAIL_TO = 'test@test.com'
EMAIL_FROM = 'noreply@example.com'


@app.route('/get-quote', methods=['GET'])
def get_quote():
    current_date = datetime.now().strftime('%Y-%m-%d')
    redis_key = f'quote-{current_date}'

    # Check if the quote exists in Redis
    cached_quote = redis_client.get(redis_key)
    if cached_quote:
        send_email(EMAIL_TO, cached_quote)
        return jsonify({"quote": cached_quote.decode('utf-8')})

    # Query the PostgreSQL database if quote not found in Redis
    result = db.query('SELECT quote FROM daily_quotes ORDER BY RANDOM() LIMIT 1').all()
    quote = result[0]['quote'] if result else 'No quote for today.'

    # Cache the result in Redis with an expiration time (e.g., 24 hours)
    redis_client.setex(redis_key, 86400, quote)

    return jsonify({"quote": quote})

def send_email(to_address, quote):
    """Sends an email with the provided quote."""
    subject = "Daily Quote"
    body = f"Here is your daily quote: {quote}"

    # Create the email message
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = EMAIL_FROM
    msg['To'] = to_address

    try:
        # Connect to the SMTP server
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp_server:
            smtp_server.sendmail(EMAIL_FROM, to_address, msg.as_string())
        print(f"Email sent successfully to {to_address}")
    except Exception as e:
        print(f"Failed to send email: {e}")

if __name__ == '__main__':
    app.run(debug=True)
```

Before running the above example using nmaas applications deployed to your own domain, please change the connection information on lines: `11`, `13`, `14`, and `18` with the relevant information obtained from the access details pages for the respective applications.

In case of any dependency errors, make sure that the following Python packages have been installed in the virtual environment:

- flask
- redis
- records
- psycopg2-binary

These can all be installed using the following command:

```bash
pip install flask redis records psycopg2-binary
```

## Testing the Demo Application

Running the application at this point will start the development web server and will automatically open an internal proxy. Clicking the `Open in Browser` button from the presented VS Code popup will open a new tab navigating to the Flask development web server.

![VS Code Port Forwarding](./img/23-open-in-browser-vscode.png)

As the specified route for the defined function in the source code above is `/get-quote`, the path in the new tab will need to be manually adjusted.

![VS Code Demo Flask Application Test](./img/24-app-test.png)

To fully test the functionality of the application, we can also insert more quotes in the database:

```sql
INSERT INTO quotes (quote) VALUES ('Goals transform a random walk into a chase.');
INSERT INTO quotes (quote) VALUES ('Beware of bugs in the above code. I have only proved it correct, not tried it.');
INSERT INTO quotes (quote) VALUES ('640K ought to be enough for anybody.');
```

After inserting the above quotes to the database, refreshing the page multiple times should always return the same result as previously, since that quote has been cached into Valkey and no new queries are executed against the PostgreSQL database.

The final aspect to test is the sending of the emails. A request to the random quotes API should also send an email using MailDev's dummy SMTP server. The content of the email message should be visible using the MailDev web interface. 

![Previewing an Email Message Using MailDev](./img/25-maildev-email-preview.png)