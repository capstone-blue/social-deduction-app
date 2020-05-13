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
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [players]=useListKeys(lobbiesRef.child(match.params.id).child('players'))
  const [roles,setRoles] = useState([])
  const [roleList,loading,error] = useObjectVal(db.ref().child('games').child('gameId1').child('roles'))
  const playersRef = lobbiesRef.child(match.params.id).child('players')
  const gameRef = lobbiesRef.child(match.params.id)
  const [currentRolesList] =  useObjectVal(gameRef.child("currentRoles"))
  // console.log(players)
  // console.log(currentRoleList)
  // rolesRef.once('value').then(function (snapshot) {
  //   console.log(snapshot.val())
  //   const updatedRoles =  snapshot.val()
  //   console.log(updatedRoles)
  //   setRoles(updatedRoles)
  // })
  console.log(roles, currentRolesList)
  useEffect(()=>checkHostUpdate)
  function checkHostUpdate(){
    if(currentRolesList){
      if(!equalArrays(roles,currentRolesList)){
        setRoles(currentRolesList)
      }
    }
    else if(currentRolesList === null && roles.length !== 0){
      console.log(roles.length)
      setRoles([])
    }
  }
  function equalArrays(localRoles, DBRoles){
    if(localRoles.length !== DBRoles.length){
      return false
    }
    for(let i =0;i<localRoles.length; i++){
      if(localRoles[i] !== DBRoles[i]){
        return false
      }
    }
    return true
  }
  function buttonClicked(role){
    if(roles.includes(role)){
      const newRoles = roles.filter(el=>el !== role)
      gameRef.update({"currentRoles":newRoles})
      setRoles(newRoles)
    }
    else{
      const newRoles = [...roles, role]
      gameRef.update({"currentRoles":newRoles})
      setRoles([...roles, role])
    }
  }
  function masonButtonClicked(){
    if(roles.includes("mason")){
      const newRoles = roles.filter(el=>el !== "mason")
      gameRef.update({"currentRoles":roles})
      setRoles(newRoles)
    }
    else{
      gameRef.update({"currentRoles":roles})
      setRoles([...roles, "mason", "mason"])
    }
  }
  return(
    
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
        <h1>start the game</h1>
      </div>
      <div>
        {/* {currentRoleList} */}
        meep
      </div>
      <div>
        {roles.length - (players.length+3) != 0
          ?
          <div>
          {roles.length - (players.length+3) > 0
            ? <h4>select {roles.length - (players.length+3)} fewer roles to start the game </h4>
            : <h4>select {(players.length+3)-roles.length} more roles to start the game</h4>
          }
        </div>
          : <RoleLockButton wolfy = {wolfy} roles = {roles} players = {players} playersRef = {playersRef} roleList = {roleList}/>
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
  );
}

function wolfy(inputArray,players,playersRef,roleList){
    const inPlay = []
    const spliceArray = inputArray.slice(0)
    for(let i=0; i<players.length;i++){
        const newVal = Math.round(Math.random()*(spliceArray.length-1))
        inPlay.push(spliceArray[newVal])
        spliceArray.splice(newVal,1)
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

}

export default RoleAssignment