import React, { useState } from 'react';
import { db } from '../firebase';
import { useObject } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'


const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: darkslateblue;
`;

function HomePage(props) {
  return (
    <div>
      <LobbyForm {...props} />
    </div>
  );
}

function LobbyForm({ history }) {
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [usersRef] = useState(db.ref().child('users'));

  const [lobbyName, setLobbyName] = useState('');
  const [userId] = useUserId();
  const [userSnap, userLoading] = useObject(usersRef.child(userId));

  async function createLobby() {
    try {
      const lobbySnap = await lobbiesRef.push({
        name: lobbyName,
        status: "pending",
        players: { [userSnap.key]: { ...userSnap.val(), host: true } },
      });
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

      if (!lobbySnaps.val()) {
        setLobbyName('');
        throw new Error(`Cannot find lobby with name ${lobbyName}`);
      }

      lobbySnaps.forEach((l) => {
        lobbiesRef
          .child(l.key)
          .child('players')
          .update({ [userSnap.key]: userSnap.val() });
        setLobbyName('');
        history.push(`/lobbies/${l.key}`);
        return true;
      });
    } catch (e) {
      console.error('Error in joinLobby', e.message);
    }
  }

  return userLoading ? (
    <div>Loading...</div>
  ) : (
      <React.Fragment>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand>
            <img
              alt=""
              src="../../public/logo.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />One Night Ultimate Werewolf
    </Navbar.Brand>
        </Navbar>
        <Container>
          <Title>Create or Join a Lobby</Title>
          <Row>
            <Form.Control size="sm" type="text" placeholder="Lobby Name" onChange={(e) => setLobbyName(e.target.value)}
              value={lobbyName} />
          </Row>
          <Row>
            <Col>
              <Button variant="dark" onClick={joinLobby}>Join Lobby</Button>
              <Button variant="dark" onClick={createLobby}>Create Lobby</Button>
            </Col>
          </Row>
        </Container>
      </React.Fragment>
    );
}

export default HomePage;
