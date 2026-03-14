import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, scores, answers } = body
    
    if (!deviceId || !scores || !answers) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    const result = await db.testResult.create({
      data: {
        deviceId,
        rootScore: scores['海底轮'] || 0,
        solarPlexusScore: scores['太阳轮'] || 0,
        sacralScore: scores['脐轮'] || 0,
        heartScore: scores['心轮'] || 0,
        throatScore: scores['喉轮'] || 0,
        thirdEyeScore: scores['眉心轮'] || 0,
        crownScore: scores['顶轮'] || 0,
        answers
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: '测试结果保存成功' 
    })
  } catch (error) {
    console.error('保存测试结果失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
