import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { useUserId } from '../context/userContext';
import { useList } from 'react-firebase-hooks/database'
import styled from 'styled-components'
import Container from 'react-bootstrap/Container'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Badge from 'react-bootstrap/Badge'
import ListGroup from 'react-bootstrap/ListGroup'

const Title = styled.h1`
  font-size: 2.5em;
  text-align: center;
  color: darkslateblue;
`;

// the results should checked which player had the most votes, and see their actual role
// if the actual role is werewolf, villagers win
// if the actual role is not werewolf, werewolfs win
// if the actual role is tanner, tanner wins
// if the hunter dies but pointing at a werewolf, villagers win
// if a werewolf and villager got same number of votes, villagers win
// if no werewolves but there is a minion, werewolf team wins if minion lives, but also wins if no one dies? so scratch the official rules, villagers win if minion dies
// if no werewolf and all votes are equal, villagers win

const GameEnd = () => {
  return (
    <React.Fragment>
      <Container>
        <Title><Badge variant="dark">Result</Badge></Title>
      </Container>
    </React.Fragment>
  )
}

export default GameEnd

