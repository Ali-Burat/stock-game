import { useState } from 'react';
import {
  Button,
  Card,
  Input,
  Text,
  Title1,
  Title3,
  Body1,
  Caption1,
  Badge,
  makeStyles,
  tokens,
  shorthands,
  Field,
} from '@fluentui/react-components';
import {
  PersonRegular,
  PlayRegular,
  DocumentRegular,
} from '@fluentui/react-icons';
import { PlayerIdentity, GameMode, Difficulty, GameStartConfig } from '../types';
import { PLAYER_IDENTITIES, DIFFICULTY_CONFIG } from '../constants';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground3,
    padding: '16px',
  },
  card: {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    boxShadow: tokens.shadow8,
  },
  header: {
    textAlign: 'center',
    padding: '24px',
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, #4a90d9 100%)`,
    ...shorthands.borderRadius('12px 12px 0 0'),
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
    padding: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  identityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  identityCard: {
    cursor: 'pointer',
    padding: '12px',
    ...shorthands.borderRadius('8px'),
    border: '2px solid transparent',
    backgroundColor: tokens.colorNeutralBackground3,
    transition: 'all 0.2s',
    selectors: {
      '&:hover': {
        backgroundColor: tokens.colorNeutralBackground3Hover,
      },
    },
  },
  identityCardSelected: {
    border: `2px solid ${tokens.colorBrandBackground}`,
    backgroundColor: tokens.colorBrandBackground2,
  },
  identityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  identityIcon: {
    fontSize: '24px',
  },
  modeSelector: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  modeCard: {
    flex: 1,
    minWidth: '150px',
    cursor: 'pointer',
    padding: '16px',
    ...shorthands.borderRadius('8px'),
    border: '2px solid transparent',
    textAlign: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    transition: 'all 0.2s',
    selectors: {
      '&:hover': {
        backgroundColor: tokens.colorNeutralBackground3Hover,
      },
    },
  },
  modeCardSelected: {
    border: `2px solid ${tokens.colorBrandBackground}`,
    backgroundColor: tokens.colorBrandBackground2,
  },
  difficultyGrid: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  difficultyCard: {
    cursor: 'pointer',
    padding: '12px 16px',
    ...shorthands.borderRadius('8px'),
    border: '2px solid transparent',
    textAlign: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    transition: 'all 0.2s',
    selectors: {
      '&:hover': {
        backgroundColor: tokens.colorNeutralBackground3Hover,
      },
    },
  },
  difficultyCardSelected: {
    border: `2px solid ${tokens.colorBrandBackground}`,
    backgroundColor: tokens.colorBrandBackground2,
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  startButton: {
    minWidth: '160px',
    height: '44px',
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

  // 游戏设置
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

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
      playerIdentity: selectedIdentity,
      gameMode,
      difficulty,
    };

    onStartGame(config);
  };

  // 获取选中样式
  const getIdentityStyle = (identity: PlayerIdentity) => {
    return `${styles.identityCard} ${selectedIdentity?.id === identity.id ? styles.identityCardSelected : ''}`;
  };

  const getModeStyle = (mode: GameMode) => {
    return `${styles.modeCard} ${gameMode === mode ? styles.modeCardSelected : ''}`;
  };

  const getDifficultyStyle = (diff: Difficulty) => {
    return `${styles.difficultyCard} ${difficulty === diff ? styles.difficultyCardSelected : ''}`;
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title1 className={styles.title}>📈 炒股人生</Title1>
          <Body1 className={styles.subtitle}>体验股市风云，感悟人生百态</Body1>
        </div>
        
        <div className={styles.body}>
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
            <Title3 className={styles.sectionTitle}>选择身份</Title3>
            <div className={styles.identityGrid}>
              {PLAYER_IDENTITIES.map((identity) => (
                <div
                  key={identity.id}
                  className={getIdentityStyle(identity)}
                  onClick={() => setSelectedIdentity(identity)}
                >
                  <div className={styles.identityHeader}>
                    <span className={styles.identityIcon}>{identity.icon}</span>
                    <Text weight="semibold">{identity.name}</Text>
                  </div>
                  <Caption1>{identity.description}</Caption1>
                  <div style={{ marginTop: '8px' }}>
                    <Badge appearance="filled" color="brand">
                      ¥{identity.initialCash.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 游戏模式 */}
          <div className={styles.section}>
            <Title3 className={styles.sectionTitle}>游戏模式</Title3>
            <div className={styles.modeSelector}>
              <div
                className={getModeStyle('normal')}
                onClick={() => setGameMode('normal')}
              >
                <div style={{ fontSize: '36px' }}>📊</div>
                <Text weight="semibold">普通炒股</Text>
                <Caption1 style={{ display: 'block', marginTop: '4px' }}>
                  专注交易
                </Caption1>
              </div>
              <div
                className={getModeStyle('survival')}
                onClick={() => setGameMode('survival')}
              >
                <div style={{ fontSize: '36px' }}>🏠</div>
                <Text weight="semibold">生活炒股</Text>
                <Caption1 style={{ display: 'block', marginTop: '4px' }}>
                  平衡生活
                </Caption1>
              </div>
            </div>
          </div>

          {/* 难度选择 */}
          <div className={styles.section}>
            <Title3 className={styles.sectionTitle}>难度选择</Title3>
            <div className={styles.difficultyGrid}>
              {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                <div
                  key={key}
                  className={getDifficultyStyle(key as Difficulty)}
                  onClick={() => setDifficulty(key as Difficulty)}
                >
                  <Text weight="semibold">{config.name}</Text>
                </div>
              ))}
            </div>
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
        </div>
      </Card>
    </div>
  );
}
