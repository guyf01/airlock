import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { SCENARIOS } from './src/scenarios.js'
import { runAllTests } from './src/runner.js'
import { printReport } from './src/report.js'
import { RUNS_PER_CELL, MODELS, MODEL_PRICING } from './src/types.js'
import type { TestResult, ResultsFile } from './src/types.js'

const RESULTS_DIR = 'results'

function nextResultNumber(): number {
  if (!existsSync(RESULTS_DIR)) return 1
  const nums = readdirSync(RESULTS_DIR)
    .map(f => f.match(/^result(\d+)-/))
    .filter(Boolean)
    .map(m => parseInt(m![1], 10))
  return nums.length ? Math.max(...nums) + 1 : 1
}

function resultFilename(label: string): string {
  const n = nextResultNumber()
  const slug = label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
  return join(RESULTS_DIR, `result${n}-${slug}.json`)
}

function estimateCost(results: TestResult[]): number {
  let total = 0
  for (const r of results) {
    const model = MODELS.find(m => m.label === r.model)
    if (!model) continue
    const pricing = MODEL_PRICING[model.id]
    if (!pricing) continue
    total += (r.inputTokens / 1_000_000) * pricing.inputPer1M
    total += (r.outputTokens / 1_000_000) * pricing.outputPer1M
  }
  return total
}

function latestResultsFile(): string | null {
  if (!existsSync(RESULTS_DIR)) return null
  const files = readdirSync(RESULTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse()
  return files[0] ? join(RESULTS_DIR, files[0]) : null
}

async function main() {
  const reportOnly = process.argv.includes('--report-only')
  const quick = process.argv.includes('--quick')
  const labelIdx = process.argv.indexOf('--label')
  const labelArg = labelIdx !== -1 ? process.argv[labelIdx + 1] : null

  if (reportOnly) {
    const file = latestResultsFile()
    if (!file) {
      console.error('No results files found in results/. Run without --report-only first.')
      process.exit(1)
    }
    console.log(`Loading: ${file}\n`)
    const data: ResultsFile = JSON.parse(readFileSync(file, 'utf8'))
    printReport(data.results)
    return
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is not set.')
    console.error('Get a key at https://openrouter.ai and set it in your environment.')
    process.exit(1)
  }

  const scenarios = quick ? SCENARIOS.slice(0, 1) : SCENARIOS
  const label = labelArg ?? (quick ? 'quick' : 'full')
  const modelList = MODELS.map(m => m.label).join(' / ')
  const total = 3 * RUNS_PER_CELL * MODELS.length * scenarios.length

  console.log(`Airlock Spotlighting POC${quick ? '  [--quick: 1 scenario only]' : ''}`)
  console.log(`Scenarios: ${scenarios.length}`)
  console.log(`Models: ${modelList}`)
  console.log(`Runs per cell: ${RUNS_PER_CELL} (3 groups × ${RUNS_PER_CELL} × ${MODELS.length} models × ${scenarios.length} scenarios = ${total} total calls)`)
  console.log(`\nRunning...\n`)

  const results = await runAllTests(scenarios, msg => console.log(msg))

  const totalInputTokens = results.reduce((s, r) => s + r.inputTokens, 0)
  const totalOutputTokens = results.reduce((s, r) => s + r.outputTokens, 0)
  const estimatedCostUsd = estimateCost(results)

  const file: ResultsFile = {
    meta: {
      timestamp: new Date().toISOString(),
      label,
      scenarioIds: scenarios.map(s => s.id),
      modelLabels: MODELS.map(m => m.label),
      runsPerCell: RUNS_PER_CELL,
      totalCalls: results.length,
      totalInputTokens,
      totalOutputTokens,
      estimatedCostUsd,
    },
    results,
  }

  const filename = resultFilename(label)
  writeFileSync(filename, JSON.stringify(file, null, 2))

  console.log(`\nResults saved to ${filename}`)
  console.log(`Tokens used: ${totalInputTokens.toLocaleString()} input / ${totalOutputTokens.toLocaleString()} output`)
  console.log(`Estimated cost: $${estimatedCostUsd.toFixed(4)} USD`)

  printReport(results)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
