import type { Hypothesis } from '@w-ux/shared-types'

export interface TestScript {
  name: string
  code: string
  selector?: string
  expectedBehavior: string
}

export function generateTest(hypothesis: Hypothesis): TestScript {
  const selector = extractSelector(hypothesis.description)
  
  switch (hypothesis.category) {
    case 'blocked-cta':
      return {
        name: `verify-blocked-cta-${hypothesis.id.slice(0, 8)}`,
        code: `
import { test, expect } from '@playwright/test'

test('${hypothesis.title}', async ({ page }) => {
  await page.goto('${hypothesis.description.includes('url') ? '${URL}' : 'http://localhost:3000'}')
  
  const element = await page.locator('${selector || 'button'}')
  
  // Check if element is visible
  await expect(element).toBeVisible()
  
  // Check if element is enabled
  const isEnabled = await element.isEnabled()
  expect(isEnabled).toBe(true)
  
  // Try to click
  await element.click()
  
  // Verify expected behavior
  ${hypothesis.description.includes('modal') ? "await expect(page.locator('.modal')).not.toBeVisible()" : '// Add assertions'}
})
        `.trim(),
        selector,
        expectedBehavior: 'Element should be clickable and respond to interaction',
      }
      
    case 'rage-click':
      return {
        name: `verify-rage-click-${hypothesis.id.slice(0, 8)}`,
        code: `
import { test, expect } from '@playwright/test'

test('${hypothesis.title}', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  const element = await page.locator('${selector || 'button'}')
  
  // Multiple rapid clicks
  for (let i = 0; i < 5; i++) {
    await element.click()
    await page.waitForTimeout(100)
  }
  
  // Should not cause errors
  await expect(page.locator('.error')).not.toBeVisible()
})
        `.trim(),
        selector,
        expectedBehavior: 'Multiple clicks should not cause errors',
      }
      
    default:
      return {
        name: `verify-${hypothesis.id.slice(0, 8)}`,
        code: `
import { test, expect } from '@playwright/test'

test('${hypothesis.title}', async ({ page }) => {
  await page.goto('http://localhost:3000')
  // TODO: Add specific test steps
})
        `.trim(),
        expectedBehavior: 'Test hypothesis behavior',
      }
  }
}

function extractSelector(description: string): string | undefined {
  const match = description.match(/on ([^\s]+)/)
  return match?.[1]
}