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
  Input,
  makeStyles,
  tokens,
  shorthands,
  MessageBar,
  MessageBarBody,
  ProgressBar,
Card,
} from '@fluentui/react-components';
import {
  BuildingRegular,
  ClockRegular,
  MoneyRegular,
} from '@fluentui/react-icons';
import { useGameStore } from '../store';
import { JOBS, DIFFICULTY_CONFIG } from '../constants';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  jobGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  jobCard: {
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
  jobHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  jobTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  jobPay: {
    color: tokens.colorBrandForeground1,
    fontWeight: '600',
  },
  jobStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  jobStat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  hoursInput: {
    width: '80px',
  },
  workTimeInfo: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('8px'),
  },
  timeSlots: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '8px',
  },
  timeSlot: {
    padding: '2px 8px',
    ...shorthands.borderRadius('4px'),
    fontSize: '12px',
  },
  availableSlot: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  unavailableSlot: {
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground2,
  },
  currentSlot: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

export function WorkPanel() {
  const styles = useStyles();
  const [selectedHours, setSelectedHours] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    gameTime,
    survivalStatus,
    playerIdentity,
    difficulty,
    customDifficulty,
    doWork,
  } = useGameStore();

  // 计算工资倍率
  const payMultiplier = difficulty === 'custom' && customDifficulty
    ? customDifficulty.workPayMultiplier
    : DIFFICULTY_CONFIG[difficulty]?.workPayMultiplier || 1;

  // 工作效率
  const efficiency = playerIdentity?.workEfficiency || 50;

  // 执行工作
  const handleWork = (jobId: string) => {
    const hours = selectedHours[jobId] || 1;
    const result = doWork(jobId, hours);
    
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    
    if (result.success) {
      setSelectedHours(prev => ({ ...prev, [jobId]: 1 }));
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  // 检查是否可以工作
  const canWork = (job: typeof JOBS[0]) => {
    return job.workHours.includes(gameTime) && survivalStatus.health >= job.requiredHealth;
  };

  // 获取时间状态样式
  const getTimeSlotStyle = (hour: number, job: typeof JOBS[0]) => {
    if (hour === gameTime) return `${styles.timeSlot} ${styles.currentSlot}`;
    if (job.workHours.includes(hour)) return `${styles.timeSlot} ${styles.availableSlot}`;
    return `${styles.timeSlot} ${styles.unavailableSlot}`;
  };

  return (
    <div className={styles.container}>
      {/* 消息提示 */}
      {message && (
        <MessageBar intent={message.type === 'success' ? 'success' : 'error'}>
          <MessageBarBody>{message.text}</MessageBarBody>
        </MessageBar>
      )}

      {/* 当前状态 */}
      <Card>
        <Card>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div>
              <Text>当前时间: </Text>
              <Text weight="semibold">{gameTime.toString().padStart(2, '0')}:00</Text>
            </div>
            <div>
              <Text>工作效率: </Text>
              <Text weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>{efficiency}%</Text>
            </div>
            <div>
              <Text>工资倍率: </Text>
              <Text weight="semibold">{payMultiplier}x</Text>
            </div>
            <div>
              <Text>健康值: </Text>
              <Text weight="semibold" style={{ color: survivalStatus.health >= 50 ? tokens.colorPaletteGreenForeground1 : tokens.colorPaletteRedForeground1 }}>
                {Math.round(survivalStatus.health)}%
              </Text>
            </div>
          </div>
        </Card>
      </Card>

      {/* 工作列表 */}
      <div className={styles.jobGrid}>
        {JOBS.map(job => {
          const hours = selectedHours[job.id] || 1;
          const basePay = job.hourlyPay * hours * payMultiplier;
          const actualPay = Math.round(basePay * (efficiency / 100));
          const isAvailable = canWork(job);

          return (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <div className={styles.jobTitle}>
                  <BuildingRegular />
                  <Text weight="semibold" size={400}>{job.name}</Text>
                </div>
                <Badge appearance="filled" color={isAvailable ? 'success' : 'warning'}>
                  {isAvailable ? '可工作' : '不可用'}
                </Badge>
              </div>

              <Caption1 style={{ marginBottom: '12px', display: 'block' }}>
                {job.description}
              </Caption1>

              <div className={styles.jobStats}>
                <div className={styles.jobStat}>
                  <Text>时薪</Text>
                  <Text className={styles.jobPay}>¥{job.hourlyPay}/小时</Text>
                </div>
                <div className={styles.jobStat}>
                  <Text>预计收入</Text>
                  <Text weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                    ¥{actualPay} ({hours}小时)
                  </Text>
                </div>
                <div className={styles.jobStat}>
                  <Text>精力消耗</Text>
                  <Text>{job.energyCost * hours}</Text>
                </div>
                <div className={styles.jobStat}>
                  <Text>心情影响</Text>
                  <Text style={{ color: job.moodEffect >= 0 ? tokens.colorPaletteGreenForeground1 : tokens.colorPaletteRedForeground1 }}>
                    {job.moodEffect >= 0 ? '+' : ''}{job.moodEffect * hours}
                  </Text>
                </div>
                <div className={styles.jobStat}>
                  <Text>健康要求</Text>
                  <Text>{job.requiredHealth}%</Text>
                </div>
              </div>

              {/* 健康值进度条 */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Caption1>健康值</Caption1>
                  <Caption1>{Math.round(survivalStatus.health)}% / {job.requiredHealth}%</Caption1>
                </div>
                <ProgressBar
                  value={survivalStatus.health / 100}
                  color={survivalStatus.health >= job.requiredHealth ? 'success' : 'error'}
                />
              </div>

              <div className={styles.jobActions}>
                <Text>工作时长:</Text>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={hours.toString()}
                  onChange={(e) => setSelectedHours(prev => ({
                    ...prev,
                    [job.id]: Math.min(8, Math.max(1, parseInt(e.target.value) || 1))
                  }))}
                  className={styles.hoursInput}
                  size="small"
                />
                <Text>小时</Text>
                <Button
                  appearance="primary"
                  size="small"
                  onClick={() => handleWork(job.id)}
                  disabled={!isAvailable}
                >
                  开始工作
                </Button>
              </div>

              {/* 工作时间表 */}
              <div className={styles.workTimeInfo}>
                <Caption1>工作时间表:</Caption1>
                <div className={styles.timeSlots}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <span key={i} className={getTimeSlotStyle(i, job)}>
                      {i.toString().padStart(2, '0')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
