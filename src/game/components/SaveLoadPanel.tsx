'use client';

import { useState, useMemo, useCallback } from 'react';
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
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import {
  SaveRegular,
  DeleteRegular,
  DocumentRegular,
  ClockRegular,
  PersonRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import { useGameStore } from '../store';
import { MAX_SAVE_SLOTS } from '../constants';
import { SaveData } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '4px',
  },
  slotCard: {
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    border: `2px solid ${tokens.colorNeutralStroke1}`,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    ':hover': {
      borderColor: tokens.colorBrandStroke1,
      boxShadow: tokens.shadow4,
    },
  },
  slotCardSelected: {
    borderColor: tokens.colorBrandBackground,
    backgroundColor: tokens.colorBrandBackground2,
  },
  slotCardEmpty: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  slotHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  slotNumber: {
    fontWeight: '600',
    color: tokens.colorBrandForeground1,
  },
  slotInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  slotInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  slotActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '16px',
  },
  emptySlot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    color: tokens.colorNeutralForeground2,
  },
});

interface SaveLoadPanelProps {
  mode: 'save' | 'load';
  onClose: () => void;
}

const SLOTS_PER_PAGE = 20;

export function SaveLoadPanel({ mode, onClose }: SaveLoadPanelProps) {
  const styles = useStyles();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { saveGame, loadGame, deleteSave, hasSave, currentSlotId } = useGameStore();

  // 加载存档数据 - 使用useMemo避免在useEffect中同步设置state
  const saveDataMap = useMemo(() => {
    const map = new Map<number, SaveData>();
    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
      const saveStr = localStorage.getItem(`stock_game_save_${i}`);
      if (saveStr) {
        try {
          map.set(i, JSON.parse(saveStr));
        } catch {
          // 忽略损坏的存档
        }
      }
    }
    return map;
  }, [refreshKey]); // 当refreshKey变化时重新加载

  // 计算分页
  const totalPages = Math.ceil(MAX_SAVE_SLOTS / SLOTS_PER_PAGE);
  const startSlot = (currentPage - 1) * SLOTS_PER_PAGE + 1;
  const endSlot = Math.min(currentPage * SLOTS_PER_PAGE, MAX_SAVE_SLOTS);

  // 获取当前页的存档槽
  const currentSlots = Array.from(
    { length: endSlot - startSlot + 1 },
    (_, i) => startSlot + i
  );

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化游戏时长
  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分钟`;
  };

  // 保存游戏
  const handleSave = (slotId: number) => {
    const result = saveGame(slotId);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    
    if (result.success) {
      // 刷新存档数据
      setRefreshKey(prev => prev + 1);
    }
    
    setTimeout(() => {
      setMessage(null);
      if (result.success) {
        onClose();
      }
    }, 1500);
  };

  // 加载游戏
  const handleLoad = (slotId: number) => {
    const result = loadGame(slotId);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    
    setTimeout(() => {
      if (result.success) {
        onClose();
      }
    }, 1500);
  };

  // 删除存档
  const handleDelete = (slotId: number) => {
    if (confirm(`确定要删除存档槽 ${slotId} 的存档吗？此操作不可恢复。`)) {
      const result = deleteSave(slotId);
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });
      
      if (result.success) {
        setRefreshKey(prev => prev + 1);
      }
      
      setTimeout(() => setMessage(null), 1500);
    }
  };

  return (
    <div className={styles.container}>
      {/* 消息提示 */}
      {message && (
        <MessageBar intent={message.type === 'success' ? 'success' : 'error'}>
          <MessageBarBody>{message.text}</MessageBarBody>
        </MessageBar>
      )}

      {/* 说明 */}
      <Text style={{ color: tokens.colorNeutralForeground2 }}>
        {mode === 'save' 
          ? `选择一个存档槽保存游戏（共 ${MAX_SAVE_SLOTS} 个槽位）`
          : '选择一个存档槽加载游戏'
        }
      </Text>

      {/* 存档槽列表 */}
      <div className={styles.slotGrid}>
        {currentSlots.map(slotId => {
          const saveData = saveDataMap.get(slotId);
          const isSelected = selectedSlot === slotId;
          const isCurrentSlot = currentSlotId === slotId;

          return (
            <div
              key={slotId}
              className={`${styles.slotCard} ${isSelected ? styles.slotCardSelected : ''} ${!saveData ? styles.slotCardEmpty : ''}`}
              onClick={() => setSelectedSlot(slotId)}
            >
              <div className={styles.slotHeader}>
                <Text className={styles.slotNumber}>存档槽 #{slotId}</Text>
                {isCurrentSlot && (
                  <Badge appearance="filled" color="brand">当前</Badge>
                )}
                {!saveData && (
                  <Badge appearance="tint">空</Badge>
                )}
              </div>

              {saveData ? (
                <>
                  <div className={styles.slotInfo}>
                    <div className={styles.slotInfoRow}>
                      <PersonRegular />
                      <Text>{saveData.playerName}</Text>
                      <Badge appearance="tint" size="small">{saveData.playerIdentity?.name}</Badge>
                    </div>
                    <div className={styles.slotInfoRow}>
                      <Text>💰 ¥{saveData.cash.toLocaleString()}</Text>
                    </div>
                    <div className={styles.slotInfoRow}>
                      <ClockRegular />
                      <Caption1>第 {saveData.gameDay} 天 · {formatPlayTime(saveData.playTime)}</Caption1>
                    </div>
                    <div className={styles.slotInfoRow}>
                      <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
                        {formatDate(saveData.updatedAt)}
                      </Caption1>
                    </div>
                  </div>

                  <div className={styles.slotActions}>
                    {mode === 'save' && (
                      <Button
                        size="small"
                        appearance="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave(slotId);
                        }}
                      >
                        覆盖保存
                      </Button>
                    )}
                    {mode === 'load' && (
                      <Button
                        size="small"
                        appearance="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoad(slotId);
                        }}
                      >
                        读取
                      </Button>
                    )}
                    <Button
                      size="small"
                      appearance="outline"
                      icon={<DeleteRegular />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(slotId);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {mode === 'save' ? (
                    <div className={styles.emptySlot}>
                      <DocumentRegular style={{ fontSize: '32px', marginBottom: '8px' }} />
                      <Text>空存档槽</Text>
                      <Button
                        size="small"
                        appearance="primary"
                        style={{ marginTop: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave(slotId);
                        }}
                      >
                        保存
                      </Button>
                    </div>
                  ) : (
                    <div className={styles.emptySlot}>
                      <Text>空存档槽</Text>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 分页 */}
      <div className={styles.pagination}>
        <Button
          appearance="outline"
          icon={<ChevronLeftRegular />}
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        >
          上一页
        </Button>
        <Text>第 {currentPage} / {totalPages} 页</Text>
        <Button
          appearance="outline"
          icon={<ChevronRightRegular />}
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        >
          下一页
        </Button>
      </div>

      {/* 底部按钮 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
        <Button appearance="outline" onClick={onClose}>
          取消
        </Button>
      </div>
    </div>
  );
}
