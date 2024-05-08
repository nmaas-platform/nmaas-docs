# NMaaS Documentation

This repository contains the source files for the [docs.nmaas.eu](https://docs.nmaas.eu) website. It provides information on both the self-hosted NMaaS version, as well as the hosted one.

## Contributing to the Documentation

The documentation is built using MkDocs. GitHub workflows have been configured that publish the latest changes from the `master` branch to GitHub pages.

The following steps can be followed to set up a local environment:

1. Fork/Clone the Git repository
2. Create a new Python virtual environment

    ```bash
    sudo apt update && sudo apt install -y virtualenv
    git clone git@gitlab.software.geant.org:nmaas/documentation/nmaas-docs.git
    cd nmaas-docs
    virtualenv -p python3 venv
    ```

3. Activate the newly created Python virtual environment

    ```bash
    source venv/bin/activate
    ```

4. Install the dependencies specified in the `requirements.txt` file

    ```bash
    pip install -r requirements.txt
    ```

5. Start the MkDocs development server

    ```bash
    mkdocs serve
    ```

6. Make changes to any of the source Markdown files, save them, and preview them using the development server.
7. Push the changes and create a corresponding pull request.