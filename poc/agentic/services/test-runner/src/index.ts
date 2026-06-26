import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { SCENARIOS } from './scenarios.js'
import { runAllTests } from './runner.js'
import { printReport } from './report.js'
import { RUNS_PER_CELL, GROUPS } from './types.js'
import type { SessionResult, Group } from './types.js'

const RESULTS_DIR = '/app/results'

function resultFilename(): string {
  if (!existsSync(RESULTS_DIR)) mkdirSync(RESULTS_DIR, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return join(RESULTS_DIR, `results-${ts}.json`)
}

async function verifyPassthrough(): Promise<void> {
  const telemetryUrl = process.env['TELEMETRY_URL'] ?? 'http://ops-telemetry:9001'
  try {
    const resp = await fetch(`${telemetryUrl}/health`)
    if (!resp.ok) throw new Error(`Status ${resp.status}`)
    const data = (await resp.json()) as { status: string }
    if (data.status !== 'ok') throw new Error(`Unexpected status: ${data.status}`)
    console.log(`Telemetry service: OK`)
  } catch (err) {
    console.error(`Telemetry service unreachable at ${telemetryUrl}: ${err}`)
    process.exit(1)
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const runsIdx = process.argv.indexOf('--runs')
  const runsArg = runsIdx !== -1 ? parseInt(process.argv[runsIdx + 1] ?? '', 10) : NaN

  // --scenarios B03,B05  OR  --scenario B03 --scenario B05
  const scenariosIdx = process.argv.indexOf('--scenarios')
  const scenarioIds: string[] = scenariosIdx !== -1
    ? (process.argv[scenariosIdx + 1] ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    : process.argv
        .map((arg, i) => arg === '--scenario' ? process.argv[i + 1] : null)
        .filter((s): s is string => s !== null)

  let scenarios = SCENARIOS
  if (scenarioIds.length > 0) {
    scenarios = SCENARIOS.filter((s) => scenarioIds.includes(s.id))
    const missing = scenarioIds.filter((id) => !SCENARIOS.find((s) => s.id === id))
    if (missing.length > 0) {
      console.error(`Unknown scenario(s): ${missing.join(', ')}. Available: ${SCENARIOS.map((s) => s.id).join(', ')}`)
      process.exit(1)
    }
  }

  // --groups control  OR  --groups control,clause-only
  const groupsIdx = process.argv.indexOf('--groups')
  const groupFilter: string[] = groupsIdx !== -1
    ? (process.argv[groupsIdx + 1] ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const runsPerCell = !isNaN(runsArg) && runsArg > 0 ? runsArg : RUNS_PER_CELL
  const activeGroups: Group[] = groupFilter.length > 0
    ? GROUPS.filter((g) => groupFilter.includes(g))
    : [...GROUPS]
  if (groupFilter.length > 0 && activeGroups.length === 0) {
    console.error(`Unknown group(s): ${groupFilter.join(', ')}. Available: ${GROUPS.join(', ')}`)
    process.exit(1)
  }
  const totalSessions = scenarios.length * activeGroups.length * runsPerCell

  const modeLabel = dryRun
    ? 'DRY RUN (no agent sessions)'
    : `${scenarios.length} scenario(s) × ${activeGroups.length} group(s) × ${runsPerCell} runs`

  console.log('\nAgent test harness')
  console.log('═'.repeat(60))
  console.log(`Mode: ${modeLabel}`)
  console.log(`Scenarios: ${scenarios.map((s) => s.id).join(', ')}`)
  console.log(`Groups: ${activeGroups.join(', ')}`)
  console.log(`Runs/cell: ${runsPerCell}  |  Total sessions: ${totalSessions}`)
  console.log('')

  await verifyPassthrough()

  if (dryRun) {
    console.log('\nDry run complete. Services are reachable. Exiting without running agent sessions.')
    process.exit(0)
  }

  if (!process.env['ANTHROPIC_API_KEY']) {
    console.error('ANTHROPIC_API_KEY is not set.')
    process.exit(1)
  }

  console.log('\nStarting sessions...\n')
  const results = await runAllTests(scenarios, (msg) => console.log(msg), runsPerCell, activeGroups)

  const filename = resultFilename()
  const output: { meta: object; results: SessionResult[] } = {
    meta: {
      timestamp: new Date().toISOString(),
      scenarioIds: scenarios.map((s) => s.id),
      runsPerCell,
      totalSessions: results.length,
      mode: scenarioIds.length === 1 ? `single:${scenarioIds[0]}` : `${scenarios.length}-scenarios`,
    },
    results,
  }
  writeFileSync(filename, JSON.stringify(output, null, 2))
  console.log(`\nResults saved: ${filename}`)

  printReport(results)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
