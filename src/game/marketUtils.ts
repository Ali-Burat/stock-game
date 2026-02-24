import { v4 as uuidv4 } from 'uuid';
import { News, NewsTemplate, MarketState, MarketIndex, Stock } from './types';
import { 
  ALL_NEWS_TEMPLATES, 
  NEWS_GENERATION_CONFIG,
  NewsCategory,
  NewsImportance,
} from './newsData';
import { ALL_STOCKS, INITIAL_MARKET_INDICES, LIMIT_UP_PERCENT, LIMIT_DOWN_PERCENT } from './marketData';

// 生成随机数
function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// 生成随机整数
function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

// 从模板生成新闻
export function generateNewsFromTemplate(
  template: NewsTemplate, 
  stocks: Stock[],
  gameDay: number
): News {
  let title = template.titleTemplate;
  let content = template.contentTemplate;
  
  const replacements: Record<string, string | number> = {
    '{percent}': randomInt(1, 5) * 0.25,
    '{amount}': randomInt(100, 5000),
    '{date}': `${gameDay}日`,
    '{quarter}': `${Math.floor(gameDay / 90) + 1}季`,
    '{month}': `${Math.floor(gameDay / 30) + 1}月`,
    '{year}': '2024',
    '{value}': randomInt(50, 60),
    '{change}': (Math.random() * 2).toFixed(1),
    '{months}': randomInt(3, 12),
    '{days}': randomInt(3, 10),
    '{count}': randomInt(10, 50),
    '{price}': randomInt(80, 150),
    '{rate}': (Math.random() * 3 + 1).toFixed(2),
    '{operation}': randomInt(100, 1000),
    '{due}': randomInt(50, 500),
    '{total}': randomInt(10, 100),
    '{unit}': 10,
    '{shares}': randomInt(10, 500),
    '{client}': '某大型企业',
    '{product}': '新型',
    '{executive}': '某高管',
    '{issue}': '财务数据',
    '{industry}': '相关',
    '{export_percent}': randomInt(5, 20),
    '{import_percent}': randomInt(5, 20),
  };
  
  Object.entries(replacements).forEach(([key, value]) => {
    title = title.replace(new RegExp(key, 'g'), String(value));
    content = content.replace(new RegExp(key, 'g'), String(value));
  });
  
  const effect = random(template.effectRange.min, template.effectRange.max);
  const duration = randomInt(template.durationRange.min, template.durationRange.max);
  
  const effects: News['effects'] = {};
  
  if (template.affectedIndustries && template.affectedIndustries.length > 0) {
    effects.industries = template.affectedIndustries.map(industry => ({
      industry,
      effect: effect * (Math.random() > 0.5 ? 1 : -1),
      duration,
    }));
  }
  
  if (template.marketEffectRange) {
    effects.marketEffect = random(template.marketEffectRange.min, template.marketEffectRange.max);
  }
  
  if (template.sentimentEffectRange) {
    effects.sentimentEffect = random(template.sentimentEffectRange.min, template.sentimentEffectRange.max);
  }
  
  // 如果是公司新闻，随机选择一只股票
  if (template.category === 'company' && stocks.length > 0) {
    const randomStock = stocks[randomInt(0, stocks.length - 1)];
    title = title.replace('{company}', randomStock.name);
    content = content.replace('{company}', randomStock.name);
    effects.stocks = [{
      stockId: randomStock.id,
      effect,
      duration,
    }];
  }
  
  const expiryConfig = NEWS_GENERATION_CONFIG.expiryRange[template.importance];
  const expiryHours = randomInt(expiryConfig.min, expiryConfig.max);
  
  return {
    id: uuidv4(),
    title,
    content,
    summary: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
    category: template.category,
    importance: template.importance,
    type: template.type,
    publishTime: Date.now(),
    expireTime: Date.now() + expiryHours * 3600000 / 1000,
    effects,
    isDigested: false,
    isBreaking: template.isBreaking || false,
    source: template.source,
  };
}

// 根据权重随机选择新闻类型
function selectNewsCategory(): NewsCategory {
  const weights = NEWS_GENERATION_CONFIG.categoryWeights;
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let randomValue = Math.random() * totalWeight;
  
  for (const [category, weight] of Object.entries(weights)) {
    randomValue -= weight;
    if (randomValue <= 0) {
      return category as NewsCategory;
    }
  }
  return 'company';
}

// 根据权重随机选择新闻重要性
function selectNewsImportance(): NewsImportance {
  const weights = NEWS_GENERATION_CONFIG.importanceWeights;
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let randomValue = Math.random() * totalWeight;
  
  for (const [importance, weight] of Object.entries(weights)) {
    randomValue -= weight;
    if (randomValue <= 0) {
      return importance as NewsImportance;
    }
  }
  return 'normal';
}

// 生成随机新闻
export function generateRandomNews(stocks: Stock[], gameDay: number): News | null {
  if (Math.random() > NEWS_GENERATION_CONFIG.hourlyProbability) {
    return null;
  }
  
  const category = selectNewsCategory();
  const importance = selectNewsImportance();
  
  let candidates = ALL_NEWS_TEMPLATES.filter(
    t => t.category === category && t.importance === importance
  );
  
  if (candidates.length === 0) {
    candidates = ALL_NEWS_TEMPLATES.filter(t => t.category === category);
    if (candidates.length === 0) return null;
  }
  
  const template = candidates[randomInt(0, candidates.length - 1)];
  return generateNewsFromTemplate(template, stocks, gameDay);
}

// 更新股票价格（考虑涨跌停）
function updateStockPrice(stock: Stock, newPrice: number): Stock {
  const changePercent = ((newPrice - stock.dayOpenPrice) / stock.dayOpenPrice) * 100;
  
  let limitedPrice = newPrice;
  let isLimitUp = false;
  let isLimitDown = false;
  
  if (changePercent >= LIMIT_UP_PERCENT) {
    limitedPrice = stock.dayOpenPrice * (1 + LIMIT_UP_PERCENT / 100);
    isLimitUp = true;
  } else if (changePercent <= -LIMIT_DOWN_PERCENT) {
    limitedPrice = stock.dayOpenPrice * (1 - LIMIT_DOWN_PERCENT / 100);
    isLimitDown = true;
  }
  
  limitedPrice = Math.round(limitedPrice * 100) / 100;
  
  const dayChange = limitedPrice - stock.basePrice;
  const dayChangePercent = (dayChange / stock.basePrice) * 100;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (dayChangePercent > 2) trend = 'up';
  else if (dayChangePercent < -2) trend = 'down';
  
  return {
    ...stock,
    currentPrice: limitedPrice,
    previousPrice: stock.currentPrice,
    dayHighPrice: Math.max(stock.dayHighPrice, limitedPrice),
    dayLowPrice: Math.min(stock.dayLowPrice, limitedPrice),
    dayChange: Math.round(dayChange * 100) / 100,
    dayChangePercent: Math.round(dayChangePercent * 100) / 100,
    trend,
    isLimitUp,
    isLimitDown,
    history: [
      ...stock.history.slice(-99),
      { time: Date.now(), price: limitedPrice, volume: Math.floor(Math.random() * 1000000) },
    ],
  };
}

// 应用新闻效果到股票
export function applyNewsEffectToStocks(
  news: News, 
  stocks: Stock[],
  volatilityMultiplier: number
): Stock[] {
  if (news.isDigested) return stocks;
  
  let newStocks = [...stocks];
  
  if (news.effects.industries) {
    news.effects.industries.forEach(effect => {
      newStocks = newStocks.map(stock => {
        if (stock.industry === effect.industry) {
          const changePercent = effect.effect * volatilityMultiplier * 0.1;
          const newPrice = stock.currentPrice * (1 + changePercent / 100);
          return updateStockPrice(stock, newPrice);
        }
        return stock;
      });
    });
  }
  
  if (news.effects.stocks) {
    news.effects.stocks.forEach(effect => {
      newStocks = newStocks.map(stock => {
        if (stock.id === effect.stockId) {
          const changePercent = effect.effect * volatilityMultiplier * 0.1;
          const newPrice = stock.currentPrice * (1 + changePercent / 100);
          return updateStockPrice(stock, newPrice);
        }
        return stock;
      });
    });
  }
  
  return newStocks;
}

// 更新大盘指数
export function updateMarketIndices(indices: MarketIndex[], stocks: Stock[]): MarketIndex[] {
  return indices.map(index => {
    const componentStocks = stocks.filter(s => index.components.includes(s.id));
    if (componentStocks.length === 0) return index;
    
    const avgChange = componentStocks.reduce((sum, s) => sum + s.dayChangePercent, 0) / componentStocks.length;
    const newValue = index.currentValue * (1 + avgChange / 100);
    
    const dayChange = newValue - index.baseValue;
    const dayChangePercent = (dayChange / index.baseValue) * 100;
    
    return {
      ...index,
      currentValue: Math.round(newValue * 100) / 100,
      previousValue: index.currentValue,
      dayChange: Math.round(dayChange * 100) / 100,
      dayChangePercent: Math.round(dayChangePercent * 100) / 100,
      dayHigh: Math.max(index.dayHigh, newValue),
      dayLow: Math.min(index.dayLow, newValue),
      history: [...index.history.slice(-99), { time: Date.now(), value: newValue }],
    };
  });
}

// 计算市场统计
export function calculateMarketStats(stocks: Stock[]) {
  let upCount = 0;
  let downCount = 0;
  let limitUpCount = 0;
  let limitDownCount = 0;
  let totalVolume = 0;
  
  stocks.forEach(stock => {
    if (stock.dayChangePercent > 0) upCount++;
    else if (stock.dayChangePercent < 0) downCount++;
    if (stock.isLimitUp) limitUpCount++;
    if (stock.isLimitDown) limitDownCount++;
    totalVolume += Math.floor(Math.random() * 10000000);
  });
  
  return { upCount, downCount, limitUpCount, limitDownCount, totalVolume };
}

// 创建初始市场状态
export function createInitialMarketState(): MarketState {
  return {
    indices: INITIAL_MARKET_INDICES.map(index => ({
      ...index,
      history: [{ time: Date.now(), value: index.currentValue }],
    })),
    sentiment: 0,
    totalVolume: 0,
    upCount: 0,
    downCount: 0,
    limitUpCount: 0,
    limitDownCount: 0,
    news: [],
    newsHistory: [],
  };
}

// 创建初始股票数据
export function createInitialStocks(): Stock[] {
  return ALL_STOCKS.map(stock => ({
    ...stock,
    history: [{ time: Date.now(), price: stock.currentPrice, volume: 0 }],
  }));
}

// 更新市场情绪
export function updateMarketSentiment(
  currentSentiment: number,
  news: News[],
  stocks: Stock[]
): number {
  let sentimentChange = 0;
  
  news.forEach(n => {
    if (!n.isDigested && n.effects.sentimentEffect) {
      sentimentChange += n.effects.sentimentEffect * 0.1;
    }
  });
  
  const upCount = stocks.filter(s => s.dayChangePercent > 0).length;
  const downCount = stocks.filter(s => s.dayChangePercent < 0).length;
  sentimentChange += (upCount - downCount) * 0.5;
  sentimentChange -= currentSentiment * 0.01;
  
  return Math.max(-100, Math.min(100, currentSentiment + sentimentChange));
}
