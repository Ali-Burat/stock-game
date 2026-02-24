import { useState, useEffect } from 'react'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import { useGameStore } from './store'
import { GameStartScreen } from './components/GameStartScreen'
import { GameMain } from './components/GameMain'

export default function StockGame() {
  const { isPlaying, startGame, getSaveList } = useGameStore()
  const [showLoadPanel, setShowLoadPanel] = useState(false)
  
  // 检查是否有存档
  const hasSaves = getSaveList().length > 0

  // 处理开始游戏
  const handleStartGame = (config: any) => {
    startGame(config)
  }

  // 处理读取存档
  const handleLoadGame = () => {
    setShowLoadPanel(true)
  }

  return (
    <FluentProvider theme={webLightTheme}>
      <div style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'auto',
        minHeight: '100vh'
      }}>
        {!isPlaying ? (
          <GameStartScreen 
            onStartGame={handleStartGame}
            onLoadGame={handleLoadGame}
            hasSaves={hasSaves}
          />
        ) : (
          <GameMain />
        )}
      </div>
    </FluentProvider>
  )
}
