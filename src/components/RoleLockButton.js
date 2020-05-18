import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
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
      <Button variant="success" onClick ={()=>clickActivate()} size="lg" block>
            Lock In Roles
      </Button>
    )
}

export default RoleLockButton