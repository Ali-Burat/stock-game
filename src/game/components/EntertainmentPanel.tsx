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
  ProgressBar,
Card,
} from '@fluentui/react-components';
import {
  GameRegular,
  ClockRegular,
  MoneyRegular,
} from '@fluentui/react-icons';
import { useGameStore } from '../store';
import { ENTERTAINMENTS } from '../constants';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  entertainmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  entertainmentCard: {
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: tokens.colorBrandStroke1,
      boxShadow: tokens.shadow4,
    },
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  cardIcon: {
    fontSize: '40px',
  },
  cardTitle: {
    flex: 1,
  },
  cardStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  cardStat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodBoost: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: tokens.colorPaletteGreenForeground1,
    fontWeight: '600',
  },
  currentMood: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('8px'),
  },
});

export function EntertainmentPanel() {
  const styles = useStyles();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { cash, survivalStatus, doEntertainment } = useGameStore();

  // 执行娱乐活动
  const handleEntertainment = (entertainmentId: string) => {
    const result = doEntertainment(entertainmentId);
    
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    
    setTimeout(() => setMessage(null), 3000);
  };

  // 获取心情状态颜色
  const getMoodColor = (mood: number) => {
    if (mood >= 70) return 'success';
    if (mood >= 40) return 'warning';
    return 'error';
  };

  return (
    <div className={styles.container}>
      {/* 消息提示 */}
      {message && (
        <MessageBar intent={message.type === 'success' ? 'success' : 'error'}>
          <MessageBarBody>{message.text}</MessageBarBody>
        </MessageBar>
      )}

      {/* 当前心情状态 */}
      <Card>
        <Card>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div>
              <Text>当前资金: </Text>
              <Text weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                ¥{cash.toLocaleString()}
              </Text>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <Text>当前心情</Text>
                <Text weight="semibold">{Math.round(survivalStatus.mood)}%</Text>
              </div>
              <ProgressBar
                value={survivalStatus.mood / 100}
                color={getMoodColor(survivalStatus.mood)}
              />
            </div>
          </div>
        </Card>
      </Card>

      {/* 娱乐活动列表 */}
      <div className={styles.entertainmentGrid}>
        {ENTERTAINMENTS.map(entertainment => {
          const canAfford = cash >= entertainment.cost;

          return (
            <div key={entertainment.id} className={styles.entertainmentCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{entertainment.icon}</span>
                <div className={styles.cardTitle}>
                  <Text weight="semibold" size={400}>{entertainment.name}</Text>
                  <Caption1>{entertainment.description}</Caption1>
                </div>
              </div>

              <div className={styles.cardStats}>
                <div className={styles.cardStat}>
                  <Text>费用</Text>
                  <Text weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                    {entertainment.cost === 0 ? '免费' : `¥${entertainment.cost}`}
                  </Text>
                </div>
                <div className={styles.cardStat}>
                  <Text>心情提升</Text>
                  <div className={styles.moodBoost}>
                    <span>😊</span>
                    <Text weight="semibold">+{entertainment.moodBoost}</Text>
                  </div>
                </div>
                <div className={styles.cardStat}>
                  <Text>耗时</Text>
                  <Text>{entertainment.timeCost}小时</Text>
                </div>
              </div>

              <Button
                appearance="primary"
                style={{ width: '100%' }}
                onClick={() => handleEntertainment(entertainment.id)}
                disabled={!canAfford}
              >
                {entertainment.cost === 0 ? '开始' : `花费 ¥${entertainment.cost}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* 提示信息 */}
      <Card>
        <Card>
          <Text style={{ color: tokens.colorNeutralForeground2 }}>
            💡 提示：心情值会随时间自然下降，保持良好的心情有助于提高工作效率和生活质量。
            选择适合自己经济状况的娱乐方式，避免过度消费。
          </Text>
        </Card>
      </Card>
    </div>
  );
}
