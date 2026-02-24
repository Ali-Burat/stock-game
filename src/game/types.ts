// 游戏类型定义

// 游戏模式
export type GameMode = 'normal' | 'survival';

// 难度等级
export type Difficulty = 'easy' | 'normal' | 'hard' | 'realistic' | 'custom' | 'cheat';

// 玩家身份
export interface PlayerIdentity {
  id: string;
  name: string;
  description: string;
  initialCash: number;
  stressResistance: number; // 耐压能力 1-100
  workEfficiency: number; // 工作效率 1-100
  investmentSense: number; // 投资直觉 1-100
  icon: string;
}

// 股票信息
export interface Stock {
  id: string;
  code: string;
  name: string;
  industry: string;
  basePrice: number;
  currentPrice: number;
  previousPrice: number;
  dayOpenPrice: number; // 今日开盘价
  dayHighPrice: number; // 今日最高价
  dayLowPrice: number; // 今日最低价
  dayChange: number;
  dayChangePercent: number;
  volatility: number; // 波动率
  trend: 'up' | 'down' | 'stable';
  description: string;
  history: StockHistoryPoint[];
  totalShares: number;
  marketCap: number; // 市值
  pe: number; // 市盈率
  dividend: number; // 股息率
  isLimitUp: boolean; // 是否涨停
  isLimitDown: boolean; // 是否跌停
  announcement?: StockAnnouncement; // 当前公告
}

// 股票公告
export interface StockAnnouncement {
  id: string;
  stockId: string;
  title: string;
  content: string;
  type: 'positive' | 'negative' | 'neutral';
  effect: number; // 预期影响百分比
  publishTime: number;
  expireTime: number;
}

// 股票历史数据点
export interface StockHistoryPoint {
  time: number;
  price: number;
  volume: number;
}

// 持仓信息
export interface Position {
  stockId: string;
  stockCode: string;
  stockName: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  profit: number;
  profitPercent: number;
}

// 交易记录
export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  stockId: string;
  stockCode: string;
  stockName: string;
  shares: number;
  price: number;
  totalAmount: number;
  fee: number;
  timestamp: number;
}

// 物品类型
export type ItemType = 'food' | 'drink' | 'entertainment' | 'medicine';

// 商店物品
export interface ShopItem {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  effect: {
    hunger?: number;
    thirst?: number;
    health?: number;
    mood?: number;
  };
  shelfLife: number; // 保质期（游戏天数），0表示永久
  description: string;
  icon: string;
}

// 背包物品
export interface InventoryItem {
  item: ShopItem;
  purchaseDate: number; // 购买时的游戏天数
  quantity: number;
}

// 生存状态
export interface SurvivalStatus {
  hunger: number; // 饥饿值 0-100
  thirst: number; // 口渴值 0-100
  health: number; // 健康值 0-100
  mood: number; // 心情值 0-100
}

// 工作类型
export interface Job {
  id: string;
  name: string;
  description: string;
  hourlyPay: number;
  energyCost: number; // 消耗的精力
  moodEffect: number; // 心情影响
  requiredHealth: number; // 最低健康要求
  workHours: number[]; // 可工作时间段
}

// 娱乐设施
export interface Entertainment {
  id: string;
  name: string;
  description: string;
  cost: number;
  moodBoost: number;
  timeCost: number; // 消耗时间（小时）
  icon: string;
}

// 随机事件
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  effects: {
    cash?: number;
    hunger?: number;
    thirst?: number;
    health?: number;
    mood?: number;
    stockEffect?: {
      industry?: string;
      effect: number; // 对股价的影响百分比
    };
  };
  probability: number;
}

// 存档数据
export interface SaveData {
  slotId: number;
  playerName: string;
  playerIdentity: PlayerIdentity;
  gameMode: GameMode;
  difficulty: Difficulty;
  customDifficulty?: CustomDifficulty;
  cash: number;
  bankDeposit: number;
  positions: Position[];
  transactions: Transaction[];
  survivalStatus: SurvivalStatus;
  inventory: InventoryItem[];
  gameDay: number;
  gameTime: number; // 当前时间（小时）
  stockMarket: Stock[];
  createdAt: number;
  updatedAt: number;
  playTime: number; // 总游戏时长（秒）
}

// 自定义难度设置
export interface CustomDifficulty {
  initialCash: number;
  stockVolatility: number; // 股票波动率倍数
  survivalDecayRate: number; // 生存值衰减速度
  foodPriceMultiplier: number;
  workPayMultiplier: number;
  eventProbability: number; // 随机事件概率
}

// 游戏状态
export interface GameState {
  // 游戏基础信息
  isPlaying: boolean;
  isPaused: boolean;
  gameMode: GameMode;
  difficulty: Difficulty;
  customDifficulty: CustomDifficulty | null;
  
  // 玩家信息
  playerName: string;
  playerIdentity: PlayerIdentity | null;
  
  // 财务信息
  cash: number;
  bankDeposit: number;
  
  // 股票相关
  stocks: Stock[];
  positions: Position[];
  transactions: Transaction[];
  
  // 市场状态
  marketState: MarketState;
  
  // 生存系统
  survivalStatus: SurvivalStatus;
  inventory: InventoryItem[];
  
  // 时间系统
  gameDay: number;
  gameTime: number; // 0-23小时
  gameSpeed: number; // 游戏速度倍数
  
  // 统计
  totalProfit: number;
  totalLoss: number;
  winCount: number;
  loseCount: number;
  playTime: number;
  
  // 当前事件
  currentEvent: GameEvent | null;
  
  // 存档
  currentSlotId: number;
}

// 游戏动作
export interface GameActions {
  // 游戏控制
  startGame: (config: GameStartConfig) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  tickGame: () => void;
  
  // 股票交易
  buyStock: (stockId: string, shares: number) => boolean;
  sellStock: (stockId: string, shares: number) => boolean;
  updateStockPrices: () => void;
  
  // 生存系统
  updateSurvivalStatus: () => void;
  consumeItem: (itemId: string) => boolean;
  buyItem: (itemId: string, quantity: number) => boolean;
  
  // 工作
  doWork: (jobId: string, hours: number) => boolean;
  
  // 娱乐
  doEntertainment: (entertainmentId: string) => boolean;
  
  // 存档
  saveGame: (slotId: number) => boolean;
  loadGame: (slotId: number) => boolean;
  deleteSave: (slotId: number) => boolean;
  getSaveList: () => SaveData[];
  
  // 事件
  triggerEvent: (event: GameEvent) => void;
  dismissEvent: () => void;
}

// 游戏开始配置
export interface GameStartConfig {
  playerName: string;
  playerIdentity: PlayerIdentity;
  gameMode: GameMode;
  difficulty: Difficulty;
  customDifficulty?: CustomDifficulty;
}

// 新闻类型
export type NewsCategory = 
  | 'macro_economy'    // 宏观经济
  | 'industry'         // 行业动态
  | 'company'          // 公司新闻
  | 'policy'           // 政策法规
  | 'international'    // 国际形势
  | 'market_sentiment' // 市场情绪
  | 'financial';       // 金融动态

// 新闻重要性
export type NewsImportance = 'minor' | 'normal' | 'major' | 'critical';

// 新闻
export interface News {
  id: string;
  title: string;
  content: string;
  summary: string; // 简短摘要
  category: NewsCategory;
  importance: NewsImportance;
  type: 'positive' | 'negative' | 'neutral';
  publishTime: number;
  expireTime: number;
  
  // 新闻影响
  effects: {
    // 影响的行业及影响程度
    industries?: Array<{
      industry: string;
      effect: number; // 影响百分比
      duration: number; // 影响持续小时数
    }>;
    // 影响的个股
    stocks?: Array<{
      stockId: string;
      effect: number;
      duration: number;
    }>;
    // 大盘影响
    marketEffect?: number;
    // 市场情绪影响
    sentimentEffect?: number;
  };
  
  // 是否已被市场消化
  isDigested: boolean;
  // 是否为突发新闻
  isBreaking: boolean;
  // 来源
  source: string;
}

// 大盘指数
export interface MarketIndex {
  id: string;
  code: string;
  name: string;
  baseValue: number;
  currentValue: number;
  previousValue: number;
  dayChange: number;
  dayChangePercent: number;
  dayHigh: number;
  dayLow: number;
  dayOpen: number;
  history: Array<{
    time: number;
    value: number;
  }>;
  // 指数成分股
  components: string[]; // stockId数组
}

// 市场状态
export interface MarketState {
  // 大盘指数
  indices: MarketIndex[];
  // 市场情绪 -100 到 100
  sentiment: number;
  // 市场成交量
  totalVolume: number;
  // 上涨股票数
  upCount: number;
  // 下跌股票数
  downCount: number;
  // 涨停股票数
  limitUpCount: number;
  // 跌停股票数
  limitDownCount: number;
  // 当前新闻列表
  news: News[];
  // 历史新闻（已过期）
  newsHistory: News[];
}

// K线数据
export interface KLineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 技术指标
export interface TechnicalIndicators {
  ma5: number;   // 5日均线
  ma10: number;  // 10日均线
  ma20: number;  // 20日均线
  rsi: number;   // 相对强弱指标
  macd: number;  // MACD
  kdj: {         // KDJ指标
    k: number;
    d: number;
    j: number;
  };
}
