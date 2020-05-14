import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal, useList, useListKeys } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';
import EvilButton from './EvilButton'
import VillageButton from './VillageButton'
import MasonButton from './MasonButton'
import RoleLockButton from './RoleLockButton'

//immediate needs
  // conditional rendering based on if you are host versus player
  // actually writing roles to the db when changing roles
    // FUGGG,  this has slightly larger implications than I thought 
//possible further work

  // default setup button for given number of players
  //prebuilt game states that are regarded as fun
function RoleAssignment({ match }) {
  const [lobbiesRef] = useState(db.ref().child('gameSessions'));
  const [userId] = useUserId()
  const [playerVals] = useObjectVal(lobbiesRef.child(match.params.id).child('players').child(userId))
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [players]=useListKeys(lobbiesRef.child(match.params.id).child('players'))
  // const [roles,setRoles] = useState([])
  const [roleList,loading,error] = useObjectVal(db.ref().child('games').child('werewolf').child('roles'))
  const playersRef = lobbiesRef.child(match.params.id).child('players')
  const gameRef = lobbiesRef.child(match.params.id)
  const [currentRolesList] =  useObjectVal(gameRef.child("currentRoles"))
  console.log(playerVals)
  console.log(roleList)

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
    <div>
      <h1>werewolves</h1>
      <div className = 'werewolfTeam'>
        <EvilButton buttonClicked = {buttonClicked} role = "werewolf 1"/>
        <EvilButton buttonClicked = {buttonClicked} role = "werewolf 2"/>
      </div>
      <h1>Villagers</h1>
      <div className = 'villagerTeam'>
        <VillageButton buttonClicked = {buttonClicked} role = "villager 1"/>
        <VillageButton buttonClicked = {buttonClicked} role = "villager 2"/>
        <VillageButton buttonClicked = {buttonClicked} role = "villager 3"/>
        <VillageButton buttonClicked = {buttonClicked} role = "seer"/>
        <VillageButton buttonClicked = {buttonClicked} role = "robber"/>
      </div>

      <div>
        {currentRolesList
        ? currentRolesList.length - (players.length+3) != 0
          ?
            <div>
            {currentRolesList.length - (players.length+3) > 0
              ? playerVals.host 
                ? <h4>select {currentRolesList.length - (players.length+3)} fewer roles to start the game </h4>
                : <h4>host needs to select {currentRolesList.length - (players.length+3)} fewer roles to start the game </h4>
              : playerVals.host
                ? <h4>select {(players.length+3)-currentRolesList.length} more roles to start the game</h4>
                : <h4>host needs to select {(players.length+3)-currentRolesList.length} more roles to start the game</h4>
            }
          </div>
          : playerVals.host 
            ?<RoleLockButton wolfy = {wolfy} roles = {currentRolesList} players = {players} playersRef = {playersRef} roleList = {roleList} gameRef = {gameRef}/>
            : <h4>waiting for host to start the game</h4>
        :<h4>select {players.length+3} more roles to start the game</h4>
        }
      </div>
      <div>
        <h3>Coming "Soon"</h3>
        <MasonButton masonButtonClicked = {masonButtonClicked}/>
        <EvilButton buttonClicked = {buttonClicked} role = "minion"/>
        <EvilButton buttonClicked = {buttonClicked} role = "alpha wolf"/>
        <VillageButton buttonClicked = {buttonClicked} role = "TroubleMaker"/>
        <VillageButton buttonClicked = {buttonClicked} role = "Drunk"/>
        <VillageButton buttonClicked = {buttonClicked} role = "Tanner"/>
        <VillageButton buttonClicked = {buttonClicked} role = "Hunter"/>
        <VillageButton buttonClicked = {buttonClicked} role = "Insomniac"/>
        <VillageButton buttonClicked = {buttonClicked} role = "dopplegänger"/>
      </div>
    </div>
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
    console.log("these are assigned",inPlay, "these are in the center",spliceArray)
    function setTheRoles(players,playersRef,roleList){
     for (let i = 0; i<players.length; i++){
       console.log(players[i])
       const individualRef = playersRef.child(players[i])
        if(inPlay[i].includes("villager")){
          console.log('villager')
          const roleUpdate = roleList["villager"]
          individualRef.update({"startingRole": roleUpdate})
        }
        else if(inPlay[i].includes("werewolf")){
          console.log('wolf')
          const roleUpdate = roleList["werewolf"]
          individualRef.update({"startingRole": roleUpdate})
        }
        else{
          console.log('else')
          const roleUpdate = roleList[inPlay[i]]
          individualRef.update({"startingRole": roleUpdate})
        }
      }
    }
    setTheRoles(players,playersRef,roleList)
    setTheCards(spliceArray,roleList,gameRef)

}

export default RoleAssignment