import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildDirectoryCategoryOptions,
  getBoardCategoryLabel,
  normalizeBoardCategories,
} from '../../src/lib/board-categories.ts'

test('normalizes board categories into stable directory slugs', () => {
  assert.deepEqual(
    normalizeBoardCategories([' Dev Tools ', 'developer-tools', 'Open Source', 'E-commerce', '', 'AI']),
    ['developer-tools', 'open-source', 'ecommerce', 'ai'],
  )
})

test('builds sorted directory category options with labels and counts', () => {
  assert.deepEqual(
    buildDirectoryCategoryOptions([
      ['developer-tools', 'saas'],
      ['devtools', 'analytics'],
      ['security'],
    ]),
    [
      { value: 'developer-tools', label: 'Developer tools', count: 2 },
      { value: 'analytics', label: 'Analytics', count: 1 },
      { value: 'saas', label: 'SaaS', count: 1 },
      { value: 'security', label: 'Security', count: 1 },
    ],
  )
})

test('formats custom category labels', () => {
  assert.equal(getBoardCategoryLabel('customer-success'), 'Customer Success')
})
