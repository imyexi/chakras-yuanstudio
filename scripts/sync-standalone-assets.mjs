import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const nextStaticDir = path.join(rootDir, '.next', 'static')
const publicDir = path.join(rootDir, 'public')

const staticTargets = [
  path.join(rootDir, '.next', 'standalone', '.next', 'static'),
  path.join(rootDir, '.next', 'standalone', 'chakras-yuanstudio', '.next', 'static')
]

const publicTargets = [
  path.join(rootDir, '.next', 'standalone', 'public'),
  path.join(rootDir, '.next', 'standalone', 'chakras-yuanstudio', 'public')
]

const resetDir = (dirPath) => {
  rmSync(dirPath, { recursive: true, force: true })
  mkdirSync(dirPath, { recursive: true })
}

if (!existsSync(nextStaticDir)) {
  throw new Error(`Missing Next static directory: ${nextStaticDir}`)
}

for (const targetDir of staticTargets) {
  resetDir(targetDir)
  cpSync(nextStaticDir, targetDir, { recursive: true })
}

if (existsSync(publicDir)) {
  for (const targetDir of publicTargets) {
    resetDir(targetDir)
    cpSync(publicDir, targetDir, { recursive: true })
  }
}

console.log('Standalone assets synced to all runtime directories.')
