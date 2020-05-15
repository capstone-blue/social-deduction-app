import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
function RoleMarkerButton(props){
    function clickActivate(){
        props.applyMarker(props.selectedCards,props.role,props.gameRef)
    }
    return(
        <Button variant="warning" onClick={clickActivate} >
        Mark this player as {props.role}
      </Button>
    )
}

export default RoleMarkerButton
