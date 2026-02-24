'use client';

import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Text,
  Badge,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  DismissCircleRegular,
  InfoRegular,
} from '@fluentui/react-icons';
import { GameEvent } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
  },
  positiveIcon: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
  },
  negativeIcon: {
    backgroundColor: tokens.colorPaletteRedBackground2,
  },
  neutralIcon: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
  },
  effects: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    marginTop: '16px',
  },
});

interface EventModalProps {
  event: GameEvent;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  const styles = useStyles();

  // 获取事件图标
  const getEventIcon = () => {
    switch (event.type) {
      case 'positive':
        return '🎉';
      case 'negative':
        return '😢';
      case 'neutral':
        return '📢';
    }
  };

  // 获取事件类型样式
  const getTypeStyle = () => {
    switch (event.type) {
      case 'positive':
        return styles.positiveIcon;
      case 'negative':
        return styles.negativeIcon;
      case 'neutral':
        return styles.neutralIcon;
    }
  };

  // 获取效果显示
  const getEffectBadges = () => {
    const badges = [];
    
    if (event.effects.cash) {
      badges.push(
        <Badge
          key="cash"
          appearance="filled"
          color={event.effects.cash > 0 ? 'success' : 'danger'}
        >
          💰 {event.effects.cash > 0 ? '+' : ''}¥{event.effects.cash}
        </Badge>
      );
    }
    
    if (event.effects.hunger) {
      badges.push(
        <Badge
          key="hunger"
          appearance="filled"
          color={event.effects.hunger > 0 ? 'success' : 'danger'}
        >
          🍖 饥饿 {event.effects.hunger > 0 ? '+' : ''}{event.effects.hunger}
        </Badge>
      );
    }
    
    if (event.effects.thirst) {
      badges.push(
        <Badge
          key="thirst"
          appearance="filled"
          color={event.effects.thirst > 0 ? 'success' : 'danger'}
        >
          💧 口渴 {event.effects.thirst > 0 ? '+' : ''}{event.effects.thirst}
        </Badge>
      );
    }
    
    if (event.effects.health) {
      badges.push(
        <Badge
          key="health"
          appearance="filled"
          color={event.effects.health > 0 ? 'success' : 'danger'}
        >
          ❤️ 健康 {event.effects.health > 0 ? '+' : ''}{event.effects.health}
        </Badge>
      );
    }
    
    if (event.effects.mood) {
      badges.push(
        <Badge
          key="mood"
          appearance="filled"
          color={event.effects.mood > 0 ? 'success' : 'danger'}
        >
          😊 心情 {event.effects.mood > 0 ? '+' : ''}{event.effects.mood}
        </Badge>
      );
    }
    
    if (event.effects.stockEffect) {
      const industry = event.effects.stockEffect.industry || '全部';
      const effect = event.effects.stockEffect.effect;
      badges.push(
        <Badge
          key="stock"
          appearance="filled"
          color={effect > 0 ? 'success' : 'danger'}
        >
          📈 {industry}股票 {effect > 0 ? '+' : ''}{effect}%
        </Badge>
      );
    }

    return badges;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogSurface>
        <DialogBody>
          <div className={styles.container}>
            <div className={`${styles.iconContainer} ${getTypeStyle()}`}>
              {getEventIcon()}
            </div>
            
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<DismissCircleRegular />}
                  onClick={onClose}
                />
              }
              className={styles.title}
            >
              {event.title}
            </DialogTitle>
            
            <DialogContent className={styles.description}>
              {event.description}
            </DialogContent>

            <div className={styles.effects}>
              {getEffectBadges()}
            </div>
          </div>

          <DialogActions>
            <Button appearance="primary" onClick={onClose}>
              知道了
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
