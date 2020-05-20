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
  color: #ffc108;
  margin-bottom: 3rem;
`;

const ContentContainer = styled.div`
  height: auto;
  margin: 0 auto;
  min-width: 40%;
  padding: 2rem 2rem;
  border-radius: 0.25rem;
  border-top: 8px solid #c22c31;
  border-bottom: 8px solid #c22c31;
  background-color: #eaeaea;
  @media (min-width: 768px) {
    width: 70%;
  }
`;

const ContentText = styled.p`
  color: #23272b;
`;

const LobbyInput = styled(Form.Control)`
  &[type='text'] {
    background-color: #eaeaea;
    border-bottom: 2px solid #a0aec0;
    border-radius: 0px;
    &:focus {
      outline: none !important;
      border-bottom: 2px solid #c22c31;
      box-shadow: none;
      color: #c22c31;
    }
  }
  margin-bottom: 1rem;
  ::placeholder {
    color: #a0aec0;
  }
  background-image: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
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
          <Col className="mx-auto">
            <ContentText>
              Welcome to the{' '}
              <span style={{ color: '#c22c31' }}>
                One Night: Ultimate Werewolf
              </span>{' '}
              clone. If you&apos;re hosting a match, go ahead and create a
              lobby. Otherwise, enter your friend&apos;s lobby name and join
              their game!
            </ContentText>
          </Col>
        </Row>
        <Row>
          <Col className="mx-auto text-center">
            <LobbyInput
              type="text"
              placeholder="enter a lobby name"
              onChange={(e) => setLobbyName(e.target.value)}
              value={lobbyName}
            />
          </Col>
        </Row>
        <Row className="mb-1">
          <Col className="mx-auto" lg="auto">
            <Button
              variant="dark"
              onClick={joinLobby}
              disabled={lobbyName ? false : true}
            >
              Join Lobby
            </Button>
          </Col>
        </Row>
        <Row>
          <Col className="mx-auto" lg="auto">
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
        </Row>
      </ContentContainer>
    </PageContainer>
  );
}

export default HomePage;
