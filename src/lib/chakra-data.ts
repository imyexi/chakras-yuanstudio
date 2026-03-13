// 脉轮测试数据

export interface Question {
  id: number;
  text: string;
  scores: number[]; // 5个选项对应的分数：完全没有、轻微、中等、强烈、非常强烈
}

export interface Chakra {
  id: number;
  name: string;
  englishName: string;
  color: string;
  colorLight: string;
  description: string;
  meanings: string[];
  startQuestion: number;
  endQuestion: number;
  interpretations: {
    inactive: string;
    moderate: string;
    active: string;
    veryActive: string;
  };
}

// 56道测试题目（按题目ID排序，每个脉轮8题）
export const questions: Question[] = [
  // 海底轮 (Root Chakra) - 题目 1-8
  { id: 1, text: "你总是很有安全感？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 2, text: "你担心自己的财务状况和家宅的安全？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 3, text: "你容易紧张或倾向避免让你紧张的情况？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 4, text: "你信赖大多数的人？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 5, text: "你通常有压力的时候身体就会有反应？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 6, text: "你行事比较倾向于事前规划而非随遇而安？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 7, text: "你觉得不论在哪里，都感到很自在？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 8, text: "你是否通常觉得活在当下，生活十分踏实？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  
  // 太阳轮 (Solar Plexus Chakra) - 题目 9-16
  { id: 9, text: "你对团队合作感到很轻松？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 10, text: "你对于自己的本能冲动感到羞耻？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 11, text: "你能在必要时积极主动？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 12, text: "你很有自信？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 13, text: "处于团体中，你感觉可以掌控事情的发展？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 14, text: "你容易对你所想要的事物采取行动？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 15, text: "你总是有掌控局势的强烈欲望？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 16, text: "你在社交上有被动和犹豫不决的倾向？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  
  // 脐轮 (Sacral Chakra) - 题目 17-24
  { id: 17, text: "你有自律的习惯？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 18, text: "你是个非常情绪化或热情的人？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 19, text: "你对于亲密关系和肉体欲望，都感觉很自然？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 20, text: "你和人们情感联系的需求很强烈？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 21, text: "你容易毫无保留地表达自己的情感？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 22, text: "你能觉察你的喜好、厌恶和需求？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 23, text: "你倾向于隐藏情绪，不显露表情？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 24, text: "你能自由地表达对性方面的感觉？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  
  // 心轮 (Heart Chakra) - 题目 25-32
  { id: 25, text: "你是否倾向被动，感到寂寞，或与他人刻意保持距离？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 26, text: "你喜爱大多数的人？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 27, text: "你富有热情和同理心，可以容易延伸至自我和他人？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 28, text: "你对于像你示好的人很小心，以免受到伤害？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 29, text: "你努力追求人与人关系的和谐？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 30, text: "你总是对他人付出太多以致于忘记了自己？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 31, text: "如果你和他人有冲突，你会考虑到他人的感受？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 32, text: "你是一个天生就很友善的人？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  
  // 喉轮 (Throat Chakra) - 题目 33-40
  { id: 33, text: "你善于通过写作进行沟通？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 34, text: "你透过某种形式或创作（音乐、绘画、唱歌或者其他）来表达情绪？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 35, text: "你很难表达自己的感觉，并且很少说话？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 36, text: "你善于沟通，能倾听也能善于表达？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 37, text: "你很有创造性？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 38, text: "你喜欢聊天和交谈？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 39, text: "你说话时的声音响亮清楚？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 40, text: "你善于用语言，符号和概念进行思考？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  
  // 眉心轮 (Third Eye Chakra) - 题目 41-48
  { id: 41, text: "你对事物有洞见？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 42, text: "你很依赖直觉？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 43, text: "你喜欢无拘无束的幻想？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 44, text: "你很容易回想你的梦境？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 45, text: "你通常依赖他人的洞察力？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 46, text: "你常常有好的、创新的点子？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 47, text: "你很难将描述的事情视觉化？比如书中的场景", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 48, text: "你对于未来有愿景或期待？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  
  // 顶轮 (Crown Chakra) - 题目 49-56
  { id: 49, text: "你觉得所谓巧合通常是有意义，而非全是随机发生的？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 50, text: "有一些情况你是否经常想极力避免？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 51, text: "你是否很依赖于某些人或事？", scores: [12.5, 6.25, 0, -6.25, -12.5] },
  { id: 52, text: "你觉得身边所有围绕你的事物或宇宙间存在有某种联系？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 53, text: "你感觉自己是背后一股更大力量的展现？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 54, text: "你感觉到的完整的自觉意识？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 55, text: "你倾向把发生在自己身上的事当作学习的过程？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
  { id: 56, text: "你对所有发生在自己身上的事情接受性很高？", scores: [-12.5, -6.25, 0, 6.25, 12.5] },
];

// 7个脉轮信息（按从下到上的顺序）
export const chakras: Chakra[] = [
  {
    id: 1,
    name: "海底轮",
    englishName: "Root Chakra",
    color: "#DC2626",
    colorLight: "#FEE2E2",
    description: "代表安全感、生存、基本需求",
    meanings: ["安全感", "生存本能", "物质需求", "身体连接"],
    startQuestion: 1,
    endQuestion: 8,
    interpretations: {
      inactive: "你的海底轮能量偏低，可能感到缺乏安全感、焦虑或与物质世界脱节。建议多接触大自然，进行接地练习，关注身体健康和财务稳定。",
      moderate: "你的海底轮能量适中，基本的安全感和生存需求得到满足。可以通过运动、冥想和稳定的生活节奏来进一步增强。",
      active: "你的海底轮能量充沛，拥有强烈的安全感和生存能力。你脚踏实地，能够有效地处理物质世界的事务。",
      veryActive: "你的海底轮能量非常强大，可能过度关注物质层面。建议在保持安全感的同时，也要注意精神层面的平衡发展。"
    }
  },
  {
    id: 2,
    name: "太阳轮",
    englishName: "Solar Plexus Chakra",
    color: "#CA8A04",
    colorLight: "#FEF9C3",
    description: "代表个人力量、自我价值",
    meanings: ["个人力量", "自信", "意志力", "自我价值"],
    startQuestion: 9,
    endQuestion: 16,
    interpretations: {
      inactive: "你的太阳轮能量偏低，可能缺乏自信、意志力薄弱或自我价值感不足。建议设定小目标并逐步完成，培养自律习惯，相信自己的能力。",
      moderate: "你的太阳轮能量适中，有一定的自信和行动力。可以通过挑战自我、承担责任来增强个人力量。",
      active: "你的太阳轮能量充沛，拥有强大的自信和意志力。你能够有效地掌控自己的生活，追求并实现目标。",
      veryActive: "你的太阳轮能量非常强大，可能表现出过强的控制欲或自我中心。建议学会倾听他人，将个人力量用于帮助和服务他人。"
    }
  },
  {
    id: 3,
    name: "脐轮",
    englishName: "Sacral Chakra",
    color: "#EA580C",
    colorLight: "#FFEDD5",
    description: "代表情感、性、创造力",
    meanings: ["情感表达", "创造力", "性欲", "欲望"],
    startQuestion: 17,
    endQuestion: 24,
    interpretations: {
      inactive: "你的脐轮能量偏低，可能在情感表达、创造力或亲密关系方面存在障碍。建议尝试艺术创作、培养兴趣爱好，学会感受和表达情感。",
      moderate: "你的脐轮能量适中，能够在一定程度上表达情感和创造。可以通过舞蹈、绘画或音乐等活动来进一步激发创意能量。",
      active: "你的脐轮能量充沛，情感丰富，创造力强。你能够自然地表达欲望和情感，享受生活的美好。",
      veryActive: "你的脐轮能量非常强大，可能过于追求感官刺激或情绪波动较大。建议学会平衡，将创造能量用于有意义的事物。"
    }
  },
  {
    id: 4,
    name: "心轮",
    englishName: "Heart Chakra",
    color: "#16A34A",
    colorLight: "#DCFCE7",
    description: "代表爱、关系、和谐",
    meanings: ["无条件的爱", "同情心", "和谐关系", "宽恕"],
    startQuestion: 25,
    endQuestion: 32,
    interpretations: {
      inactive: "你的心轮能量偏低，可能难以建立亲密关系，缺乏同情心或封闭自我。建议练习感恩，学会接纳和宽恕，打开心扉去爱和被爱。",
      moderate: "你的心轮能量适中，能够建立和维持人际关系。可以通过志愿服务、关心他人来培养更多的爱与同情心。",
      active: "你的心轮能量充沛，拥有开放的心灵和深厚的人际关系。你能够无条件地爱，与他人建立真诚的连接。",
      veryActive: "你的心轮能量非常强大，可能过度付出而忽视自己。建议学会设立健康的界限，在爱他人的同时也要爱自己。"
    }
  },
  {
    id: 5,
    name: "喉轮",
    englishName: "Throat Chakra",
    color: "#2563EB",
    colorLight: "#DBEAFE",
    description: "代表沟通、表达",
    meanings: ["真实表达", "沟通能力", "创造力", "倾听"],
    startQuestion: 33,
    endQuestion: 40,
    interpretations: {
      inactive: "你的喉轮能量偏低，可能在表达自我、沟通想法方面存在困难。建议练习真诚表达，尝试写作或演讲，学会用声音传达真实想法。",
      moderate: "你的喉轮能量适中，基本的沟通能力良好。可以通过朗读、唱歌或公开表达来增强表达能力。",
      active: "你的喉轮能量充沛，善于沟通和表达。你能够清晰地说出自己的想法，并有效地影响他人。",
      veryActive: "你的喉轮能量非常强大，可能说话过多或过于直言不讳。建议学会倾听，在表达真实的同时也要考虑他人的感受。"
    }
  },
  {
    id: 6,
    name: "眉心轮",
    englishName: "Third Eye Chakra",
    color: "#7C3AED",
    colorLight: "#EDE9FE",
    description: "代表直觉、洞察力",
    meanings: ["直觉", "想象力", "洞察力", "智慧"],
    startQuestion: 41,
    endQuestion: 48,
    interpretations: {
      inactive: "你的眉心轮能量偏低，可能缺乏直觉或难以看到事物的深层含义。建议练习冥想，记录梦境，培养观察力和想象力。",
      moderate: "你的眉心轮能量适中，具有一定的直觉和想象力。可以通过艺术创作、学习新知识来拓展视野。",
      active: "你的眉心轮能量充沛，拥有敏锐的直觉和深刻的洞察力。你能够看到事物的本质，做出智慧的判断。",
      veryActive: "你的眉心轮能量非常强大，可能过度沉浸于精神世界而脱离现实。建议保持与物质世界的连接，将智慧用于实际生活。"
    }
  },
  {
    id: 7,
    name: "顶轮",
    englishName: "Crown Chakra",
    color: "#9333EA",
    colorLight: "#F3E8FF",
    description: "代表灵性、意识",
    meanings: ["灵性连接", "意识觉醒", "宇宙能量", "超越自我"],
    startQuestion: 49,
    endQuestion: 56,
    interpretations: {
      inactive: "你的顶轮能量偏低，可能缺乏精神追求或与更高意识脱节。建议探索灵性实践，如冥想、瑜伽，思考生命的意义和目的。",
      moderate: "你的顶轮能量适中，对精神世界有一定的感知。可以通过阅读哲学书籍、接触不同信仰来深化灵性体验。",
      active: "你的顶轮能量充沛，拥有强烈的灵性连接和意识觉醒。你能够感受到超越自我的存在，理解生命的深层意义。",
      veryActive: "你的顶轮能量非常强大，可能过于追求精神而忽视现实生活。建议保持平衡，在灵性成长的同时也要照顾好日常生活。"
    }
  }
];

// 选项文本
export const optionLabels = [
  "完全没有",
  "轻微",
  "中等",
  "强烈",
  "非常强烈"
];

// 计算单个脉轮的分数
export function calculateChakraScore(
  answers: Record<number, number>,
  startQuestion: number,
  endQuestion: number
): number {
  let totalScore = 0;
  for (let i = startQuestion; i <= endQuestion; i++) {
    const answerIndex = answers[i];
    if (answerIndex !== undefined) {
      const question = questions.find(q => q.id === i);
      if (question) {
        totalScore += question.scores[answerIndex];
      }
    }
  }
  return totalScore;
}

// 获取所有脉轮的分数
export function calculateAllChakraScores(answers: Record<number, number>): Record<string, number> {
  const scores: Record<string, number> = {};
  chakras.forEach(chakra => {
    const rawScore = calculateChakraScore(answers, chakra.startQuestion, chakra.endQuestion);
    // 直接使用原始分数作为百分比（-100到100）
    const percentage = Math.round(rawScore);
    scores[chakra.name] = Math.max(-100, Math.min(100, percentage));
  });
  return scores;
}

// 获取脉轮状态描述
export function getChakraStatus(percentage: number): { status: string; interpretation: string } {
  if (percentage <= -20) {
    return { status: "不活跃", interpretation: "inactive" };
  } else if (percentage <= 50) {
    return { status: "开启", interpretation: "moderate" };
  } else {
    return { status: "非常活跃", interpretation: "veryActive" };
  }
}
