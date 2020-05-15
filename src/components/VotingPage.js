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


const VotingPage = ({ match, history }) => {
  const [userId] = useUserId();
  const [gameSessionId] = useState(match.params.id)
  const [gameSessionRef] = useState(db.ref(`/gameSessions/${gameSessionId}`));
  const [players] = useList(gameSessionRef.child('players'))
  const [playerRef] = useState(db.ref(`/gameSessions/${gameSessionId}/players/${userId}`))
  const [voteStatusRef] = useState(db.ref(`/gameSessions/${gameSessionId}/players/${userId}/votedAgainst`))
  const [playerInfo] = useObjectVal(playerRef)
  const [voted, setVoted] = useState(false)
  const [voteLock, setVoteLock] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [allVoted, setAllVoted] = useState(false)

  useEffect(() => {
    function listenOnVoteStatus() {
      try {
        voteStatusRef.on('value', function (snapshot) {
          if (snapshot.val() !== false) {
            setVoted(snapshot.val())
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
        if (snapshot.val().host) {
          setIsHost(true)
        }
      })
    }
    function checkIfAllVoted() {
      // go through all players and check vote status
      // if no false is found, return true, else return false
      const result = players.find(player => player.val().votedAgainst === false)
      if (result !== undefined) {
        setAllVoted(false)
      } else {
        setAllVoted(true)
      }
    }
    checkIfHost()
    listenOnVoteStatus()
    checkIfAllVoted()
  }, [userId, gameSessionId, voteStatusRef, playerInfo, players])

  async function vote(selectedPlayer) {
    // if you click on a player, it will set a new vote property onto the game session with that player role
    // or should there be a use effect when entering the vote screen that adds all the players's roles into the game session then increment as voting happens?
    // but we also want to display the votes across all player screens to incite tension
    if (selectedPlayer.key === userId) {
      return alert("You can't vote for yourself!")
    }
    if (!voted) {
      // increment vote count
      const selectedPlayerVoteRef = gameSessionRef.child('players').child(selectedPlayer.key).child('votes')
      selectedPlayerVoteRef.transaction(function (votes) {
        return (votes || 0) + 1
      })

      // update the voter's voted status to true
      await playerRef.update({ ...playerInfo, votedAgainst: selectedPlayer.key })
    }
  }

  async function unvote() {
    // updated the selected player's vote count -1
    if (voted) {
      const selectedPlayerVoteRef = gameSessionRef.child('players').child(voted).child('votes')
      selectedPlayerVoteRef.transaction(function (votes) {
        return votes - 1
      })
      // update the voter's voted status back to false
      await playerRef.update({ ...playerInfo, votedAgainst: false })
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
    if (allVoted) {
      voteStatusRef.off()
      history.push(`/gamesession/${gameSessionId}/gameover`)
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
              <ListGroup.Item key={player.key} action onClick={() => vote(player)} disabled={voteLock ? true : false}>
                <Container>
                  <Badge variant="info">{player.val().alias}</Badge>
                  <Badge variant="danger">Votes: {player.val().votes}</Badge>
                </Container>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Container>
        <Container>
          {voted && !voteLock ? <Button variant="success" onClick={() => unvote()}>Unvote</Button> : null}
          {isHost ? <Button variant="warning" onClick={() => lockVotes()}>Lock In Votes</Button> : null}
          {isHost && allVoted ? <Button variant="danger" onClick={() => finishVoting()}>Finalize</Button> : null}
        </Container>
      </Container>
    </React.Fragment>
  )
}

export default VotingPage

