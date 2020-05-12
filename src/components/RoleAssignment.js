import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal, useList, useListKeys } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';

function RoleAssignment({ match }) {
  const [lobbiesRef] = useState(db.ref().child('gameSessions'));
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [players]=useListKeys(lobbiesRef.child(match.params.id).child('players'))
  const [roles,setRoles] = useState('')
  const [roleList,loading,error] = useObjectVal(db.ref().child('games').child('gameId1').child('roles'))
  const playersRef = lobbiesRef.child(match.params.id).child('players')
  // console.log(players)
  // console.log(roleList)
  return(
    
    <div>
      <div className = 'werewolfTeam'>
        <button onClick = {()=>setRoles([...roles,"werewolf"])}>
          werewolf
        </button>
        <button onClick = {()=>setRoles([...roles,"werewolf"])}>
          werewolf2
        </button>
        <button onClick = {()=>setRoles([...roles,"minion"])}>
         minion
        </button>
        <button onClick = {()=>setRoles([...roles,"alpha wolf"])}>
         alphawolf
        </button>
      </div>
      <div className = 'villagerTeam'>
        <button onClick = {()=>setRoles([...roles,"seer"])}>
          seer
        </button>
        <button onClick = {()=>setRoles([...roles,"robber"])}>
          robber
        </button>
        <button onClick = {()=>setRoles([...roles,"villager"])}>
          villager
        </button>
        <button onClick = {()=>setRoles([...roles,"villager"])}>
          villager2
        </button>
      </div>
      <div>
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
    console.log(players)
    console.log("these are assigned",inPlay, "these are in the center",spliceArray)
    function setTheRoles(players,playersRef,roleList){
     console.log(players)
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
        const roleUpdate = roleList[inPlay[i]]
        // console.log(roleUpdate)
          // individualRef.update({"actualRole":{
          //   "description" : "Look at one player's card or two from the center",
          //   "name" : inPlay[i],
          //   "type" : "villager"
          // }})
          individualRef.update({"startingRole": roleUpdate})
      }
    }
    setTheRoles(players,playersRef,roleList)

}

export default RoleAssignment