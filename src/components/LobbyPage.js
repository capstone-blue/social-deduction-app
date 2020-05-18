import React, { useState } from 'react';
import { db } from '../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import { GameStart, AliasModal, LobbyView, NavigationBar } from './index';
import Container from 'react-bootstrap/Container';

// Main logic should be handled in this component
function LobbyPage({ match, history }) {
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [gameStarted, setGameStarted] = useState(false);

  return lobbyLoading ? (
    <Container>...Loading</Container>
  ) : (
    <React.Fragment>
      <NavigationBar />
      <Container>
        <AliasModal match={match} />
        <LobbyView players={Object.entries(lobby.players)} name={lobby.name} />
        <GameStart
          players={Object.entries(lobby.players)}
          match={match}
          history={history}
          setGameStarted={setGameStarted}
          gameStarted={gameStarted}
        />
      </Container>
    </React.Fragment>
  );
}

export default LobbyPage;
