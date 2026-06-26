#!/usr/bin/env node
// Generates a Verdaccio storage entry for an npm package at build time.
// Usage: node build-storage.js <pkg-dir> <out-dir>
// Creates <out-dir>/<package-name>/<pkg>-<version>.tgz and package.json.
// Avoids any runtime `npm publish` step — package is immediately available.
'use strict'
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const crypto = require('crypto')

const pkgDir = path.resolve(process.argv[2])
const outDir = path.resolve(process.argv[3])

process.chdir(pkgDir)
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

fs.mkdirSync(outDir, { recursive: true })

// npm pack creates the tarball in the current directory
spawnSync('npm', ['pack'], { stdio: 'pipe' })
// npm pack strips the @ and replaces / with - for scoped packages
// (@acme/diagnostics@1.0.0 → acme-diagnostics-1.0.0.tgz)
const tgzBaseName = pkg.name.startsWith('@')
  ? pkg.name.slice(1).replace('/', '-')
  : pkg.name
const tgzName = `${tgzBaseName}-${pkg.version}.tgz`
fs.copyFileSync(tgzName, path.join(outDir, tgzName))

const tgzBuf = fs.readFileSync(tgzName)
const shasum = crypto.createHash('sha1').update(tgzBuf).digest('hex')
const integrity = 'sha512-' + crypto.createHash('sha512').update(tgzBuf).digest('base64')

// Verdaccio registry metadata format
const meta = {
  _id: pkg.name,
  name: pkg.name,
  description: pkg.description ?? '',
  'dist-tags': { latest: pkg.version },
  versions: {
    [pkg.version]: {
      ...pkg,
      _id: `${pkg.name}@${pkg.version}`,
      dist: {
        tarball: `http://verdaccio/${pkg.name}/-/${tgzName}`,
        shasum,
        integrity,
      },
    },
  },
  time: {
    modified: new Date().toISOString(),
    [pkg.version]: new Date().toISOString(),
  },
}

fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify(meta, null, 2))
console.log(`Storage entry: ${pkg.name}@${pkg.version}  shasum=${shasum}`)
