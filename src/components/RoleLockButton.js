import React, { useEffect, useState } from 'react';

function RoleLockButton(props){
    const [active, setActive] = useState(false)
    function clickActivate(){
        if((props.players.length+3)===props.roles.length){
          props.wolfy(props.roles,props.players, props.playersRef, props.roleList)
        }
        else{
          console.log('not time yet')
        }
    }
    return(
      <button onClick ={()=>clickActivate()} >
            Lock In Roles
      </button>
    )
}

export default RoleLockButton