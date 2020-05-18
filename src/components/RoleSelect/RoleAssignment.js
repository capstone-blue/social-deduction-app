import React, { useState } from 'react';
import { db } from '../../firebase';
import { useObjectVal,useListKeys } from 'react-firebase-hooks/database';
import { useUserId } from '../../context/userContext';
import EvilButton from './EvilButton'
import VillageButton from './VillageButton'
import MasonButton from './MasonButton'
import RoleLockButton from './RoleLockButton'
import Container from 'react-bootstrap/Container';


 
//possible further work

  // default setup button for given number of players
  //prebuilt game states that are regarded as fun
function RoleAssignment({ match }) {
  const [lobbiesRef] = useState(db.ref().child('gameSessions'));
  const [userId] = useUserId()
  const [playerVals] = useObjectVal(lobbiesRef.child(match.params.id).child('players').child(userId))
  const [players]=useListKeys(lobbiesRef.child(match.params.id).child('players'))
  const [roleList] = useObjectVal(db.ref().child('games').child('werewolf').child('roles'))
  const playersRef = lobbiesRef.child(match.params.id).child('players')
  const gameRef = lobbiesRef.child(match.params.id)
  const [currentRolesList] =  useObjectVal(gameRef.child("currentRoles"))


  function buttonClicked(role){
    if(playerVals.host){
      if(currentRolesList){
        if(currentRolesList.includes(role)){
          const newRoles = currentRolesList.filter(el=>el !== role)
          gameRef.update({"currentRoles":newRoles})
        }
        else{
          const newRoles = [...currentRolesList, role]
          gameRef.update({"currentRoles":newRoles})
        }
      }
      else{
        gameRef.update({"currentRoles":[role]})
      }

    }
  }
  function masonButtonClicked(){
    if(currentRolesList.includes("mason")){
      const newRoles = currentRolesList.filter(el=>el !== "mason")
      gameRef.update({"currentRoles":newRoles})
    }
    else{
      const newRoles = [...currentRolesList, "mason", "mason"]
      gameRef.update({"currentRoles":newRoles})
    }
  }
  return(
    playerVals
    ?
    <Container>
      <h1 className = "text-center">werewolves</h1>
      <div className = 'werewolfTeam'>
        <EvilButton buttonClicked = {buttonClicked} role = "werewolf 1" currentRolesList = {currentRolesList}/>{` `}
        <EvilButton buttonClicked = {buttonClicked} role = "werewolf 2" currentRolesList ={currentRolesList}/>{` `}
      </div>
      


      <h1 className = "text-center">Villagers</h1>
        <VillageButton buttonClicked = {buttonClicked} role = "villager 1" currentRolesList = {currentRolesList}/>{' '}


        <VillageButton buttonClicked = {buttonClicked} role = "villager 2" currentRolesList = {currentRolesList}/>{' '}
        <VillageButton buttonClicked = {buttonClicked} role = "villager 3" currentRolesList = {currentRolesList}/>{' '}
        <VillageButton buttonClicked = {buttonClicked} role = "seer" currentRolesList = {currentRolesList}/>{' '}
        <VillageButton buttonClicked = {buttonClicked} role = "robber" currentRolesList = {currentRolesList}/>{' '}

      <div>
        {currentRolesList
        ? currentRolesList.length - (players.length+3) !== 0
          ?
            <div>
            {currentRolesList.length - (players.length+3) > 0
              ? playerVals.host 
                ? <div className = "text-center">
                    <h1>Start Game</h1>
                    <h4 className = "text-center">select {currentRolesList.length - (players.length+3)} fewer roles to start the game </h4>
                  </div>
                : <div className = "text-center">
                    <h1>Start Game</h1>
                    <h4 className = "text-center">host needs to select {currentRolesList.length - (players.length+3)} fewer roles to start the game </h4>
                  </div>
              : playerVals.host
                ? <div className = "text-center">
                    <h1>Start Game</h1>
                    <h4 className = "text-center">select {(players.length+3)-currentRolesList.length} more roles to start the game</h4>
                </div>
                : <div className = "text-center">
                    <h1>Start Game</h1>
                    <h4 className = "text-center">host needs to select {(players.length+3)-currentRolesList.length} more roles to start the game</h4>
                </div>
            }
          </div>
          : playerVals.host 
            ?<div className = "text-center">
              <h1>Start Game</h1>
              <RoleLockButton wolfy = {wolfy} roles = {currentRolesList} players = {players} playersRef = {playersRef} roleList = {roleList} gameRef = {gameRef}/>
            </div>
            : <div className = "text-center">
                <h1>Start Game</h1>
                <h4>waiting for host to start the game</h4>
              </div>
        :<div className = "text-center">
            <h1>Start Game</h1>
            <h4>select {players.length+3} more roles to start the game</h4>

        </div>

        }
      </div>
      <div>
        <h3 className = "text-center">Coming "Soon"</h3>
        <EvilButton buttonClicked = {buttonClicked} role = "minion"/>{' '}
        <EvilButton buttonClicked = {buttonClicked} role = "alpha wolf"/>{' '}
        <VillageButton buttonClicked = {buttonClicked} role = "TroubleMaker"/>{' '}
        <VillageButton buttonClicked = {buttonClicked} role = "Drunk"/>{' '}
        <VillageButton buttonClicked = {buttonClicked} role = "Tanner"/>{' '}
        <VillageButton buttonClicked = {buttonClicked} role = "Hunter"/>{' '}
        <VillageButton buttonClicked = {buttonClicked} role = "Insomniac"/>{' '}
        <VillageButton buttonClicked = {buttonClicked} role = "dopplegänger"/>{' '}
        <MasonButton masonButtonClicked = {masonButtonClicked}/>
      </div>
    </Container>
    : <h1>loading</h1>
  );
}

function wolfy(inputArray,players,playersRef,roleList,gameRef){
    const inPlay = []
    const spliceArray = inputArray.slice(0)
    for(let i=0; i<players.length;i++){
        const newVal = Math.round(Math.random()*(spliceArray.length-1))
        inPlay.push(spliceArray[newVal])
        spliceArray.splice(newVal,1)
    }
    function setTheCards(inputArray,roleList,gameRef){
      for(let j = 1; j-1<spliceArray.length; j++){
        const cardVal = `card ${j}`
        if(spliceArray[j-1].includes("villager")){
          const cardUpdate = roleList["villager"]
          gameRef.child("centerCards").update({[cardVal]: cardUpdate})
        }
        else if(spliceArray[j-1].includes("werewolf")){
          const cardUpdate = roleList["werewolf"]
          gameRef.child("centerCards").update({[cardVal]: cardUpdate})
        }
        else{
          const cardUpdate = roleList[[spliceArray[j-1]]]
          gameRef.child("centerCards").update({[cardVal]: cardUpdate})
        }
      }
    }
    // console.log("these are assigned",inPlay, "these are in the center",spliceArray)
    function setTheRoles(players,playersRef,roleList){
     for (let i = 0; i<players.length; i++){
       const individualRef = playersRef.child(players[i])
        if(inPlay[i].includes("villager")){
          const roleUpdate = roleList["villager"]
          individualRef.update({
            "startingRole": roleUpdate,
            "actualRole":roleUpdate
        })
        }
        else if(inPlay[i].includes("werewolf")){
          const roleUpdate = roleList["werewolf"]
          individualRef.update({
            "startingRole": roleUpdate,
            "actualRole":roleUpdate
        })
        }
        else{
          const roleUpdate = roleList[inPlay[i]]
          individualRef.update({
            "startingRole": roleUpdate,
            "actualRole":roleUpdate
        })
        }
      }
    }
    setTheRoles(players,playersRef,roleList)
    setTheCards(spliceArray,roleList,gameRef)

}

export default RoleAssignment