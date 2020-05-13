import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import { GameStart, AliasModal } from './index'
import Container from 'react-bootstrap/Container'
import styled from 'styled-components';

const Title = styled.h1`
  font-size: 1.5em;
  ${'' /* text-align: center; */}
  color: darkslateblue;
`;

const SubTitle = styled.h2`
  font-size: 1.5em;
  ${'' /* text-align: center; */}
  color: darkslateblue;
`;

const Text = styled.h3`
  font-size: 1.5em;
  ${'' /* text-align: center; */}
  color: darkslateblue;
`;

// Main logic should be handled in this component
function LobbyPage({ match, history }) {
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [gameStarted, setGameStarted] = useState(false)


  return lobbyLoading ? (
    <div>...Loading</div>
  ) : (
      <Container>
        <AliasModal match={match} />
        <LobbyView players={Object.entries(lobby.players)} name={lobby.name} />
        <GameStart players={Object.entries(lobby.players)} match={match} history={history} setGameStarted={setGameStarted} gameStarted={gameStarted} />
      </Container>
    );
}

function LobbyView({ name, players }) {
  const [host, setHost] = useState({});
  const [members, setMembers] = useState([]);
  useEffect(() => {
    const m = [];
    let h = {};

    players.forEach((playerEntry) => {
      const [, player] = playerEntry;
      if (player.host) h = player;
      else m.push(playerEntry);
    });

    setHost(h);
    setMembers(m);
  }, [players]);

  return (
    <React.Fragment>
      <Container>
        <Title>Lobby</Title>
        <SubTitle>{name}</SubTitle>
        <Container>
          <Text>host</Text>
          <Container>{host.alias ? host.alias : '(...)'}</Container>
        </Container>
        <Container>
          <Text>members</Text>
          <Container>
            {members.map((m) => {
              const [id, player] = m;
              return <Container key={id}>{player.alias ? player.alias : '(...)'}</Container>;
            })}
          </Container>
        </Container>
      </Container>
    </React.Fragment>
  );
}

export default LobbyPage;
