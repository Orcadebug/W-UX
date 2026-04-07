import { chromium } from 'playwright'

export interface InteractabilityCheck {
  selector: string
  isVisible: boolean
  isEnabled: boolean
  isClickable: boolean
  blockingElements?: string[]
}

export async function checkElementInteractability(
  url: string,
  selector: string
): Promise<InteractabilityCheck> {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(url)
    const element = page.locator(selector)

    const isVisible = await element.isVisible().catch(() => false)
    const isEnabled = await element.isEnabled().catch(() => false)

    let isClickable = false
    let blockingElements: string[] = []

    if (isVisible && isEnabled) {
      try {
        await element.click({ timeout: 1000 })
        isClickable = true
      } catch {
        isClickable = false
        blockingElements = await findBlockingElements(page, selector)
      }
    }

    await browser.close()

    return {
      selector,
      isVisible,
      isEnabled,
      isClickable,
      blockingElements: blockingElements.length > 0 ? blockingElements : undefined,
    }
  } catch (error) {
    await browser.close()
    return {
      selector,
      isVisible: false,
      isEnabled: false,
      isClickable: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function findBlockingElements(page: import('playwright').Page, selector: string): Promise<string[]> {
  return page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return ['Element not found']

    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const topElement = document.elementFromPoint(centerX, centerY)
    if (topElement && topElement !== element && !element.contains(topElement)) {
      const tag = topElement.tagName.toLowerCase()
      const className = topElement.className
      return [`${tag}${className ? '.' + className : ''}`]
    }

    return []
  }, selector)
}