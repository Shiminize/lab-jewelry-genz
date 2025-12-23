import fs from 'fs'
import path from 'path'

type TokenMap = Record<string, string>

let cachedTokens: TokenMap | null = null

function parseTokens(): TokenMap {
  if (cachedTokens) {
    return cachedTokens
  }

  const cssPath = path.join(process.cwd(), 'app/styles/tokens.css')
  let cssContent = ''
  try {
    cssContent = fs.readFileSync(cssPath, 'utf8')
  } catch (error) {
    console.warn('[designTokens] unable to read tokens.css', error)
  }

  const map: TokenMap = {}
  const tokenRegex = /--([\w-]+)\s*:\s*([^;]+);/g
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(cssContent)) !== null) {
    const [, name, value] = match
    map[name] = value.trim()
  }

  cachedTokens = map
  return map
}

export function getDesignToken(name: string) {
  return parseTokens()[name] ?? ''
}
