import React from 'react';
import { useUserId } from '../../context/userContext';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import AliasModal from './AliasModal';

const PlayerTitle = styled.h2`
  color: #18a2b8;
`;

const PlayerContainer = styled.div`
  color: white;
  height: auto;
  padding: 2rem 2rem;
  border-radius: 0.25rem;
  background: rgba(52, 58, 64, 0.65);
`;

function PlayersList({ players, match }) {
  const [userId] = useUserId();
  return (
    <Container>
      <PlayerTitle>Players</PlayerTitle>
      <PlayerContainer>
        {players.map((p) => {
          const [id, player] = p;
          const { alias, host } = player;
          return (
            <Row key={id}>
              <Col>
                {alias ? alias : '(...)'}{' '}
                {host ? <span style={{ color: '#18A2B8' }}>(host)</span> : ''}{' '}
              </Col>
              <Col xs={3}>
                {id === userId ? (
                  <AliasModal match={match} currPlayer={p} />
                ) : (
                  ''
                )}
              </Col>
            </Row>
          );
        })}
      </PlayerContainer>
    </Container>
  );
}

export default PlayersList;
