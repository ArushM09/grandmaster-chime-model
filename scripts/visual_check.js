import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

/* global document */

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
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const child = spawn(
    npmCmd,
    ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  )
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

async function canvasStats(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl')
    if (!canvas || !gl) {
      return { hasCanvas: false }
    }

    const width = Math.min(canvas.width, 360)
    const height = Math.min(canvas.height, 260)
    const x = Math.max(0, Math.floor((canvas.width - width) / 2))
    const y = Math.max(0, Math.floor((canvas.height - height) / 2))
    const pixels = new Uint8Array(width * height * 4)
    gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    let brightPixels = 0
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] + pixels[index + 1] + pixels[index + 2] > 55) {
        brightPixels += 1
      }
    }

    return {
      hasCanvas: true,
      brightPixels,
      sampledPixels: width * height,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
    }
  })
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

  const stats = await canvasStats(page)
  if (!stats.hasCanvas || stats.brightPixels < 200) {
    throw new Error(`${name} canvas failed pixel check: ${JSON.stringify(stats)}`)
  }
  if (consoleErrors.length || pageErrors.length) {
    throw new Error(
      `${name} browser errors: ${JSON.stringify({ consoleErrors, pageErrors }, null, 2)}`,
    )
  }

  const target = path.join(SCREENSHOT_DIR, `${name}.png`)
  await page.screenshot({ path: target, fullPage: false })
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
    server.kill()
  }
}
