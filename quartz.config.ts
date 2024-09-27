import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: " GridexX Blog",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-3HLX7XWG79",
    },
    locale: "en-US",
    baseUrl: "blog.gridexx.fr",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "League Spartan",
        body: "Roboto Condensed",
        code: "Fira Code",
      },
      colors: {
        lightMode: {
          light: "#eceff4",
          lightgray: "#e5e5e5",
          gray: "#4c566a",
          darkgray: "#434c5e",
          dark: "#2e3440",
          secondary: "#5e81ac",
          tertiary: "#88c0d0",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#23232c",
          lightgray: "#272831",
          gray: "#a8b2c1",
          darkgray: "#e6f1ff",
          dark: "#ef961a",
          secondary: "#e6f1ff",
          tertiary: "#ef961a",
          highlight: "#a8b2c1",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        // you can add 'git' here for last modified from Git
        // if you do rely on git for dates, ensure defaultDateType is 'modified'
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents({ maxDepth: 4, minEntries: 1, collapseByDefault: false }),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
