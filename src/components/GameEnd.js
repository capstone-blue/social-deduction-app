import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useUserId } from '../context/userContext';
import { useList, useObject } from 'react-firebase-hooks/database';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';

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
  const [isHost, setIsHost] = useState(false);
  const [winner, setWinner] = useState('');
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [newLobbyRef] = useState(gameSessionRef.child('newLobby'));
  const [usersRef] = useState(db.ref().child('users'));
  const [lobbyName, setLobbyName] = useState('');
  const [userSnap] = useObject(usersRef.child(userId));
  const [deadPlayers] = useList(gameSessionRef.child('deadPlayers'));

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

  console.log(players);

  return (
    <React.Fragment>
      <Container>
        <Title>
          <Badge variant="danger">
            {winner} {winner === 'Tanner' ? 'Wins!' : 'Win!'}
          </Badge>
        </Title>
        <Badge variant="dark">Who died?</Badge>
        <ListGroup horizontal>
          {deadPlayers ? (
            deadPlayers.map((player) => (
              <ListGroup.Item key={player.key}>{player.val()}</ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>Nobody died!</ListGroup.Item>
          )}
        </ListGroup>
        <Container>
          <Table size="sm" striped bordered variant="dark">
            <thead>
              <tr>
                <th>Player</th>
                <th>Starting Role</th>
                <th>Final Role</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.key}>
                  <td>{player.val().alias}</td>
                  <td>{player.val().startingRole.name}</td>
                  <td>{player.val().actualRole.name}</td>
                </tr>
              ))}
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
