'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import qrCodeImage from '../../public/qrcode.png'
import {
  questions,
  chakras,
  optionLabels,
  calculateAllChakraScores,
  type Chakra
} from '@/lib/chakra-data'
import {
  formatArchetypePeople,
  generateChakraArchetypeResult,
  normalizeChakraScore
} from '@/lib/chakra-archetypes'
import { getDeviceId } from '@/lib/device'
import { ChakraArchetypeAvatar, type ArchetypeAvatarGender } from '@/components/chakra-archetype-avatar'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList
} from 'recharts'
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, Sun, Play, Share2, Check, Users, Compass, Target, Shield, Quote, TrendingUp, Layers, Venus, Mars } from 'lucide-react'

type PageState = 'welcome' | 'test' | 'result'

const archetypeGenderOptions: Array<{
  value: ArchetypeAvatarGender
  label: string
  Icon: typeof Venus
}> = [
  { value: 'female', label: '女性', Icon: Venus },
  { value: 'male', label: '男性', Icon: Mars }
]

type StoredResult = {
  scores: Record<string, number>
  answers: Record<number, number>
  completedAt: string
}

const STORAGE_KEYS = {
  answers: 'chakra-test-answers',
  currentQuestion: 'chakra-test-current-question',
  result: 'chakra-test-result'
} as const

const API_BASE_PATH = '/chakras'

const RARE_ARCHETYPE_CODES = new Set([
  'Crown-ThirdEye',
  'Crown-Throat',
  'ThirdEye-Crown',
  'ThirdEye-Throat',
  'Crown-Heart',
  'ThirdEye-Heart'
])

function ArchetypeGenderToggle({
  value,
  onChange
}: {
  value: ArchetypeAvatarGender
  onChange: (value: ArchetypeAvatarGender) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-black/15 p-1">
      {archetypeGenderOptions.map(({ value: optionValue, label, Icon }) => {
        const isActive = value === optionValue

        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={[
              'inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
              isActive ? 'bg-white text-slate-950 shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'
            ].join(' ')}
            aria-pressed={isActive}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

// 欢迎页面组件
function WelcomePage({ 
  onStart, 
  hasProgress, 
  progressInfo,
  onContinue,
  onRestart 
}: { 
  onStart: () => void
  hasProgress: boolean
  progressInfo: { answered: number; total: number; percentage: number }
  onContinue: () => void
  onRestart: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        {/* 脉轮图标 */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            {chakras.map((chakra, index) => (
              <motion.div
                key={chakra.id}
                initial={false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="absolute w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: chakra.color,
                  left: `${50 + 40 * Math.cos((index * Math.PI * 2) / 7 - Math.PI / 2)}%`,
                  top: `${50 + 40 * Math.sin((index * Math.PI * 2) / 7 - Math.PI / 2)}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 20px ${chakra.color}80`
                }}
              >
                <span className="text-white text-xs font-bold">{chakra.id}</span>
              </motion.div>
            ))}
            <motion.div
              initial={false}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-white/80" />
            </motion.div>
          </div>
        </div>

        <motion.h1
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent"
        >
          脉轮能量测试
        </motion.h1>

        <motion.p
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg md:text-xl text-purple-200/80 mb-8 leading-relaxed"
        >
          探索你的七大脉轮能量状态，了解身心灵的平衡与和谐
        </motion.p>

        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-3 mb-10 max-w-lg mx-auto"
        >
          {chakras.map((chakra) => (
            <div
              key={chakra.id}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10"
            >
              <div
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: chakra.color, boxShadow: `0 0 8px ${chakra.color}` }}
              />
              <span className="text-sm text-white font-medium">{chakra.name}</span>
            </div>
          ))}
        </motion.div>

        {/* 根据是否有进度显示不同的按钮 */}
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col items-center gap-4"
        >
          {hasProgress ? (
            <>
              {/* 显示进度信息 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 mb-4 border border-white/10">
                <p className="text-white text-base">
                  发现未完成的测试
                </p>
                <p className="text-purple-200 text-sm mt-1">
                  已完成 <span className="text-white font-semibold">{progressInfo.answered}/{progressInfo.total}</span> 题（<span className="text-white font-semibold">{progressInfo.percentage}%</span>）
                </p>
              </div>
              
              {/* 继续测试按钮 */}
              <Button
                onClick={onContinue}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-lg rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                <Play className="mr-2 h-5 w-5" />
                继续测试
              </Button>
              
              {/* 重新开始按钮 */}
              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 text-sm transition-all duration-300 mt-3"
              >
                <RotateCcw className="h-4 w-4" />
                重新开始
              </button>
            </>
          ) : (
            <>
              {/* 开始测试按钮 */}
              <Button
                onClick={onStart}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 text-lg rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                开始测试
              </Button>
              <p className="text-sm text-white/70 mt-2">
                共56道题目，约需5-10分钟完成
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

// 测试页面组件
function TestPage({
  currentQuestion,
  answers,
  onSelectAnswer,
  onNext,
  onPrev,
  onSubmit
}: {
  currentQuestion: number
  answers: Record<number, number>
  onSelectAnswer: (questionId: number, answerIndex: number) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
}) {
  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const selectedAnswer = answers[question.id]
  const isLastQuestion = currentQuestion === questions.length - 1

  // 获取当前脉轮
  const getCurrentChakra = (): Chakra => {
    return chakras.find(
      c => question.id >= c.startQuestion && question.id <= c.endQuestion
    ) || chakras[0]
  }

  const currentChakra = getCurrentChakra()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* 进度条 */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-300">
              问题 {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-sm text-purple-300">{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-white/10"
          />
          {/* 提示信息 */}
          <p className="text-xs text-white/50 text-center mt-2">
            💡 本测试可以临时退出，回头再继续哦，仅限同一台设备
          </p>
        </div>
      </div>

      {/* 问题区域 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          key={question.id}
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full max-w-2xl"
        >
          {/* 脉轮指示器 */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ backgroundColor: currentChakra.color, boxShadow: `0 0 15px ${currentChakra.color}` }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: currentChakra.color }}
            >
              {currentChakra.name} - {currentChakra.englishName}
            </span>
          </div>

          {/* 问题卡片 */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="text-5xl font-bold text-purple-300/30 mb-4">
                {question.id}
              </div>
              <CardTitle className="text-xl md:text-2xl text-white leading-relaxed">
                {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {optionLabels.map((label, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectAnswer(question.id, index)
                    // 选择后自动跳转到下一题（最后一题除外）
                    if (!isLastQuestion) {
                      setTimeout(() => {
                        onNext()
                      }, 300)
                    }
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedAnswer === index
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        selectedAnswer === index
                          ? 'bg-white/20'
                          : 'bg-white/10'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>
                </motion.button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 导航按钮 */}
      <div className="sticky bottom-0 z-20 bg-slate-900/80 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onPrev}
              disabled={currentQuestion === 0}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              上一题
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={onSubmit}
                disabled={selectedAnswer === undefined}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                查看结果
              </Button>
            ) : (
              <Button
                onClick={onNext}
                disabled={selectedAnswer === undefined}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
              >
                下一题
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 结果页面组件
function ResultPage({
  scores,
  onRestart
}: {
  scores: Record<string, number>
  onRestart: () => void
}) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [avatarGender, setAvatarGender] = useState<ArchetypeAvatarGender>('female')
  const archetypeResult = generateChakraArchetypeResult(scores)
  const isRareArchetype = RARE_ARCHETYPE_CODES.has(archetypeResult.archetype.code)
  const roleByChakraName: Record<string, string> = {
    [archetypeResult.primary.name]: '主导能量',
    [archetypeResult.secondary.name]: '辅助风格',
    [archetypeResult.lowest.name]: '成长课题'
  }

  // 生成分享文本
  const getShareText = () => {
    const shareUrl = 'http://yyry.studio/chakras'
    return `我的脉轮人物原型：${archetypeResult.archetype.name}

${archetypeResult.archetype.headline}

代表人物参考：${formatArchetypePeople(archetypeResult.archetype.celebrities)}

。 ${shareUrl}`
  }

  // 复制分享文本
  const handleCopyLink = async () => {
    const text = getShareText()
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      // 降级方案：创建临时输入框
      const input = document.createElement('input')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  // 准备图表数据
  const chartData = chakras.map(chakra => {
    const rawScore = scores[chakra.name] || 0
    return {
      name: chakra.name,
      score: rawScore,
      normalizedScore: normalizeChakraScore(rawScore),
      rawScore,
      role: roleByChakraName[chakra.name],
      color: chakra.color,
      fullName: chakra.name
    }
  })

  const formatSignedScore = (score: number) => `${score > 0 ? '+' : ''}${Math.round(score)}%`
  const rawAverageScore = Math.round(chakras.reduce((sum, chakra) => sum + (scores[chakra.name] || 0), 0) / chakras.length)
  const energyBarChart = (
    <div className="mb-5 rounded-xl border border-white/10 bg-black/10 p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Sun className="h-4 w-4 text-yellow-300" />
        七大脉轮能量柱状图
      </div>
      <div className="h-60 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              type="number"
              domain={[-100, 100]}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value: number, name: string, props: any) => [
                `${formatSignedScore(value)}（能量尺 ${props.payload.normalizedScore}/100）`,
                props.payload.role || '能量倾向'
              ]}
            />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
            <Bar dataKey="score" radius={[4, 4, 4, 4]}>
              <LabelList
                dataKey="score"
                position="insideRight"
                fill="white"
                fontSize={12}
                formatter={(value: number) => formatSignedScore(value)}
              />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 头部 */}
      <div className="pt-8 pb-4 text-center">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-4"
        >
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-purple-300">测试完成</span>
        </motion.div>
        <motion.h1
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-white mb-2"
        >
          你的脉轮人物原型报告
        </motion.h1>
        <motion.p
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-purple-300/60"
        >
          以下是你当前能量模式、成长课题与七大脉轮状态
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* 人物原型结果 */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <Card className="overflow-hidden border-white/10 bg-white/[0.06] backdrop-blur-sm">
            <CardContent className="p-0">
              <div>
                <section className="p-5 md:p-6 xl:p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">
                      {archetypeResult.archetype.family}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
                      {archetypeResult.archetype.code}
                    </span>
                    <span className="rounded-full border border-amber-300/20 bg-amber-400/15 px-3 py-1 text-xs text-amber-200">
                      {archetypeResult.activityType.name} · {archetypeResult.balanceType.name}
                    </span>
                  </div>

                  <p className="mb-1.5 text-sm text-white/60">你的脉轮人物原型</p>
                  <h2 className="mb-3 text-4xl font-bold text-white md:text-5xl xl:text-6xl">
                    {archetypeResult.archetype.name}
                  </h2>
                  <div className="mb-5 flex items-start gap-3">
                    <Quote className="mt-1 h-5 w-5 shrink-0 text-amber-300" />
                    <p className="text-lg leading-relaxed text-white/90 md:text-xl xl:text-2xl">
                      {archetypeResult.archetype.headline}
                    </p>
                  </div>

                  <div className="mb-5 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-300/10 via-white/5 to-amber-300/10 p-3 shadow-inner shadow-white/5 sm:p-4">
                    <div className="mb-3 flex justify-center">
                      <ArchetypeGenderToggle value={avatarGender} onChange={setAvatarGender} />
                    </div>
                    <ChakraArchetypeAvatar
                      name={archetypeResult.archetype.name}
                      code={archetypeResult.archetype.code}
                      primaryKey={archetypeResult.primary.key}
                      secondaryKey={archetypeResult.secondary.key}
                      gender={avatarGender}
                      variant="hero"
                      active
                      showCaption={false}
                      className="mx-auto max-w-[260px]"
                    />
                  </div>

                  {energyBarChart}

                  <div className="grid grid-cols-2 gap-2 text-xs sm:gap-3 sm:text-sm">
                    <div className="rounded-lg border border-white/10 bg-black/10 p-2.5 sm:p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-white/50">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-300 sm:h-4 sm:w-4" />
                        主导能量
                      </div>
                      <p className="font-medium leading-tight text-white">{archetypeResult.primary.name}</p>
                      <p className="mt-0.5 leading-tight text-white/50">{formatSignedScore(archetypeResult.primary.score)}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-2.5 sm:p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-white/50">
                        <Layers className="h-3.5 w-3.5 shrink-0 text-sky-300 sm:h-4 sm:w-4" />
                        辅助风格
                      </div>
                      <p className="font-medium leading-tight text-white">{archetypeResult.secondary.name}</p>
                      <p className="mt-0.5 leading-tight text-white/50">{formatSignedScore(archetypeResult.secondary.score)}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-2.5 sm:p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-white/50">
                        <Target className="h-3.5 w-3.5 shrink-0 text-rose-300 sm:h-4 sm:w-4" />
                        成长课题
                      </div>
                      <p className="font-medium leading-tight text-white">{archetypeResult.growthTheme.name}</p>
                      <p className="mt-0.5 leading-tight text-white/50">{formatSignedScore(archetypeResult.lowest.score)}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-2.5 sm:p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-white/50">
                        <Compass className="h-3.5 w-3.5 shrink-0 text-violet-300 sm:h-4 sm:w-4" />
                        能量结构
                      </div>
                      <p className="font-medium leading-tight text-white">{archetypeResult.energyStructure.name}</p>
                      <p className="mt-0.5 leading-tight text-white/50">平均 {formatSignedScore(rawAverageScore)}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-emerald-300/15 bg-gradient-to-br from-emerald-500/10 via-white/5 to-violet-500/10 p-3.5 md:p-4">
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
                        <Users className="h-4 w-4 text-emerald-300" />
                        代表人物参考
                      </div>
                      <p className="text-xs leading-relaxed text-white/45">
                        代表人物仅用于帮助理解该类型的公众气质，不代表对本人真实性格、经历、成就或心理状态的判断。
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {archetypeResult.archetype.celebrities.map((person) => (
                        <span
                          key={`${person.name}-${person.enName || ''}`}
                          className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
                        >
                          {person.enName ? `${person.name} ${person.enName}` : person.name}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      {copySuccess ? (
                        <p className="text-sm text-green-300">已复制，可粘贴分享给微信好友</p>
                      ) : (
                        <p className="text-xs text-white/40">把你的原型结果发给好友一起看看</p>
                      )}
                      <Button
                        onClick={handleCopyLink}
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700"
                      >
                        {copySuccess ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Share2 className="mr-2 h-4 w-4" />
                            分享给好友
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </section>

              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 深度分析 */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-300" />
                深度分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isRareArchetype && (
                <div className="mb-4 rounded-xl border border-amber-300/25 bg-gradient-to-br from-amber-300/15 via-white/5 to-violet-400/10 p-4">
                  <p className="text-sm font-semibold text-amber-100">
                    恭喜你命中小概率人格：{archetypeResult.archetype.name}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    这类原型通常需要高层次洞察、精神追问、表达或共情能量同时突出，因此在人群中更少见。你可以把它看作一份值得认真理解的内在天赋。
                  </p>
                </div>
              )}
              <p className="text-sm text-white/65 leading-relaxed">{archetypeResult.summary}</p>
              <div className="relative mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/10 px-4 pb-4 pt-3">
                <div className="space-y-2 opacity-45">
                  <div className="h-3 w-11/12 rounded-full bg-white/15" />
                  <div className="h-3 w-4/5 rounded-full bg-white/10" />
                  <div className="h-3 w-2/3 rounded-full bg-white/10" />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/95 via-purple-950/70 to-transparent" />
                <div className="relative mt-4 flex items-center justify-center border-t border-white/10 pt-3">
                  <p className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-1.5 text-xs font-medium text-amber-100">
                    更多分析请咨询圆圆
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 二维码区域 */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 max-w-sm mx-auto">
            <CardContent className="p-6 text-center">
              <div className="bg-white rounded-xl p-4 mb-4 inline-block">
                <img 
                  src={qrCodeImage.src} 
                  alt="二维码" 
                  className="w-40 h-40 mx-auto"
                />
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                截屏分析结果直接咨询圆圆，或者长按二维码添加圆圆领取分析结果
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 重新测试按钮 */}
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center"
        >
          {/* 重新测试按钮 */}
          <Button
            onClick={onRestart}
            variant="outline"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10 px-8"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            重新测试
          </Button>
        </motion.div>

        {/* 页脚 */}
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8 pb-8 max-w-3xl mx-auto"
        >
          <p className="text-white/35 text-xs leading-relaxed mb-3">
            本测试结果仅用于自我探索、情绪觉察和个人成长参考，不构成医学、心理诊断或治疗建议。如你正经历持续的心理痛苦或身体不适，请寻求专业人士支持。
          </p>
          <p className="text-white/40 text-sm">@圆圆如意</p>
        </motion.div>
      </div>

    </div>
  )
}

// 从本地存储加载初始状态的辅助函数
const loadSavedProgress = () => {
  if (typeof window === 'undefined') return { answers: {}, currentQuestion: 0 }
  try {
    const savedAnswers = localStorage.getItem(STORAGE_KEYS.answers)
    const savedQuestion = localStorage.getItem(STORAGE_KEYS.currentQuestion)
    return {
      answers: savedAnswers ? JSON.parse(savedAnswers) : {},
      currentQuestion: savedQuestion ? parseInt(savedQuestion, 10) : 0
    }
  } catch {
    return { answers: {}, currentQuestion: 0 }
  }
}

// 检查是否有未完成的测试
const checkSavedProgress = () => {
  if (typeof window === 'undefined') return { hasProgress: false, progressInfo: { answered: 0, total: 56, percentage: 0 } }
  try {
    const savedAnswers = localStorage.getItem(STORAGE_KEYS.answers)
    if (savedAnswers) {
      const answers = JSON.parse(savedAnswers)
      const answered = Object.keys(answers).length
      return {
        hasProgress: answered > 0,
        progressInfo: {
          answered,
          total: 56,
          percentage: Math.round((answered / 56) * 100)
        }
      }
    }
  } catch {
    // ignore
  }
  return { hasProgress: false, progressInfo: { answered: 0, total: 56, percentage: 0 } }
}

const loadSavedResult = (): StoredResult | null => {
  if (typeof window === 'undefined') return null
  try {
    const savedResult = localStorage.getItem(STORAGE_KEYS.result)
    if (!savedResult) return null

    const parsedResult = JSON.parse(savedResult) as Partial<StoredResult>
    if (!parsedResult.scores || typeof parsedResult.scores !== 'object') {
      return null
    }

    return {
      scores: parsedResult.scores,
      answers: parsedResult.answers && typeof parsedResult.answers === 'object' ? parsedResult.answers : {},
      completedAt: typeof parsedResult.completedAt === 'string' ? parsedResult.completedAt : new Date().toISOString()
    }
  } catch {
    return null
  }
}

const clearSavedProgress = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.answers)
  localStorage.removeItem(STORAGE_KEYS.currentQuestion)
}

const clearSavedResult = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.result)
}

// 主页面组件
export default function Home() {
  const initialProgress = loadSavedProgress()
  const savedProgressState = checkSavedProgress()
  const initialSavedResult = savedProgressState.hasProgress ? null : loadSavedResult()
  const initialPageState: PageState = initialSavedResult ? 'result' : 'welcome'

  const [pageState, setPageState] = useState<PageState>(initialPageState)
  const [currentQuestion, setCurrentQuestion] = useState(initialProgress.currentQuestion)
  const [answers, setAnswers] = useState<Record<number, number>>(initialProgress.answers)
  const [scores, setScores] = useState<Record<string, number>>(initialSavedResult?.scores || {})
  const [hasProgress, setHasProgress] = useState(savedProgressState.hasProgress)
  const [progressInfo, setProgressInfo] = useState(savedProgressState.progressInfo)

  // 保存进度到本地存储
  useEffect(() => {
    if (pageState === 'test') {
      localStorage.setItem(STORAGE_KEYS.answers, JSON.stringify(answers))
      localStorage.setItem(STORAGE_KEYS.currentQuestion, currentQuestion.toString())
    }
  }, [answers, currentQuestion, pageState])

  const handleStart = () => {
    // 开始新测试，清除之前的进度
    clearSavedResult()
    setAnswers({})
    setCurrentQuestion(0)
    setScores({})
    setHasProgress(false)
    setProgressInfo({ answered: 0, total: 56, percentage: 0 })
    clearSavedProgress()
    setPageState('test')
  }

  const handleContinue = () => {
    // 继续之前的测试
    setPageState('test')
  }

  const handleRestart = () => {
    // 重新开始，清除所有数据
    clearSavedResult()
    setAnswers({})
    setCurrentQuestion(0)
    setScores({})
    setHasProgress(false)
    setProgressInfo({ answered: 0, total: 56, percentage: 0 })
    clearSavedProgress()
  }

  const handleSelectAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    const calculatedScores = calculateAllChakraScores(answers)
    setScores(calculatedScores)

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.result, JSON.stringify({
        scores: calculatedScores,
        answers,
        completedAt: new Date().toISOString()
      }))
    }
    
    try {
      const deviceId = getDeviceId()
      const response = await fetch(`${API_BASE_PATH}/api/test-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          scores: calculatedScores,
          answers
        })
      })
      
      const data = await response.json()
      if (data.success) {
        console.log('测试结果已保存')
      } else {
        console.error('保存失败:', data.error)
      }
    } catch (error) {
      console.error('保存测试结果失败:', error)
    }
    
    setHasProgress(false)
    setPageState('result')
    setProgressInfo({ answered: 0, total: 56, percentage: 0 })
    clearSavedProgress()
  }

  const handleResultRestart = () => {
    clearSavedResult()
    clearSavedProgress()
    setAnswers({})
    setCurrentQuestion(0)
    setScores({})
    setPageState('welcome')
    setHasProgress(false)
    setProgressInfo({ answered: 0, total: 56, percentage: 0 })
  }

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {pageState === 'welcome' && (
          <motion.div
            key="welcome"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WelcomePage 
              onStart={handleStart}
              hasProgress={hasProgress}
              progressInfo={progressInfo}
              onContinue={handleContinue}
              onRestart={handleRestart}
            />
          </motion.div>
        )}

        {pageState === 'test' && (
          <motion.div
            key="test"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TestPage
              currentQuestion={currentQuestion}
              answers={answers}
              onSelectAnswer={handleSelectAnswer}
              onNext={handleNext}
              onPrev={handlePrev}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}

        {pageState === 'result' && (
          <motion.div
            key="result"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultPage scores={scores} onRestart={handleResultRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
