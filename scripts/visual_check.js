import { spawn, spawnSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { PNG } from 'pngjs'
import { chromium } from 'playwright'

const BASE_URL = process.env.VISUAL_CHECK_URL || 'http://127.0.0.1:5173'
const SCREENSHOT_DIR = path.resolve('validation/screenshots')

async function isReachable(url) {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

function startDevServer() {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const args =
    process.platform === 'win32'
      ? ['/d', '/s', '/c', 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort']
      : ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort']
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  child.stdout.on('data', (chunk) => process.stdout.write(chunk))
  child.stderr.on('data', (chunk) => process.stderr.write(chunk))
  return child
}

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (await isReachable(url)) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 350))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

async function screenshotCanvasStats(page, target) {
  const box = await page.locator('canvas').boundingBox()
  if (!box) {
    return { hasCanvas: false }
  }

  const bytes = await page.screenshot({ path: target, fullPage: false })
  const png = PNG.sync.read(bytes)
  const width = Math.min(Math.floor(box.width), 360)
  const height = Math.min(Math.floor(box.height), 260)
  const startX = Math.max(0, Math.floor(box.x + (box.width - width) / 2))
  const startY = Math.max(0, Math.floor(box.y + (box.height - height) / 2))
  let brightPixels = 0
  let nonWhitePixels = 0
  let variedPixels = 0

  for (let y = startY; y < Math.min(png.height, startY + height); y += 1) {
    for (let x = startX; x < Math.min(png.width, startX + width); x += 1) {
      const index = (png.width * y + x) * 4
      const red = png.data[index]
      const green = png.data[index + 1]
      const blue = png.data[index + 2]
      const sum = red + green + blue
      if (sum > 55) {
        brightPixels += 1
      }
      if (sum < 735) {
        nonWhitePixels += 1
      }
      if (Math.max(red, green, blue) - Math.min(red, green, blue) > 8) {
        variedPixels += 1
      }
    }
  }

  return {
    hasCanvas: true,
    brightPixels,
    nonWhitePixels,
    variedPixels,
    sampledPixels: width * height,
    clientWidth: Math.round(box.width),
    clientHeight: Math.round(box.height),
  }
}

async function openScenario(browser, name, viewport, action) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  if (action) {
    await action(page)
    await page.waitForTimeout(1600)
  }

  const target = path.join(SCREENSHOT_DIR, `${name}.png`)
  const stats = await screenshotCanvasStats(page, target)
  if (
    !stats.hasCanvas ||
    stats.brightPixels < 200 ||
    stats.nonWhitePixels < 200 ||
    stats.variedPixels < 200
  ) {
    throw new Error(`${name} canvas failed screenshot pixel check: ${JSON.stringify(stats)}`)
  }
  if (consoleErrors.length || pageErrors.length) {
    throw new Error(
      `${name} browser errors: ${JSON.stringify({ consoleErrors, pageErrors }, null, 2)}`,
    )
  }

  await page.close()
  return { name, target, stats }
}

await mkdir(SCREENSHOT_DIR, { recursive: true })

let server = null
if (!(await isReachable(BASE_URL))) {
  server = startDevServer()
  await waitForServer(BASE_URL)
}

const browser = await chromium.launch()
try {
  const results = []
  results.push(
    await openScenario(browser, 'desktop', { width: 1440, height: 1000 }),
  )
  results.push(await openScenario(browser, 'narrow', { width: 390, height: 900 }))
  results.push(
    await openScenario(browser, 'front-side', { width: 1440, height: 1000 }, async (page) => {
      await page.getByRole('button', { name: 'Time side', exact: true }).click()
    }),
  )
  results.push(
    await openScenario(browser, 'calendar-side', { width: 1440, height: 1000 }, async (page) => {
      await page.getByRole('button', { name: 'Calendar side', exact: true }).click()
    }),
  )
  results.push(
    await openScenario(browser, 'exploded-view', { width: 1440, height: 1000 }, async (page) => {
      await page.getByRole('button', { name: 'Explode', exact: true }).click()
      await page.getByRole('button', { name: 'Labels', exact: true }).click()
    }),
  )
  results.push(
    await openScenario(browser, 'chime-mode', { width: 1440, height: 1000 }, async (page) => {
      await page
        .locator('.animation-section')
        .getByRole('button', { name: 'Grande', exact: true })
        .click()
    }),
  )

  console.log(JSON.stringify(results, null, 2))
} finally {
  await browser.close()
  if (server) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      })
    } else {
      server.kill()
    }
  }
}
