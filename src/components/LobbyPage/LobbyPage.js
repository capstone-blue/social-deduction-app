import React, { useState } from 'react';
import { db } from '../../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import GameStart from './GameStart';
import AliasModal from './AliasModal';
import PlayersList from './PlayersList';
import Container from 'react-bootstrap/Container';

const PageContainer = styled(Container)`
  position: relative;
  margin-top: 2rem;
  text-align: center;
  z-index: 1;
`;

const PageTitle = styled.h1`
  color: white;
  margin-bottom: 3rem;
`;

const TitleSpan = styled.span`
  color: white;
  text-decoration: underline;
  text-decoration-color: #c22c31;
`;

// Main logic should be handled in this component
function LobbyPage({ match, history }) {
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [gameStarted, setGameStarted] = useState(false);

  return lobbyLoading ? (
    <Container>...Loading</Container>
  ) : (
    <PageContainer>
      <PageTitle>
        Lobby <TitleSpan>{lobby.name}</TitleSpan>
      </PageTitle>
      <Row>
        <Col>
          <PlayersList players={Object.entries(lobby.players)} />
        </Col>
        <Col className="d-flex align-items-center">
          <GameStart
            players={Object.entries(lobby.players)}
            match={match}
            history={history}
            setGameStarted={setGameStarted}
            gameStarted={gameStarted}
          />
        </Col>
      </Row>
      <AliasModal match={match} players={Object.entries(lobby.players)} />
    </PageContainer>
  );
}

export default LobbyPage;
