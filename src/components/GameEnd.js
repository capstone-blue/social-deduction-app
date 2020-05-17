import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { useUserId } from '../context/userContext';
import { useList, useObjectVal } from 'react-firebase-hooks/database'
import styled from 'styled-components'
import Container from 'react-bootstrap/Container'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'

const Title = styled.h1`
  font-size: 2.5em;
  text-align: center;
  color: darkslateblue;
`;

const GameEnd = ({ match }) => {
  const [userId] = useUserId();
  const [gameSessionId] = useState(match.params.id)
  const [gameSessionRef] = useState(db.ref(`/gameSessions/${gameSessionId}`));
  const [players] = useList(gameSessionRef.child('players'))
  const [playerRef] = useState(db.ref(`/gameSessions/${gameSessionId}/players/${userId}`))
  const [voteStatusRef] = useState(db.ref(`/gameSessions/${gameSessionId}/players/${userId}/votedAgainst`))
  const [playerInfo] = useObjectVal(playerRef)
  const [isHost, setIsHost] = useState(false)
  const [winner, setWinner] = useState('')

  useEffect(() => {
    function setWinningTeam() {
      try {
        gameSessionRef.child('winner').once('value').then(function (snapshot) {
          setWinner(snapshot.val())
        })
      } catch (e) {
        console.error('Error in GameEnd setWinningTeam', e.message)
      }
    }
    setWinningTeam()
  }, [gameSessionRef])

  return (
    <React.Fragment>
      <Container>
        <Title><Badge variant="dark">Result</Badge></Title>
        <Title><Badge variant="Danger">{winner} Win!</Badge></Title>
      </Container>
    </React.Fragment>
  )
}

export default GameEnd

