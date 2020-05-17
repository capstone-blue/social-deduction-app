import React, { useEffect, useState } from 'react';

function RoleLockButton(props){
    const [active, setActive] = useState(false)
    function clickActivate(){
      props.wolfy(props.roles,props.players, props.playersRef, props.roleList, props.gameRef)
      props.gameRef.update({
        "rolesSet":true,
        "status":"nightPhase"
    })
    }
    return(
      <button onClick ={()=>clickActivate()} >
            Lock In Roles
      </button>
    )
}

export default RoleLockButton