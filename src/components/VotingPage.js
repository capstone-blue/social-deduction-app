/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { VotingTimer } from './index';
import { db } from '../firebase';
import { useUserId } from '../context/userContext';
import { useList, useObjectVal } from 'react-firebase-hooks/database';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import UIfx from 'uifx';
import selectSound from '../assets/sounds/select.wav';
import unselectSound from '../assets/sounds/unselect.wav';

const select = new UIfx(selectSound, {
  volume: 0.3,
  throttleMs: 50,
});

const unselect = new UIfx(unselectSound, {
  volume: 0.3,
  throttleMs: 50,
});

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
  const [gameSessionId] = useState(match.params.id);
  const [gameSessionRef] = useState(db.ref(`/gameSessions/${gameSessionId}`));
  const [players] = useList(gameSessionRef.child('players'));
  const [playerRef] = useState(
    db.ref(`/gameSessions/${gameSessionId}/players/${userId}`)
  );
  const [voteStatusRef] = useState(
    db.ref(`/gameSessions/${gameSessionId}/players/${userId}/votedAgainst`)
  );
  const [winnerRef] = useState(db.ref(`gameSessions/${gameSessionId}/winner`));
  const [playerInfo] = useObjectVal(playerRef);
  const [voted, setVoted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [allVoted, setAllVoted] = useState(false);

  useEffect(() => {
    function listenOnVoteStatus() {
      try {
        voteStatusRef.on('value', function (snapshot) {
          if (snapshot.val() !== false) {
            setVoted(snapshot.val());
          } else if (snapshot.val() === false) {
            setVoted(false);
          }
        });
      } catch (e) {
        console.error('Error in VotingPage vote status listener', e.message);
      }
    }
    function checkIfHost() {
      db.ref(`/gameSessions/${gameSessionId}/players/${userId}/host`)
        .once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            setIsHost(true);
          }
        });
    }
    function checkIfAllVoted() {
      // go through all players and check vote status
      // if no false is found, return true, else return false
      const result = players.find(
        (player) => player.val().votedAgainst === false
      );
      if (result !== undefined) {
        setAllVoted(false);
      } else {
        setAllVoted(true);
      }
    }
    checkIfHost();
    listenOnVoteStatus();
    checkIfAllVoted();
  }, [
    userId,
    gameSessionId,
    voteStatusRef,
    playerInfo,
    players,
    gameSessionRef,
  ]);

  async function vote(selectedPlayer) {
    if (!voted) {
      select.play();
      // increment vote count
      const selectedPlayerVoteRef = gameSessionRef
        .child('players')
        .child(selectedPlayer.key)
        .child('votes');
      selectedPlayerVoteRef.transaction(function (votes) {
        return (votes || 0) + 1;
      });

      // update the voter's votedAgainst field to the id of the player they voted against
      await playerRef.update({
        ...playerInfo,
        votedAgainst: selectedPlayer.key,
      });
    }
  }

  async function unvote() {
    // updated the selected player's vote count -1
    if (voted) {
      unselect.play();
      const selectedPlayerVoteRef = gameSessionRef
        .child('players')
        .child(voted)
        .child('votes');
      selectedPlayerVoteRef.transaction(function (votes) {
        return votes - 1;
      });
      // update the voter's votedAgainst status back to false
      await playerRef.update({ ...playerInfo, votedAgainst: false });
    }
  }

  // the results should checked which player had the most votes, and see their actual role
  // if the actual role is werewolf, villagers win
  // if the actual role is not werewolf, werewolfs win
  // if the actual role is tanner, tanner wins
  // if the hunter dies but pointing at a werewolf, villagers win
  // if the hunter dies but pointing at a tanner, tanner wins
  // if both tanner and a werewolf dies, tanner and villagers win
  // if tanner and a villager dies, only the tanner wins. werewolves do not win
  // if a werewolf and villager got same number of votes, villagers win
  // if no werewolves but there is a minion, werewolf team wins if minion lives
  // if no werewolf and all votes are equal, villagers win

  // eslint-disable-next-line complexity
  async function calculateWinner() {
    // find the most occurences of a votedAgainst
    const resultsTable = {};
    const voteNames = [];
    players.forEach((player) => (resultsTable[player.key] = 0));
    players.forEach((player) => voteNames.push(player.val().votedAgainst));
    voteNames.forEach((vote) => (resultsTable[vote] = resultsTable[vote] += 1));

    const getPlayersWithMostVotes = (object) => {
      return Object.keys(object).filter((x) => {
        return object[x] === Math.max.apply(null, Object.values(object));
      });
    };

    const mostVotes = getPlayersWithMostVotes(resultsTable);
    // console.log(mostVotes)
    const actualRoles = [];
    const deadPlayers = [];
    mostVotes.forEach((vote) => {
      players.forEach((player) => {
        if (player.key === vote) {
          actualRoles.push(player.val().actualRole.name);
          deadPlayers.push(
            `${player.val().actualRole.name} (${player.val().alias})`
          );
        }
      });
    });
    console.log(actualRoles);

    await gameSessionRef.child('deadPlayers').set(deadPlayers);

    async function findHunterVictim() {
      // console.log('got here with',actualRoles)
      // whomever the hunter votes for also dies
      // find whomever was hunter
      const hunter = players.find(
        (player) => player.val().actualRole.name === 'Hunter'
      );
      // then find ID of whomever the hunter voted against
      const hunterVictimId = hunter.val().votedAgainst;
      // find the victim using said ID
      const hunterVictim = players.find(
        (player) => player.key === hunterVictimId
      );
      // find the victim's actualRole
      const hunterVictimRole = hunterVictim.val().actualRole.name;
      // check whether a tanner also died
      const tannerDied = actualRoles.includes('Tanner');
      console.log(actualRoles);
      console.log(tannerDied);
      if (hunterVictimRole === 'Werewolf' && tannerDied)
        await gameSessionRef.child('winner').set('Tanner and Villagers');
      else if (hunterVictimRole !== 'Werewolf' && tannerDied)
        await gameSessionRef.child('winner').set('Tanner');
      else if (hunterVictimRole === 'Tanner')
        await gameSessionRef.child('winner').set('Tanner');
      else await gameSessionRef.child('winner').set('Werewolves');
    }

    async function minionWinConditions() {
      console.log('got here with', actualRoles);
      // if there is a werewolf and minion dies, werewolves win
      // if there are no werewolves and someone other than minion dies, werewolves win
      // if there are no werewolve and minion dies, villagers win

      // check if there is a werewolf among the players
      const werewolfInGame = players.find(
        (player) => player.val().actualRole.name === 'Werewolf'
      );

      if (werewolfInGame)
        await gameSessionRef.child('winner').set('Werewolves');
      else await gameSessionRef.child('winner').set('Villagers');
    }

    if (
      actualRoles.length === players.length &&
      !actualRoles.includes('Werewolf')
    )
      await gameSessionRef.child('winner').set('Villagers');
    else if (actualRoles.length === 1) {
      console.log('got here with', actualRoles);
      if (actualRoles.includes('Werewolf'))
        await gameSessionRef.child('winner').set('Villagers');
      else if (actualRoles.includes('Hunter')) findHunterVictim();
      else if (actualRoles.includes('Minion')) minionWinConditions();
      else if (actualRoles.includes('Tanner'))
        await gameSessionRef.child('winner').set('Tanner');
      else if (actualRoles.includes('Villager'))
        await gameSessionRef.child('winner').set('Werewolves');
    } else if (actualRoles.length === 2) {
      if (actualRoles.includes('Werewolf') && actualRoles.includes('Tanner'))
        await gameSessionRef.child('winner').set('Tanner and Villagers');
      else if (actualRoles.includes('Werewolf'))
        await gameSessionRef.child('winner').set('Villagers');
      else if (actualRoles.includes('Hunter')) findHunterVictim();
      else if (actualRoles.includes('Minion')) minionWinConditions();
      else if (actualRoles.includes('Tanner'))
        await gameSessionRef.child('winner').set('Tanner');
      else await gameSessionRef.child('winner').set('Werewolves');
    } else if (actualRoles.length === 3) {
      if (actualRoles.includes('Werewolf') && actualRoles.includes('Tanner'))
        await gameSessionRef.child('winner').set('Tanner and Villagers');
      else if (actualRoles.includes('Werewolf'))
        await gameSessionRef.child('winner').set('Villagers');
      else if (actualRoles.includes('Hunter')) findHunterVictim();
      else if (actualRoles.includes('Minion')) minionWinConditions();
      else if (actualRoles.includes('Tanner'))
        await gameSessionRef.child('winner').set('Tanner');
      else await gameSessionRef.child('winner').set('Werewolves');
    } else if (actualRoles.length === 4) {
      if (actualRoles.includes('Werewolf') && actualRoles.includes('Tanner'))
        await gameSessionRef.child('winner').set('Tanner and Villagers');
      else if (actualRoles.includes('Werewolf'))
        await gameSessionRef.child('winner').set('Villagers');
      else if (actualRoles.includes('Hunter')) findHunterVictim();
      else if (actualRoles.includes('Minion')) minionWinConditions();
      else if (actualRoles.includes('Tanner'))
        await gameSessionRef.child('winner').set('Tanner');
      else await gameSessionRef.child('winner').set('Werewolves');
    } else if (actualRoles.length === 5) {
      if (actualRoles.includes('Werewolf') && actualRoles.includes('Tanner'))
        await gameSessionRef.child('winner').set('Tanner and Villagers');
      else if (actualRoles.includes('Werewolf'))
        await gameSessionRef.child('winner').set('Villagers');
      else if (actualRoles.includes('Hunter')) findHunterVictim();
      else if (actualRoles.includes('Minion')) minionWinConditions();
      else if (actualRoles.includes('Tanner'))
        await gameSessionRef.child('winner').set('Tanner');
    } else await gameSessionRef.child('winner').set('Werewolves');
  }

  function finishVoting() {
    if (allVoted) {
      // asdasd
      voteStatusRef.off();
      // calculate winner and set winner into gameSession for retrieval in GameEnd component
      calculateWinner();
      // turn off winner listener
      winnerRef.off();
      gameSessionRef.update({ status: 'results' });
    }
  }

  return (
    <React.Fragment>
      <Container>
        <VotingTimer
          gameRef={gameSessionRef}
          host={isHost}
          finishVoting={finishVoting}
        />
        <Title>
          <Badge variant="dark">Decision Time!</Badge>
          <p variant="dark">Vote for the player you think is a werewolf!</p>
          <Container>
            <Col>
              {voted ? (
                <Button variant="success" onClick={() => unvote()}>
                  Unvote
                </Button>
              ) : null}
            </Col>
          </Container>
        </Title>
        <ProgressBar now={70} label="Time Remaining: (Not working)" />
        <Container>
          <ListGroup>
            {players.map((player) => (
              <ListGroup.Item variant="info" key={player.key}>
                <Row>
                  <Col>
                    <p>{player.val().alias}</p>
                  </Col>
                  <Col>
                    <Badge variant="danger">Votes: {player.val().votes}</Badge>
                  </Col>
                  <Col>
                    <Button
                      onClick={() => vote(player)}
                      disabled={!!voted || player.key === userId}
                    >
                      Vote
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Container>
      </Container>
    </React.Fragment>
  );
};

export default VotingPage;
