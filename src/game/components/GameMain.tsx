import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardHeader,
  Text,
  Caption1,
  Badge,
  makeStyles,
  tokens,
  shorthands,
  Tab,
  TabList,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  ProgressBar,
  Avatar,
  Divider,
} from '@fluentui/react-components';
import {
  DataUsageRegular,
  FoodRegular,
  BuildingRegular,
  GamesRegular,
  SaveRegular,
  PauseRegular,
  PlayRegular,
  ClockRegular,
  MoneyRegular,
  NewsRegular,
  NavigationRegular,
} from '@fluentui/react-icons';
import { useGameStore } from '../store';
import { StockTrading } from './StockTrading';
import { ShopPanel } from './ShopPanel';
import { WorkPanel } from './WorkPanel';
import { EntertainmentPanel } from './EntertainmentPanel';
import { SaveLoadPanel } from './SaveLoadPanel';
import { EventModal } from './EventModal';
import { NewsPanel } from './NewsPanel';
import { MarketOverview } from './MarketOverview';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: tokens.shadow4,
    flexWrap: 'wrap',
    gap: '8px',
    '@media (min-width: 768px)': {
      padding: '12px 24px',
    },
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '@media (min-width: 768px)': {
      gap: '16px',
    },
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '@media (min-width: 768px)': {
      gap: '8px',
    },
  },
  playerInfo: {
    display: 'none',
    alignItems: 'center',
    gap: '8px',
    '@media (min-width: 768px)': {
      display: 'flex',
      gap: '12px',
    },
  },
  playerAvatar: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  playerDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    overflowX: 'auto',
    flexWrap: 'wrap',
    '@media (min-width: 768px)': {
      gap: '24px',
      padding: '12px 24px',
    },
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    '@media (min-width: 768px)': {
      gap: '8px',
    },
  },
  statIcon: {
    fontSize: '16px',
    '@media (min-width: 768px)': {
      fontSize: '20px',
    },
  },
  statValue: {
    fontWeight: '600',
    fontSize: '14px',
    '@media (min-width: 768px)': {
      fontSize: 'inherit',
    },
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'visible',
    '@media (min-width: 1024px)': {
      flexDirection: 'row',
      overflow: 'hidden',
    },
  },
  sidebar: {
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'visible',
    '@media (min-width: 1024px)': {
      width: '320px',
      borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
      borderBottom: 'none',
      padding: '16px',
      overflowY: 'auto',
    },
  },
  content: {
    flex: 1,
    padding: '12px',
    overflowY: 'visible',
    '@media (min-width: 768px)': {
      padding: '24px',
      overflowY: 'auto',
    },
  },
  survivalPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    '@media (min-width: 768px)': {
      gap: '12px',
    },
  },
  survivalItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  survivalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabContent: {
    minHeight: '400px',
    '@media (min-width: 768px)': {
      height: '100%',
    },
  },
  timeControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '@media (min-width: 768px)': {
      gap: '8px',
    },
  },
  speedButton: {
    minWidth: '32px',
    padding: '0 8px',
    '@media (min-width: 768px)': {
      minWidth: '40px',
    },
  },
  inventoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  inventoryItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('8px'),
  },
  inventoryItemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  positionCard: {
    padding: '8px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('8px'),
    marginBottom: '8px',
    '@media (min-width: 768px)': {
      padding: '12px',
    },
  },
  positionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  indexMini: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('8px'),
    '@media (min-width: 768px)': {
      gap: '8px',
      padding: '8px 12px',
    },
  },
  mobileMenuButton: {
    display: 'flex',
    '@media (min-width: 1024px)': {
      display: 'none',
    },
  },
  sidebarToggle: {
    display: 'none',
    '@media (max-width: 1023px)': {
      display: 'block',
    },
  },
});

export function GameMain() {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<string>('stocks');
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [showLoadPanel, setShowLoadPanel] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const {
    isPlaying,
    isPaused,
    gameMode,
    difficulty,
    playerName,
    playerIdentity,
    cash,
    gameDay,
    gameTime,
    gameSpeed,
    survivalStatus,
    positions,
    inventory,
    currentEvent,
    marketState,
    pauseGame,
    resumeGame,
    setGameSpeed,
    tickGame,
    dismissEvent,
    getTotalAssets,
    consumeItem,
  } = useGameStore();

  // 游戏时间推进
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const interval = setInterval(() => {
      tickGame();
    }, 1000 / gameSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, gameSpeed, tickGame]);

  // 格式化时间
  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // 获取生存状态进度条外观
  const getStatusAppearance = (value: number): 'success' | 'warning' | 'error' => {
    if (value >= 70) return 'success';
    if (value >= 40) return 'warning';
    return 'error';
  };

  // 计算总资产
  const totalAssets = getTotalAssets();

  // 计算持仓市值
  const positionValue = positions.reduce((sum, p) => sum + p.currentPrice * p.shares, 0);

  // 获取大盘指数颜色
  const getIndexColor = (change: number) => {
    if (change > 0) return tokens.colorPaletteRedForeground1;
    if (change < 0) return tokens.colorPaletteGreenForeground1;
    return tokens.colorNeutralForeground1;
  };

  return (
    <div className={styles.container}>
      {/* 顶部栏 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            size="small"
            icon={<NavigationRegular />}
            className={styles.mobileMenuButton}
            onClick={() => setShowSidebar(!showSidebar)}
          />
          <div className={styles.logo}>
            <Text size={400} weight="bold">📈 炒股人生</Text>
          </div>
          <Divider vertical />
          <div className={styles.playerInfo}>
            <Avatar name={playerName} className={styles.playerAvatar} />
            <div className={styles.playerDetails}>
              <Text weight="semibold">{playerName}</Text>
              <Caption1>{playerIdentity?.name} · {difficulty === 'cheat' ? '作弊模式' : difficulty === 'custom' ? '自定义' : difficulty}</Caption1>
            </div>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.timeControl}>
            <Button
              size="small"
              icon={isPaused ? <PlayRegular /> : <PauseRegular />}
              onClick={isPaused ? resumeGame : pauseGame}
            />
            <Text>速度:</Text>
            {[1, 2, 5, 10].map(speed => (
              <Button
                key={speed}
                size="small"
                appearance={gameSpeed === speed ? 'primary' : 'outline'}
                className={styles.speedButton}
                onClick={() => setGameSpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </div>
          <Button
            size="small"
            icon={<SaveRegular />}
            onClick={() => setShowSavePanel(true)}
          >
            存档
          </Button>
          <Button
            size="small"
            icon={<ClockRegular />}
            onClick={() => setShowLoadPanel(true)}
          >
            读档
          </Button>
        </div>
      </div>

      {/* 状态栏 */}
      <div className={styles.statsBar}>
        {/* 大盘指数迷你显示 */}
        {marketState.indices.slice(0, 2).map(index => (
          <div key={index.id} className={styles.indexMini}>
            <Caption1>{index.name}</Caption1>
            <Text weight="semibold" style={{ color: getIndexColor(index.dayChangePercent), fontSize: '14px' }}>
              {index.currentValue.toFixed(2)}
            </Text>
            <Caption1 style={{ color: getIndexColor(index.dayChangePercent) }}>
              {index.dayChangePercent >= 0 ? '+' : ''}{index.dayChangePercent.toFixed(2)}%
            </Caption1>
          </div>
        ))}
        
        <Divider vertical />
        
        <div className={styles.statItem}>
          <MoneyRegular className={styles.statIcon} />
          <Text>现金:</Text>
          <Text className={styles.statValue} style={{ color: tokens.colorBrandForeground1 }}>
            ¥{cash.toLocaleString()}
          </Text>
        </div>
        
        <div className={styles.statItem}>
          <DataUsageRegular className={styles.statIcon} />
          <Text>持仓:</Text>
          <Text className={styles.statValue} style={{ color: tokens.colorBrandForeground1 }}>
            ¥{positionValue.toLocaleString()}
          </Text>
        </div>
        
        <div className={styles.statItem}>
          <MoneyRegular className={styles.statIcon} />
          <Text>总资产:</Text>
          <Text className={styles.statValue} style={{ color: tokens.colorPaletteGreenForeground1 }}>
            ¥{totalAssets.toLocaleString()}
          </Text>
        </div>
        
        <div className={styles.statItem}>
          <ClockRegular className={styles.statIcon} />
          <Text>第 {gameDay} 天</Text>
          <Text className={styles.statValue}>{formatTime(gameTime)}</Text>
        </div>
        {isPaused && (
          <Badge appearance="filled" color="warning">
            已暂停
          </Badge>
        )}
        {marketState.news.length > 0 && (
          <Badge appearance="filled" color="informative">
            <NewsRegular style={{ marginRight: '4px' }} />
            {marketState.news.length} 条新闻
          </Badge>
        )}
      </div>

      {/* 主内容 */}
      <div className={styles.mainContent}>
        {/* 左侧边栏 */}
        <div className={styles.sidebar} style={{ 
          display: window.innerWidth < 1024 && !showSidebar ? 'none' : 'flex'
        }}>
          {/* 市场概览 */}
          <MarketOverview marketState={marketState} />

          {/* 生存状态（仅生存模式） */}
          {gameMode === 'survival' && (
            <Card>
              <CardHeader
                header={<Text weight="semibold">生存状态</Text>}
              />
              <div className={styles.survivalPanel}>
                <div className={styles.survivalItem}>
                  <div className={styles.survivalHeader}>
                    <Text>🍖 饥饿</Text>
                    <Text weight="semibold">{Math.round(survivalStatus.hunger)}%</Text>
                  </div>
                  <ProgressBar
                    value={survivalStatus.hunger / 100}
                    color={getStatusAppearance(survivalStatus.hunger)}
                  />
                </div>
                <div className={styles.survivalItem}>
                  <div className={styles.survivalHeader}>
                    <Text>💧 口渴</Text>
                    <Text weight="semibold">{Math.round(survivalStatus.thirst)}%</Text>
                  </div>
                  <ProgressBar
                    value={survivalStatus.thirst / 100}
                    color={getStatusAppearance(survivalStatus.thirst)}
                  />
                </div>
                <div className={styles.survivalItem}>
                  <div className={styles.survivalHeader}>
                    <Text>❤️ 健康</Text>
                    <Text weight="semibold">{Math.round(survivalStatus.health)}%</Text>
                  </div>
                  <ProgressBar
                    value={survivalStatus.health / 100}
                    color={getStatusAppearance(survivalStatus.health)}
                  />
                </div>
                <div className={styles.survivalItem}>
                  <div className={styles.survivalHeader}>
                    <Text>😊 心情</Text>
                    <Text weight="semibold">{Math.round(survivalStatus.mood)}%</Text>
                  </div>
                  <ProgressBar
                    value={survivalStatus.mood / 100}
                    color={getStatusAppearance(survivalStatus.mood)}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* 持仓概览 */}
          <Card>
            <CardHeader
              header={<Text weight="semibold">持仓概览</Text>}
            />
            <div>
              {positions.length === 0 ? (
                <Text style={{ color: tokens.colorNeutralForeground2 }}>
                  暂无持仓
                </Text>
              ) : (
                positions.map(position => (
                  <div key={position.stockId} className={styles.positionCard}>
                    <div className={styles.positionRow}>
                      <Text weight="semibold">{position.stockName}</Text>
                      <Badge
                        appearance="filled"
                        color={position.profit >= 0 ? 'success' : 'danger'}
                      >
                        {position.profit >= 0 ? '+' : ''}{position.profitPercent.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className={styles.positionRow}>
                      <Caption1>{position.shares}股 · 成本 ¥{position.averageCost.toFixed(2)}</Caption1>
                      <Caption1 style={{ color: position.profit >= 0 ? tokens.colorPaletteGreenForeground1 : tokens.colorPaletteRedForeground1 }}>
                        {position.profit >= 0 ? '+' : ''}¥{position.profit.toFixed(2)}
                      </Caption1>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* 背包（仅生存模式） */}
          {gameMode === 'survival' && (
            <Card>
              <CardHeader
                header={<Text weight="semibold">背包</Text>}
              />
              <div>
                {inventory.length === 0 ? (
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    背包为空
                  </Text>
                ) : (
                  <div className={styles.inventoryList}>
                    {inventory.map(item => (
                      <div key={item.item.id} className={styles.inventoryItem}>
                        <div className={styles.inventoryItemInfo}>
                          <span>{item.item.icon}</span>
                          <div>
                            <Text>{item.item.name}</Text>
                            <Caption1> x{item.quantity}</Caption1>
                          </div>
                        </div>
                        <Button
                          size="small"
                          onClick={() => {
                            const result = consumeItem(item.item.id);
                            if (!result.success) {
                              alert(result.message);
                            }
                          }}
                        >
                          使用
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* 主内容区 */}
        <div className={styles.content}>
          <TabList
            selectedValue={selectedTab}
            onTabSelect={(_, data) => setSelectedTab(data.value as string)}
          >
            <Tab value="stocks" icon={<DataUsageRegular />}>
              股票交易
            </Tab>
            <Tab value="news" icon={<NewsRegular />}>
              财经新闻
              {marketState.news.filter(n => !n.isDigested).length > 0 && (
                <Badge appearance="filled" color="danger" size="small" style={{ marginLeft: '8px' }}>
                  {marketState.news.filter(n => !n.isDigested).length}
                </Badge>
              )}
            </Tab>
            {gameMode === 'survival' && (
              <>
                <Tab value="shop" icon={<FoodRegular />}>
                  商店
                </Tab>
                <Tab value="work" icon={<BuildingRegular />}>
                  打工
                </Tab>
                <Tab value="entertainment" icon={<GamesRegular />}>
                  娱乐
                </Tab>
              </>
            )}
          </TabList>

          <div className={styles.tabContent}>
            {selectedTab === 'stocks' && <StockTrading />}
            {selectedTab === 'news' && <NewsPanel news={marketState.news} />}
            {selectedTab === 'shop' && gameMode === 'survival' && <ShopPanel />}
            {selectedTab === 'work' && gameMode === 'survival' && <WorkPanel />}
            {selectedTab === 'entertainment' && gameMode === 'survival' && <EntertainmentPanel />}
          </div>
        </div>
      </div>

      {/* 存档面板 */}
      <Dialog open={showSavePanel} onOpenChange={(_, data) => setShowSavePanel(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>保存游戏</DialogTitle>
            <DialogContent>
              <SaveLoadPanel mode="save" onClose={() => setShowSavePanel(false)} />
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* 读档面板 */}
      <Dialog open={showLoadPanel} onOpenChange={(_, data) => setShowLoadPanel(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>读取存档</DialogTitle>
            <DialogContent>
              <SaveLoadPanel mode="load" onClose={() => setShowLoadPanel(false)} />
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* 事件弹窗 */}
      {currentEvent && (
        <EventModal event={currentEvent} onClose={dismissEvent} />
      )}
    </div>
  );
}
