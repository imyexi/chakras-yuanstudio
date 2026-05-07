import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { ChakraKey } from '@/lib/chakra-archetypes'

export type ArchetypeAvatarGender = 'female' | 'male'

type ChakraArchetypeAvatarProps = {
  name: string
  code: string
  primaryKey: ChakraKey
  secondaryKey: ChakraKey
  gender?: ArchetypeAvatarGender
  variant?: 'featured' | 'compact' | 'hero'
  active?: boolean
  showCaption?: boolean
  className?: string
}

const chakraAccent: Record<ChakraKey, string> = {
  root: '#EF4444',
  sacral: '#F97316',
  solar: '#FACC15',
  heart: '#22C55E',
  throat: '#38BDF8',
  thirdEye: '#A78BFA',
  crown: '#E879F9'
}

const publicAssetBasePath = '/chakras'

function slugifyArchetypeCode(code: string) {
  return code
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getArchetypeImageSrc(code: string, gender: ArchetypeAvatarGender) {
  const extension = gender === 'female' ? 'png' : 'webp'
  return `${publicAssetBasePath}/archetypes/${gender}/${slugifyArchetypeCode(code)}.${extension}`
}

function ImagePlaceholder({
  isCompact,
  primaryKey,
  secondaryKey
}: {
  isCompact: boolean
  primaryKey: ChakraKey
  secondaryKey: ChakraKey
}) {
  return (
    <div
      className={[
        'flex h-full w-full items-center justify-center rounded-md border border-white/10 bg-slate-950/35',
        isCompact ? 'text-[10px]' : 'text-sm'
      ].join(' ')}
      style={{
        background: `linear-gradient(135deg, ${chakraAccent[primaryKey]}24, ${chakraAccent[secondaryKey]}18 55%, rgba(15,23,42,0.55))`
      }}
    >
      <span className="font-medium text-white/55">图片生成中</span>
    </div>
  )
}

export function ChakraArchetypeAvatar({
  name,
  code,
  primaryKey,
  secondaryKey,
  gender = 'female',
  variant = 'featured',
  active = false,
  showCaption = true,
  className = ''
}: ChakraArchetypeAvatarProps) {
  const isCompact = variant === 'compact'
  const isHero = variant === 'hero'
  const imageSrc = useMemo(() => getArchetypeImageSrc(code, gender), [code, gender])
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null)
  const imageFailed = failedImageSrc === imageSrc
  const imageFrameClass = isCompact
    ? 'mx-auto aspect-square w-full max-w-[132px]'
    : isHero
      ? gender === 'female'
        ? 'mx-auto aspect-[7/5] w-full max-w-[520px]'
        : 'mx-auto aspect-square w-full max-w-[280px]'
      : 'mx-auto aspect-square w-full max-w-[240px]'
  const imageSizes = isCompact
    ? '(max-width: 768px) 44vw, 132px'
    : isHero
      ? gender === 'female'
        ? '(max-width: 768px) 78vw, 520px'
        : '(max-width: 768px) 70vw, 280px'
      : '(max-width: 768px) 80vw, 240px'

  return (
    <div
      className={[
        'relative text-center transition-all duration-300',
        isHero ? '' : 'overflow-hidden rounded-lg border',
        !isHero && active ? 'border-amber-300/80 bg-amber-300/10 shadow-lg shadow-amber-500/10' : '',
        !isHero && !active ? 'border-white/10 bg-white/[0.06]' : '',
        isCompact ? 'px-2 py-3 hover:-translate-y-1 hover:border-white/30' : '',
        variant === 'featured' ? 'p-5' : '',
        className
      ].join(' ')}
      style={isHero ? undefined : { borderTopColor: active ? '#FCD34D' : chakraAccent[primaryKey], borderTopWidth: active ? 3 : 2 }}
    >
      {active && !isHero && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold text-slate-950">
          当前
        </span>
      )}

      <div className={imageFrameClass}>
        <div
          className={[
            'relative h-full w-full overflow-hidden',
            isHero
              ? 'rounded-xl border border-white/25 bg-[radial-gradient(circle_at_50%_22%,#fff7ed_0%,#efe7ff_50%,#d9c8ff_100%)] shadow-2xl shadow-black/20 ring-1 ring-white/35 after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-t after:from-violet-950/15 after:via-transparent after:to-white/10'
              : 'rounded-md bg-white'
          ].join(' ')}
        >
          {imageFailed ? (
            <ImagePlaceholder isCompact={isCompact} primaryKey={primaryKey} secondaryKey={secondaryKey} />
          ) : (
            <Image
              src={imageSrc}
              alt={`${gender === 'female' ? '女性' : '男性'}${name}人物原型`}
              fill
              sizes={imageSizes}
              className={isHero ? 'object-contain mix-blend-multiply contrast-105 saturate-110' : 'object-cover'}
              priority={variant === 'featured' || isHero}
              unoptimized
              onError={() => setFailedImageSrc(imageSrc)}
            />
          )}
        </div>
      </div>

      {showCaption && (
        <div className={isCompact ? 'mt-2 min-h-[42px]' : isHero ? 'mt-3' : 'mt-4'}>
          <p className={isCompact ? 'text-sm font-bold leading-tight text-white' : isHero ? 'text-xl font-bold text-white' : 'text-2xl font-bold text-white'}>
            {name}
          </p>
          <p className={isCompact ? 'mt-0.5 text-[10px] text-white/45' : 'mt-1 text-xs text-white/45'}>
            {code}
          </p>
        </div>
      )}
    </div>
  )
}
