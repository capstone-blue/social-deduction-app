import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { useUserId } from '../context/userContext';
import { useList, useObjectVal } from 'react-firebase-hooks/database'
import styled from 'styled-components'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
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
  const [userId] = useUserId();
  const [gameSessionId] = useState(match.params.id)
  const [gameSessionRef] = useState(db.ref(`/gameSessions/${gameSessionId}`));
  const [players] = useList(gameSessionRef.child('players'))
  const [playerRef] = useState(db.ref(`/gameSessions/${gameSessionId}/players/${userId}`))
  const [voteStatusRef] = useState(db.ref(`/gameSessions/${gameSessionId}/players/${userId}/voted`))
  const [playerInfo] = useObjectVal(playerRef)
  const [voted, setVoted] = useState(false)
  const [voteDone, setVoteDone] = useState(false)
  const [voteLock, setVoteLock] = useState(false)
  const [isHost, setIsHost] = useState(false)

  useEffect(() => {
    function listenOnVoteStatus() {
      try {
        voteStatusRef.on('value', function (snapshot) {
          if (snapshot.exists()) {
            setVoted(true)
            // voteStatusRef.off()
          } else if (snapshot.val() === false) {
            setVoted(false)
          }
        })
      } catch (e) {
        console.error('Error in VotingPage vote status listener', e.message)
      }
    }
    function checkIfHost() {
      db.ref(`/gameSessions/${gameSessionId}/players/${userId}`).once('value').then((snapshot) => {
        if (snapshot.val().host === true) {
          setIsHost(true)
        }
      })
    }
    checkIfHost()
    listenOnVoteStatus()
  }, [userId, gameSessionId, voteStatusRef, playerInfo])

  async function vote(selectedPlayer) {
    // if you click on a player, it will set a new vote property onto the game session with that player role
    // or should there be a use effect when entering the vote screen that adds all the players's roles into the game session then increment as voting happens?
    // but we also want to display the votes across all player screens to incite tension
    if (selectedPlayer.key === userId) {
      return alert("You can't vote for yourself!")
    }
    if (!voted) {
      // updated the selected player's vote count +1
      await gameSessionRef.child('players').child(selectedPlayer.key).update({ ...selectedPlayer.val(), votes: selectedPlayer.val().votes + 1 })
      // update the voter's voted status to true
      await playerRef.update({ ...playerInfo, voted: true })
    }
  }

  async function unvote(selectedPlayer) {
    // updated the selected player's vote count -1
    if (voted) {
      await gameSessionRef.child('players').child(selectedPlayer.key).update({ ...selectedPlayer.val(), votes: selectedPlayer.val().votes - 1 })
      // update the voter's voted status back to false
      await playerRef.update({ ...playerInfo, voted: false })
    }
  }

  async function checkIfAllVoted() {
    // go through all players and check vote status
    // if any returns false, return false
    const voteResults = players.find(player => player.val().voted === false)
    if (voteResults) {
      console.log(false)
    } else {
      console.log(true)
    }
  }

  function lockVotes() {
    if (voteLock) {
      setVoteLock(false)
    } else {
      setVoteLock(true)
    }
  }

  function finishVoting() {
    if (checkIfAllVoted() === true) {
      console.log(playerInfo.host)
      console.log(players)
    } else {
      alert("People aren't done voting!")
    }
  }

  return (
    <React.Fragment>
      <Container>
        <Title><Badge variant="dark">Vote</Badge></Title>
        <ProgressBar now={70} label='Time Remaining: (Not working)' />
        <Container>
          <ListGroup>
            {players.map(player =>
              <ListGroup.Item key={player.key} action onClick={!voted ? () => vote(player) : () => unvote(player)} disabled={voteLock ? true : false}>
                <Container>
                  <Badge variant="info">{player.val().alias}</Badge>
                  <Badge variant="danger">Votes: {player.val().votes}</Badge>
                </Container>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Container>
        <Container>
          {isHost ? <Button variant="success" onClick={() => checkIfAllVoted()}>Check if all voted</Button> : null}
          {isHost ? <Button variant="warning" onClick={() => lockVotes()}>Lock In Votes</Button> : null}
          {isHost ? <Button variant="dark" onClick={() => finishVoting()}>Finalize</Button> : null}
        </Container>
      </Container>
    </React.Fragment>
  )
}

export default VotingPage

