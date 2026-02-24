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
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  FoodRegular,
  DrinkToGoRegular,
  MedalRegular,
  GamesRegular,
} from '@fluentui/react-icons';
import { useGameStore } from '../store';
import { SHOP_ITEMS, DIFFICULTY_CONFIG } from '../constants';
import { ItemType } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  categoryTabs: {
    marginBottom: '16px',
  },
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  itemCard: {
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: tokens.colorBrandStroke1,
      boxShadow: tokens.shadow4,
    },
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  itemIcon: {
    fontSize: '32px',
  },
  itemName: {
    flex: 1,
  },
  itemPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: tokens.colorBrandForeground1,
    fontWeight: '600',
  },
  itemEffects: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  effectBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quantityInput: {
    width: '80px',
  },
  shelfLife: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

export function ShopPanel() {
  const styles = useStyles();
  const [selectedCategory, setSelectedCategory] = useState<ItemType | 'all'>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { cash, difficulty, customDifficulty, buyItem } = useGameStore();

  // 计算价格倍率
  const priceMultiplier = difficulty === 'custom' && customDifficulty
    ? customDifficulty.foodPriceMultiplier
    : DIFFICULTY_CONFIG[difficulty]?.foodPriceMultiplier || 1;

  // 过滤物品
  const filteredItems = SHOP_ITEMS.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.type === selectedCategory;
  });

  // 购买物品
  const handleBuy = (itemId: string) => {
    const quantity = quantities[itemId] || 1;
    const result = buyItem(itemId, quantity);
    
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    
    if (result.success) {
      setQuantities(prev => ({ ...prev, [itemId]: 1 }));
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  // 获取类型图标
  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case 'food': return '🍖';
      case 'drink': return '💧';
      case 'medicine': return '💊';
      case 'entertainment': return '🎮';
    }
  };

  // 获取效果显示
  const getEffectDisplay = (effect: { hunger?: number; thirst?: number; health?: number; mood?: number }) => {
    const effects = [];
    if (effect.hunger) effects.push({ label: '饥饿', value: effect.hunger, icon: '🍖' });
    if (effect.thirst) effects.push({ label: '口渴', value: effect.thirst, icon: '💧' });
    if (effect.health) effects.push({ label: '健康', value: effect.health, icon: '❤️' });
    if (effect.mood) effects.push({ label: '心情', value: effect.mood, icon: '😊' });
    return effects;
  };

  return (
    <div className={styles.container}>
      {/* 消息提示 */}
      {message && (
        <MessageBar intent={message.type === 'success' ? 'success' : 'error'}>
          <MessageBarBody>{message.text}</MessageBarBody>
        </MessageBar>
      )}

      {/* 分类标签 */}
      <TabList
        selectedValue={selectedCategory}
        onTabSelect={(_, data) => setSelectedCategory(data.value as ItemType | 'all')}
        className={styles.categoryTabs}
      >
        <Tab value="all">全部</Tab>
        <Tab value="food" icon={<FoodRegular />}>食物</Tab>
        <Tab value="drink" icon={<DrinkToGoRegular />}>饮品</Tab>
        <Tab value="medicine" icon={<MedalRegular />}>药品</Tab>
        <Tab value="entertainment" icon={<GamesRegular />}>娱乐</Tab>
      </TabList>

      {/* 当前资金 */}
      <Text>
        当前资金: <Text weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>¥{cash.toLocaleString()}</Text>
      </Text>

      {/* 物品列表 */}
      <div className={styles.itemGrid}>
        {filteredItems.map(item => {
          const actualPrice = Math.round(item.price * priceMultiplier);
          const quantity = quantities[item.id] || 1;
          const totalCost = actualPrice * quantity;
          const canAfford = cash >= totalCost;

          return (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <span className={styles.itemIcon}>{item.icon}</span>
                <div className={styles.itemName}>
                  <Text weight="semibold">{item.name}</Text>
                  <Caption1>{item.description}</Caption1>
                </div>
              </div>

              <div className={styles.itemPrice}>
                <Text size={400} weight="semibold">¥{actualPrice}</Text>
                {priceMultiplier !== 1 && (
                  <Caption1 style={{ textDecoration: 'line-through', color: tokens.colorNeutralForeground2 }}>
                    ¥{item.price}
                  </Caption1>
                )}
              </div>

              <div className={styles.itemEffects}>
                {getEffectDisplay(item.effect).map((eff, idx) => (
                  <Badge
                    key={idx}
                    appearance="tint"
                    color={eff.value > 0 ? 'success' : 'danger'}
                  >
                    {eff.icon} {eff.value > 0 ? '+' : ''}{eff.value}
                  </Badge>
                ))}
              </div>

              {item.shelfLife > 0 && (
                <div className={styles.shelfLife}>
                  <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
                    📅 保质期: {item.shelfLife}天
                  </Caption1>
                </div>
              )}

              {item.shelfLife === 0 && (
                <div className={styles.shelfLife}>
                  <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
                    ⚡ 即时使用
                  </Caption1>
                </div>
              )}

              <div className={styles.itemActions}>
                <Input
                  type="number"
                  min={1}
                  value={quantity.toString()}
                  onChange={(e) => setQuantities(prev => ({
                    ...prev,
                    [item.id]: Math.max(1, parseInt(e.target.value) || 1)
                  }))}
                  className={styles.quantityInput}
                  size="small"
                />
                <Text>件</Text>
                <Button
                  appearance="primary"
                  size="small"
                  onClick={() => handleBuy(item.id)}
                  disabled={!canAfford}
                >
                  购买 (¥{totalCost})
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
