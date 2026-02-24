'use client';

import {
  CardHeader,
  Text,
  Title3,
  Body1,
  Body2,
  Caption1,
  Badge,
  makeStyles,
  tokens,
  shorthands,
  ProgressBar,
  Divider,
Card,
} from '@fluentui/react-components';
import {
  ArrowTrendingRegular,
  ArrowUpRegular,
  ArrowDownRegular,
  DataUsageRegular,
  PeopleRegular,
} from '@fluentui/react-icons';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MarketIndex, MarketState } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  indexGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  indexCard: {
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  indexHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  indexName: {
    fontWeight: '600',
  },
  indexValue: {
    fontSize: '24px',
    fontWeight: '700',
  },
  indexChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
  },
  upColor: {
    color: tokens.colorPaletteRedForeground1,
  },
  downColor: {
    color: tokens.colorPaletteGreenForeground1,
  },
  chartContainer: {
    height: '60px',
    marginTop: '8px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  statCard: {
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('8px'),
    textAlign: 'center',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
  },
  statLabel: {
    marginTop: '4px',
  },
  sentimentBar: {
    marginTop: '8px',
  },
  sentimentLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
});

interface MarketOverviewProps {
  marketState: MarketState;
}

export function MarketOverview({ marketState }: MarketOverviewProps) {
  const styles = useStyles();

  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  const getIndexIcon = (index: MarketIndex) => {
    if (index.dayChangePercent > 0) {
      return <ArrowUpRegular className={styles.upColor} />;
    } else if (index.dayChangePercent < 0) {
      return <ArrowDownRegular className={styles.downColor} />;
    }
    return <ArrowTrendingRegular />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 30) return 'success';
    if (sentiment >= 0) return 'warning';
    return 'error';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 50) return '极度乐观';
    if (sentiment >= 30) return '乐观';
    if (sentiment >= 10) return '偏乐观';
    if (sentiment >= -10) return '中性';
    if (sentiment >= -30) return '偏悲观';
    if (sentiment >= -50) return '悲观';
    return '极度悲观';
  };

  return (
    <div className={styles.container}>
      {/* 大盘指数 */}
      <Card>
        <CardHeader
          header={
            <Title3>
              <DataUsageRegular style={{ marginRight: '8px' }} />
              大盘指数
            </Title3>
          }
        />
        <Card>
          <div className={styles.indexGrid}>
            {marketState.indices.map(index => (
              <div key={index.id} className={styles.indexCard}>
                <div className={styles.indexHeader}>
                  <Text className={styles.indexName}>{index.name}</Text>
                  {getIndexIcon(index)}
                </div>
                
                <Text 
                  className={`${styles.indexValue} ${index.dayChangePercent >= 0 ? styles.upColor : styles.downColor}`}
                >
                  {index.currentValue.toFixed(2)}
                </Text>
                
                <div className={styles.indexChange}>
                  <Text 
                    size={200}
                    className={index.dayChangePercent >= 0 ? styles.upColor : styles.downColor}
                  >
                    {formatChange(index.dayChange, index.dayChangePercent)}
                  </Text>
                </div>

                {/* 迷你图表 */}
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={index.history.slice(-20)}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <RechartsTooltip
                        formatter={(value: number) => value.toFixed(2)}
                        labelFormatter={() => ''}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={index.dayChangePercent >= 0 ? tokens.colorPaletteRedForeground1 : tokens.colorPaletteGreenForeground1}
                        dot={false}
                        strokeWidth={1.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Card>

      {/* 市场统计 */}
      <Card>
        <CardHeader
          header={
            <Title3>
              <PeopleRegular style={{ marginRight: '8px' }} />
              市场概况
            </Title3>
          }
        />
        <Card>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <Text className={`${styles.statValue} ${styles.upColor}`}>
                {marketState.upCount}
              </Text>
              <Caption1 className={styles.statLabel}>上涨</Caption1>
            </div>
            <div className={styles.statCard}>
              <Text className={`${styles.statValue} ${styles.downColor}`}>
                {marketState.downCount}
              </Text>
              <Caption1 className={styles.statLabel}>下跌</Caption1>
            </div>
            <div className={styles.statCard}>
              <Text className={`${styles.statValue}`} style={{ color: tokens.colorPaletteRedForeground1 }}>
                {marketState.limitUpCount}
              </Text>
              <Caption1 className={styles.statLabel}>涨停</Caption1>
            </div>
            <div className={styles.statCard}>
              <Text className={`${styles.statValue}`} style={{ color: tokens.colorPaletteGreenForeground1 }}>
                {marketState.limitDownCount}
              </Text>
              <Caption1 className={styles.statLabel}>跌停</Caption1>
            </div>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* 市场情绪 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text weight="semibold">市场情绪</Text>
              <Badge appearance="filled" color={getSentimentColor(marketState.sentiment)}>
                {getSentimentLabel(marketState.sentiment)}
              </Badge>
            </div>
            <div className={styles.sentimentBar}>
              <ProgressBar
                value={(marketState.sentiment + 100) / 200}
                color={getSentimentColor(marketState.sentiment)}
              />
            </div>
            <div className={styles.sentimentLabels}>
              <Caption1>极度悲观</Caption1>
              <Caption1>中性</Caption1>
              <Caption1>极度乐观</Caption1>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );
}
