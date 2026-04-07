import { chromium, type Browser, type Page } from 'playwright'
import type { TestScript } from './test-builder'

export interface TestResult {
  passed: boolean
  duration: number
  error?: string
  screenshot?: string
}

export class TestRunner {
  private browser: Browser | null = null

  async init() {
    this.browser = await chromium.launch()
  }

  async runTest(test: TestScript, url: string): Promise<TestResult> {
    if (!this.browser) {
      await this.init()
    }

    const context = await this.browser!.newContext()
    const page = await context.newPage()
    const startTime = Date.now()

    try {
      await page.goto(url)

      if (test.selector) {
        const element = page.locator(test.selector)
        await element.waitFor({ state: 'visible', timeout: 5000 })

        const isVisible = await element.isVisible()
        const isEnabled = await element.isEnabled()

        if (!isVisible) {
          throw new Error(`Element ${test.selector} is not visible`)
        }

        if (!isEnabled) {
          throw new Error(`Element ${test.selector} is not enabled`)
        }

        await element.click()
      }

      const duration = Date.now() - startTime
      await context.close()

      return { passed: true, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      const screenshot = await page.screenshot({ encoding: 'base64' }).catch(() => undefined)
      await context.close()

      return {
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        screenshot,
      }
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}