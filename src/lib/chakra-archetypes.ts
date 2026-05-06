export type ChakraKey = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'thirdEye' | 'crown';

export type ArchetypePerson = {
  name: string;
  enName?: string;
};

export type ChakraArchetype = {
  name: string;
  family: string;
  code: string;
  headline: string;
  celebrities: ArchetypePerson[];
};

export type ChakraProfile = {
  key: ChakraKey;
  name: string;
  englishName: string;
  shortName: string;
  family: string;
  themes: string[];
  core: string;
  strength: string;
  shadow: string;
  relationship: string;
  work: string;
  fields: string[];
};

export type GrowthTheme = {
  key: ChakraKey;
  name: string;
  theme: string;
  growth: string;
  suggestions: string[];
};

export type ResultStatus = {
  name: string;
  description: string;
};

export type ScoredChakra = ChakraProfile & {
  score: number;
  normalizedScore: number;
};

export type ChakraArchetypeResult = {
  primary: ScoredChakra;
  secondary: ScoredChakra;
  lowest: ScoredChakra;
  archetype: ChakraArchetype;
  growthTheme: GrowthTheme;
  balanceType: ResultStatus;
  activityType: ResultStatus;
  energyStructure: ResultStatus;
  gap: number;
  average: number;
  strengths: string[];
  shadow: string;
  relationshipMode: string;
  workMode: string;
  summary: string;
  recommendations: string[];
};

export type ChakraArchetypeGalleryItem = {
  key: string;
  primary: ChakraProfile;
  secondary: ChakraProfile;
  archetype: ChakraArchetype;
};

export const chakraOrder: ChakraKey[] = ['root', 'sacral', 'solar', 'heart', 'throat', 'thirdEye', 'crown'];

export const chakraProfiles: Record<ChakraKey, ChakraProfile> = {
  root: {
    key: 'root',
    name: '海底轮',
    englishName: 'Root Chakra',
    shortName: 'Root',
    family: '守护者家族',
    themes: ['稳定', '安全', '现实', '责任', '秩序', '守护'],
    core: '你重视现实根基、安全感和生活秩序，倾向先确认事情是否稳、是否可持续。',
    strength: '你能把混乱的事物稳住，也容易成为别人眼里可靠、踏实、能承担的人。',
    shadow: '当这股能量失衡时，可能会过度追求确定性，变得保守、固执，或对变化保持戒备。',
    relationship: '你在关系里更看重稳定、承诺和可依靠的陪伴，不太喜欢悬而未决的状态。',
    work: '你适合把愿景落成流程、制度和可执行的步骤，擅长守住长期成果。',
    fields: ['运营', '管理', '财务', '供应链', '项目落地', '生活方式']
  },
  sacral: {
    key: 'sacral',
    name: '脐轮',
    englishName: 'Sacral Chakra',
    shortName: 'Sacral',
    family: '创造者家族',
    themes: ['感受', '欲望', '创造', '亲密', '流动', '魅力'],
    core: '你对情绪、美感、关系和体验的变化很敏感，容易从感受里获得灵感。',
    strength: '你有鲜活的生命力，能够把氛围、情绪和审美转化为感染力。',
    shadow: '当这股能量失衡时，可能被情绪、关系或即时欲望牵动，状态起伏较明显。',
    relationship: '你在关系里需要真实的情绪流动，也需要被允许表达喜欢、厌恶和渴望。',
    work: '你适合创作、表达、审美、品牌和体验相关的工作，把感受变成作品。',
    fields: ['内容创作', '艺术', '品牌', '设计', '表演', '社交媒体']
  },
  solar: {
    key: 'solar',
    name: '太阳轮',
    englishName: 'Solar Plexus Chakra',
    shortName: 'Solar',
    family: '行动者家族',
    themes: ['自信', '意志', '目标', '掌控', '行动', '领导'],
    core: '你重视目标、效率和行动结果，遇到事情时更容易进入推动和解决模式。',
    strength: '你有执行力和影响欲，能把想法往前推，也能在关键时刻承担决策。',
    shadow: '当这股能量失衡时，可能急于掌控局面，或把价值感过度绑定在胜负与结果上。',
    relationship: '你在关系里倾向主动解决问题，但也需要留意不要替别人做完所有决定。',
    work: '你适合需要推动、领导、竞争、谈判和资源整合的场景。',
    fields: ['创业', '销售', '管理', '项目推进', '商业策略', '团队领导']
  },
  heart: {
    key: 'heart',
    name: '心轮',
    englishName: 'Heart Chakra',
    shortName: 'Heart',
    family: '疗愈者家族',
    themes: ['爱', '共情', '关系', '接纳', '连接', '慈悲'],
    core: '你重视情感连接、理解和关系中的温度，容易觉察他人的真实需求。',
    strength: '你能让人感到被看见、被接住，也适合在群体里建立信任和凝聚力。',
    shadow: '当这股能量失衡时，可能过度付出、边界不清，或替别人承担太多情绪。',
    relationship: '你在关系里追求温柔、理解和互相支持，也需要练习让自己的需求同样被看见。',
    work: '你适合教育、咨询、服务、公益、社群和需要信任感的协作场景。',
    fields: ['教育', '咨询', '服务', '公益', '社群运营', '内容表达']
  },
  throat: {
    key: 'throat',
    name: '喉轮',
    englishName: 'Throat Chakra',
    shortName: 'Throat',
    family: '表达者家族',
    themes: ['表达', '沟通', '真实', '声音', '影响', '传播'],
    core: '你重视真实表达和信息传递，容易通过语言、声音或作品建立影响。',
    strength: '你能把感受、观点或复杂概念说出来，让别人听见并理解。',
    shadow: '当这股能量失衡时，可能表达过满、急于说服，或用语言占据局面。',
    relationship: '你在关系里需要坦诚沟通，也会希望双方都能把真实想法说清楚。',
    work: '你适合传播、写作、演讲、教学、主持、品牌表达和公众沟通。',
    fields: ['写作', '演讲', '传播', '主持', '教学', '品牌表达']
  },
  thirdEye: {
    key: 'thirdEye',
    name: '眉心轮',
    englishName: 'Third Eye Chakra',
    shortName: 'ThirdEye',
    family: '洞察者家族',
    themes: ['洞察', '直觉', '判断', '远见', '想象', '结构'],
    core: '你倾向看见事情背后的结构、趋势和隐含信息，不满足于表层答案。',
    strength: '你能在复杂信息里看见规律，适合分析、判断、规划和长期决策。',
    shadow: '当这股能量失衡时，可能过度分析、想太多，或和身体及现实体验脱节。',
    relationship: '你在关系里会捕捉细节和潜台词，也需要练习让判断保留温度。',
    work: '你适合策略、研究、产品、咨询、投资、技术、风控和复杂系统分析。',
    fields: ['战略', '研究', '产品', '咨询', '投资', '技术']
  },
  crown: {
    key: 'crown',
    name: '顶轮',
    englishName: 'Crown Chakra',
    shortName: 'Crown',
    family: '智者家族',
    themes: ['意义', '信念', '精神', '智慧', '使命', '超越'],
    core: '你会追问意义、信念和更高层次的方向，不太满足于只解决眼前问题。',
    strength: '你能把经验提升成理解，也容易给自己和他人带来更大的视野。',
    shadow: '当这股能量失衡时，可能停留在理念里，逃避现实细节，或难以真正落地。',
    relationship: '你在关系里需要精神共鸣和价值观连接，也需要把关怀落在具体行动上。',
    work: '你适合愿景、文化、教育、写作、公益、哲学和长期价值建设。',
    fields: ['教育', '文化', '公益', '写作', '研究', '长期价值建设']
  }
};

export const chakraKeyByName: Record<string, ChakraKey> = {
  海底轮: 'root',
  脐轮: 'sacral',
  太阳轮: 'solar',
  心轮: 'heart',
  喉轮: 'throat',
  眉心轮: 'thirdEye',
  顶轮: 'crown'
};

export const archetypeMap: Record<string, ChakraArchetype> = {
  root_sacral: {
    name: '生活经营者',
    family: '守护者家族',
    code: 'Root-Sacral',
    headline: '你把日子过成作品，也把安全感种进生活。',
    celebrities: [{ name: '林徽因' }, { name: '三毛' }, { name: '苏东坡' }]
  },
  root_solar: {
    name: '稳健掌控者',
    family: '守护者家族',
    code: 'Root-Solar',
    headline: '你不是冲得最快的人，但你是最能扛住风浪的人。',
    celebrities: [{ name: '董明珠' }, { name: '梅琳达·盖茨', enName: 'Melinda Gates' }, { name: '稻盛和夫' }]
  },
  root_heart: {
    name: '温暖守护者',
    family: '守护者家族',
    code: 'Root-Heart',
    headline: '你给人的不是承诺，而是可以依靠的安定。',
    celebrities: [{ name: '张桂梅' }, { name: '特蕾莎修女', enName: 'Mother Teresa' }, { name: '弗雷德·罗杰斯', enName: 'Fred Rogers' }]
  },
  root_throat: {
    name: '可靠传达者',
    family: '守护者家族',
    code: 'Root-Throat',
    headline: '你的声音不喧哗，却让人愿意相信。',
    celebrities: [{ name: '杨澜' }, { name: '柴静' }, { name: '白岩松' }]
  },
  root_thirdEye: {
    name: '现实策略家',
    family: '守护者家族',
    code: 'Root-ThirdEye',
    headline: '你看得清局势，也懂得如何稳稳落地。',
    celebrities: [{ name: '屠呦呦' }, { name: '玛丽·居里', enName: 'Marie Curie' }, { name: '查理·芒格', enName: 'Charlie Munger' }]
  },
  root_crown: {
    name: '入世修行者',
    family: '守护者家族',
    code: 'Root-Crown',
    headline: '你把信念放进生活，把精神落到脚下。',
    celebrities: [{ name: '证严法师' }, { name: '南丁格尔', enName: 'Florence Nightingale' }, { name: '甘地', enName: 'Mahatma Gandhi' }]
  },
  sacral_root: {
    name: '感官生活家',
    family: '创造者家族',
    code: 'Sacral-Root',
    headline: '你不是活着，你是在认真品尝这个世界。',
    celebrities: [{ name: '三毛' }, { name: '林青霞' }, { name: '苏东坡' }]
  },
  sacral_solar: {
    name: '热情开创者',
    family: '创造者家族',
    code: 'Sacral-Solar',
    headline: '你一旦被点燃，就能把欲望变成行动。',
    celebrities: [{ name: '李宇春' }, { name: '碧昂丝', enName: 'Beyonce' }, { name: '理查德·布兰森', enName: 'Richard Branson' }]
  },
  sacral_heart: {
    name: '情感滋养者',
    family: '创造者家族',
    code: 'Sacral-Heart',
    headline: '你让关系有温度，也让爱有生命力。',
    celebrities: [{ name: '周迅' }, { name: '奥黛丽·赫本', enName: 'Audrey Hepburn' }, { name: '张艾嘉' }]
  },
  sacral_throat: {
    name: '灵感表达者',
    family: '创造者家族',
    code: 'Sacral-Throat',
    headline: '你不是在表达想法，你是在把灵魂烧成作品。',
    celebrities: [{ name: 'Lady Gaga' }, { name: '王菲' }, { name: '邓紫棋', enName: 'G.E.M.' }]
  },
  sacral_thirdEye: {
    name: '想象造梦者',
    family: '创造者家族',
    code: 'Sacral-ThirdEye',
    headline: '你看见的不只是现实，还有现实背后的梦。',
    celebrities: [{ name: '草间弥生' }, { name: 'J.K. 罗琳', enName: 'J.K. Rowling' }, { name: '宫崎骏' }]
  },
  sacral_crown: {
    name: '灵性艺术家',
    family: '创造者家族',
    code: 'Sacral-Crown',
    headline: '你的创造不是装饰世界，而是替灵魂发声。',
    celebrities: [{ name: '王菲' }, { name: 'Björk' }, { name: '坂本龙一' }]
  },
  solar_root: {
    name: '坚定执行者',
    family: '行动者家族',
    code: 'Solar-Root',
    headline: '你不靠运气翻盘，你靠意志把路踩出来。',
    celebrities: [{ name: '董明珠' }, { name: '玫琳凯·艾施', enName: 'Mary Kay Ash' }, { name: '稻盛和夫' }]
  },
  solar_sacral: {
    name: '热血推动者',
    family: '行动者家族',
    code: 'Solar-Sacral',
    headline: '你有火，也有欲望把世界推向前。',
    celebrities: [{ name: '蕾哈娜', enName: 'Rihanna' }, { name: '麦当娜', enName: 'Madonna' }, { name: '史蒂夫·乔布斯', enName: 'Steve Jobs' }]
  },
  solar_heart: {
    name: '温柔领导者',
    family: '行动者家族',
    code: 'Solar-Heart',
    headline: '你不是用权力征服别人，而是用温度让人心甘情愿靠近你。',
    celebrities: [{ name: '奥普拉·温弗瑞', enName: 'Oprah Winfrey' }, { name: '杨澜' }, { name: '米歇尔·奥巴马', enName: 'Michelle Obama' }]
  },
  solar_throat: {
    name: '影响力演说者',
    family: '行动者家族',
    code: 'Solar-Throat',
    headline: '你的语言不是声音，是能推动人群的力量。',
    celebrities: [{ name: '奥普拉·温弗瑞', enName: 'Oprah Winfrey' }, { name: '董卿' }, { name: '马丁·路德·金', enName: 'Martin Luther King Jr.' }]
  },
  solar_thirdEye: {
    name: '战略决策者',
    family: '行动者家族',
    code: 'Solar-ThirdEye',
    headline: '你不是只会行动，你知道该往哪里赢。',
    celebrities: [{ name: '何超琼' }, { name: '苏珊·沃西基', enName: 'Susan Wojcicki' }, { name: '彼得·德鲁克', enName: 'Peter Drucker' }]
  },
  solar_crown: {
    name: '使命实践者',
    family: '行动者家族',
    code: 'Solar-Crown',
    headline: '你不只是想成功，你想证明某种信念值得被实现。',
    celebrities: [{ name: '南丁格尔', enName: 'Florence Nightingale' }, { name: '简·古道尔', enName: 'Jane Goodall' }, { name: '马丁·路德·金', enName: 'Martin Luther King Jr.' }]
  },
  heart_root: {
    name: '安全感疗愈者',
    family: '疗愈者家族',
    code: 'Heart-Root',
    headline: '你给人的爱不是情绪，而是一种可以停靠的地方。',
    celebrities: [{ name: '张桂梅' }, { name: '特蕾莎修女', enName: 'Mother Teresa' }, { name: '弗雷德·罗杰斯', enName: 'Fred Rogers' }]
  },
  heart_sacral: {
    name: '情感滋养者',
    family: '疗愈者家族',
    code: 'Heart-Sacral',
    headline: '你让爱变得柔软，也让关系重新流动。',
    celebrities: [{ name: '周迅' }, { name: '奥黛丽·赫本', enName: 'Audrey Hepburn' }, { name: '张艾嘉' }]
  },
  heart_solar: {
    name: '温柔领导者',
    family: '疗愈者家族',
    code: 'Heart-Solar',
    headline: '你不是用权力征服别人，而是用温度让人心甘情愿靠近你。',
    celebrities: [{ name: '奥普拉·温弗瑞', enName: 'Oprah Winfrey' }, { name: '杨澜' }, { name: '米歇尔·奥巴马', enName: 'Michelle Obama' }]
  },
  heart_throat: {
    name: '温柔传达者',
    family: '疗愈者家族',
    code: 'Heart-Throat',
    headline: '你说出的不只是话，而是别人终于被理解的瞬间。',
    celebrities: [{ name: '杨澜' }, { name: '龙应台' }, { name: '陈鲁豫' }]
  },
  heart_thirdEye: {
    name: '洞察疗愈者',
    family: '疗愈者家族',
    code: 'Heart-ThirdEye',
    headline: '你不只看见伤口，你还看见它为什么在那里。',
    celebrities: [{ name: '弗吉尼亚·萨提亚', enName: 'Virginia Satir' }, { name: '毕淑敏' }, { name: '卡尔·荣格', enName: 'Carl Jung' }]
  },
  heart_crown: {
    name: '慈悲理想者',
    family: '疗愈者家族',
    code: 'Heart-Crown',
    headline: '你的爱不止给某个人，也给你相信的世界。',
    celebrities: [{ name: '特蕾莎修女', enName: 'Mother Teresa' }, { name: '简·古道尔', enName: 'Jane Goodall' }, { name: '甘地', enName: 'Mahatma Gandhi' }]
  },
  throat_root: {
    name: '稳定表达者',
    family: '表达者家族',
    code: 'Throat-Root',
    headline: '你的表达不浮夸，却有一种让人安心的重量。',
    celebrities: [{ name: '柴静' }, { name: '杨澜' }, { name: '白岩松' }]
  },
  throat_sacral: {
    name: '魅力表达者',
    family: '表达者家族',
    code: 'Throat-Sacral',
    headline: '你一开口，情绪、风格和生命力就一起出现。',
    celebrities: [{ name: 'Lady Gaga' }, { name: '王菲' }, { name: '邓紫棋', enName: 'G.E.M.' }]
  },
  throat_solar: {
    name: '观点领导者',
    family: '表达者家族',
    code: 'Throat-Solar',
    headline: '你不是附和时代，你是敢于说出方向的人。',
    celebrities: [{ name: '董卿' }, { name: '奥普拉·温弗瑞', enName: 'Oprah Winfrey' }, { name: '马丁·路德·金', enName: 'Martin Luther King Jr.' }]
  },
  throat_heart: {
    name: '共情沟通者',
    family: '表达者家族',
    code: 'Throat-Heart',
    headline: '你让沟通不只是交换信息，而是建立连接。',
    celebrities: [{ name: '杨澜' }, { name: '陈鲁豫' }, { name: '樊登' }]
  },
  throat_thirdEye: {
    name: '真相揭示者',
    family: '表达者家族',
    code: 'Throat-ThirdEye',
    headline: '你说出的不是漂亮话，而是别人不敢面对的真相。',
    celebrities: [{ name: '汉娜·阿伦特', enName: 'Hannah Arendt' }, { name: '柴静' }, { name: '乔治·奥威尔', enName: 'George Orwell' }]
  },
  throat_crown: {
    name: '信念传播者',
    family: '表达者家族',
    code: 'Throat-Crown',
    headline: '你的声音不是为了被听见，而是为了唤醒什么。',
    celebrities: [{ name: '龙应台' }, { name: '奥普拉·温弗瑞', enName: 'Oprah Winfrey' }, { name: '纪伯伦', enName: 'Kahlil Gibran' }]
  },
  thirdEye_root: {
    name: '现实洞察者',
    family: '洞察者家族',
    code: 'ThirdEye-Root',
    headline: '你不是看得远，你是看见别人还没意识到的世界。',
    celebrities: [{ name: '董明珠' }, { name: '屠呦呦' }, { name: '埃隆·马斯克', enName: 'Elon Musk' }]
  },
  thirdEye_sacral: {
    name: '想象探索者',
    family: '洞察者家族',
    code: 'ThirdEye-Sacral',
    headline: '你的直觉不是幻想，而是通往未知的入口。',
    celebrities: [{ name: '草间弥生' }, { name: 'J.K. 罗琳', enName: 'J.K. Rowling' }, { name: '宫崎骏' }]
  },
  thirdEye_solar: {
    name: '策略预见者',
    family: '洞察者家族',
    code: 'ThirdEye-Solar',
    headline: '你在别人行动前，已经看见了结局的形状。',
    celebrities: [{ name: '何超琼' }, { name: '苏珊·沃西基', enName: 'Susan Wojcicki' }, { name: '彼得·德鲁克', enName: 'Peter Drucker' }]
  },
  thirdEye_heart: {
    name: '人心洞察者',
    family: '洞察者家族',
    code: 'ThirdEye-Heart',
    headline: '你看见的不是表情，而是表情背后的灵魂。',
    celebrities: [{ name: '弗吉尼亚·萨提亚', enName: 'Virginia Satir' }, { name: '毕淑敏' }, { name: '卡尔·荣格', enName: 'Carl Jung' }]
  },
  thirdEye_throat: {
    name: '清醒讲述者',
    family: '洞察者家族',
    code: 'ThirdEye-Throat',
    headline: '你把复杂的真相，说成别人终于能懂的话。',
    celebrities: [{ name: '汉娜·阿伦特', enName: 'Hannah Arendt' }, { name: '柴静' }, { name: '罗振宇' }]
  },
  thirdEye_crown: {
    name: '高维观察者',
    family: '洞察者家族',
    code: 'ThirdEye-Crown',
    headline: '你不只看事件，你看见事件背后的秩序。',
    celebrities: [{ name: '汉娜·阿伦特', enName: 'Hannah Arendt' }, { name: '玛丽·居里', enName: 'Marie Curie' }, { name: '爱因斯坦', enName: 'Albert Einstein' }]
  },
  crown_root: {
    name: '扎根修行者',
    family: '智者家族',
    code: 'Crown-Root',
    headline: '你不是逃离现实，而是在现实里修炼灵魂。',
    celebrities: [{ name: '证严法师' }, { name: '南丁格尔', enName: 'Florence Nightingale' }, { name: '甘地', enName: 'Mahatma Gandhi' }]
  },
  crown_sacral: {
    name: '灵感创造者',
    family: '智者家族',
    code: 'Crown-Sacral',
    headline: '你的灵感像从高处落下，又在身体里开花。',
    celebrities: [{ name: '王菲' }, { name: 'Björk' }, { name: '坂本龙一' }]
  },
  crown_solar: {
    name: '使命驱动者',
    family: '智者家族',
    code: 'Crown-Solar',
    headline: '你不是为了赢而行动，你是为了回应内在召唤。',
    celebrities: [{ name: '简·古道尔', enName: 'Jane Goodall' }, { name: '南丁格尔', enName: 'Florence Nightingale' }, { name: '马丁·路德·金', enName: 'Martin Luther King Jr.' }]
  },
  crown_heart: {
    name: '慈悲引导者',
    family: '智者家族',
    code: 'Crown-Heart',
    headline: '你想带来的不是答案，而是一种更有爱的可能。',
    celebrities: [{ name: '特蕾莎修女', enName: 'Mother Teresa' }, { name: '证严法师' }, { name: '简·古道尔', enName: 'Jane Goodall' }]
  },
  crown_throat: {
    name: '智慧传播者',
    family: '智者家族',
    code: 'Crown-Throat',
    headline: '你说出的不是观点，而是被提炼过的生命理解。',
    celebrities: [{ name: '龙应台' }, { name: '奥普拉·温弗瑞', enName: 'Oprah Winfrey' }, { name: '纪伯伦', enName: 'Kahlil Gibran' }]
  },
  crown_thirdEye: {
    name: '灵性观察者',
    family: '智者家族',
    code: 'Crown-ThirdEye',
    headline: '你看见世界的表面，也看见它背后的意义。',
    celebrities: [{ name: '汉娜·阿伦特', enName: 'Hannah Arendt' }, { name: '玛丽·居里', enName: 'Marie Curie' }, { name: '爱因斯坦', enName: 'Albert Einstein' }]
  }
};

export const growthThemeMap: Record<ChakraKey, GrowthTheme> = {
  root: {
    key: 'root',
    name: '海底轮',
    theme: '安全感与现实稳定',
    growth: '你需要建立身体感、安全感、现实根基和生活秩序。',
    suggestions: ['规律作息，建立稳定生活节奏。', '通过运动、散步、瑜伽等方式回到身体。', '整理财务、居住空间和长期计划。', '减少长期悬而未决的现实压力。']
  },
  sacral: {
    key: 'sacral',
    name: '脐轮',
    theme: '感受力与创造力',
    growth: '你需要重新连接愉悦、亲密、身体感受和创造冲动。',
    suggestions: ['安排无目标的体验，比如音乐、绘画、跳舞、旅行。', '练习表达喜欢和不喜欢。', '允许自己享受，而不是总追求有用。', '把情绪转化成作品、文字或行动。']
  },
  solar: {
    key: 'solar',
    name: '太阳轮',
    theme: '自信与行动边界',
    growth: '你需要提升自信、行动力、边界感和自我主张。',
    suggestions: ['把目标拆成可以完成的小行动。', '练习提出明确请求和拒绝。', '记录自己完成过的事，重建自我效能感。', '在行动前确认：这是我的选择，不只是他人的期待。']
  },
  heart: {
    key: 'heart',
    name: '心轮',
    theme: '连接与健康边界',
    growth: '你需要学习信任、接纳、情感连接和健康边界。',
    suggestions: ['帮助别人之前，先确认自己是否有余力。', '练习说：“我愿意支持你，但我不能替你承担。”', '允许自己表达需要，而不只是照顾他人。', '把关系中的责任还给各自的位置。']
  },
  throat: {
    key: 'throat',
    name: '喉轮',
    theme: '真实表达与自我声音',
    growth: '你需要练习表达真实想法，建立自己的声音。',
    suggestions: ['每天写下一个真实想法，不急着修饰。', '从低风险场景开始表达不同意见。', '练习把感受说清楚，而不是等别人猜。', '在表达前问自己：这句话是否诚实、清晰、必要。']
  },
  thirdEye: {
    key: 'thirdEye',
    name: '眉心轮',
    theme: '清晰判断与内在信任',
    growth: '你需要建立清晰判断、方向感和内在信任。',
    suggestions: ['减少同时处理的信息源，给判断留白。', '记录直觉和实际结果，训练内在校准。', '遇到选择时写下最关键的三个变量。', '把洞察落成一次具体行动。']
  },
  crown: {
    key: 'crown',
    name: '顶轮',
    theme: '意义感与长期方向',
    growth: '你需要寻找意义感、信念感和更高层次的生命方向。',
    suggestions: ['给当前阶段写一个长期主题。', '把抽象信念转化成一件具体行动。', '阅读、冥想或独处，整理自己的价值排序。', '每次投入前问自己：这件事到底想留下什么。']
  }
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeChakraScore(score: number) {
  return Math.round((clamp(score, -100, 100) + 100) / 2);
}

function getBalanceType(gap: number): ResultStatus {
  if (gap <= 15) return { name: '均衡型', description: '各脉轮发展较平均，能量结构稳定。' };
  if (gap <= 30) return { name: '轻度偏科型', description: '有明显优势，也有需要补足的领域。' };
  if (gap <= 45) return { name: '偏科型', description: '某些主题突出，某些主题明显薄弱。' };
  return { name: '强烈偏科型', description: '当前能量结构差异较大，优势和课题都很明显。' };
}

function getActivityType(average: number): ResultStatus {
  if (average < 40) return { name: '低活跃状态', description: '当前能量偏收缩，可能处于疲惫、防御或低动力阶段。' };
  if (average < 60) return { name: '中低活跃状态', description: '能量可用，但部分主题尚未充分打开。' };
  if (average < 75) return { name: '稳定活跃状态', description: '整体状态较健康，优势和课题都比较清晰。' };
  if (average < 90) return { name: '高活跃状态', description: '能量强、感知敏锐，行动或表达欲较高。' };
  return { name: '过度活跃状态', description: '能量很强，但也可能带来过载、焦虑或失衡。' };
}

function getEnergyStructure(scoredChakras: ScoredChakra[]): ResultStatus {
  const scoreByKey = Object.fromEntries(scoredChakras.map(chakra => [chakra.key, chakra.normalizedScore])) as Record<ChakraKey, number>;
  const lowerAverage = (scoreByKey.root + scoreByKey.sacral + scoreByKey.solar) / 3;
  const upperAverage = (scoreByKey.throat + scoreByKey.thirdEye + scoreByKey.crown) / 3;
  const heart = scoreByKey.heart;

  if (lowerAverage - upperAverage >= 15) {
    return {
      name: '下三轮强',
      description: '现实、安全、感受和行动更先启动，适合把精神或愿景继续向上打开。'
    };
  }

  if (upperAverage - lowerAverage >= 15) {
    return {
      name: '上三轮强',
      description: '表达、洞察和意义感更活跃，适合把想法落回身体、节奏和现实行动。'
    };
  }

  if (heart >= lowerAverage && heart >= upperAverage) {
    return {
      name: '心轮桥梁型',
      description: '心轮像上下能量之间的桥梁，关系、共情和连接是整合全局的关键。'
    };
  }

  return {
    name: '上下较均衡',
    description: '现实行动和精神洞察之间没有明显偏斜，适合稳步发展优势主题。'
  };
}

function buildScoredChakras(scores: Record<string, number>): ScoredChakra[] {
  return chakraOrder.map(key => {
    const profile = chakraProfiles[key];
    const score = scores[profile.name] ?? 0;
    return {
      ...profile,
      score,
      normalizedScore: normalizeChakraScore(score)
    };
  });
}

function personName(person: ArchetypePerson) {
  return person.enName ? `${person.name} ${person.enName}` : person.name;
}

export function formatArchetypePeople(people: ArchetypePerson[]) {
  return people.map(personName).join(' · ');
}

export function getAllChakraArchetypeItems(): ChakraArchetypeGalleryItem[] {
  return chakraOrder.flatMap(primaryKey =>
    chakraOrder
      .filter(secondaryKey => secondaryKey !== primaryKey)
      .map(secondaryKey => {
        const key = `${primaryKey}_${secondaryKey}`;
        return {
          key,
          primary: chakraProfiles[primaryKey],
          secondary: chakraProfiles[secondaryKey],
          archetype: archetypeMap[key]
        };
      })
  );
}

export function generateChakraArchetypeResult(scores: Record<string, number>): ChakraArchetypeResult {
  const scoredChakras = buildScoredChakras(scores);
  const orderIndex = (key: ChakraKey) => chakraOrder.indexOf(key);
  const sortedDesc = [...scoredChakras].sort((a, b) => {
    if (b.normalizedScore !== a.normalizedScore) return b.normalizedScore - a.normalizedScore;
    return orderIndex(a.key) - orderIndex(b.key);
  });
  const sortedAsc = [...scoredChakras].sort((a, b) => {
    if (a.normalizedScore !== b.normalizedScore) return a.normalizedScore - b.normalizedScore;
    return orderIndex(b.key) - orderIndex(a.key);
  });

  const primary = sortedDesc[0];
  const secondary = sortedDesc[1];
  const lowest = sortedAsc[0];
  const archetype = archetypeMap[`${primary.key}_${secondary.key}`] ?? {
    name: `${primary.name}${secondary.name}型`,
    family: primary.family,
    code: `${primary.shortName}-${secondary.shortName}`,
    headline: `${primary.name}是你的主导能量，${secondary.name}让这种能量拥有更具体的表达方式。`,
    celebrities: []
  };
  const gap = primary.normalizedScore - lowest.normalizedScore;
  const average = Math.round(scoredChakras.reduce((sum, chakra) => sum + chakra.normalizedScore, 0) / scoredChakras.length);
  const growthTheme = growthThemeMap[lowest.key];

  return {
    primary,
    secondary,
    lowest,
    archetype,
    growthTheme,
    balanceType: getBalanceType(gap),
    activityType: getActivityType(average),
    energyStructure: getEnergyStructure(scoredChakras),
    gap,
    average,
    strengths: [
      primary.strength,
      secondary.strength,
      `你适合把“${primary.themes[0]}”和“${secondary.themes[0]}”结合起来，形成有辨识度的个人能量模式。`
    ],
    shadow: `${primary.shadow}${secondary.shadow} 这不是固定人格，而是当前能量失衡时需要留意的倾向。`,
    relationshipMode: `${primary.relationship}${secondary.relationship}`,
    workMode: `${primary.work}${secondary.work}`,
    summary: `你当前呈现出「${archetype.name}」的能量模式。${primary.core}${secondary.name}作为辅助能量，让你的主导特质更容易通过${secondary.themes.slice(0, 2).join('、')}表现出来。`,
    recommendations: growthTheme.suggestions
  };
}
