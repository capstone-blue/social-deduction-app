import React, { useState } from 'react';
import { db } from '../../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import GameStart from './GameStart';
import AliasModal from './AliasModal';
import LobbyView from './LobbyView';
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
      <Container>
        <AliasModal match={match} players={Object.entries(lobby.players)} />
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
