import React from 'react';
import WereWolfCommands from './WerewolfCommands';
import RobberCommands from './RobberCommands';
import SeerCommands from './SeerCommands';
import DrunkCommands from './DrunkCommands';
import DoppelgangerCommands from './DoppelgangerCommands';
import TroubleMakerCommands from './TroubleMakerCommands';

function PlayerCommands({
  userId,
  gameRef,
  currPlayer,
  setSelectedCards,
  selectedCards,
  currentTurn,
}) {
  if (currPlayer.startingRole.name === 'Doppelganger') {
    return (
      <DoppelgangerCommands
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Robber') {
    return (
      <RobberCommands
        userId={userId}
        gameRef={gameRef}
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Seer') {
    return (
      <SeerCommands
        userId={userId}
        gameRef={gameRef}
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Insomniac') {
    return null;
  } else if (currPlayer.startingRole.name === 'Werewolf') {
    return (
      <WereWolfCommands
        userId={userId}
        gameRef={gameRef}
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Troublemaker') {
    return (
      <TroubleMakerCommands
        userId={userId}
        gameRef={gameRef}
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Drunk') {
    return (
      <DrunkCommands
        userId={userId}
        gameRef={gameRef}
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else {
    return null;
  }
}

export default PlayerCommands;
