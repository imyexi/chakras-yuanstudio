'use client'

import { useEffect, useRef, useState } from 'react'
import { ChakraArchetypeAvatar } from '@/components/chakra-archetype-avatar'
import { ChakraScoreChart } from '@/components/chakra-score-chart'
import { femaleArchetypeCardCopy } from '@/lib/archetype-card-copy'
import { chakras } from '@/lib/chakra-data'
import {
  formatArchetypePeople,
  generateChakraArchetypeResult,
} from '@/lib/chakra-archetypes'
import type { BackupStatus } from '@/hooks/use-test-session'
import type { StoredResult } from '@/lib/test-session'

export const RESULT_SHARE_ACTIONS_ID = 'result-share-actions'

const RARE_ARCHETYPE_CODES = new Set([
  'Crown-ThirdEye',
  'Crown-Throat',
  'ThirdEye-Crown',
  'ThirdEye-Throat',
  'Crown-Heart',
  'ThirdEye-Heart',
])

const BACKUP_COPY: Partial<Record<BackupStatus, string>> = {
  saving: '正在备份结果',
  saved: '结果已在线备份',
  failed: '结果已保存在当前设备，在线备份暂未完成',
}

function formatSignedScore(score: number) {
  const rounded = Math.round(score)
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

function buildShareText(displayName: string, headline: string, people: string) {
  return `我的脉轮人物原型：${displayName}\n\n${headline}\n\n代表人物参考：${people || '当前原型暂无人物参考'}\n\nhttps://yyry.studio/chakras`
}

function legacyCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.readOnly = true
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)

  try {
    textarea.select()
    return typeof document.execCommand === 'function' && document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

export function ResultPage({
  result,
  backupStatus,
  storageWarning,
  onRestart,
}: {
  result: StoredResult
  backupStatus: BackupStatus
  storageWarning: string | null
  onRestart(): void
}): React.ReactNode {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'failed'>('idle')
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const copyAttemptRef = useRef(0)
  const archetypeResult = generateChakraArchetypeResult(result.scores)
  const archetypeKey = `${archetypeResult.primary.key}_${archetypeResult.secondary.key}`
  const selectedCopy = femaleArchetypeCardCopy[archetypeKey]
  const displayName = selectedCopy?.displayName ?? archetypeResult.archetype.name
  const displayHeadline = selectedCopy?.headline ?? archetypeResult.archetype.headline
  const people = archetypeResult.archetype.celebrities.slice(0, 3)
  const shareText = buildShareText(displayName, displayHeadline, formatArchetypePeople(people))
  const backupCopy = BACKUP_COPY[backupStatus]
  const rawAverage = Math.round(
    chakras.reduce((sum, chakra) => sum + (result.scores[chakra.name] ?? 0), 0) / chakras.length
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      copyAttemptRef.current += 1
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
        copyTimerRef.current = null
      }
    }
  }, [])

  async function handleCopy() {
    const attempt = copyAttemptRef.current + 1
    copyAttemptRef.current = attempt
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current)
      copyTimerRef.current = null
    }

    const isCurrentAttempt = () => mountedRef.current && copyAttemptRef.current === attempt

    let copied = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        if (!isCurrentAttempt()) return
        copied = true
      }
    } catch {
      if (!isCurrentAttempt()) return
      copied = false
    }

    if (!isCurrentAttempt()) return
    if (!copied) copied = legacyCopy(shareText)

    if (!isCurrentAttempt()) return
    if (!copied) {
      setCopyState('failed')
      return
    }

    setCopyState('success')
    copyTimerRef.current = setTimeout(() => {
      if (!isCurrentAttempt()) return
      setCopyState('idle')
      copyTimerRef.current = null
    }, 2000)
  }

  function scrollToShareActions() {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth'
    document.getElementById(RESULT_SHARE_ACTIONS_ID)?.scrollIntoView({ behavior, block: 'start' })
  }

  return (
    <article className="result-report">
      <header className="result-report__header">
        <div>
          <p className="result-report__eyebrow">CHAKRA ARCHETYPE REPORT</p>
          <h1>你的脉轮人物原型报告</h1>
          <p>用于理解你此刻的能量结构、优势来源与成长课题。</p>
        </div>
        <div className="result-report__quick-actions" aria-label="结果快捷操作">
          <button type="button" onClick={scrollToShareActions}>分享结果</button>
          <button type="button" aria-label="顶部重新测试" onClick={onRestart}>重新测试</button>
        </div>
        <div className="result-report__status">
          {backupCopy && <p role="status">{backupCopy}</p>}
          {storageWarning && <p role="alert">{storageWarning}</p>}
        </div>
      </header>

      <section className="result-hero" aria-labelledby="result-archetype-title">
        <div className="result-hero__copy">
          <p className="result-hero__family">{archetypeResult.archetype.family}</p>
          <h2 id="result-archetype-title">{displayName}</h2>
          <p className="result-hero__formal-name">{archetypeResult.archetype.name}</p>
          <p className="result-hero__headline">{displayHeadline}</p>
        </div>
        <ChakraArchetypeAvatar
          name={displayName}
          code={archetypeResult.archetype.code}
          primaryKey={archetypeResult.primary.key}
          secondaryKey={archetypeResult.secondary.key}
          gender="female"
          variant="hero"
          showCaption={false}
        />
      </section>

      <section className="result-summary" aria-label="结果摘要">
        <div style={{ '--result-accent': 'var(--chakra-heart)' } as React.CSSProperties}>
          <p>主导能量</p>
          <strong>{archetypeResult.primary.name} {formatSignedScore(archetypeResult.primary.score)}</strong>
        </div>
        <div style={{ '--result-accent': 'var(--chakra-throat)' } as React.CSSProperties}>
          <p>辅助风格</p>
          <strong>{archetypeResult.secondary.name} {formatSignedScore(archetypeResult.secondary.score)}</strong>
        </div>
        <div style={{ '--result-accent': 'var(--chakra-root)' } as React.CSSProperties}>
          <p>成长课题</p>
          <strong>{archetypeResult.lowest.name} {formatSignedScore(archetypeResult.lowest.score)}</strong>
        </div>
        <div style={{ '--result-accent': 'var(--primary)' } as React.CSSProperties}>
          <p>整体结构</p>
          <strong>{archetypeResult.energyStructure.name} · 平均 {rawAverage}%</strong>
        </div>
      </section>

      <section className="result-section result-people" aria-labelledby="result-people-title">
        <div className="result-section__heading">
          <p>PUBLIC FIGURES</p>
          <h2 id="result-people-title">代表人物参考</h2>
        </div>
        <p className="result-people__boundary">仅用于帮助理解该原型呈现出的公众气质，不代表对人物真实性格、经历、成就或心理状态的判断。</p>
        {people.length > 0 ? (
          <ul className="result-people__list">
            {people.map((person) => (
              <li key={`${person.name}-${person.enName ?? ''}`}>
                <span>{person.name}</span>
                {person.enName && <small>{person.enName}</small>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="result-people__empty">当前原型暂无人物参考</p>
        )}
      </section>

      <section className="result-section" aria-labelledby="result-score-title">
        <div className="result-section__heading">
          <p>RAW SCORES</p>
          <h2 id="result-score-title">七轮数据与依据</h2>
        </div>
        <ChakraScoreChart
          scores={result.scores}
          primaryName={archetypeResult.primary.name}
          secondaryName={archetypeResult.secondary.name}
          lowestName={archetypeResult.lowest.name}
        />
      </section>

      <section className="result-section result-analysis" aria-labelledby="result-analysis-title">
        <div className="result-section__heading">
          <p>ANALYSIS</p>
          <h2 id="result-analysis-title">深度分析与成长方向</h2>
        </div>
        {RARE_ARCHETYPE_CODES.has(archetypeResult.archetype.code) && (
          <p className="result-analysis__rare">这是一个相对少见的能量组合</p>
        )}
        <article>
          <h3>你的当前能量模式</h3>
          <p>{archetypeResult.summary}</p>
        </article>
        <article>
          <h3>优势如何形成</h3>
          <ul>
            {archetypeResult.strengths.map((strength) => <li key={strength}>{strength}</li>)}
          </ul>
        </article>
        <article>
          <h3>需要留意什么</h3>
          <p>{archetypeResult.shadow}</p>
        </article>
        <p className="result-analysis__boundary">关系模式、工作模式与个人调整建议将在咨询中结合你的具体情况展开。</p>
      </section>

      <section
        id={RESULT_SHARE_ACTIONS_ID}
        className="result-section result-share"
        aria-labelledby="result-share-title"
      >
        <div className="result-share__copy">
          <div className="result-section__heading">
            <p>SHARE &amp; CONTINUE</p>
            <h2 id="result-share-title">分享与继续探索</h2>
          </div>
          <p>复制这份简短摘要，或添加圆圆微信继续了解完整分析。</p>
          <button className="result-share__primary" type="button" onClick={handleCopy}>复制分享摘要</button>
          {copyState === 'success' && <p className="result-share__feedback" aria-live="polite">已复制，可粘贴分享给好友</p>}
          {copyState === 'failed' && (
            <div className="result-share__manual">
              <p>自动复制失败，请手动选择下方文字</p>
              <textarea aria-label="手动复制分享摘要" readOnly value={shareText} />
            </div>
          )}
          <button className="result-share__secondary" type="button" onClick={onRestart}>重新测试</button>
        </div>
        <div className="result-share__qr">
          <img src="/chakras/qrcode.png" alt="添加圆圆微信以咨询完整分析的二维码" />
        </div>
      </section>

      <footer className="result-report__footer">
        <p>本测试结果仅用于自我探索、情绪觉察和个人成长参考，不构成医学、心理诊断或治疗建议。如你正经历持续的心理痛苦或身体不适，请寻求专业人士支持。</p>
        <p>@圆圆如意</p>
      </footer>
    </article>
  )
}
