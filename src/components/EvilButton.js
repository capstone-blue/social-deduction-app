import React, { useEffect, useState } from 'react';

function EvilButton(props){
    const [active, setActive] = useState(false)
    function clickActivate(){
        setActive(!active)
        props.buttonClicked(props.role)
    }
    return(
      <button onClick ={()=>clickActivate()} >
            werewolf
      </button>
    )
}

export default EvilButton