---
title: Make a blog post with Obsidian
description: How to write your first blog post with Obsidian and Quartz
  - obsidian
  - markdown
  - development
draft: false
date: 2024-02-19
---

## Make a blog post on Quartz

### TL;DR

This is a guide on how to make a blog post on Quartz using Obsidian.

1. Clone the template
  Clone the template available on [Github](https://github.com/new?template_name=quartz&template_owner=jackyzha0)
2. Write your post
  Write your post in markdown inside the `content` folder. Open a new vault in Obsidian and start writing your post.
3. See the result

    ```bash
    npm install
    npx quartz build --serve
    ```

4. Push your changes

    ```bash
    git add .
    git commit -m "Add my first post"
    git push
    ```

    >[!SUCCESS]
    > You have successfully made your first blog post on Quartz.

### Introduction

#### What is Quartz?

Quartz is a static site generator that uses markdown files to generate a website. It is a great tool for developers who want to write blog posts in markdown and host them on their own website. Quartz is built with TypeScript and is easy to use. It is also open source and free to use.

I'm using this post to test the Quartz plugin for Obsidian. I was using **Notion** for my blog posts, but I wanted to switch to a more developer-friendly tool.
Obsidian has the advantage to be open source and to be able to use markdown files. Moreover, there are plenty of plugins available to customize the experience.

To be continued...
