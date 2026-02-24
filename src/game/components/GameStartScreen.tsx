'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  Input,
  Dropdown,
  Option,
  Slider,
  Switch,
  Text,
  Title1,
  Title2,
  Title3,
  Body1,
  Body2,
  Caption1,
  Badge,
  makeStyles,
  tokens,
  shorthands,
  Field,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  PersonRegular,
  XboxControllerRegular,
  SettingsRegular,
  PlayRegular,
  DocumentRegular,
} from '@fluentui/react-icons';
import { PlayerIdentity, GameMode, Difficulty, CustomDifficulty, GameStartConfig } from '../types';
import { PLAYER_IDENTITIES, DIFFICULTY_CONFIG, DEFAULT_CUSTOM_DIFFICULTY } from '../constants';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground3,
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('16px'),
    boxShadow: tokens.shadow16,
  },
  header: {
    textAlign: 'center',
    padding: '32px',
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, ${tokens.colorBrandBackgroundPressed} 100%)`,
    ...shorthands.borderRadius('16px 16px 0 0'),
  },
  title: {
    color: tokens.colorNeutralForegroundOnBrand,
    marginBottom: '8px',
  },
  subtitle: {
    color: tokens.colorNeutralForegroundOnBrand,
    opacity: 0.9,
  },
  body: {
    padding: '32px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  identityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  identityCard: {
    cursor: 'pointer',
    padding: '16px',
    ...shorthands.borderRadius('12px'),
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    transition: 'all 0.2s ease',
    backgroundColor: tokens.colorNeutralBackground1,
    ':hover': {
      borderColor: tokens.colorBrandStroke1,
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  identityCardSelected: {
    borderColor: tokens.colorBrandBackground,
    backgroundColor: tokens.colorBrandBackground2,
  },
  identityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  identityIcon: {
    fontSize: '32px',
  },
  identityName: {
    fontWeight: '600',
  },
  identityStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '8px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeSelector: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
  },
  modeCard: {
    flex: 1,
    cursor: 'pointer',
    padding: '24px',
    ...shorthands.borderRadius('12px'),
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    transition: 'all 0.2s ease',
    textAlign: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    ':hover': {
      borderColor: tokens.colorBrandStroke1,
    },
  },
  modeCardSelected: {
    borderColor: tokens.colorBrandBackground,
    backgroundColor: tokens.colorBrandBackground2,
  },
  difficultyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  difficultyCard: {
    cursor: 'pointer',
    padding: '16px',
    ...shorthands.borderRadius('12px'),
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    transition: 'all 0.2s ease',
    textAlign: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    ':hover': {
      borderColor: tokens.colorBrandStroke1,
    },
  },
  difficultyCardSelected: {
    borderColor: tokens.colorBrandBackground,
    backgroundColor: tokens.colorBrandBackground2,
  },
  customSettings: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('12px'),
  },
  customRow: {
    marginBottom: '20px',
  },
  customLabel: {
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '32px',
  },
  startButton: {
    minWidth: '200px',
    height: '48px',
    fontSize: '16px',
    fontWeight: '600',
  },
  customIdentityForm: {
    marginTop: '16px',
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('12px'),
  },
});

interface GameStartScreenProps {
  onStartGame: (config: GameStartConfig) => void;
  onLoadGame: () => void;
  hasSaves: boolean;
}

export function GameStartScreen({ onStartGame, onLoadGame, hasSaves }: GameStartScreenProps) {
  const styles = useStyles();
  
  // 玩家信息
  const [playerName, setPlayerName] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState<PlayerIdentity | null>(null);
  const [isCustomIdentity, setIsCustomIdentity] = useState(false);
  const [customIdentity, setCustomIdentity] = useState<PlayerIdentity>({
    ...PLAYER_IDENTITIES.find(i => i.id === 'custom')!,
    initialCash: 50000,
    stressResistance: 50,
    workEfficiency: 50,
    investmentSense: 50,
  });

  // 游戏设置
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [customDifficulty, setCustomDifficulty] = useState<CustomDifficulty>(DEFAULT_CUSTOM_DIFFICULTY);

  // 身份选择
  const handleIdentitySelect = (identity: PlayerIdentity) => {
    if (identity.id === 'custom') {
      setIsCustomIdentity(true);
      setSelectedIdentity(customIdentity);
    } else {
      setIsCustomIdentity(false);
      setSelectedIdentity(identity);
    }
  };

  // 开始游戏
  const handleStartGame = () => {
    if (!playerName.trim()) {
      alert('请输入玩家名称');
      return;
    }
    if (!selectedIdentity) {
      alert('请选择玩家身份');
      return;
    }

    const config: GameStartConfig = {
      playerName: playerName.trim(),
      playerIdentity: isCustomIdentity ? customIdentity : selectedIdentity,
      gameMode,
      difficulty,
      customDifficulty: difficulty === 'custom' ? customDifficulty : undefined,
    };

    onStartGame(config);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title1 className={styles.title}>📈 炒股人生</Title1>
          <Body1 className={styles.subtitle}>体验股市风云，感悟人生百态</Body1>
        </div>
        
        <Card className={styles.body}>
          {/* 玩家名称 */}
          <div className={styles.section}>
            <Title3 className={styles.sectionTitle}>
              <PersonRegular /> 玩家信息
            </Title3>
            <Field label="玩家名称" required>
              <Input
                size="large"
                placeholder="请输入您的名称"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </Field>
          </div>

          {/* 身份选择 */}
          <div className={styles.section}>
            <Title3 className={styles.sectionTitle}>
              <XboxControllerRegular /> 选择身份
            </Title3>
            <div className={styles.identityGrid}>
              {PLAYER_IDENTITIES.map((identity) => (
                <div
                  key={identity.id}
                  className={`${styles.identityCard} ${
                    (isCustomIdentity && identity.id === 'custom') || 
                    (!isCustomIdentity && selectedIdentity?.id === identity.id)
                      ? styles.identityCardSelected 
                      : ''
                  }`}
                  onClick={() => handleIdentitySelect(identity)}
                >
                  <div className={styles.identityHeader}>
                    <span className={styles.identityIcon}>{identity.icon}</span>
                    <Text className={styles.identityName}>{identity.name}</Text>
                  </div>
                  <Caption1>{identity.description}</Caption1>
                  <div className={styles.identityStats}>
                    <div className={styles.statRow}>
                      <Caption1>初始资金</Caption1>
                      <Badge appearance="filled" color="brand">
                        ¥{identity.initialCash.toLocaleString()}
                      </Badge>
                    </div>
                    <div className={styles.statRow}>
                      <Caption1>耐压能力</Caption1>
                      <Caption1>{identity.stressResistance}</Caption1>
                    </div>
                    <div className={styles.statRow}>
                      <Caption1>工作效率</Caption1>
                      <Caption1>{identity.workEfficiency}</Caption1>
                    </div>
                    <div className={styles.statRow}>
                      <Caption1>投资直觉</Caption1>
                      <Caption1>{identity.investmentSense}</Caption1>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 自定义身份表单 */}
            {isCustomIdentity && (
              <div className={styles.customIdentityForm}>
                <Title3>自定义身份属性</Title3>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>初始资金</Text>
                    <Text weight="semibold">¥{customIdentity.initialCash.toLocaleString()}</Text>
                  </div>
                  <Slider
                    min={10000}
                    max={1000000}
                    step={10000}
                    value={customIdentity.initialCash}
                    onChange={(e, data) => setCustomIdentity(prev => ({ ...prev, initialCash: data.value }))}
                  />
                </div>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>耐压能力</Text>
                    <Text weight="semibold">{customIdentity.stressResistance}</Text>
                  </div>
                  <Slider
                    min={1}
                    max={100}
                    value={customIdentity.stressResistance}
                    onChange={(e, data) => setCustomIdentity(prev => ({ ...prev, stressResistance: data.value }))}
                  />
                </div>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>工作效率</Text>
                    <Text weight="semibold">{customIdentity.workEfficiency}</Text>
                  </div>
                  <Slider
                    min={1}
                    max={100}
                    value={customIdentity.workEfficiency}
                    onChange={(e, data) => setCustomIdentity(prev => ({ ...prev, workEfficiency: data.value }))}
                  />
                </div>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>投资直觉</Text>
                    <Text weight="semibold">{customIdentity.investmentSense}</Text>
                  </div>
                  <Slider
                    min={1}
                    max={100}
                    value={customIdentity.investmentSense}
                    onChange={(e, data) => setCustomIdentity(prev => ({ ...prev, investmentSense: data.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 游戏模式 */}
          <div className={styles.section}>
            <Title3 className={styles.sectionTitle}>
              <SettingsRegular /> 游戏模式
            </Title3>
            <div className={styles.modeSelector}>
              <div
                className={`${styles.modeCard} ${gameMode === 'normal' ? styles.modeCardSelected : ''}`}
                onClick={() => setGameMode('normal')}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                <Text weight="semibold" size={400}>普通炒股</Text>
                <Body2 style={{ marginTop: '8px', color: tokens.colorNeutralForeground2 }}>
                  专注于股票交易，无需担心生存问题
                </Body2>
              </div>
              <div
                className={`${styles.modeCard} ${gameMode === 'survival' ? styles.modeCardSelected : ''}`}
                onClick={() => setGameMode('survival')}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏠</div>
                <Text weight="semibold" size={400}>生活炒股</Text>
                <Body2 style={{ marginTop: '8px', color: tokens.colorNeutralForeground2 }}>
                  平衡生活与投资，管理饥饿、口渴、健康、心情
                </Body2>
              </div>
            </div>
          </div>

          {/* 难度选择 */}
          <div className={styles.section}>
            <Title3 className={styles.sectionTitle}>
              <SettingsRegular /> 难度选择
            </Title3>
            <div className={styles.difficultyGrid}>
              {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                <div
                  key={key}
                  className={`${styles.difficultyCard} ${difficulty === key ? styles.difficultyCardSelected : ''}`}
                  onClick={() => setDifficulty(key as Difficulty)}
                >
                  <Text weight="semibold">{config.name}</Text>
                  <Caption1 style={{ marginTop: '4px', display: 'block' }}>
                    {config.description}
                  </Caption1>
                </div>
              ))}
            </div>

            {/* 自定义难度设置 */}
            {difficulty === 'custom' && (
              <div className={styles.customSettings}>
                <Title3>自定义难度参数</Title3>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>初始资金</Text>
                    <Text weight="semibold">¥{customDifficulty.initialCash.toLocaleString()}</Text>
                  </div>
                  <Slider
                    min={10000}
                    max={10000000}
                    step={10000}
                    value={customDifficulty.initialCash}
                    onChange={(e, data) => setCustomDifficulty(prev => ({ ...prev, initialCash: data.value }))}
                  />
                </div>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>股票波动率</Text>
                    <Text weight="semibold">{customDifficulty.stockVolatility.toFixed(1)}x</Text>
                  </div>
                  <Slider
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={customDifficulty.stockVolatility}
                    onChange={(e, data) => setCustomDifficulty(prev => ({ ...prev, stockVolatility: data.value }))}
                  />
                </div>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>生存衰减速度</Text>
                    <Text weight="semibold">{customDifficulty.survivalDecayRate.toFixed(1)}x</Text>
                  </div>
                  <Slider
                    min={0}
                    max={5}
                    step={0.1}
                    value={customDifficulty.survivalDecayRate}
                    onChange={(e, data) => setCustomDifficulty(prev => ({ ...prev, survivalDecayRate: data.value }))}
                  />
                </div>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>物价倍率</Text>
                    <Text weight="semibold">{customDifficulty.foodPriceMultiplier.toFixed(1)}x</Text>
                  </div>
                  <Slider
                    min={0.5}
                    max={5}
                    step={0.1}
                    value={customDifficulty.foodPriceMultiplier}
                    onChange={(e, data) => setCustomDifficulty(prev => ({ ...prev, foodPriceMultiplier: data.value }))}
                  />
                </div>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>工资倍率</Text>
                    <Text weight="semibold">{customDifficulty.workPayMultiplier.toFixed(1)}x</Text>
                  </div>
                  <Slider
                    min={0.5}
                    max={5}
                    step={0.1}
                    value={customDifficulty.workPayMultiplier}
                    onChange={(e, data) => setCustomDifficulty(prev => ({ ...prev, workPayMultiplier: data.value }))}
                  />
                </div>
                <div className={styles.customRow}>
                  <div className={styles.customLabel}>
                    <Text>随机事件概率</Text>
                    <Text weight="semibold">{customDifficulty.eventProbability.toFixed(1)}x</Text>
                  </div>
                  <Slider
                    min={0}
                    max={5}
                    step={0.1}
                    value={customDifficulty.eventProbability}
                    onChange={(e, data) => setCustomDifficulty(prev => ({ ...prev, eventProbability: data.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 按钮 */}
          <div className={styles.buttonRow}>
            {hasSaves && (
              <Button
                size="large"
                appearance="outline"
                icon={<DocumentRegular />}
                onClick={onLoadGame}
              >
                读取存档
              </Button>
            )}
            <Button
              size="large"
              appearance="primary"
              icon={<PlayRegular />}
              onClick={handleStartGame}
              className={styles.startButton}
            >
              开始游戏
            </Button>
          </div>
        </Card>
      </Card>
    </div>
  );
}
