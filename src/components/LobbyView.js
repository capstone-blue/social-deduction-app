import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
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
              return (
                <Container key={id}>
                  {player.alias ? player.alias : '(...)'}
                </Container>
              );
            })}
          </Container>
        </Container>
      </Container>
    </React.Fragment>
  );
}

export default LobbyView;
