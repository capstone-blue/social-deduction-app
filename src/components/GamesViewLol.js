import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal, useList, useListKeys } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';

// Main logic should be handled in this component
function GamesViewLol({ match }) {
  const [lobbiesRef] = useState(db.ref().child('gameSessions'));
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [players]=useListKeys(lobbiesRef.child(match.params.id).child('players'))
  const playersRef = lobbiesRef.child(match.params.id).child('players')
  console.log(playersRef)
  console.log(players)
  // players.forEach(play=>{
  //     console.log(play.val())
  
  // })
  // async function yee(){
  //   try{
  //     const playerSnap =await lobbiesRef.child(match.params.id).child('players').once('value')
  //     console.log(playerSnap)
  //   }
  //   catch(err){
  //     console.log(err)
  //   }
  // }
  // yee()
  //   const buddyBoy = {
  //     "actualRole" : {
  //       "description" : "Look at one player's card or two from the center",
  //       "name" : "what it do",
  //       "type" : "villager"
  //     }
  //   }
  // playersRef.update({"buddyboy":buddyBoy})
  return lobbyLoading ? (
    <div>...Loading</div>
  ) : (
    <div>
      <AliasModal match={match} />
      <LobbyView players={Object.entries(lobby.players)} name={lobby.name} />
    </div>
  );
}
const inSession =  ["werewolf1","werewolf2", "seer", "robber","villager1","villager2"]

function wolfy(){
  console.log('hiya')
}


function LobbyView({ name, players }) {
  const [host, setHost] = useState({});
  const [members, setMembers] = useState([]);
  useEffect(() => {
    const m = [];
    let h = {};

    players.forEach((playerEntry) => {
      const [, player] = playerEntry;
      if (player.host) h = player;
      else m.push(playerEntry);
    });

    setHost(h);
    setMembers(m);
  }, [players]);

  return (
    <div>
      <h1>Game</h1>
      <h2>{name}</h2>
      <div>
        <h3>host</h3>
        <div>{host.alias ? host.alias : '(...)'}</div>
      </div>
      <div>
        <h3>members</h3>
        <div>
          {members.map((m) => {
            const [id, player] = m;
            return <div key={id}>{player.alias ? player.alias : '(...)'}</div>;
          })}
        </div>
        <button onClick = {()=>wolfy(inSession,3,players)}/>
      </div>
    </div>
  );
}

function AliasModal({ match }) {
  const [userId] = useUserId();
  const [alias, setAlias] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const lobbyId = match.params.id;
    const updates = {
      [`users/${userId}/alias`]: alias,
      [`lobbies/${lobbyId}/players/${userId}/alias`]: alias,
    };
    db.ref().update(updates);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
        <button type="submit">submit</button>
      </form>
    </div>
  );
}

export default GamesViewLol;
