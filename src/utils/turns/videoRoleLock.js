function videoRoleLock(inputArray, players, playersRef, roleList, gameRef) {
  function setTheCards() {
    gameRef.child('centerCards').update({ 'card 1': roleList.Troublemaker });
    gameRef.child('centerCards').update({ 'card 2': roleList.villager });
    gameRef.child('centerCards').update({ 'card 3': roleList.Insomniac });
  }
  function setTheRoles() {
    for (let i = 0; i < players.length; i++) {
      const individualRef = playersRef.child(players[i]);
      if (inputArray[players[i]].alias === 'Stephen') {
        const roleUpdate = roleList.werewolf;
        individualRef.update({
          startingRole: roleUpdate,
          actualRole: roleUpdate,
        });
      } else if (inputArray[players[i]].alias === 'Ian') {
        const roleUpdate = roleList.seer;
        individualRef.update({
          startingRole: roleUpdate,
          actualRole: roleUpdate,
        });
        gameRef.update({ wolfCount: Number(1) });
      } else if (inputArray[players[i]].alias === 'Jason') {
        const roleUpdate = roleList.robber;
        individualRef.update({
          startingRole: roleUpdate,
          actualRole: roleUpdate,
        });
      }
    }
    gameRef.update({
      turnorder: ['Werewolf', 'Seer', 'Robber', 'Troublemaker', 'Insomniac'],
    });
  }

  setTheRoles();
  setTheCards();
}
export default videoRoleLock;
