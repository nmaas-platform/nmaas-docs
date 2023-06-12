# Adding a new Application

Anyone can submit an application to be included to the NMaaS catalog, thus making it available to all users of the production instance. Each application should have at least one official maintainer who will regularly pull changes from the upstream project and provide updated Docker images and Helm charts. The source code for each Helm chart should be hosted in a separate Git repository.

A brief guide on how a new chart repository can be set up using the GitHub platform is presented below.

Please note that we do not require the use of GitHub or mandate a specific code hosting service. Any platform that is publicly accessible would suffice.

!!! note
    <h3 style="margin: 0.6em 0 0.4em;">Process Explanation</h3>
    Applying for an application to be added to the NMaaS catalog is a two-step process. First, the chart needs to be created, and then a brief proposal submitted to the NMaaS team via email. After reviewing the chart, the user who submitted it will be assigned a new role on the production instance of NMaaS (https://nmaas.eu) – <i><u>tool manager</u></i>, which allows uploading of new versions and parameter changes.

<h2>Step 1: Create a new GitHub Repository</h3>
<li>Login or register a new account on GitHub and create a new public repository. Repositories can be created either as an individual user or as an organization.</li>

<details>
<summary>Figure 1: Creating a new GitHub repository</summary>
<img src="../img/new-application-1.png" >
</details>

<h2>Step 2: Configure GitHub Pages for Hosting the Helm Repository</h3>
GitHub has a free option for hosting static files for public repositories called GitHub Pages. This is a hugely popular tool for publicly hosting simple blogs or websites created using static site generators such as Hugo or Jekyll. However, in our case, this is also a perfect opportunity to host the index.yaml metadata file required for every Helm repository.
<br>
<br>
To enable GitHub Pages for your project, the following steps need to be performed:
<li>Clone the newly created repository locally and a dummy .gitignore file which can be used later.</li>
<pre>
git clone git@github.com:&lt;USERNAME&gt;/&lt;REPOSITORY_NAME&gt;.git
touch .gitignore
git add .
git commit -m "add .gitignore"
git push --set-upstream origin master
</pre>
<div style="border: 3px solid #fc7a7a; border-radius: 5px; padding-left: 20px; padding-right: 10px; padding-bottom:10px; margin-bottom: 20px; margin-top: 15px; background-color: #fdd7d7">
<h4>Branch Name</h4>
Before pushing the changes to the remote and executing the git push command, make sure to correctly identify the name of the default Git branch. This varies from environment to environment, and in the case of GitHub, can be directly checked from the settings screen of the given repository (Settings → Branches).

</div>


<li>Create a new branch called gh-pages</li>
<pre>
git checkout --orphan gh-pages
git rm -rf .
git commit -m "Initial commit" --allow-empty
git push --set-upstream origin gh-pages
</pre>
<li>Once the branch is created, GitHub Pages can be officially enabled from the Settings page of your repository</li>

<details>
<summary>Figure 2: Enabling GitHub Pages</summary>
<img src="../img/new-application-2.png" >
</details>
<li>If desirable, you can add any index.html file to the gh-pages branch, so that users are not presented with a 404 error when directly accessing the Helm repository root URL. Note that this has no effect on the functionality of the Helm repository itself.</li>
<h2>Step 3: Preparing the Chart</h2>
We are now ready to publish the source code for our chart. The GitHub Actions that we will configure in the next step mandate that our charts are placed in a charts directory within the repository.
<br><br>
<li>Switch to the master branch of the repository</li>
<pre>
git checkout master
</pre>
<li>Create the necessary directory tree</li>
<pre>
mkdir charts
cd charts
</pre>
<li>Create a new chart or copy the source files of an existing chart</li>
<pre>
helm create &lt;chart-name&gt;
</pre>
<h2>Step 4: Automatic Publishing of New Chart Versions</h2>
It would be pretty tedious to manually package each new chart version, update the artifacts to GitHub, create a new release, and update the index.yaml file on the gh-pages brach which contains the Helm repository metadata. Instead, we can automate all of these tasks using GitHub actions. To do so, we will configure automatic linting of our charts as well as publishing.

<li>Switch to the master branch of your repository and create a new folder, .github/workflows which would contain the definition for our GitHub pipelines.</li>
<pre>
git checkout master
mkdir -p .github/workflows
</pre>
<li>Create a new file called linting.yaml with the content available below.  This job will execute whenever there is a new pull request and will check whether it conforms to the best Helm charts writing practices.</li>

``` yaml title=".github/workflows/linting.yaml"
name: Helm Chart Linting
 
on:
  pull_request:
    paths:
      - 'charts/**'
 
jobs:
  lint-chart:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
       
      - name: Set up Helm
        uses: azure/setup-helm@v1
        with:
          version: v3.4.0
 
      - uses: actions/setup-python@v2
        with:
          python-version: 3.7
 
      - name: Set up chart-testing
        uses: helm/chart-testing-action@v2.1.0
 
      - name: Run chart-testing (list-changed)
        id: list-changed
        run: |
          changed=$(ct list-changed)
          if [[ -n "$changed" ]]; then
            echo "::set-output name=changed::true"
          fi
 
      - name: Run chart-testing (lint)
        run: ct lint --debug
```

<li>Once a pull request has been merged to master we want to automatically release a new version of the chart. For this purpose, we create a new workflow by defining the file release.yaml.</li>

``` yaml title=".github/workflows/release.yaml"
name: Release Charts
 
on:
  push:
    branches:
      - master
    paths:
      - 'charts/**'
 
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
 
      - name: Configure Git
        run: |
          git config user.name "$GITHUB_ACTOR"
          git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
 
      - name: Run chart-releaser
        uses: helm/chart-releaser-action@v1.2.1
        env:
          CR_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
```


<li>Commit the changes to these new files</li>
<pre>
git add .
git commit -m "add helm automation"
git push
</pre>

<h2>Step 5: Testing the Automations</h2>
We have prepared the source code of the Helm chart in Step 3 and set up the required GitHub actions in Step 4. We are now ready to test our automation tools.

<li>Create a new branch with an arbitrary name</li>
<pre>
git checkout -b new-chart-version
</pre>
<li>Open the charts/&lt;my-chart&gt;/Chart.yaml file and increment the version field of the chart</li>
<li>Push the changes to GitHub</li>

<pre>
git add .
git commit -m "new chart version"
git push --set-upstream origin new-chart-version
</pre>

<li>Go to your repository on GitHub and open a new pull request from the Pull requests page. As source branch choose the newly created one – new-chart-version</li>


<details>
<summary>Figure 3: Opening a new pull request</summary>
<img src="../img/new-application-3.png" >
</details>
<details>
<summary>Figure 4: Choosing a source branch for the pull request</summary>
<img src="../img/new-application-4.png" >
</details>
<details>
<summary>Figure 5: Comparing changes between the branches</summary>
<img src="../img/new-application-5.png" >
</details>
<li>Once the pull request is created the lint workflow should be automatically triggered. You can check the status from Actions page on your GitHub repository.</li>


<details>
<summary>Figure 6: Check status for the lint workflow</summary>
<img src="../img/new-application-6.png" >
</details>
<li>Should everything go well, we are ready to merge the changes to master. Choose Pull requests and select the previously created one. Choose the option to automatically merge its changes.</li>

<details>
<summary>Figure 7: Merge pull request</summary>
<img src="../img/new-application-7.png" >
</details>
<li>With the merging of the pull request, the second workflow that we defined should have automatically been triggered.</li>

<details>
<summary>Figure 8: Helm chart publishing workflow</summary>
<img src="../img/new-application-8.png" >
</details>
<li>As a result of this workflow, a new Release should have also been made in our repository:</li>

<details>
<summary>Figure 9: Previewing the repository release</summary>
<img src="../img/new-application-9.png" >
</details>
<details>
<summary>Figure 10: Release details</summary>
<img src="../img/new-application-10.png" >
</details>
<li>If we switch to the gh-pages branch, we can see that there is a new file that has been automatically created – index.yaml which contains the necessary metadata for the Helm Repository.</li>


<details>
<summary>Figure 11: index.yaml metadata</summary>
<img src="../img/new-application-11.png" >
</details>
<h2>Step 6: Using the Helm Repository</h2>
We are now ready to use our Helm repository by simply adding it to our list with the Helm client.
<pre>
helm repo add &lt;local-repo-name&gt; https://&lt;github-username&gt;.github.io/&lt;repository-name&gt;
helm repo update
helm install &lt;release-name&gt; local-repo-name/&lt;chart-name&gt;
</pre>
You can find the generated link to your GitHub Pages website by navigating to Settings → Pages.


<details>
<summary>Figure 12: Discovering the GitHub Pages URL</summary>
<img src="../img/new-application-12.png" >
</details>
<h2>Step 7: Generating a README File with Default Values for the Chart</h2>
Each chart submitted for addition to the NMaaS catalog must have a README file containing all of the parameters that can be altered during its deployment. Such a README file can either be created manually or automatically. Helm-docs is one such tool for automated generation of chart descriptions.

<li>Download the latest release of helm-docs from the official Releases page: https://github.com/norwoodj/helm-docs/releases.</li>
<li>Install it locally:</li>

<pre>
sudo dpkg -i helm-docs_*
</pre>
<li>Set the root of your Git repository as the working directory and execute the following command:</li>
<pre>
helm-docs --output-file "../../README.md" --dry-run
</pre>
We need to specify the --output-file parameter so that the README.md file will be created in the root of our repository instead of directly where the chart is located (charts/&lt;my_chart&gt;).

<li>If the output is satisfactory, execute the same command, but now without the --dry-run parameter and push the changes either to a new branch or directly to master.</li>

<pre>
helm-docs --output-file "../../README.md"
git add .
git commit -m "add readme.md"
git push
</pre>
<h2>Conclusion</h2>
We have created an automated pipeline using GitHub Actions which would automatically check all new changes to our chart and if accepted will release a new version of it, ready to be installed in an existing Kubernetes cluster.
<br><br>
The workflow for releasing a new version of a chart is:

<li>creating a new branch and make the necessary changes, incrementing the version field in the Chart.yaml file</li>
<li>creating a new pull request to merge these changes to master. At this point the linting task will be executed</li>
<li>merge the changes to the master branch. At this point the release task will be executed.</li>
<br>
If you want to see your chart added to the NMaaS catalog please contact nmaas-dev@lists.geant.org with the following information:

<li>URL to the upstream source-code repository of the proposed application</li>
<li>Brief description of its utility</li>
<li>URL to the Docker image backing the chart</li>
<li>URL to the Helm repository</li>
<li>A list of maintainers of the Helm repository</li>
