declare module 'mjml' {
  interface MJMLParseResults {
    html: string
    errors: Array<{ line: number; message: string }>
  }

  export default function mjml2html(mjml: string, options?: Record<string, unknown>): MJMLParseResults
}
