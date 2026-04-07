import type { Hypothesis } from '@w-ux/shared-types'

export interface CodeLocation {
  file: string
  line?: number
  component?: string
  confidence: number
}

export function mapToCode(hypothesis: Hypothesis): CodeLocation[] {
  const locations: CodeLocation[] = []
  
  if (hypothesis.suspectedFiles) {
    for (const file of hypothesis.suspectedFiles) {
      locations.push({ file, confidence: 0.7 })
    }
  }
  
  if (hypothesis.suspectedComponents) {
    for (const component of hypothesis.suspectedComponents) {
      locations.push({
        file: `components/${component}.tsx`,
        component,
        confidence: 0.6,
      })
    }
  }
  
  if (locations.length === 0) {
    locations.push({
      file: 'src/App.tsx',
      confidence: 0.3,
    })
  }
  
  return locations
}

export function suggestFilesFromSelector(selector: string): string[] {
  const files: string[] = []
  
  if (selector.includes('modal') || selector.includes('dialog')) {
    files.push('components/Modal.tsx', 'components/Dialog.tsx')
  }
  if (selector.includes('form') || selector.includes('input')) {
    files.push('components/Form.tsx', 'components/Input.tsx')
  }
  if (selector.includes('button') || selector.includes('submit')) {
    files.push('components/Button.tsx')
  }
  
  return files
}