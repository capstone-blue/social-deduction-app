import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { useUserId } from '../context/userContext';
import { useList, useObjectVal } from 'react-firebase-hooks/database'
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


const VotingPage = ({ match }) => {
  const [gameSessionRef] = useState(db.ref(`/gameSessions/${match.params.id}`));
  const [players] = useList(gameSessionRef.child('players'))
  const [userId] = useUserId();
  const [gameSessionId] = useState(match.params.id)
  const [playerRef] = useState(db.ref(`/gameSessions/${gameSessionId}/players/${userId}`))
  const [voteStatusRef] = useState(db.ref(`/gameSessions/${gameSessionId}/players/${userId}/voted`))
  const [playerInfo] = useObjectVal(playerRef)
  const [voted, setVoted] = useState(false)

  function showPlayers() {
    console.log(players)
  }

  useEffect(() => {
    function listenOnVoteStatus() {
      try {
        voteStatusRef.on('value', function (snapshot) {
          if (snapshot.val() === true) {
            setVoted(true)
            // voteStatusRef.off()
          } else if (snapshot.val() === false) {
            setVoted(false)
          }
        })
      } catch (e) {
        console.error('Error in VotingPage vote status listener', e.message)
      }
    } listenOnVoteStatus()
  }, [userId, gameSessionId, voteStatusRef])

  async function vote(selectedPlayer) {
    // if you click on a player, it will set a new vote property onto the game session with that player role
    // or should there be a use effect when entering the vote screen that adds all the players's roles into the game session then increment as voting happens?
    // but we also want to display the votes across all player screens to incite tension
    if (!voted) {
      // updated the selected player's vote count +1
      await gameSessionRef.child('players').child(selectedPlayer.key).update({ ...selectedPlayer.val(), votes: selectedPlayer.val().votes + 1 })
      // update the voter's voted status to true
      await playerRef.update({...playerInfo, voted: true})
    } else {
      alert('You already voted!')
    }
  }

  async function unvote(selectedPlayer) {
    // updated the selected player's vote count -1
    await gameSessionRef.child('players').child(selectedPlayer.key).update({ ...selectedPlayer.val(), votes: selectedPlayer.val().votes - 1 })
    // update the voter's voted status back to false
    await playerRef.update({...playerInfo, voted: false })
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
              <ListGroup.Item key={player.key} action onClick={!voted ? () => vote(player) : () => unvote(player)}>
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

