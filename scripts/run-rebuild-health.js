#!/usr/bin/env node

const { spawnSync } = require('node:child_process')
const { exit, argv } = require('node:process')

const tasks = [
  {
    key: 'lint',
    label: 'Next.js lint',
    command: ['npm', 'run', 'lint'],
  },
  {
    key: 'safety',
    label: 'Neon safety suite',
    command: ['npm', 'run', 'safety:all'],
  },
  {
    key: 'qa',
    label: 'QA full sweep',
    command: ['npm', 'run', 'qa:full'],
  },
  {
    key: 'customizer-assets',
    label: 'Customizer asset validation',
    command: ['npm', 'run', 'validate:customizer-assets'],
  },
  {
    key: 'glb',
    label: 'GLB budget validation',
    command: ['npm', 'run', 'glb:validate'],
  },
]

const args = argv.slice(2)
const skipKeys = new Set()
let onlyKeys = null

for (const arg of args) {
  if (arg === '--help' || arg === '-h') {
    printHelp()
    exit(0)
  }

  if (arg === '--list') {
    listTasks()
    exit(0)
  }

  if (arg.startsWith('--skip=')) {
    const value = arg.replace('--skip=', '')
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => skipKeys.add(entry))
    continue
  }

  if (arg.startsWith('--only=')) {
    const value = arg.replace('--only=', '')
    const entries = value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)

    if (entries.length === 0) {
      console.error('No tasks provided to --only flag.')
      exit(1)
    }

    onlyKeys = new Set(entries)
    continue
  }

  console.warn(`Unknown argument: ${arg}`)
}

const results = []

for (const task of tasks) {
  if (skipKeys.has(task.key)) {
    results.push({ task, status: 'skipped' })
    continue
  }

  if (onlyKeys && !onlyKeys.has(task.key)) {
    results.push({ task, status: 'skipped' })
    continue
  }

  console.log(`\n▶ Running ${task.label} (${task.key})`)
  const started = Date.now()
  const result = spawnSync(task.command[0], task.command.slice(1), {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  const ended = Date.now()

  if (result.status !== 0) {
    console.error(`\n✖ ${task.label} failed after ${(ended - started) / 1000}s`)
    exit(result.status ?? 1)
  }

  console.log(`✔ ${task.label} completed in ${(ended - started) / 1000}s`)
  results.push({ task, status: 'passed', duration: (ended - started) / 1000 })
}

const executed = results.filter((entry) => entry.status === 'passed').length
const skipped = results.filter((entry) => entry.status === 'skipped').length

console.log(`\nAll selected rebuild health tasks finished. Passed: ${executed}, skipped: ${skipped}.`)
exit(0)

function listTasks() {
  console.log('Available rebuild health tasks:')
  for (const task of tasks) {
    console.log(`- ${task.key}: ${task.label}`)
  }
}

function printHelp() {
  console.log(
    `GlowGlitch Neon Dream rebuild health runner\n\nUsage: node scripts/run-rebuild-health.js [options]\n\nOptions:\n  --help, -h          Show this message\n  --list              List available task keys\n  --skip=key1,key2    Skip one or more task keys\n  --only=key1,key2    Run only the provided task keys (comma separated)\n`,
  )
}
