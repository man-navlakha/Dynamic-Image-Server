<div align="center">
  <img src="{{logo_url}}" width="100px" alt="{{product_name}}" />
  <h1 style="font-size: 38px; margin: 10px 0;">{{product_name}}</h1>
  <p>{{short_bio}}</p>
</div>

<p align="center">
  <a href="https://github.com/{{repo_owner}}/{{repo_name}}/actions">
    <img alt="Tests Passing" src="https://github.com/{{repo_owner}}/{{repo_name}}/workflows/Test/badge.svg" />
  </a>
  <a href="https://github.com/{{repo_owner}}/{{repo_name}}/graphs/contributors">
    <img alt="GitHub Contributors" src="https://img.shields.io/github/contributors/{{repo_owner}}/{{repo_name}}" />
  </a>
  <a href="https://codecov.io/gh/{{repo_owner}}/{{repo_name}}">
    <img alt="Tests Coverage" src="https://codecov.io/gh/{{repo_owner}}/{{repo_name}}/branch/master/graph/badge.svg" />
  </a>
  <a href="https://github.com/{{repo_owner}}/{{repo_name}}/issues">
    <img alt="Issues" src="https://img.shields.io/github/issues/{{repo_owner}}/{{repo_name}}?color=0088ff" />
  </a>
  <a href="https://github.com/{{repo_owner}}/{{repo_name}}/pulls">
    <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/{{repo_owner}}/{{repo_name}}?color=0088ff" />
  </a>
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/{{repo_owner}}/{{repo_name}}">
    <img alt="OpenSSF Scorecard" src="https://api.securityscorecards.dev/projects/github.com/{{repo_owner}}/{{repo_name}}/badge" />
  </a>
  
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/{{repo_owner}}/{{repo_name}}">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <br />
  <br />
</p>
<p align="center">
  <a href="{{demo_url}}">View Demo</a>
  ·
  <a href="{{report_bug_url}}">Report Bug</a>
  ·
  <a href="{{request_feature_url}}">Request Feature</a>
  ·
  <a href="{{faq_url}}">FAQ</a>
  ·
  <a href="{{ask_question_url}}">Ask Question</a>
</p>

{{#if donate_url}}
<p align="center">Love the project? Please consider <a href="{{donate_url}}">donating</a> to help it improve!</p>
{{/if}}

{{long_description}}

{{#if live_button_url}}
**[{{live_button_text}}]({{live_button_url}})**
{{/if}}

---

## 🚀 Key Features

{{#each features}}
-   **{{this.title}}** {{this.description}}
{{/each}}

---

## 🛠️ Tech Stack

-   **Client:** ![Tech Stack Icons]({{base_url}}/icons?i={{tech_stack}}&theme=dark&perline=15)

---

## 🔧 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:
{{#each prerequisites}}
* ![Tech Stack Icons]({{../base_url}}/icons?i={{this}})
{{/each}}

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone {{clone_url}}
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd {{project_dir}}
    ```

3.  **Install dependencies:**
    ```sh
    {{install_command}}
    ```

4.  **Run the development server:**
    ```sh
    {{dev_command}}
    ```
    The application will be available at `{{dev_url}}`.

    *To expose the server on your local network, use the `--host` flag:*
    ```sh
    {{dev_command}} -- --host
    ```

---

## 👥 Authors

This project was brought to life by:

{{#each authors}}
-   **{{this.name}}** - [GitHub]({{this.github}}) | [Portfolio]({{this.portfolio}})
{{/each}}

---

## 📈 Repository Activity

![RepoBeats Analytics Image](https://repobeats.axiom.co/api/embed/{{repo_owner}}/{{repo_name}} "Repobeats analytics image")

---

## 💬 Feedback

We'd love to hear your feedback! If you have any suggestions or encounter issues, please reach out to us at `{{feedback_email}}`.

---

<p align="center">
  &copy; {{copyright_year}} <a href="{{copyright_url}}">{{copyright_name}}</a>. All Rights Reserved.
</p>
