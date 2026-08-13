import { fireEvent, render, screen } from '@testing-library/react'
import type { ImageProps } from 'next/image'
import { describe, expect, it, vi } from 'vitest'
import { ChakraArchetypeAvatar } from './chakra-archetype-avatar'

vi.mock('next/image', () => ({
  default: ({ priority: _priority, unoptimized: _unoptimized, fill: _fill, src, alt, ...props }: ImageProps) => (
    // 测试保留真实 img 的 src、alt、className 和错误事件。
    <img {...props} src={typeof src === 'string' ? src : ''} alt={alt} />
  ),
}))

function renderHeartSolarHero() {
  return render(
    <ChakraArchetypeAvatar
      name="老好人"
      code="Heart-Solar"
      primaryKey="heart"
      secondaryKey="solar"
      gender="female"
      variant="hero"
      showCaption={false}
    />
  )
}

describe('ChakraArchetypeAvatar hero', () => {
  it('直接呈现横向女性原型图且 hero 外层保持无装饰', () => {
    const { container } = renderHeartSolarHero()
    const image = screen.getByRole('img', { name: '女性老好人人物原型' })
    const root = container.firstElementChild
    const imageContainer = image.parentElement
    const forbiddenClasses = /(?:^|\s)(?:border(?:-|\s)|bg-|shadow|ring|p[trblxy]?-[0-9]|mix-blend)/

    expect(image).toHaveAttribute('src', '/chakras/archetypes/female/heart-solar.png')
    expect(image).toHaveClass('object-contain')
    expect(image.parentElement?.parentElement).toHaveClass('aspect-[7/5]', 'w-full', 'max-w-[520px]')
    expect(root?.className).not.toMatch(forbiddenClasses)
    expect(imageContainer?.className).not.toMatch(forbiddenClasses)
  })

  it('图片加载失败后保留展示名并给出固定说明', () => {
    renderHeartSolarHero()

    fireEvent.error(screen.getByRole('img', { name: '女性老好人人物原型' }))

    expect(screen.getByText('老好人')).toBeInTheDocument()
    expect(screen.getByText('人物原型图片暂时无法显示')).toBeInTheDocument()
    expect(screen.queryByText('图片生成中')).not.toBeInTheDocument()
  })
})
