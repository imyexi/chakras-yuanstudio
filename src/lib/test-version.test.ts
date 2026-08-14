import { describe, expect, it } from 'vitest'

import { getTestShareUrl, resolveTestVersion } from '@/lib/test-version'

describe('测试版本契约', () => {
  it.each(['/chakra', '/chakra/'])('%s 解析为 V2', (pathname) => {
    expect(resolveTestVersion(pathname)).toBe('v2')
  })

  it.each(['/chakras', '/chakras/', '/chakrafoo', '/', ''])('%s 默认解析为 V1', (pathname) => {
    expect(resolveTestVersion(pathname)).toBe('v1')
  })

  it('为两个版本返回各自公开分享地址', () => {
    expect(getTestShareUrl('v1')).toBe('https://yyry.studio/chakras')
    expect(getTestShareUrl('v2')).toBe('https://yyry.studio/chakra')
  })
})
