---
title: Create a spell check jobs with GitLab
description: An example how to write a GitLab CI/CD job to check spelling in your markdown files
tags:
  - gitlab
  - ci/cd
  - development
draft: false
slug: create-spell-check-job-gitlab
date: 2022-10-02
---

<script>

  const handleThemeChange = (theme) => {
    const repoCard = document.getElementById('codespell-repo-card');
    if (repoCard) {
      if (theme === "dark") {
        repoCard.setAttribute('data-theme', 'dark-theme');
      } else {
        repoCard.removeAttribute('data-theme');
      }
    }
  };

  // Initial theme check
  const initialTheme = document.body.getAttribute('data-theme');
  handleThemeChange(initialTheme);

  // Listen for future theme changes
  document.addEventListener("themechange", (e) => {
    console.log("Theme changed to " + e.detail.theme);
    handleThemeChange(e.detail.theme);
  });


// document.addEventListener("themechange", (e) => {
//   console.log("Theme changed to " + e.detail.theme); // either "light" or "dark"
  
//   // Get all elements with the class 'repo-card'
//   const repoCards = document.querySelectorAll('.repo-card');
  
//   repoCards.forEach(card => {
//     if (e.detail.theme === "dark") {
//       // Add data-theme attribute for dark theme
//       card.setAttribute('data-theme', 'dark-theme');
//     } else {
//       // Remove data-theme attribute for light theme
//       card.removeAttribute('data-theme');
//     }
//   });
// });
</script>
<script src="https://tarptaeya.github.io/repo-card/repo-card.js"></script>

## Context

During my work at **R2Devops**, I had the mission to improve our hub pipeline. One of our most interesting job [spell_check](https://r2devops.io/_/r2devops-bot/spell_check) was broken and I had to fix it 🔨.

Unfortunately, the developer who writes it wasn’t here anymore and it wasn’t well documented.

![Untitled](https://oldblog.gridexx.fr/_next/image?url=https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252Fe2b363f5-9a59-4af6-90a2-2b7a77e443be%252FUntitled.png%3Ftable%3Dblock%26id%3D1764212b-7904-4c7b-a7ec-96c1d134082c%26cache%3Dv2&w=1200&q=75)

_The [console](https://gitlab.com/r2devops/hub/-/jobs/3081007272) of the broken spell_check job_ 😢

That’s why I decided to rewrite it with another tool. Thanks to some research I found a helpful open-source tool and today I will share how I put it into reusable GitLab job.

Let’s dive into it 🤿

## The miracle tool

If you have never heard of [codespell](https://github.com/codespell-project/codespell), it's a command line utility to check for common misspellings with the possibility to add your own dictionaries.

[GitHub - codespell-project/codespell: check code for common misspellings](https://github.com/codespell-project/codespell)

<div id="codespell-repo-card" class="repo-card" data-repo="codespell-project/codespell"></div>

_Almost 2k stars! Give them power too_ 🌟

**Installation and usage is really simple :**

```bash
pip install codespell=<version>
codespell <options>
```

What’s really nice with it, it’s the console output, which shows in order :

1. The file where’s the typo
2. The Misspelled word
3. One or many rewrite suggestion

![Untitled](https://oldblog.gridexx.fr/_next/image?url=https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252Fbd530b03-e156-4a6a-aa4e-f659f29c0c57%252FUntitled.png%3Ftable%3Dblock%26id%3D97e5bd14-d773-4ab0-92ff-341d87c3fd33%26cache%3Dv2&w=750&q=75)

In a nutshell, here are the cooles features :

- Ignore specific files for the analysis
- Use a custom dictionary with your words
- Analyze files based on Regex
- And many more…

## Making a CI/CD jobs

In the process of writing a job, we have some standard to have a job that is easily usable, customizable and maintainable

### 1. Choosing the image

Choosing the image could seems innocuous, be it must be consider carrefully in order to respects the standards written before.

I first check on [hub.docker.com](http://hub.docker.com), if there is an available image for `codespell`. As there isn’t any, I decide to take the official python image based on the lightweight Alpine distribution : `python:3.10-alpine3.16`.

### 2. Back on track with the right stage

Here are the common stages we defined :

- build
- tests
- provision
- review
- release
- deploy
- others

For this stage the `tests` was the most appropriate, as it performs spell check in the code.

### 3. Use reusable variables

The Myspelling behavior of the [hub](https://gitlab.com/r2devops/hub/) project where it aims to be used, determines some condition for the job :

- [ ] Misspell files inside a specific directory
- [ ] Ignore some specific world in a `dictionary` file
- [ ] Ignore some file inside this directory if they contains code

It brought us with the current content in the `.gitlab-ci.yml` file :

```yaml
codespell:
  stage: tests
  image:
    name: python:3.10-alpine3.16
    entrypoint: [""]
  variables:
    CODESPELL_DICTIONARY: "dictionary.txt"
    #separate each file to ignore with a space
    CODESPELL_IGNORE_FILES: ""
    CODESPELL_VERSION: "2.2.1"
    IMAGE_TAG: "3.10-alpine3.16"
```

### 4. Write like a scribe

It is the core of the job, what command will be executed. This part written inside the `script` section of the file, is based on all previous elements and include them in the code to performs the determined condition.

This section won’t be described, if you’re interested, this job is available on the platform r2devops, [here](https://r2devops.io/_/r2devops-bot/codespell)

![Untitled](https://oldblog.gridexx.fr/_next/image?url=https%3A%2F%2Fwww.notion.so%2Fimage%2Fhttps%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252F868a0b2c-1be5-4069-9a83-5c5b6d28c1ce%252FUntitled.png%3Ftable%3Dblock%26id%3D0abb1d8e-ec3a-457f-9628-081506f92515%26cache%3Dv2&w=750&q=75)
