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

// list of players to vote for shows up
// when the user clicks on a player, the button should be selected
// when the button is selected, the vote should go against that selected player
// the results should checked which player had the most votes, and see their actual role
// if the actual role is werewolf, villagers win
// if the actual role is not werewolf, werewolfs win
// if the actual role is tanner, tanner wins
// if the hunter dies but pointing at a werewolf, villagers win
// if a werewolf and villager got same number of votes, villagers win
// if no werewolves but there is a minion, werewolf team wins if minion lives, but also wins if no one dies? so scratch the official rules, villagers win if minion dies

const VotingPage = ({ match }) => {
  const [gameSessionRef] = useState(db.ref(`/gameSessions/${match.params.id}`));
  const [players] = useList(gameSessionRef.child('players'))
  const [userId] = useUserId();
  const [gameSessionId] = useState(match.params.id)
  const [voted, setVoted] = useState(false)

  function showPlayers() {
    console.log(players)
  }

  useEffect(() => {
    function listenOnVoteStatus() {
      const voteStatusRef = db.ref(`/gameSessions/${gameSessionId}/players/${userId}/voted`)
      try {
        voteStatusRef.on('value', function (snapshot) {
          if (snapshot.val() === true) {
            setVoted(true)
            voteStatusRef.off()
          }
        })
      } catch (e) {
        console.error('Error in VotingPage vote status listener', e.message)
      }
    } listenOnVoteStatus()
  }, [userId, gameSessionId])

  async function vote(selectedPlayer) {
    // if you click on a player, it will set a new vote property onto the game session with that player role
    // or should there be a use effect when entering the vote screen that adds all the players's roles into the game session then increment as voting happens?
    // but we also want to display the votes across all player screens to incite tension

    console.log(selectedPlayer)

    // set voted status in lobby instead because local state changes on refresh
    if (!voted) {
      await gameSessionRef.child('players').child(selectedPlayer.key).update({ ...selectedPlayer.val(), votes: selectedPlayer.val().votes + 1, voted: true })
    } else {
      alert('You already voted!')
    }
  }

  return (
    <React.Fragment>
      <Container>
        <Title><Badge variant="dark">Vote</Badge></Title>
        <ProgressBar now={60} label='Time Remaining: ' />
        <Container>
          <ListGroup>
            <ListGroup.Item action onClick={showPlayers}>console.log(players)</ListGroup.Item>
            {players.map(player =>
              <ListGroup.Item key={player.key} action onClick={() => vote(player)}>
                <Container>
                  <Badge variant="info">{player.val().alias}</Badge>
                  <Badge variant="danger">Votes: {player.val().votes}</Badge>
                </Container>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Container>
      </Container>
    </React.Fragment>
  )
}

export default VotingPage

