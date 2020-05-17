import React from 'react'
// import { db } from '../firebase/index'

function GameSession({match}) {
  // const [gameSessionRef] = useState(db.ref(`/gameSessions/${match.params.id}`));
  // const [players] = useState(gameSessionRef.child('players'))

  // maybe destroy lobby in here instead?

  return (
    <div>
      <h1>This is the game session</h1>
    </div>
  )
}

export default GameSession
