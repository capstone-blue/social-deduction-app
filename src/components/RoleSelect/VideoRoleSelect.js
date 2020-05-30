/* eslint react/no-unescaped-entities: 0*/
import React, { useState } from 'react';
import { db } from '../../firebase';
import { useObjectVal, useListKeys } from 'react-firebase-hooks/database';
import { useUserId } from '../../context/userContext';
import EvilButton from './EvilButton';
import VillageButton from './VillageButton';
import MasonButton from './MasonButton';
import RoleLockButton from './RoleLockButton';
import Container from 'react-bootstrap/Container';
import videoRoleLock from '../../utils/turns/videoRoleLock';

//possible further work

// default setup button for given number of players
//prebuilt game states that are regarded as fun
function VideoRoleSelect({ match }) {
  const [lobbiesRef] = useState(db.ref().child('gameSessions'));
  const [userId] = useUserId();
  const [playerVals] = useObjectVal(
    lobbiesRef.child(match.params.id).child('players').child(userId)
  );

  const [allPlayerVals] = useObjectVal(
    lobbiesRef.child(match.params.id).child('players')
  );
  const [players] = useListKeys(
    lobbiesRef.child(match.params.id).child('players')
  );
  const [roleList] = useObjectVal(
    db.ref().child('games').child('werewolf').child('roles')
  );
  const playersRef = lobbiesRef.child(match.params.id).child('players');
  const gameRef = lobbiesRef.child(match.params.id);
  const [currentRolesList] = useObjectVal(gameRef.child('currentRoles'));
  function buttonClicked(role) {
    if (playerVals.host) {
      if (currentRolesList) {
        if (currentRolesList.includes(role)) {
          const newRoles = currentRolesList.filter((el) => el !== role);
          gameRef.update({ currentRoles: newRoles });
        } else {
          const newRoles = [...currentRolesList, role];
          gameRef.update({ currentRoles: newRoles });
        }
      } else {
        gameRef.update({ currentRoles: [role] });
      }
    }
  }
  function masonButtonClicked() {
    if (currentRolesList.includes('Mason')) {
      const newRoles = currentRolesList.filter((el) => el !== 'Mason');
      gameRef.update({ currentRoles: newRoles });
    } else {
      const newRoles = [...currentRolesList, 'Mason', 'Mason'];
      gameRef.update({ currentRoles: newRoles });
    }
  }
  return (
    <Container>
      {currentRolesList ? (
        currentRolesList.length - (players.length + 3) !== 0 ? (
          <div>
            {currentRolesList.length - (players.length + 3) > 0 ? (
              playerVals.host ? (
                <div className="text-center">
                  <h1>Start Game</h1>
                  <h4 className="text-center">
                    select {currentRolesList.length - (players.length + 3)}{' '}
                    fewer roles to start the game{' '}
                  </h4>
                </div>
              ) : (
                <div className="text-center">
                  <h1>Start Game</h1>
                  <h4 className="text-center">
                    host needs to select{' '}
                    {currentRolesList.length - (players.length + 3)} fewer roles
                    to start the game{' '}
                  </h4>
                </div>
              )
            ) : playerVals.host ? (
              <div className="text-center">
                <h1>Start Game</h1>
                <h4 className="text-center">
                  select {players.length + 3 - currentRolesList.length} more
                  roles to start the game
                </h4>
              </div>
            ) : (
              <div className="text-center">
                <h1>Start Game</h1>
                <h4 className="text-center">
                  host needs to select{' '}
                  {players.length + 3 - currentRolesList.length} more roles to
                  start the game
                </h4>
              </div>
            )}
          </div>
        ) : playerVals.host ? (
          <div className="text-center">
            <h1>Start Game</h1>
            <RoleLockButton
              wolfy={videoRoleLock}
              roles={allPlayerVals}
              players={players}
              playersRef={playersRef}
              roleList={roleList}
              gameRef={gameRef}
            />
          </div>
        ) : (
          <div className="text-center">
            <h1>Start Game</h1>
            <h4>waiting for host to start the game</h4>
          </div>
        )
      ) : (
        <div className="text-center">
          <h1>Start Game</h1>
          <h4>select {players.length + 3} more roles to start the game</h4>
        </div>
      )}
      {playerVals ? (
        <div>
          <h1 className="text-center">werewolves</h1>
          <EvilButton
            buttonClicked={buttonClicked}
            role="werewolf 1"
            currentRolesList={currentRolesList}
          />
          {` `}
          <EvilButton
            buttonClicked={buttonClicked}
            role="werewolf 2"
            currentRolesList={currentRolesList}
          />
          {` `}
          <EvilButton
            buttonClicked={buttonClicked}
            role="Minion"
            currentRolesList={currentRolesList}
          />{' '}
          <h1 className="text-center">Villagers</h1>
          <VillageButton
            buttonClicked={buttonClicked}
            role="seer"
            currentRolesList={currentRolesList}
          />{' '}
          <VillageButton
            buttonClicked={buttonClicked}
            role="robber"
            currentRolesList={currentRolesList}
          />{' '}
          <VillageButton
            buttonClicked={buttonClicked}
            role="Troublemaker"
            currentRolesList={currentRolesList}
          />{' '}
          <VillageButton
            buttonClicked={buttonClicked}
            role="Drunk"
            currentRolesList={currentRolesList}
          />{' '}
          <VillageButton
            buttonClicked={buttonClicked}
            role="Tanner"
            currentRolesList={currentRolesList}
          />{' '}
          <VillageButton
            buttonClicked={buttonClicked}
            role="Hunter"
            currentRolesList={currentRolesList}
          />{' '}
          <VillageButton
            buttonClicked={buttonClicked}
            role="Insomniac"
            currentRolesList={currentRolesList}
          />{' '}
          <MasonButton masonButtonClicked={masonButtonClicked} />
          <VillageButton
            buttonClicked={buttonClicked}
            role="villager 1"
            currentRolesList={currentRolesList}
          />{' '}
          <VillageButton
            buttonClicked={buttonClicked}
            role="villager 2"
            currentRolesList={currentRolesList}
          />{' '}
          <VillageButton
            buttonClicked={buttonClicked}
            role="villager 3"
            currentRolesList={currentRolesList}
          />{' '}
          <h3 className="text-center">Coming "Soon"</h3>
          <EvilButton buttonClicked={buttonClicked} role="alpha wolf" />{' '}
          <VillageButton
            buttonClicked={buttonClicked}
            role="Doppelganger"
            currentRolesList={currentRolesList}
          />{' '}
        </div>
      ) : (
        <h1>loading</h1>
      )}
    </Container>
  );
}
export default VideoRoleSelect;
