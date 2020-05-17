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
      db.ref(`/gameSessions/${gameSessionId}/players/${userId}/host`).once('value').then((snapshot) => {
        if (snapshot.exists()) {
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
    if (selectedPlayer.key === userId) {
      return alert("You can't vote for yourself!")
    }
    if (!voted) {
      // increment vote count
      const selectedPlayerVoteRef = gameSessionRef.child('players').child(selectedPlayer.key).child('votes')
      selectedPlayerVoteRef.transaction(function (votes) {
        return (votes || 0) + 1
      })

      // update the voter's votedAgainst field to the id of the player they voted against
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
      // update the voter's votedAgainst status back to false
      await playerRef.update({ ...playerInfo, votedAgainst: false })
    }
  }

  // the results should checked which player had the most votes, and see their actual role
  // if the actual role is werewolf, villagers win
  // if the actual role is not werewolf, werewolfs win
  // if the actual role is tanner, tanner wins
  // if the hunter dies but pointing at a werewolf, villagers win
  // if a werewolf and villager got same number of votes, villagers win
  // if no werewolves but there is a minion, werewolf team wins if minion lives, but also wins if no one dies? so scratch the official rules, villagers win if minion dies
  // if no werewolf and all votes are equal, villagers win

  async function calculateWinner() {
    // use a hashmap to save results?
    // instead of finding who has the most votes, find the most occurences of a votedAgainst?
    const resultsTable = {}
    const voteNames = []
    players.forEach(player => resultsTable[player.key] = 0)
    players.forEach(player => voteNames.push(player.val().votedAgainst))
    voteNames.forEach(vote => resultsTable[vote] = resultsTable[vote] += 1)

    const getPlayersWithMostVotes = object => {
      return Object.keys(object).filter(x => {
        return object[x] == Math.max.apply(null,
          Object.values(object));
      });
    };

    const mostVotes = getPlayersWithMostVotes(resultsTable)

    const actualRoles = []
    mostVotes.forEach(vote => {
      players.forEach(player => {
        if (player.key === vote) {
          actualRoles.push(player.val().actualRole.name)
        }
      })
    })

   async function findHunterVictim() {
      // whomever the hunter votes for also dies
      // find whomever was hunter
      const hunter = players.find(player => player.val().actualRole.name === "Hunter")
      // then find ID of whomever the hunter voted against
      const hunterVictimId = hunter.val().votedAgainst
      // find the victim using said ID
      const hunterVictim = players.find(player => player.key === hunterVictimId)
      // find the victim's actualRole
      const hunterVictimRole = hunterVictim.val().actualRole.name;
      if (hunterVictimRole === 'Werewolf') await gameSessionRef.child('winner').set('Villagers')
      else await gameSessionRef.child('winner').set('Werewolves')
    }

    if (actualRoles.length === players.length && !actualRoles.includes("Werewolf")) await gameSessionRef.child('winner').set('Villagers')
    else if (actualRoles.length === 1) {
      if (actualRoles.includes('Werewolf')) await gameSessionRef.child('winner').set('Villagers')
      else if (actualRoles.includes('Hunter')) {
        findHunterVictim()
      }
    } else if (actualRoles.length === 2) {
      if (actualRoles.includes('Werewolf')) await gameSessionRef.child('winner').set('Villagers')
      else if (actualRoles.includes('Hunter')) {
        findHunterVictim()
      }
      else await gameSessionRef.child('winner').set('Werewolves')
    } else if (actualRoles.length === 3) {
      if (actualRoles.includes('Werewolf')) await gameSessionRef.child('winner').set('Villagers')
      else if (actualRoles.includes('Hunter')) {
        findHunterVictim()
      }
      else await gameSessionRef.child('winner').set('Werewolves')
    } else if (actualRoles.length === 4) {
      if (actualRoles.includes('Werewolf')) await gameSessionRef.child('winner').set('Villagers')
      else if (actualRoles.includes('Hunter')) {
        findHunterVictim()
      }
      else await gameSessionRef.child('winner').set('Werewolves')
    } else if (actualRoles.length === 5) {
      if (actualRoles.includes('Werewolf')) await gameSessionRef.child('winner').set('Villagers')
      else if (actualRoles.includes('Hunter')) {
        findHunterVictim()
      }
      else await gameSessionRef.child('winner').set('Werewolves')
    }
  }

  function showPlayerInfo() {
    players.forEach(player => console.log(player.val().votedAgainst))
  }

  async function finishVoting() {
    if (allVoted) {
      // turn off listener
      voteStatusRef.off()
      // calculate winner and set winner into gameSession for retrieval in GameEnd component
      calculateWinner()
      // go to results page
      history.push(`/gamesession/${gameSessionId}/gameover`)
    }
  }

  function checkHost() {
    db.ref(`/gameSessions/${gameSessionId}/players/${userId}`).child('host').once('value').then((snapshot) => {
      console.log(snapshot.val())
    })
  }

  return (
    <React.Fragment>
      <Container>
        <Title><Badge variant="dark">Vote</Badge></Title>
        <ProgressBar now={70} label='Time Remaining: (Not working)' />
        <Container>
          <ListGroup>
            {players.map(player =>
              <ListGroup.Item key={player.key} action onClick={() => vote(player)} disabled={voted ? true : false}>
                <Container>
                  <Badge variant="info">{player.val().alias}</Badge>
                  <Badge variant="danger">Votes: {player.val().votes}</Badge>
                </Container>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Container>
        <Container>
          {voted ? <Button variant="success" onClick={() => unvote()}>Unvote</Button> : null}
          {isHost && allVoted ? <Button variant="danger" onClick={() => finishVoting()}>Finalize</Button> : null}
          <Button onClick={() => checkHost()}>checkHost</Button>
        </Container>
      </Container>
    </React.Fragment>
  )
}

export default VotingPage

