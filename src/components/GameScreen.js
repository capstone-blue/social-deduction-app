import RoleAssignment from './RoleSelect/RoleAssignment';
import WerewolfGamePage from './WerewolfGamePage';
import DayTime from './DayTime/DayTime';
import VotingPage from './VotingPage';
import NavigationBar from './NavigationBar';
import GameEnd from './GameEnd';
import React from 'react';
import { db } from '../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';

function GameScreen({ match, history }) {
  const gameRef = db.ref().child('gameSessions').child(match.params.id);
  const [status] = useObjectVal(gameRef.child('status'));

  return (
    <React.Fragment>
      <NavigationBar />
      {status === 'roleSelect' ? (
        <RoleAssignment match={match} />
      ) : status === 'nightPhase' ? (
        <WerewolfGamePage match={match} />
      ) : status === 'dayPhase' ? (
        <DayTime match={match} />
      ) : status === 'voting' ? (
        <VotingPage match={match} history={history} />
      ) : status === 'results' ? (
        <GameEnd match={match} history={history} />
      ) : null}
    </React.Fragment>
  );
}

export default GameScreen;
