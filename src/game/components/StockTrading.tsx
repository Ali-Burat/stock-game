'use client';

import { useState, useMemo } from 'react';
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
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableCellLayout,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  MessageBar,
  MessageBarBody,
  Tab,
  TabList,
  Dropdown,
  Option,
  SearchBox,
  Divider,
  Spinner,
Card,
} from '@fluentui/react-components';
import {
  ArrowUpRegular,
  ArrowTrendingDownRegular,
  ArrowSwapRegular,
  DismissRegular,
  InfoRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useGameStore } from '../store';
import { Stock } from '../types';
import { INDUSTRIES } from '../constants';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchBox: {
    minWidth: '200px',
  },
  tableContainer: {
    flex: 1,
    overflow: 'auto',
    marginTop: '16px',
  },
  stockRow: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  stockCode: {
    fontWeight: '600',
    color: tokens.colorBrandForeground1,
  },
  priceUp: {
    color: tokens.colorPaletteRedForeground1,
  },
  priceDown: {
    color: tokens.colorPaletteGreenForeground1,
  },
  tradePanel: {
    display: 'flex',
    gap: '24px',
    marginTop: '16px',
  },
  tradeCard: {
    flex: 1,
    padding: '20px',
  },
  tradeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  quickButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  chartContainer: {
    height: '200px',
    marginTop: '16px',
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('8px'),
  },
  stockInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  detailPanel: {
    display: 'flex',
    gap: '24px',
    marginTop: '16px',
  },
  detailLeft: {
    flex: 2,
  },
  detailRight: {
    flex: 1,
  },
  historyList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius('4px'),
    marginBottom: '4px',
  },
});

export function StockTrading() {
  const styles = useStyles();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState<number>(100);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    stocks,
    positions,
    cash,
    transactions,
    buyStock,
    sellStock,
    getPositionByStockId,
  } = useGameStore();

  // 过滤股票
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = stock.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = industryFilter === 'all' || stock.industry === industryFilter;
      return matchesSearch && matchesIndustry;
    });
  }, [stocks, searchQuery, industryFilter]);

  // 选中的股票持仓
  const selectedPosition = selectedStock ? getPositionByStockId(selectedStock.id) : null;

  // 计算交易金额
  const tradeAmount = selectedStock ? selectedStock.currentPrice * shares : 0;
  const fee = Math.max(5, Math.round(tradeAmount * 0.0003));
  const totalCost = tradeAmount + fee;

  // 执行交易
  const handleTrade = () => {
    if (!selectedStock) return;

    let result;
    if (tradeType === 'buy') {
      result = buyStock(selectedStock.id, shares);
    } else {
      result = sellStock(selectedStock.id, shares);
    }

    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    
    if (result.success) {
      setShares(100);
    }

    setTimeout(() => setMessage(null), 3000);
  };

  // 快速设置数量
  const quickSetShares = (percent: number) => {
    if (tradeType === 'buy' && selectedStock) {
      const maxShares = Math.floor(cash / selectedStock.currentPrice);
      setShares(Math.floor(maxShares * percent / 100));
    } else if (tradeType === 'sell' && selectedPosition) {
      setShares(Math.floor(selectedPosition.shares * percent / 100));
    }
  };

  // 格式化价格变化
  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  return (
    <div className={styles.container}>
      {/* 过滤器 */}
      <div className={styles.filters}>
        <SearchBox
          placeholder="搜索股票代码或名称"
          value={searchQuery}
          onChange={(e, data) => setSearchQuery(data.value)}
          className={styles.searchBox}
        />
        <Dropdown
          placeholder="选择行业"
          value={industryFilter}
          onOptionSelect={(e, data) => setIndustryFilter(data.optionValue as string)}
          style={{ minWidth: '150px' }}
        >
          <Option value="all">全部行业</Option>
          {INDUSTRIES.map(industry => (
            <Option key={industry.id} value={industry.id}>
              {industry.name}
            </Option>
          ))}
        </Dropdown>
        <Text style={{ color: tokens.colorNeutralForeground2 }}>
          共 {filteredStocks.length} 只股票
        </Text>
      </div>

      {/* 消息提示 */}
      {message && (
        <MessageBar intent={message.type === 'success' ? 'success' : 'error'}>
          <MessageBarBody>{message.text}</MessageBarBody>
        </MessageBar>
      )}

      {/* 股票列表 */}
      <div className={styles.tableContainer}>
        <Table aria-label="股票列表" size="small">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>代码</TableHeaderCell>
              <TableHeaderCell>名称</TableHeaderCell>
              <TableHeaderCell>行业</TableHeaderCell>
              <TableHeaderCell>最新价</TableHeaderCell>
              <TableHeaderCell>涨跌额</TableHeaderCell>
              <TableHeaderCell>涨跌幅</TableHeaderCell>
              <TableHeaderCell>趋势</TableHeaderCell>
              <TableHeaderCell>持仓</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map(stock => {
              const position = getPositionByStockId(stock.id);
              return (
                <TableRow
                  key={stock.id}
                  className={styles.stockRow}
                  onClick={() => setSelectedStock(stock)}
                >
                  <TableCell>
                    <TableCellLayout>
                      <Text className={styles.stockCode}>{stock.code}</Text>
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>
                    <TableCellLayout>{stock.name}</TableCellLayout>
                  </TableCell>
                  <TableCell>
                    <TableCellLayout>
                      <Badge appearance="tint">
                        {INDUSTRIES.find(i => i.id === stock.industry)?.name || stock.industry}
                      </Badge>
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>
                    <TableCellLayout>
                      <Text weight="semibold">¥{stock.currentPrice.toFixed(2)}</Text>
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>
                    <TableCellLayout>
                      <Text className={stock.dayChange >= 0 ? styles.priceUp : styles.priceDown}>
                        {stock.dayChange >= 0 ? '+' : ''}{stock.dayChange.toFixed(2)}
                      </Text>
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>
                    <TableCellLayout>
                      <Text className={stock.dayChangePercent >= 0 ? styles.priceUp : styles.priceDown}>
                        {stock.dayChangePercent >= 0 ? '+' : ''}{stock.dayChangePercent.toFixed(2)}%
                      </Text>
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>
                    <TableCellLayout>
                      {stock.trend === 'up' && <ArrowUpRegular style={{ color: tokens.colorPaletteRedForeground1 }} />}
                      {stock.trend === 'down' && <ArrowTrendingDownRegular style={{ color: tokens.colorPaletteGreenForeground1 }} />}
                      {stock.trend === 'stable' && <ArrowSwapRegular style={{ color: tokens.colorNeutralForeground2 }} />}
                    </TableCellLayout>
                  </TableCell>
                  <TableCell>
                    <TableCellLayout>
                      {position ? (
                        <Badge appearance="filled" color="brand">
                          {position.shares}股
                        </Badge>
                      ) : (
                        <Text style={{ color: tokens.colorNeutralForeground3 }}>-</Text>
                      )}
                    </TableCellLayout>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 股票详情和交易 */}
      {selectedStock && (
        <Card>
          <CardHeader
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Text weight="semibold" size={400}>{selectedStock.name}</Text>
                <Text style={{ color: tokens.colorBrandForeground1 }}>{selectedStock.code}</Text>
                <Badge appearance="tint">
                  {INDUSTRIES.find(i => i.id === selectedStock.industry)?.name}
                </Badge>
              </div>
            }
          />
          <Card>
            <div className={styles.detailPanel}>
              {/* 左侧：图表和信息 */}
              <div className={styles.detailLeft}>
                <div className={styles.stockInfo}>
                  <div className={styles.infoRow}>
                    <Text>最新价</Text>
                    <Text weight="semibold" size={400}>¥{selectedStock.currentPrice.toFixed(2)}</Text>
                  </div>
                  <div className={styles.infoRow}>
                    <Text>今日涨跌</Text>
                    <Text className={selectedStock.dayChange >= 0 ? styles.priceUp : styles.priceDown}>
                      {formatChange(selectedStock.dayChange, selectedStock.dayChangePercent)}
                    </Text>
                  </div>
                  <div className={styles.infoRow}>
                    <Text>波动率</Text>
                    <Text>{(selectedStock.volatility * 100).toFixed(1)}%</Text>
                  </div>
                  <div className={styles.infoRow}>
                    <Text>描述</Text>
                    <Text>{selectedStock.description}</Text>
                  </div>
                </div>

                {/* K线图 */}
                <div className={styles.chartContainer}>
                  <Text weight="semibold" style={{ marginBottom: '8px', display: 'block' }}>价格走势</Text>
                  <ResponsiveContainer width="100%" height="150px">
                    <LineChart data={selectedStock.history.slice(-50)}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <RechartsTooltip
                        formatter={(value: number) => `¥${value.toFixed(2)}`}
                        labelFormatter={() => ''}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={tokens.colorBrandForeground1}
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 右侧：交易面板 */}
              <div className={styles.detailRight}>
                <Card className={styles.tradeCard}>
                  <div className={styles.tradeHeader}>
                    <TabList
                      selectedValue={tradeType}
                      onTabSelect={(_, data) => setTradeType(data.value as 'buy' | 'sell')}
                    >
                      <Tab value="buy">买入</Tab>
                      <Tab value="sell">卖出</Tab>
                    </TabList>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.inputRow}>
                      <Text>价格:</Text>
                      <Text weight="semibold">¥{selectedStock.currentPrice.toFixed(2)}</Text>
                    </div>

                    <div className={styles.inputRow}>
                      <Text>数量:</Text>
                      <Input
                        type="number"
                        value={shares.toString()}
                        onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 0))}
                        min={1}
                        style={{ width: '120px' }}
                      />
                      <Text>股</Text>
                    </div>

                    <div className={styles.quickButtons}>
                      <Button size="small" onClick={() => quickSetShares(25)}>25%</Button>
                      <Button size="small" onClick={() => quickSetShares(50)}>50%</Button>
                      <Button size="small" onClick={() => quickSetShares(75)}>75%</Button>
                      <Button size="small" onClick={() => quickSetShares(100)}>全仓</Button>
                    </div>

                    <Divider />

                    <div className={styles.inputRow}>
                      <Text>交易金额:</Text>
                      <Text weight="semibold">¥{tradeAmount.toFixed(2)}</Text>
                    </div>
                    <div className={styles.inputRow}>
                      <Text>手续费:</Text>
                      <Text>¥{fee.toFixed(2)}</Text>
                    </div>
                    <div className={styles.inputRow}>
                      <Text weight="semibold">合计:</Text>
                      <Text weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                        ¥{totalCost.toFixed(2)}
                      </Text>
                    </div>

                    {tradeType === 'buy' && (
                      <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
                        可用资金: ¥{cash.toLocaleString()}
                      </Caption1>
                    )}
                    {tradeType === 'sell' && selectedPosition && (
                      <Caption1 style={{ color: tokens.colorNeutralForeground2 }}>
                        持仓: {selectedPosition.shares}股 · 成本 ¥{selectedPosition.averageCost.toFixed(2)}
                      </Caption1>
                    )}
                    {tradeType === 'sell' && !selectedPosition && (
                      <Caption1 style={{ color: tokens.colorPaletteRedForeground1 }}>
                        您没有持有该股票
                      </Caption1>
                    )}

                    <Button
                      appearance="primary"
                      style={{
                        marginTop: '12px',
                        backgroundColor: tradeType === 'buy' ? tokens.colorBrandBackground : tokens.colorPaletteRedBackground3,
                      }}
                      onClick={handleTrade}
                      disabled={tradeType === 'sell' && !selectedPosition}
                    >
                      {tradeType === 'buy' ? '确认买入' : '确认卖出'}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </Card>
      )}

      {/* 交易记录 */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader header={<Text weight="semibold">交易记录</Text>} />
          <Card>
            <div className={styles.historyList}>
              {transactions.slice(-10).reverse().map(tx => (
                <div key={tx.id} className={styles.historyItem}>
                  <div>
                    <Badge
                      appearance="filled"
                      color={tx.type === 'buy' ? 'brand' : 'danger'}
                    >
                      {tx.type === 'buy' ? '买入' : '卖出'}
                    </Badge>
                    <Text style={{ marginLeft: '8px' }}>{tx.stockName}</Text>
                    <Caption1 style={{ marginLeft: '8px' }}>
                      {tx.shares}股 @ ¥{tx.price.toFixed(2)}
                    </Caption1>
                  </div>
                  <Text weight="semibold">
                    ¥{tx.totalAmount.toFixed(2)}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Card>
      )}
    </div>
  );
}
