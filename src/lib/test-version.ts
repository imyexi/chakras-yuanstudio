export type TestVersion = 'v1' | 'v2'

const TEST_SHARE_URLS: Record<TestVersion, string> = {
  v1: 'https://yyry.studio/chakras',
  v2: 'https://yyry.studio/chakra',
}

export function resolveTestVersion(pathname: string): TestVersion {
  return pathname === '/chakra' || pathname === '/chakra/' ? 'v2' : 'v1'
}

export function getTestShareUrl(version: TestVersion): string {
  return TEST_SHARE_URLS[version]
}
