'use client';

import { useState } from 'react';
import {
  CardHeader,
  Text,
  Title3,
  Body1,
  Body2,
  Caption1,
  Badge,
  Button,
  makeStyles,
  tokens,
  shorthands,
  MessageBar,
  MessageBarBody,
  Tab,
  TabList,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  ScrollArea,
  Divider,
} from '@fluentui/react-components';
import {
  NewsRegular,
  AlertRegular,
  ClockRegular,
  ChevronRightRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { News, NewsCategory, NewsImportance } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  newsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  newsCard: {
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('8px'),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: tokens.colorBrandStroke1,
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  breakingNews: {
    borderLeft: `4px solid ${tokens.colorPaletteRedBorder2}`,
    backgroundColor: tokens.colorPaletteRedBackground2,
  },
  newsHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '8px',
  },
  newsTitle: {
    flex: 1,
    fontWeight: '600',
  },
  newsMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  importanceBadge: {
    fontSize: '10px',
  },
  categoryBadge: {
    fontSize: '10px',
  },
  effectSection: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('8px'),
  },
  effectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    color: tokens.colorNeutralForeground2,
  },
  dialogContent: {
    minWidth: '500px',
    maxWidth: '600px',
  },
  detailHeader: {
    marginBottom: '16px',
  },
  detailMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },
  detailContent: {
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  effectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '8px',
  },
  effectCard: {
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('6px'),
  },
});

interface NewsPanelProps {
  news: News[];
  onNewsClick?: (news: News) => void;
}

const CATEGORY_NAMES: Record<NewsCategory, string> = {
  macro_economy: '宏观经济',
  industry: '行业动态',
  company: '公司新闻',
  policy: '政策法规',
  international: '国际形势',
  market_sentiment: '市场情绪',
  financial: '金融动态',
};

const IMPORTANCE_COLORS: Record<NewsImportance, 'informative' | 'important' | 'severe' | 'subtle'> = {
  minor: 'subtle',
  normal: 'informative',
  major: 'important',
  critical: 'severe',
};

const IMPORTANCE_NAMES: Record<NewsImportance, string> = {
  minor: '一般',
  normal: '普通',
  major: '重要',
  critical: '重大',
};

export function NewsPanel({ news, onNewsClick }: NewsPanelProps) {
  const styles = useStyles();
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [filterCategory, setFilterCategory] = useState<NewsCategory | 'all'>('all');

  const filteredNews = filterCategory === 'all' 
    ? news 
    : news.filter(n => n.category === filterCategory);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleNewsClick = (item: News) => {
    setSelectedNews(item);
    onNewsClick?.(item);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title3>
          <NewsRegular style={{ marginRight: '8px' }} />
          财经新闻
        </Title3>
        <Caption1>{news.length} 条新闻</Caption1>
      </div>

      {/* 分类筛选 */}
      <TabList
        selectedValue={filterCategory}
        onTabSelect={(_, data) => setFilterCategory(data.value as NewsCategory | 'all')}
      >
        <Tab value="all">全部</Tab>
        <Tab value="macro_economy">宏观</Tab>
        <Tab value="industry">行业</Tab>
        <Tab value="company">公司</Tab>
        <Tab value="policy">政策</Tab>
        <Tab value="international">国际</Tab>
      </TabList>

      {/* 新闻列表 */}
      {filteredNews.length === 0 ? (
        <div className={styles.emptyState}>
          <NewsRegular style={{ fontSize: '48px', marginBottom: '16px' }} />
          <Text>暂无新闻</Text>
          <Caption1>新闻将在游戏过程中自动生成</Caption1>
        </div>
      ) : (
        <div className={styles.newsList}>
          {filteredNews.map(item => (
            <div
              key={item.id}
              className={`${styles.newsCard} ${item.isBreaking ? styles.breakingNews : ''}`}
              onClick={() => handleNewsClick(item)}
            >
              <div className={styles.newsHeader}>
                {item.isBreaking && (
                  <Badge appearance="filled" color="danger" size="small">
                    突发
                  </Badge>
                )}
                <Text className={styles.newsTitle}>{item.title}</Text>
              </div>
              
              <Caption1>{item.summary}</Caption1>
              
              <div className={styles.newsMeta}>
                <Badge 
                  appearance="tint" 
                  color={IMPORTANCE_COLORS[item.importance]}
                  size="small"
                >
                  {IMPORTANCE_NAMES[item.importance]}
                </Badge>
                <Badge appearance="outline" size="small">
                  {CATEGORY_NAMES[item.category]}
                </Badge>
                <Caption1>
                  <ClockRegular style={{ marginRight: '4px' }} />
                  {formatTime(item.publishTime)}
                </Caption1>
                <Caption1>{item.source}</Caption1>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新闻详情弹窗 */}
      <Dialog open={!!selectedNews} onOpenChange={(_, data) => !data.open && setSelectedNews(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<DismissRegular />}
                  onClick={() => setSelectedNews(null)}
                />
              }
            >
              {selectedNews?.title}
            </DialogTitle>
            <DialogContent className={styles.dialogContent}>
              {selectedNews && (
                <>
                  <div className={styles.detailMeta}>
                    {selectedNews.isBreaking && (
                      <Badge appearance="filled" color="danger">突发新闻</Badge>
                    )}
                    <Badge 
                      appearance="tint" 
                      color={IMPORTANCE_COLORS[selectedNews.importance]}
                    >
                      {IMPORTANCE_NAMES[selectedNews.importance]}
                    </Badge>
                    <Badge appearance="outline">
                      {CATEGORY_NAMES[selectedNews.category]}
                    </Badge>
                    <Caption1>{selectedNews.source}</Caption1>
                  </div>

                  <div className={styles.detailContent}>
                    <Text>{selectedNews.content}</Text>
                  </div>

                  {/* 新闻影响 */}
                  {(selectedNews.effects.industries || selectedNews.effects.stocks || selectedNews.effects.marketEffect) && (
                    <div className={styles.effectSection}>
                      <Text weight="semibold" style={{ marginBottom: '8px', display: 'block' }}>
                        📊 市场影响预测
                      </Text>
                      
                      <div className={styles.effectGrid}>
                        {selectedNews.effects.industries?.map((effect, idx) => (
                          <div key={idx} className={styles.effectCard}>
                            <Caption1>{CATEGORY_NAMES[effect.industry as NewsCategory] || effect.industry}</Caption1>
                            <Text 
                              weight="semibold"
                              style={{ 
                                color: effect.effect > 0 ? tokens.colorPaletteGreenForeground1 : tokens.colorPaletteRedForeground1 
                              }}
                            >
                              {effect.effect > 0 ? '+' : ''}{effect.effect.toFixed(1)}%
                            </Text>
                          </div>
                        ))}
                        
                        {selectedNews.effects.marketEffect && (
                          <div className={styles.effectCard}>
                            <Caption1>大盘影响</Caption1>
                            <Text 
                              weight="semibold"
                              style={{ 
                                color: selectedNews.effects.marketEffect > 0 
                                  ? tokens.colorPaletteGreenForeground1 
                                  : tokens.colorPaletteRedForeground1 
                              }}
                            >
                              {selectedNews.effects.marketEffect > 0 ? '+' : ''}
                              {selectedNews.effects.marketEffect.toFixed(1)}%
                            </Text>
                          </div>
                        )}
                        
                        {selectedNews.effects.sentimentEffect && (
                          <div className={styles.effectCard}>
                            <Caption1>市场情绪</Caption1>
                            <Text 
                              weight="semibold"
                              style={{ 
                                color: selectedNews.effects.sentimentEffect > 0 
                                  ? tokens.colorPaletteGreenForeground1 
                                  : tokens.colorPaletteRedForeground1 
                              }}
                            >
                              {selectedNews.effects.sentimentEffect > 0 ? '+' : ''}
                              {selectedNews.effects.sentimentEffect.toFixed(0)}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Divider style={{ margin: '16px 0' }} />

                  <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
                    💡 提示：新闻可能对相关股票产生影响，请谨慎分析后做出投资决策。
                  </Caption1>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setSelectedNews(null)}>
                我知道了
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
