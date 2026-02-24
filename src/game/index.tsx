import { useState, useEffect } from 'react'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import { useGameStore } from './store'
import { GameStartScreen } from './components/GameStartScreen'
import { GameMain } from './components/GameMain'

export default function StockGame() {
  const [started, setStarted] = useState(false)
  const { gameStarted } = useGameStore()

  useEffect(() => {
    if (gameStarted) {
      setStarted(true)
    }
  }, [gameStarted])

  return (
    <FluentProvider theme={webLightTheme}>
      <div style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'auto',
        minHeight: '100vh'
      }}>
        {!started ? (
          <GameStartScreen />
        ) : (
          <GameMain />
        )}
      </div>
    </FluentProvider>
  )
}
