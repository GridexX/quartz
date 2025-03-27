import { QuartzTransformerPlugin } from "../types"
import rehypePrettyCode, { Options as CodeOptions, Theme as CodeTheme } from "rehype-pretty-code"
import { getHighlighter } from "shiki"
import { readFile } from "fs/promises"
import { surrealSyntax } from "./surrealSyntax"
// import the static highlighter from the syntax directory
// import
interface Theme extends Record<string, CodeTheme> {
  light: CodeTheme
  dark: CodeTheme
}

interface Options {
  theme?: Theme
  keepBackground?: boolean
}

const defaultOptions: Options = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
}

export const SyntaxHighlighting: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const options = {
    getHighlighter: (options: any) =>
      getHighlighter({
        ...options,
        langs: ["plaintext", surrealSyntax],
      }),
  }
  const allOptions = { ...defaultOptions, ...userOpts, ...options }
  const opts: CodeOptions = allOptions

  return {
    name: "SyntaxHighlighting",
    htmlPlugins() {
      return [[rehypePrettyCode, opts]]
    },
  }
}
