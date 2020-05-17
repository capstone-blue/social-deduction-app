import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { useUserId } from '../context/userContext';
import { useList, useObject, useObjectVal } from 'react-firebase-hooks/database'
import styled from 'styled-components'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import Form from 'react-bootstrap/Form'

const Title = styled.h1`
  font-size: 2.5em;
  text-align: center;
  color: darkslateblue;
`;

const GameEnd = ({ match, history }) => {
  const [userId] = useUserId();
  const [gameSessionId] = useState(match.params.id)
  const [gameSessionRef] = useState(db.ref(`/gameSessions/${gameSessionId}`));
  const [players] = useList(gameSessionRef.child('players'))
  const [playerRef] = useState(db.ref(`/gameSessions/${gameSessionId}/players/${userId}`))
  const [playerInfo] = useObjectVal(playerRef)
  const [isHost, setIsHost] = useState(false)
  const [winner, setWinner] = useState('')
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [usersRef] = useState(db.ref().child('users'));
  const [lobbyName, setLobbyName] = useState('');
  const [userSnap, userLoading] = useObject(usersRef.child(userId));


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
    function checkIfHost() {
      db.ref(`/gameSessions/${gameSessionId}/players/${userId}/host`).once('value').then((snapshot) => {
        if (snapshot.exists()) {
          setIsHost(true)
        }
      })
    }
    setWinningTeam()
    checkIfHost()
  }, [gameSessionRef, gameSessionId, userId])




  async function createLobby() {
    try {
      const lobbySnap = await lobbiesRef.push({
        name: lobbyName,
        status: "pending",
        players: { [userSnap.key]: { ...userSnap.val(), host: true } },
      });
      await db.ref().child('users').child(userId).update({ ...userSnap.val, inLobby: true })
      setLobbyName('');
      history.push(`/lobbies/${lobbySnap.key}`);
    } catch (e) {
      console.error('Error in createLobby', e.message);
    }
  }


  async function joinLobby() {
    try {
      const lobbySnaps = await lobbiesRef
        .orderByChild('name')
        .equalTo(lobbyName)
        .once('value');

      lobbySnaps.forEach((l) => {
        lobbiesRef
          .child(l.key)
          .child('players')
          .update({ [userSnap.key]: userSnap.val() });
        setLobbyName('');
        history.push(`/lobbies/${l.key}`);
        return true;
      });
      await db.ref().child('users').child(userId).update({ ...userSnap.val, inLobby: true })
    } catch (e) {
      console.error('Error in joinLobby', e.message);
    }
  }

  return (
    <React.Fragment>
      <Container>
        <Title><Badge variant="dark">Result</Badge></Title>
        <Title><Badge variant="danger">{winner} Win!</Badge></Title>
      </Container>
      <Container>
        <Title>Start New Game?</Title>
        <Row>
          <Form.Control size="sm" type="text" placeholder="Lobby Name" onChange={(e) => setLobbyName(e.target.value)}
            value={lobbyName} />
        </Row>
        <Row>
          <Col>
            {!isHost ? <Button variant="dark" onClick={joinLobby}>Join Lobby</Button> : null}
            {isHost ? <Button variant="dark" onClick={createLobby}>Create Lobby</Button> : <p>Waiting on host to create new lobby...</p>}
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  )
}

export default GameEnd

