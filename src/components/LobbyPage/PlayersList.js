import React from 'react';
import Container from 'react-bootstrap/Container';
import styled from 'styled-components';

const PlayerTitle = styled.h2`
  color: #18a2b8;
`;

const PlayerContainer = styled.div`
  color: #eaeaea;
  height: auto;
  padding: 2rem 2rem;
  border-radius: 0.25rem;
  background: rgba(52, 58, 64, 0.65);
`;

function PlayersList({ players }) {
  return (
    <Container>
      <PlayerTitle>Players</PlayerTitle>
      <PlayerContainer>
        {players.map((m) => {
          const [id, player] = m;
          return (
            <Container key={id}>
              {player.alias ? player.alias : '(...)'}{' '}
              {player.host ? '(host)' : ''}
            </Container>
          );
        })}
      </PlayerContainer>
    </Container>
  );
}

export default PlayersList;
