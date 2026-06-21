import { readFileSync, writeFileSync, existsSync } from 'fs'
import { SCENARIOS } from './src/scenarios.js'
import { runAllTests } from './src/runner.js'
import { printReport } from './src/report.js'
import { RUNS_PER_CELL, MODELS } from './src/types.js'
import type { TestResult } from './src/types.js'

const RESULTS_FILE = 'results/results.json'

async function main() {
  const reportOnly = process.argv.includes('--report-only')
  const quick = process.argv.includes('--quick')

  if (reportOnly) {
    if (!existsSync(RESULTS_FILE)) {
      console.error('No results file found. Run without --report-only first.')
      process.exit(1)
    }
    const results: TestResult[] = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'))
    printReport(results)
    return
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is not set.')
    console.error('Get a key at https://openrouter.ai and set it in your environment.')
    process.exit(1)
  }

  const scenarios = quick ? SCENARIOS.slice(0, 1) : SCENARIOS
  const modelList = MODELS.map(m => m.label).join(' / ')
  const total = 3 * RUNS_PER_CELL * MODELS.length * scenarios.length

  console.log(`Airlock Spotlighting POC${quick ? '  [--quick: 1 scenario only]' : ''}`)
  console.log(`Scenarios: ${scenarios.length}${quick ? ' (S01 only)' : ''}`)
  console.log(`Models: ${modelList}`)
  console.log(`Runs per cell: ${RUNS_PER_CELL} (3 groups × ${RUNS_PER_CELL} × ${MODELS.length} models × ${scenarios.length} scenarios = ${total} total calls)`)
  console.log(`\nRunning...\n`)

  const results = await runAllTests(scenarios, msg => console.log(msg))

  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))
  console.log(`\nResults saved to ${RESULTS_FILE}`)

  printReport(results)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
