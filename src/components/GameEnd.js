import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useUserId } from '../context/userContext';
import {
  useList,
  useObject,
  useObjectVal,
} from 'react-firebase-hooks/database';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';

const Title = styled.h1`
  font-size: 2.5em;
  text-align: center;
  color: darkslateblue;
`;

const GameEnd = ({ match, history }) => {
  const [userId] = useUserId();
  const [gameSessionId] = useState(match.params.id);
  const [gameSessionRef] = useState(db.ref(`/gameSessions/${gameSessionId}`));
  const [players] = useList(gameSessionRef.child('players'));
  const [playerRef] = useState(
    db.ref(`/gameSessions/${gameSessionId}/players/${userId}`)
  );
  const [isHost, setIsHost] = useState(false);
  const [winner, setWinner] = useState('');
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [newLobbyRef] = useState(gameSessionRef.child('newLobby'));
  const [usersRef] = useState(db.ref().child('users'));
  const [lobbyName, setLobbyName] = useState('');
  const [userSnap, userLoading] = useObject(usersRef.child(userId));

  useEffect(() => {
    function setWinningTeam() {
      try {
        gameSessionRef
          .child('winner')
          .once('value')
          .then(function (snapshot) {
            setWinner(snapshot.val());
          });
      } catch (e) {
        console.error('Error in GameEnd setWinningTeam', e.message);
      }
    }
    function checkIfHost() {
      db.ref(`/gameSessions/${gameSessionId}/players/${userId}/host`)
        .once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            setIsHost(true);
          }
        });
    }
    function listenOnNewLobby() {
      try {
        newLobbyRef.on('value', function (snapshot) {
          if (snapshot.exists() && !isHost) {
            setLobbyName(snapshot.val());
          }
        });
      } catch (e) {
        console.error('Error in GameStart lobby listener', e.message);
      }
    }
    setWinningTeam();
    checkIfHost();
    listenOnNewLobby();
  }, [gameSessionRef, gameSessionId, userId, isHost]);

  async function createLobby() {
    try {
      const lobbySnap = await lobbiesRef.push({
        name: lobbyName,
        status: 'pending',
        players: { [userSnap.key]: { ...userSnap.val(), host: true } },
      });
      await db
        .ref()
        .child('users')
        .child(userId)
        .update({ ...userSnap.val, inLobby: true });
      await gameSessionRef.child('newLobby').set(lobbyName);
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
      await db
        .ref()
        .child('users')
        .child(userId)
        .update({ ...userSnap.val, inLobby: true });
      await newLobbyRef.off();
    } catch (e) {
      console.error('Error in joinLobby', e.message);
    }
  }

  return (
    <React.Fragment>
      <Container>
        <Title>
          <Badge variant="dark">Result</Badge>
        </Title>
        <Title>
          <Badge variant="danger">
            {winner} {winner === 'Tanner' ? 'Wins!' : 'Win!'}
          </Badge>
        </Title>
        <Container>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
              </tr>
              <tr>
                <td>3</td>
                <td colSpan="2">Larry the Bird</td>
                <td>@twitter</td>
              </tr>
            </tbody>
          </Table>
        </Container>
      </Container>
      <Container>
        <Title>Start New Game?</Title>
        <Row>
          <Form.Control
            size="sm"
            type="text"
            placeholder="Lobby Name"
            onChange={(e) => setLobbyName(e.target.value)}
            value={lobbyName}
          />
        </Row>
        <Row>
          <Col>
            {!isHost && lobbyName ? (
              <Button variant="dark" onClick={joinLobby}>
                Join Lobby
              </Button>
            ) : null}
            {!isHost && !lobbyName ? (
              <p>Waiting on host to create new lobby...</p>
            ) : null}
            {isHost ? (
              <Button variant="dark" onClick={createLobby}>
                Create Lobby
              </Button>
            ) : null}
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default GameEnd;
