import RoleAssignment from './RoleSelect/RoleAssignment';
import WerewolfGamePage from './WerewolfGamePage';
import DayTime from './DayTime/DayTime';
import VotingPage from './VotingPage';
import GameEnd from './GameEnd';
import React from 'react';
import { db } from '../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import VideoRoleSelect from './RoleSelect/VideoRoleSelect';

function GameScreen({ match, history }) {
  const gameRef = db.ref().child('gameSessions').child(match.params.id);
  const [status] = useObjectVal(gameRef.child('status'));
  /////////////////////////////////////////
  // for video use only swap out this code

  // return (
  //   <React.Fragment>
  //     {status === 'roleSelect' ? (
  //       <VideoRoleSelect match={match} />
  //     ) : status === 'nightPhase' ? (
  //       <WerewolfGamePage match={match} />
  //     ) : status === 'dayPhase' ? (
  //       <DayTime match={match} />
  //     ) : status === 'voting' ? (
  //       <VotingPage match={match} history={history} />
  //     ) : status === 'results' ? (
  //       <GameEnd match={match} history={history} />
  //     ) : null}
  //   </React.Fragment>
  // );
  ////////////////////////////////////////////////////////////////

  return (
    <React.Fragment>
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
