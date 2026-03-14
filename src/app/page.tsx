'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  questions,
  chakras,
  optionLabels,
  calculateAllChakraScores,
  getChakraStatus,
  type Chakra
} from '@/lib/chakra-data'
import { getDeviceId } from '@/lib/device'
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LabelList
} from 'recharts'
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, Heart, Eye, Sun, Moon, Play, Share2, Check, Link } from 'lucide-react'

type PageState = 'welcome' | 'test' | 'result'

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
        initial={{ opacity: 0, y: 20 }}
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
                initial={{ scale: 0, opacity: 0 }}
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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-white/80" />
            </motion.div>
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent"
        >
          脉轮能量测试
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg md:text-xl text-purple-200/80 mb-8 leading-relaxed"
        >
          探索你的七大脉轮能量状态，了解身心灵的平衡与和谐
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
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
          initial={{ opacity: 0 }}
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
          initial={{ opacity: 0, x: 20 }}
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
  const [selectedChakra, setSelectedChakra] = useState<Chakra | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // 生成分享文本
  const getShareText = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `我刚测完我的脉轮，转你也试试，${baseUrl}`
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
  const chartData = chakras.map(chakra => ({
    name: chakra.name,
    score: scores[chakra.name] || 0,
    color: chakra.color,
    fullName: chakra.name
  }))

  // 雷达图数据
  const radarData = chakras.map(chakra => ({
    subject: chakra.name,
    value: scores[chakra.name] || 0,
    fullMark: 100,
    minMark: -100
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 头部 */}
      <div className="pt-8 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-4"
        >
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-purple-300">测试完成</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-white mb-2"
        >
          你的脉轮能量报告
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-purple-300/60"
        >
          以下是你七大脉轮的能量状态分析
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* 图表区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* 条形图 */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-400" />
                能量柱状图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
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
                      formatter={(value: number) => [`${value}%`, '能量值']}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      <LabelList
                        dataKey="score"
                        position="insideRight"
                        fill="white"
                        fontSize={12}
                        formatter={(value: number) => `${value > 0 ? '+' : ''}${value}%`}
                      />
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 雷达图 */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-400" />
                能量雷达图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[-100, 100]}
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                    />
                    <Radar
                      name="能量值"
                      dataKey="value"
                      stroke="url(#colorGradient)"
                      fill="url(#colorGradient)"
                      fillOpacity={0.5}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#9333EA" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                    <Legend
                      wrapperStyle={{ color: 'white' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 脉轮详情 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" />
            脉轮详情解读
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {chakras.map((chakra, index) => {
              const score = scores[chakra.name] || 0
              const { status, interpretation } = getChakraStatus(score)

              return (
                <motion.div
                  key={chakra.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedChakra(chakra)}
                  className="cursor-pointer"
                >
                  <Card
                    className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
                    style={{ borderTopColor: chakra.color, borderTopWidth: '3px' }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: chakra.color }}
                          >
                            <span className="text-white text-xs font-bold">{chakra.id}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{chakra.name}</h3>
                            <p className="text-xs text-white/50">{chakra.englishName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/60">能量值</span>
                          <span
                            className="font-medium"
                            style={{ color: chakra.color }}
                          >
                            {score > 0 ? '+' : ''}{score}%
                          </span>
                        </div>
                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                          {/* 中间线 */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 -translate-x-1/2" />
                          {/* 进度条 */}
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.abs(score) / 2}%` }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                            className="absolute h-full rounded-full"
                            style={{ 
                              backgroundColor: chakra.color,
                              left: score >= 0 ? '50%' : 'auto',
                              right: score < 0 ? '50%' : 'auto'
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-white/40 mt-1">
                          <span>-100%</span>
                          <span>0</span>
                          <span>+100%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        {index < 3 ? (
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: `${chakra.color}20`,
                              color: chakra.color
                            }}
                          >
                            {status}
                          </span>
                        ) : (
                          <span className="text-xs text-white/50">
                            联系圆圆获取解读
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* 二维码区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 max-w-sm mx-auto">
            <CardContent className="p-6 text-center">
              <div className="bg-white rounded-xl p-4 mb-4 inline-block">
                <img 
                  src="/qrcode.png" 
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

        {/* 分享和重新测试按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* 分享按钮 */}
          <Button
            onClick={handleCopyLink}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8"
          >
            {copySuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                已复制链接
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                分享给好友
              </>
            )}
          </Button>
          
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

        {/* 分享提示 */}
        {copySuccess && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-green-400 text-sm mt-2"
          >
            已复制，可粘贴分享给微信好友
          </motion.p>
        )}

        {/* 页脚 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8 pb-8"
        >
          <p className="text-white/40 text-sm">@圆圆如意</p>
        </motion.div>
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedChakra && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedChakra(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <Card
                className="bg-slate-900/95 border-white/20 overflow-hidden"
                style={{ borderTopColor: selectedChakra.color, borderTopWidth: '4px' }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: selectedChakra.color }}
                    >
                      <span className="text-white text-lg font-bold">{selectedChakra.id}</span>
                    </div>
                    <div>
                      <CardTitle className="text-white">{selectedChakra.name}</CardTitle>
                      <p className="text-sm text-white/50">{selectedChakra.englishName}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 mb-4">{selectedChakra.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">能量值</span>
                      <span
                        className="font-bold text-lg"
                        style={{ color: selectedChakra.color }}
                      >
                        {scores[selectedChakra.name] > 0 ? '+' : ''}{scores[selectedChakra.name]}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                      {/* 中间线 */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
                      {/* 进度条 */}
                      <div
                        className="absolute h-full rounded-full"
                        style={{
                          width: `${Math.abs(scores[selectedChakra.name]) / 2}%`,
                          left: scores[selectedChakra.name] >= 0 ? '50%' : `${50 - Math.abs(scores[selectedChakra.name]) / 2}%`,
                          backgroundColor: selectedChakra.color
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/40 mt-1">
                      <span>-100%</span>
                      <span>0</span>
                      <span>+100%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-white/80 mb-2">代表意义</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedChakra.meanings.map((meaning, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70"
                        >
                          {meaning}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedChakra.id <= 3 ? (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2">状态解读</h4>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {selectedChakra.interpretations[getChakraStatus(scores[selectedChakra.name]).interpretation as keyof typeof selectedChakra.interpretations]}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-sm mb-2">
                        想了解{selectedChakra.name}的详细解读？
                      </p>
                      <p className="text-purple-300 text-sm">
                        扫描下方二维码联系圆圆获取专属分析
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => setSelectedChakra(null)}
                    className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white"
                  >
                    关闭
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 从本地存储加载初始状态的辅助函数
const loadSavedProgress = () => {
  if (typeof window === 'undefined') return { answers: {}, currentQuestion: 0 }
  try {
    const savedAnswers = localStorage.getItem('chakra-test-answers')
    const savedQuestion = localStorage.getItem('chakra-test-current-question')
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
    const savedAnswers = localStorage.getItem('chakra-test-answers')
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

// 主页面组件
export default function Home() {
  const [pageState, setPageState] = useState<PageState>('welcome')
  const [currentQuestion, setCurrentQuestion] = useState(() => loadSavedProgress().currentQuestion)
  const [answers, setAnswers] = useState<Record<number, number>>(() => loadSavedProgress().answers)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [hasProgress, setHasProgress] = useState(() => checkSavedProgress().hasProgress)
  const [progressInfo, setProgressInfo] = useState(() => checkSavedProgress().progressInfo)

  // 保存进度到本地存储
  useEffect(() => {
    if (pageState === 'test') {
      localStorage.setItem('chakra-test-answers', JSON.stringify(answers))
      localStorage.setItem('chakra-test-current-question', currentQuestion.toString())
    }
  }, [answers, currentQuestion, pageState])

  const handleStart = () => {
    // 开始新测试，清除之前的进度
    setAnswers({})
    setCurrentQuestion(0)
    setHasProgress(false)
    localStorage.removeItem('chakra-test-answers')
    localStorage.removeItem('chakra-test-current-question')
    setPageState('test')
  }

  const handleContinue = () => {
    // 继续之前的测试
    setPageState('test')
  }

  const handleRestart = () => {
    // 重新开始，清除所有数据
    setAnswers({})
    setCurrentQuestion(0)
    setHasProgress(false)
    setProgressInfo({ answered: 0, total: 56, percentage: 0 })
    localStorage.removeItem('chakra-test-answers')
    localStorage.removeItem('chakra-test-current-question')
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
    
    try {
      const deviceId = getDeviceId()
      const response = await fetch('/api/test-results', {
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
    localStorage.removeItem('chakra-test-answers')
    localStorage.removeItem('chakra-test-current-question')
  }

  const handleResultRestart = () => {
    setAnswers({})
    setCurrentQuestion(0)
    setScores({})
    setPageState('welcome')
  }

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {pageState === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
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
            initial={{ opacity: 0 }}
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
            initial={{ opacity: 0 }}
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
