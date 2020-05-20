import React from 'react';
import Button from 'react-bootstrap/Button';
function RoleLockButton(props){
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