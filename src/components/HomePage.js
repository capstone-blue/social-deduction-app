/* eslint no-unneeded-ternary: 0 */
import React, { useState } from 'react';
import { db } from '../firebase';
import { useObject } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const PageContainer = styled(Container)`
  position: relative;
  margin-top: 2rem;
  text-align: center;
  z-index: 1;
`;

const PageTitle = styled.h1`
  color: #f6e05e;
  margin-bottom: 3rem;
`;

const ContentContainer = styled.div`
  height: auto;
  margin: 0 auto;
  width: 40%;
  padding: 1rem 1rem;
  border-radius: 0.5rem;
  border-bottom: 6px solid #9b2c2c;
  background-color: #718096;
`;

const LobbyInput = styled(Form.Control)`
  &[type='text'] {
    background-color: white;
  }
  margin-bottom: 1rem;
  ::placeholder {
    color: #a0aec0;
  }
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

  // function checkIfAlreadyInALobby() {
  //   // await db.ref().child('users').child(userId);
  //   // .set({ signedIn: true })
  //   console.log(userSnap.val().inLobby);
  // }

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
      console.log(lobbySnaps);
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
      await db
        .ref()
        .child('users')
        .child(userId)
        .update({ ...userSnap.val, inLobby: true });
    } catch (e) {
      console.error('Error in joinLobby', e.message);
    }
  }

  return userLoading ? (
    <div>Loading...</div>
  ) : (
    <PageContainer>
      <PageTitle>One Night: Ultimate Werewolf</PageTitle>

      <ContentContainer>
        <Row>
          <Col>
            <LobbyInput
              type="text"
              placeholder="enter a lobby name"
              onChange={(e) => setLobbyName(e.target.value)}
              value={lobbyName}
            />
          </Col>
        </Row>
        <Row>
          <Col />
          <Col lg="auto">
            <Button
              variant="dark"
              onClick={joinLobby}
              disabled={lobbyName ? false : true}
            >
              Join Lobby
            </Button>
            <Button
              variant="dark"
              onClick={createLobby}
              disabled={lobbyName ? false : true}
            >
              Create Lobby
            </Button>
            {/* <Button variant="dark" onClick={checkIfAlreadyInALobby}>
                Check if already in a lobby
              </Button> */}
          </Col>
          <Col />
        </Row>
      </ContentContainer>
    </PageContainer>
  );
}

export default HomePage;
