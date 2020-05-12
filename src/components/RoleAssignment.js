import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal, useList, useListKeys } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';
import EvilButton from './EvilButton'

function hey(){
  console.log("hey")
}
function RoleAssignment({ match }) {
  const [lobbiesRef] = useState(db.ref().child('gameSessions'));
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [players]=useListKeys(lobbiesRef.child(match.params.id).child('players'))
  const [roles,setRoles] = useState('')
  const [roleList,loading,error] = useObjectVal(db.ref().child('games').child('gameId1').child('roles'))
  const playersRef = lobbiesRef.child(match.params.id).child('players')
  // console.log(players)
  // console.log(roleList)
  //unifying the button behavior and implementing toggling
   function buttonClicked(role){
    if(roles.includes(role)){
      const newRoles = roles.filter(el=>el !== role)
      setRoles(newRoles)
    }
    else{
      setRoles([...roles, role])
    }
  }
  return(
    
    <div>
      <h1>werewolves</h1>
      <div className = 'werewolfTeam'>
        <EvilButton buttonClicked = {buttonClicked} role = "werewolf1"/>
        <button onClick = {()=>buttonClicked("werewolf2")}>
          werewolf2
        </button>
        <button onClick = {()=>buttonClicked("minion")}>
         minion
        </button>
        <button onClick = {()=>buttonClicked("alpha wolf")}>
         alphawolf
        </button>
      </div>
      <h1>Villagers</h1>
      <div className = 'villagerTeam'>
        <button onClick = {()=>buttonClicked("seer")}>
          seer
        </button>
        <button onClick = {()=>buttonClicked("robber")}>
          robber
        </button>
        <button onClick = {()=>buttonClicked("villager1")}>
          villager
        </button>
        <button onClick = {()=>buttonClicked("villager2")}>
          villager2
        </button>
      </div>
      <div>
        <h1>start the game</h1>
        <button onClick = {()=>wolfy(roles,3,players,playersRef,roleList)}>
          set the roles
        </button>
      </div>
      <div>
        {roles}
      </div>
    </div>
  );
}

function setup(match,lobbiesRef){
  
  const playersRef = lobbiesRef.child(match.params.id).child('players')
  console.log(playersRef)
  
    const buddyBoy = {
        "actualRole" : {
          "description" : "Look at one player's card or two from the center",
          "name" : "what it do",
          "type" : "villager"
        }
      }
    playersRef.update({"buddyboy":buddyBoy})
}
function wolfy(inputArray,playerNumber,players,playersRef,roleList){
    const inPlay = []
    const spliceArray = inputArray.slice(0)
    for(let i=0; i<playerNumber;i++){
        const newVal = Math.round(Math.random()*(spliceArray.length-1))
        // console.log(newVal)
        // console.log(spliceArray[newVal])
        inPlay.push(spliceArray[newVal])
        // console.log("this is in play",inPlay)
        spliceArray.splice(newVal,1)
        // console.log('got here')
        // console.log(spliceArray)
    }
    // console.log(players)
    console.log("these are assigned",inPlay, "these are in the center",spliceArray)
    function setTheRoles(players,playersRef,roleList){
    //  console.log(players)
     for (let i = 0; i<players.length; i++){
       console.log(players[i])
       const individualRef = playersRef.child(players[i])
        // playersRef.update({[players[i]]:{
        //   "actualRole" : {
        //     "description" : "Look at one player's card or two from the center",
        //     "name" : inPlay[i],
        //     "type" : "villager"
        //   }
        // }})
        // console.log(roleList)
        if(inPlay[i]=== "villager1" || inPlay[i]=== "villager2"){
          console.log('villager')
          const roleUpdate = roleList["villager"]
          individualRef.update({"startingRole": roleUpdate})
        }
        else if(inPlay[i]==="werewolf1" || inPlay[i]=== "werewolf2"){
          console.log('wolf')
          const roleUpdate = roleList["werewolf"]
          individualRef.update({"startingRole": roleUpdate})
        }
        else{
          console.log('else')
          const roleUpdate = roleList[inPlay[i]]
          individualRef.update({"startingRole": roleUpdate})
        }
        // console.log(roleUpdate)
          // individualRef.update({"actualRole":{
          //   "description" : "Look at one player's card or two from the center",
          //   "name" : inPlay[i],
          //   "type" : "villager"
          // }})
      }
    }
    setTheRoles(players,playersRef,roleList)

}

export default RoleAssignment