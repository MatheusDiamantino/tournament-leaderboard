import React from 'react'
import Leaderboard from './components/Leaderboard'
import './App.css'

function App() {
  return (
    <div className="App">
      <Leaderboard 
        tournamentId={1994}
        instanceId="REMOVIDO"
      />
    </div>
  )
}

export default App
