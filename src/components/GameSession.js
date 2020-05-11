import React, { useState } from 'react'
import { db } from '../firebase/index'

function GameSession({match}) {
  const [gameSessionRef] = useState(db.ref(`/gameSessions/${match.params.id}`));
  const [players] = useState(gameSessionRef.child('players'))

  return (
    <div>
      <h1>This is the game session</h1>
    </div>
  )
}

export default GameSession
