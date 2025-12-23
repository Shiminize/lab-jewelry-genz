#!/usr/bin/env node
/**
 * Quick DeepSeek connectivity check.
 * Usage: node scripts/test-deepseek.js "Describe the Aurora concierge experience."
 */

const OpenAI = require('openai')

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('DEEPSEEK_API_KEY is not set in the environment.')
    process.exit(1)
  }

  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
    timeout: 20000,
  })

  const prompt = process.argv.slice(2).join(' ') || 'Provide a single sentence about GlowGlitch concierge service.'

  const completion = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are Aurora Concierge, the luxury jewelry AI stylist for GlowGlitch.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.6,
  })

  const content = completion.choices?.[0]?.message?.content ?? '(no content)'
  console.log('\nDeepSeek response:\n')
  console.log(content.trim())
  console.log('\n— end —')
}

main().catch((error) => {
  console.error('DeepSeek test failed:', error)
  process.exit(1)
})
