import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  GameStartConfig,
  Position,
  Transaction,
  InventoryItem,
  SaveData,
  GameEvent,
  Stock,
  SurvivalStatus,
  MarketState,
} from './types';
import {
  DIFFICULTY_CONFIG,
  DEFAULT_CUSTOM_DIFFICULTY,
  SHOP_ITEMS,
  GAME_EVENTS,
  MAX_SAVE_SLOTS,
  SAVE_KEY_PREFIX,
  JOBS,
  ENTERTAINMENTS,
} from './constants';
import {
  createInitialStocks,
  createInitialMarketState,
  generateRandomNews,
  applyNewsEffectToStocks,
  updateMarketIndices,
  calculateMarketStats,
  updateMarketSentiment,
} from './marketUtils';

// 初始生存状态
const initialSurvivalStatus: SurvivalStatus = {
  hunger: 80,
  thirst: 80,
  health: 100,
  mood: 70,
};

// 初始游戏状态
const initialState: GameState = {
  isPlaying: false,
  isPaused: false,
  gameMode: 'normal',
  difficulty: 'normal',
  customDifficulty: null,
  playerName: '',
  playerIdentity: null,
  cash: 0,
  bankDeposit: 0,
  stocks: [],
  positions: [],
  transactions: [],
  marketState: createInitialMarketState(),
  survivalStatus: initialSurvivalStatus,
  inventory: [],
  gameDay: 1,
  gameTime: 8, // 早上8点开始
  gameSpeed: 1,
  totalProfit: 0,
  totalLoss: 0,
  winCount: 0,
  loseCount: 0,
  playTime: 0,
  currentEvent: null,
  currentSlotId: 1,
};

// 深拷贝股票数据
function cloneStocks(stocks: Stock[]): Stock[] {
  return stocks.map(stock => ({
    ...stock,
    history: [...stock.history],
  }));
}

// 计算手续费
function calculateFee(amount: number): number {
  return Math.max(5, Math.round(amount * 0.0003)); // 最低5元，万分之三
}

// 生成唯一ID
function generateId(): string {
  return uuidv4();
}

// 创建游戏Store
export const useGameStore = create<GameState & {
  // 游戏控制
  startGame: (config: GameStartConfig) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  tickGame: () => void;
  setGameSpeed: (speed: number) => void;
  
  // 股票交易
  buyStock: (stockId: string, shares: number) => { success: boolean; message: string };
  sellStock: (stockId: string, shares: number) => { success: boolean; message: string };
  updateStockPrices: () => void;
  
  // 生存系统
  updateSurvivalStatus: () => void;
  consumeItem: (itemId: string) => { success: boolean; message: string };
  buyItem: (itemId: string, quantity: number) => { success: boolean; message: string };
  
  // 工作
  doWork: (jobId: string, hours: number) => { success: boolean; message: string };
  
  // 娱乐
  doEntertainment: (entertainmentId: string) => { success: boolean; message: string };
  
  // 存档
  saveGame: (slotId: number) => { success: boolean; message: string };
  loadGame: (slotId: number) => { success: boolean; message: string };
  deleteSave: (slotId: number) => { success: boolean; message: string };
  getSaveList: () => SaveData[];
  hasSave: (slotId: number) => boolean;
  
  // 事件
  triggerEvent: (event: GameEvent) => void;
  dismissEvent: () => void;
  
  // 辅助
  getStockById: (stockId: string) => Stock | undefined;
  getPositionByStockId: (stockId: string) => Position | undefined;
  getTotalAssets: () => number;
}>((set, get) => ({
  ...initialState,

  // 开始游戏
  startGame: (config: GameStartConfig) => {
    const { playerIdentity, gameMode, difficulty, customDifficulty } = config;
    
    // 计算初始资金
    let initialCash = playerIdentity.initialCash;
    if (difficulty !== 'custom' && difficulty !== 'cheat') {
      initialCash = Math.round(initialCash * DIFFICULTY_CONFIG[difficulty].initialCashMultiplier);
    } else if (difficulty === 'custom' && customDifficulty) {
      initialCash = customDifficulty.initialCash;
    } else if (difficulty === 'cheat') {
      initialCash = 999999999; // 作弊模式无限资金
    }

    // 初始化股票市场
    const stocks = createInitialStocks();
    
    // 初始化市场状态
    const marketState = createInitialMarketState();

    set({
      isPlaying: true,
      isPaused: false,
      gameMode,
      difficulty,
      customDifficulty: customDifficulty || null,
      playerName: config.playerName,
      playerIdentity,
      cash: initialCash,
      bankDeposit: 0,
      stocks,
      positions: [],
      transactions: [],
      marketState,
      survivalStatus: gameMode === 'survival' ? { ...initialSurvivalStatus } : initialSurvivalStatus,
      inventory: [],
      gameDay: 1,
      gameTime: 8,
      gameSpeed: 1,
      totalProfit: 0,
      totalLoss: 0,
      winCount: 0,
      loseCount: 0,
      playTime: 0,
      currentEvent: null,
    });
  },

  // 暂停游戏
  pauseGame: () => set({ isPaused: true }),

  // 继续游戏
  resumeGame: () => set({ isPaused: false }),

  // 结束游戏
  endGame: () => set({ ...initialState }),

  // 设置游戏速度
  setGameSpeed: (speed: number) => set({ gameSpeed: speed }),

  // 游戏时间推进
  tickGame: () => {
    const state = get();
    if (!state.isPlaying || state.isPaused) return;

    let newGameTime = state.gameTime + 1;
    let newGameDay = state.gameDay;

    // 时间超过24小时，进入下一天
    if (newGameTime >= 24) {
      newGameTime = 0;
      newGameDay += 1;
    }

    set({
      gameTime: newGameTime,
      gameDay: newGameDay,
      playTime: state.playTime + 1,
    });

    // 更新股票价格（每小时更新一次）
    if (newGameTime % 1 === 0) {
      get().updateStockPrices();
    }

    // 更新生存状态（生存模式）
    if (state.gameMode === 'survival') {
      get().updateSurvivalStatus();
    }

    // 生成新闻
    const news = generateRandomNews(state.stocks, newGameDay);
    if (news) {
      const volatilityMultiplier = state.difficulty === 'custom' && state.customDifficulty
        ? state.customDifficulty.stockVolatility
        : DIFFICULTY_CONFIG[state.difficulty]?.stockVolatilityMultiplier || 1;
      
      const newStocks = applyNewsEffectToStocks(news, state.stocks, volatilityMultiplier);
      const newMarketState = { ...state.marketState };
      newMarketState.news = [news, ...newMarketState.news.slice(0, 19)];
      
      set({ stocks: newStocks, marketState: newMarketState });
    }

    // 随机事件检测
    if (Math.random() < 0.01) {
      const eventProbability = state.difficulty === 'custom' && state.customDifficulty
        ? state.customDifficulty.eventProbability
        : DIFFICULTY_CONFIG[state.difficulty]?.eventProbabilityMultiplier || 1;
      
      const possibleEvents = GAME_EVENTS.filter(e => Math.random() < e.probability * eventProbability);
      if (possibleEvents.length > 0) {
        const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        get().triggerEvent(randomEvent);
      }
    }
  },

  // 买入股票
  buyStock: (stockId: string, shares: number) => {
    const state = get();
    const stock = state.stocks.find(s => s.id === stockId);
    
    if (!stock) {
      return { success: false, message: '股票不存在' };
    }

    if (shares <= 0) {
      return { success: false, message: '购买数量必须大于0' };
    }

    const totalAmount = stock.currentPrice * shares;
    const fee = calculateFee(totalAmount);
    const totalCost = totalAmount + fee;

    if (state.cash < totalCost) {
      return { success: false, message: '资金不足' };
    }

    // 创建交易记录
    const transaction: Transaction = {
      id: generateId(),
      type: 'buy',
      stockId,
      stockCode: stock.code,
      stockName: stock.name,
      shares,
      price: stock.currentPrice,
      totalAmount,
      fee,
      timestamp: Date.now(),
    };

    // 更新持仓
    const existingPosition = state.positions.find(p => p.stockId === stockId);
    let newPositions: Position[];

    if (existingPosition) {
      const newTotalShares = existingPosition.shares + shares;
      const newAverageCost = (existingPosition.averageCost * existingPosition.shares + totalAmount) / newTotalShares;
      
      newPositions = state.positions.map(p =>
        p.stockId === stockId
          ? {
              ...p,
              shares: newTotalShares,
              averageCost: newAverageCost,
              currentPrice: stock.currentPrice,
              profit: (stock.currentPrice - newAverageCost) * newTotalShares,
              profitPercent: ((stock.currentPrice - newAverageCost) / newAverageCost) * 100,
            }
          : p
      );
    } else {
      const newPosition: Position = {
        stockId,
        stockCode: stock.code,
        stockName: stock.name,
        shares,
        averageCost: stock.currentPrice,
        currentPrice: stock.currentPrice,
        profit: 0,
        profitPercent: 0,
      };
      newPositions = [...state.positions, newPosition];
    }

    set({
      cash: state.cash - totalCost,
      positions: newPositions,
      transactions: [...state.transactions, transaction],
    });

    return { success: true, message: `成功买入 ${stock.name} ${shares} 股，花费 ¥${totalCost.toFixed(2)}` };
  },

  // 卖出股票
  sellStock: (stockId: string, shares: number) => {
    const state = get();
    const stock = state.stocks.find(s => s.id === stockId);
    const position = state.positions.find(p => p.stockId === stockId);

    if (!stock) {
      return { success: false, message: '股票不存在' };
    }

    if (!position) {
      return { success: false, message: '您没有持有该股票' };
    }

    if (shares <= 0) {
      return { success: false, message: '卖出数量必须大于0' };
    }

    if (shares > position.shares) {
      return { success: false, message: '卖出数量超过持有数量' };
    }

    const totalAmount = stock.currentPrice * shares;
    const fee = calculateFee(totalAmount);
    const netAmount = totalAmount - fee;

    // 计算盈亏
    const profit = (stock.currentPrice - position.averageCost) * shares;
    const profitPercent = ((stock.currentPrice - position.averageCost) / position.averageCost) * 100;

    // 创建交易记录
    const transaction: Transaction = {
      id: generateId(),
      type: 'sell',
      stockId,
      stockCode: stock.code,
      stockName: stock.name,
      shares,
      price: stock.currentPrice,
      totalAmount,
      fee,
      timestamp: Date.now(),
    };

    // 更新持仓
    let newPositions: Position[];
    if (shares === position.shares) {
      newPositions = state.positions.filter(p => p.stockId !== stockId);
    } else {
      newPositions = state.positions.map(p =>
        p.stockId === stockId
          ? {
              ...p,
              shares: p.shares - shares,
              profit: (stock.currentPrice - p.averageCost) * (p.shares - shares),
              profitPercent: ((stock.currentPrice - p.averageCost) / p.averageCost) * 100,
            }
          : p
      );
    }

    // 更新统计
    const newTotalProfit = profit > 0 ? state.totalProfit + profit : state.totalProfit;
    const newTotalLoss = profit < 0 ? state.totalLoss + Math.abs(profit) : state.totalLoss;
    const newWinCount = profit > 0 ? state.winCount + 1 : state.winCount;
    const newLoseCount = profit < 0 ? state.loseCount + 1 : state.loseCount;

    set({
      cash: state.cash + netAmount,
      positions: newPositions,
      transactions: [...state.transactions, transaction],
      totalProfit: newTotalProfit,
      totalLoss: newTotalLoss,
      winCount: newWinCount,
      loseCount: newLoseCount,
    });

    const profitText = profit >= 0 ? `盈利 ¥${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)` : `亏损 ¥${Math.abs(profit).toFixed(2)} (${profitPercent.toFixed(2)}%)`;
    return { success: true, message: `成功卖出 ${stock.name} ${shares} 股，获得 ¥${netAmount.toFixed(2)}，${profitText}` };
  },

  // 更新股票价格
  updateStockPrices: () => {
    const state = get();
    const volatilityMultiplier = state.difficulty === 'custom' && state.customDifficulty
      ? state.customDifficulty.stockVolatility
      : DIFFICULTY_CONFIG[state.difficulty]?.stockVolatilityMultiplier || 1;

    const newStocks = state.stocks.map(stock => {
      // 随机波动
      const change = (Math.random() - 0.5) * 2 * stock.volatility * volatilityMultiplier;
      const newPrice = Math.max(0.01, stock.currentPrice * (1 + change));
      const dayChange = newPrice - stock.basePrice;
      const dayChangePercent = (dayChange / stock.basePrice) * 100;

      // 判断趋势
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (dayChangePercent > 2) trend = 'up';
      else if (dayChangePercent < -2) trend = 'down';

      return {
        ...stock,
        previousPrice: stock.currentPrice,
        currentPrice: Math.round(newPrice * 100) / 100,
        dayHighPrice: Math.max(stock.dayHighPrice, newPrice),
        dayLowPrice: Math.min(stock.dayLowPrice, newPrice),
        dayChange: Math.round(dayChange * 100) / 100,
        dayChangePercent: Math.round(dayChangePercent * 100) / 100,
        trend,
        history: [
          ...stock.history.slice(-99),
          { time: Date.now(), price: newPrice, volume: Math.floor(Math.random() * 1000000) },
        ],
      };
    });

    // 更新持仓的当前价格和盈亏
    const newPositions = state.positions.map(position => {
      const stock = newStocks.find(s => s.id === position.stockId);
      if (stock) {
        return {
          ...position,
          currentPrice: stock.currentPrice,
          profit: (stock.currentPrice - position.averageCost) * position.shares,
          profitPercent: ((stock.currentPrice - position.averageCost) / position.averageCost) * 100,
        };
      }
      return position;
    });

    // 更新市场状态
    const newMarketState = { ...state.marketState };
    newMarketState.indices = updateMarketIndices(newMarketState.indices, newStocks);
    
    const stats = calculateMarketStats(newStocks);
    newMarketState.upCount = stats.upCount;
    newMarketState.downCount = stats.downCount;
    newMarketState.limitUpCount = stats.limitUpCount;
    newMarketState.limitDownCount = stats.limitDownCount;
    newMarketState.totalVolume = stats.totalVolume;
    
    newMarketState.sentiment = updateMarketSentiment(
      newMarketState.sentiment,
      newMarketState.news,
      newStocks
    );

    set({ stocks: newStocks, positions: newPositions, marketState: newMarketState });
  },

  // 更新生存状态
  updateSurvivalStatus: () => {
    const state = get();
    if (state.gameMode !== 'survival') return;

    const decayMultiplier = state.difficulty === 'custom' && state.customDifficulty
      ? state.customDifficulty.survivalDecayRate
      : DIFFICULTY_CONFIG[state.difficulty]?.survivalDecayMultiplier || 1;

    // 每小时衰减
    const hungerDecay = 2 * decayMultiplier;
    const thirstDecay = 3 * decayMultiplier;
    const moodDecay = 1 * decayMultiplier;

    // 健康值受饥饿和口渴影响
    let healthChange = 0;
    if (state.survivalStatus.hunger < 20) healthChange -= 2;
    if (state.survivalStatus.thirst < 20) healthChange -= 3;

    const newStatus: SurvivalStatus = {
      hunger: Math.max(0, Math.min(100, state.survivalStatus.hunger - hungerDecay)),
      thirst: Math.max(0, Math.min(100, state.survivalStatus.thirst - thirstDecay)),
      health: Math.max(0, Math.min(100, state.survivalStatus.health + healthChange)),
      mood: Math.max(0, Math.min(100, state.survivalStatus.mood - moodDecay)),
    };

    set({ survivalStatus: newStatus });
  },

  // 消耗物品
  consumeItem: (itemId: string) => {
    const state = get();
    const inventoryItem = state.inventory.find(i => i.item.id === itemId);

    if (!inventoryItem) {
      return { success: false, message: '物品不存在' };
    }

    // 检查保质期
    if (inventoryItem.item.shelfLife > 0) {
      const daysPassed = state.gameDay - inventoryItem.purchaseDate;
      if (daysPassed > inventoryItem.item.shelfLife) {
        // 物品已过期，移除
        set({
          inventory: state.inventory.filter(i => i.item.id !== itemId),
        });
        return { success: false, message: '物品已过期，已自动丢弃' };
      }
    }

    // 应用效果
    const newStatus = { ...state.survivalStatus };
    const effect = inventoryItem.item.effect;
    
    if (effect.hunger) newStatus.hunger = Math.min(100, newStatus.hunger + effect.hunger);
    if (effect.thirst) newStatus.thirst = Math.min(100, newStatus.thirst + effect.thirst);
    if (effect.health) newStatus.health = Math.min(100, Math.max(0, newStatus.health + effect.health));
    if (effect.mood) newStatus.mood = Math.min(100, Math.max(0, newStatus.mood + effect.mood));

    // 更新库存
    let newInventory: InventoryItem[];
    if (inventoryItem.quantity <= 1) {
      newInventory = state.inventory.filter(i => i.item.id !== itemId);
    } else {
      newInventory = state.inventory.map(i =>
        i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    }

    set({
      survivalStatus: newStatus,
      inventory: newInventory,
    });

    return { success: true, message: `使用了 ${inventoryItem.item.name}` };
  },

  // 购买物品
  buyItem: (itemId: string, quantity: number) => {
    const state = get();
    const item = SHOP_ITEMS.find(i => i.id === itemId);

    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    const priceMultiplier = state.difficulty === 'custom' && state.customDifficulty
      ? state.customDifficulty.foodPriceMultiplier
      : DIFFICULTY_CONFIG[state.difficulty]?.foodPriceMultiplier || 1;

    const totalCost = Math.round(item.price * quantity * priceMultiplier);

    if (state.cash < totalCost) {
      return { success: false, message: '资金不足' };
    }

    // 如果是即时使用的物品（shelfLife为0），直接使用
    if (item.shelfLife === 0) {
      const newStatus = { ...state.survivalStatus };
      const effect = item.effect;
      
      for (let i = 0; i < quantity; i++) {
        if (effect.hunger) newStatus.hunger = Math.min(100, newStatus.hunger + effect.hunger);
        if (effect.thirst) newStatus.thirst = Math.min(100, newStatus.thirst + effect.thirst);
        if (effect.health) newStatus.health = Math.min(100, Math.max(0, newStatus.health + effect.health));
        if (effect.mood) newStatus.mood = Math.min(100, Math.max(0, newStatus.mood + effect.mood));
      }

      set({
        cash: state.cash - totalCost,
        survivalStatus: newStatus,
      });

      return { success: true, message: `购买了 ${quantity} 个 ${item.name} 并立即使用` };
    }

    // 添加到库存
    const existingItem = state.inventory.find(i => i.item.id === itemId);
    let newInventory: InventoryItem[];

    if (existingItem) {
      newInventory = state.inventory.map(i =>
        i.item.id === itemId
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      newInventory = [
        ...state.inventory,
        { item, purchaseDate: state.gameDay, quantity },
      ];
    }

    set({
      cash: state.cash - totalCost,
      inventory: newInventory,
    });

    return { success: true, message: `购买了 ${quantity} 个 ${item.name}` };
  },

  // 工作
  doWork: (jobId: string, hours: number) => {
    const state = get();
    
    const job = JOBS.find(j => j.id === jobId);

    if (!job) {
      return { success: false, message: '工作不存在' };
    }

    // 检查工作时间
    if (!job.workHours.includes(state.gameTime)) {
      return { success: false, message: '当前时间不在工作时间内' };
    }

    // 检查健康值
    if (state.survivalStatus.health < job.requiredHealth) {
      return { success: false, message: '健康值不足，无法工作' };
    }

    const payMultiplier = state.difficulty === 'custom' && state.customDifficulty
      ? state.customDifficulty.workPayMultiplier
      : DIFFICULTY_CONFIG[state.difficulty]?.workPayMultiplier || 1;

    const earnings = Math.round(job.hourlyPay * hours * payMultiplier);
    const efficiency = state.playerIdentity?.workEfficiency || 50;
    const actualEarnings = Math.round(earnings * (efficiency / 100));

    // 更新状态
    const newStatus = { ...state.survivalStatus };
    newStatus.health = Math.max(0, newStatus.health - job.energyCost * hours * 0.5);
    newStatus.mood = Math.max(0, Math.min(100, newStatus.mood + job.moodEffect * hours));
    newStatus.hunger = Math.max(0, newStatus.hunger - 5 * hours);
    newStatus.thirst = Math.max(0, newStatus.thirst - 8 * hours);

    // 推进时间
    let newGameTime = state.gameTime + hours;
    let newGameDay = state.gameDay;
    if (newGameTime >= 24) {
      newGameTime -= 24;
      newGameDay += 1;
    }

    set({
      cash: state.cash + actualEarnings,
      survivalStatus: newStatus,
      gameTime: newGameTime,
      gameDay: newGameDay,
    });

    return { success: true, message: `工作了 ${hours} 小时，获得 ¥${actualEarnings}` };
  },

  // 娱乐
  doEntertainment: (entertainmentId: string) => {
    const state = get();
    
    const entertainment = ENTERTAINMENTS.find(e => e.id === entertainmentId);

    if (!entertainment) {
      return { success: false, message: '娱乐活动不存在' };
    }

    if (state.cash < entertainment.cost) {
      return { success: false, message: '资金不足' };
    }

    // 更新状态
    const newStatus = { ...state.survivalStatus };
    newStatus.mood = Math.min(100, newStatus.mood + entertainment.moodBoost);

    // 推进时间
    let newGameTime = state.gameTime + entertainment.timeCost;
    let newGameDay = state.gameDay;
    if (newGameTime >= 24) {
      newGameTime -= 24;
      newGameDay += 1;
    }

    set({
      cash: state.cash - entertainment.cost,
      survivalStatus: newStatus,
      gameTime: newGameTime,
      gameDay: newGameDay,
    });

    return { success: true, message: `享受了 ${entertainment.name}，心情提升 ${entertainment.moodBoost}` };
  },

  // 保存游戏
  saveGame: (slotId: number) => {
    const state = get();
    
    if (slotId < 1 || slotId > MAX_SAVE_SLOTS) {
      return { success: false, message: '存档槽位无效' };
    }

    if (!state.isPlaying) {
      return { success: false, message: '没有进行中的游戏' };
    }

    const saveData: SaveData = {
      slotId,
      playerName: state.playerName,
      playerIdentity: state.playerIdentity!,
      gameMode: state.gameMode,
      difficulty: state.difficulty,
      customDifficulty: state.customDifficulty || undefined,
      cash: state.cash,
      bankDeposit: state.bankDeposit,
      positions: state.positions,
      transactions: state.transactions,
      survivalStatus: state.survivalStatus,
      inventory: state.inventory,
      gameDay: state.gameDay,
      gameTime: state.gameTime,
      stockMarket: state.stocks,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      playTime: state.playTime,
    };

    // 检查是否已有存档
    const existingSave = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`);
    if (existingSave) {
      const parsed = JSON.parse(existingSave);
      saveData.createdAt = parsed.createdAt;
    }

    localStorage.setItem(`${SAVE_KEY_PREFIX}${slotId}`, JSON.stringify(saveData));
    set({ currentSlotId: slotId });

    return { success: true, message: `游戏已保存到存档槽 ${slotId}` };
  },

  // 加载游戏
  loadGame: (slotId: number) => {
    if (slotId < 1 || slotId > MAX_SAVE_SLOTS) {
      return { success: false, message: '存档槽位无效' };
    }

    const saveDataStr = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`);
    if (!saveDataStr) {
      return { success: false, message: '存档不存在' };
    }

    try {
      const saveData: SaveData = JSON.parse(saveDataStr);
      
      set({
        isPlaying: true,
        isPaused: true,
        gameMode: saveData.gameMode,
        difficulty: saveData.difficulty,
        customDifficulty: saveData.customDifficulty || null,
        playerName: saveData.playerName,
        playerIdentity: saveData.playerIdentity,
        cash: saveData.cash,
        bankDeposit: saveData.bankDeposit,
        stocks: saveData.stockMarket,
        positions: saveData.positions,
        transactions: saveData.transactions,
        survivalStatus: saveData.survivalStatus,
        inventory: saveData.inventory,
        gameDay: saveData.gameDay,
        gameTime: saveData.gameTime,
        gameSpeed: 1,
        totalProfit: 0,
        totalLoss: 0,
        winCount: 0,
        loseCount: 0,
        playTime: saveData.playTime,
        currentEvent: null,
        currentSlotId: slotId,
      });

      return { success: true, message: `已加载存档槽 ${slotId} 的游戏` };
    } catch {
      return { success: false, message: '存档数据损坏' };
    }
  },

  // 删除存档
  deleteSave: (slotId: number) => {
    if (slotId < 1 || slotId > MAX_SAVE_SLOTS) {
      return { success: false, message: '存档槽位无效' };
    }

    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotId}`);
    return { success: true, message: `已删除存档槽 ${slotId}` };
  },

  // 获取存档列表
  getSaveList: () => {
    const saves: SaveData[] = [];
    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
      const saveDataStr = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`);
      if (saveDataStr) {
        try {
          saves.push(JSON.parse(saveDataStr));
        } catch {
          // 忽略损坏的存档
        }
      }
    }
    return saves;
  },

  // 检查存档是否存在
  hasSave: (slotId: number) => {
    return localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`) !== null;
  },

  // 触发事件
  triggerEvent: (event: GameEvent) => {
    const state = get();
    
    // 应用事件效果
    let newCash = state.cash;
    let newStatus = { ...state.survivalStatus };
    let newStocks = [...state.stocks];

    if (event.effects.cash) {
      newCash += event.effects.cash;
    }

    if (event.effects.hunger) {
      newStatus.hunger = Math.min(100, Math.max(0, newStatus.hunger + event.effects.hunger));
    }
    if (event.effects.thirst) {
      newStatus.thirst = Math.min(100, Math.max(0, newStatus.thirst + event.effects.thirst));
    }
    if (event.effects.health) {
      newStatus.health = Math.min(100, Math.max(0, newStatus.health + event.effects.health));
    }
    if (event.effects.mood) {
      newStatus.mood = Math.min(100, Math.max(0, newStatus.mood + event.effects.mood));
    }

    if (event.effects.stockEffect) {
      newStocks = newStocks.map(stock => {
        if (event.effects.stockEffect!.industry && stock.industry !== event.effects.stockEffect!.industry) {
          return stock;
        }
        const effect = event.effects.stockEffect!.effect / 100;
        const newPrice = Math.max(0.01, stock.currentPrice * (1 + effect));
        return {
          ...stock,
          currentPrice: Math.round(newPrice * 100) / 100,
          dayChange: Math.round((newPrice - stock.basePrice) * 100) / 100,
          dayChangePercent: Math.round(((newPrice - stock.basePrice) / stock.basePrice) * 100 * 100) / 100,
        };
      });
    }

    set({
      cash: newCash,
      survivalStatus: newStatus,
      stocks: newStocks,
      currentEvent: event,
    });
  },

  // 关闭事件
  dismissEvent: () => set({ currentEvent: null }),

  // 获取股票
  getStockById: (stockId: string) => {
    return get().stocks.find(s => s.id === stockId);
  },

  // 获取持仓
  getPositionByStockId: (stockId: string) => {
    return get().positions.find(p => p.stockId === stockId);
  },

  // 获取总资产
  getTotalAssets: () => {
    const state = get();
    let total = state.cash + state.bankDeposit;
    
    state.positions.forEach(position => {
      total += position.currentPrice * position.shares;
    });

    return total;
  },
}));
