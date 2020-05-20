import React from 'react';
import WereWolfCommands from './WerewolfCommands';
import RobberCommands from './RobberCommands';
import SeerCommands from './SeerCommands';
import DrunkCommands from './DrunkCommands';
import InsomniacCommands from './InsomniacCommands';
import DoppelgangerCommands from './DoppelgangerCommands';
import TroubleMakerCommands from './TroubleMakerCommands';

function PlayerCommands({
  currPlayer,
  setSelectedCards,
  selectedCards,
  currentTurn,
}) {
  console.log('current Player', currPlayer);
  console.log('currentTurn', currentTurn);
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
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Seer') {
    return (
      <SeerCommands
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Insomniac') {
    return (
      <InsomniacCommands
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Werewolf') {
    return (
      <WereWolfCommands
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Troublemaker') {
    return (
      <TroubleMakerCommands
        currPlayer={currPlayer}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        currentTurn={currentTurn}
      />
    );
  } else if (currPlayer.startingRole.name === 'Drunk') {
    return (
      <DrunkCommands
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
