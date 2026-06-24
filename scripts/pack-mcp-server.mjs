import { rmSync, mkdirSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageDir = path.join(root, 'packages', 'mcp-server')
const outputDir = path.join(root, 'packages', 'dashboard', 'public', 'mcp')

mkdirSync(outputDir, { recursive: true })
for (const filename of readdirSync(outputDir)) {
  if (filename.startsWith('feedbacks-mcp-server-') && filename.endsWith('.tgz')) {
    rmSync(path.join(outputDir, filename))
  }
}

const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'cmd.exe' : 'npm'
const npmArgs = isWindows
  ? ['/d', '/s', '/c', `npm.cmd pack --pack-destination ${outputDir}`]
  : ['pack', '--pack-destination', outputDir]
const result = spawnSync(
  npmCommand,
  npmArgs,
  {
    cwd: packageDir,
    encoding: 'utf8',
    stdio: 'pipe',
  },
)

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.error?.message || 'Failed to package the MCP server.\n')
  process.exit(result.status || 1)
}

process.stdout.write(result.stdout)
