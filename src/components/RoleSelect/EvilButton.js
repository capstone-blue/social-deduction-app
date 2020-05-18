import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
function EvilButton(props){
    const [active, setActive] = useState(false)
    function clickActivate(){
        setActive(!active)
        props.buttonClicked(props.role)
    }
    return(
      props.currentRolesList

      ? props.currentRolesList.includes(props.role)
        ?<Button variant="danger" onClick ={()=>clickActivate()} size = "lg" block >
              {props.role}
        </Button>
        :<Button variant= "outline-danger" onClick ={()=>clickActivate()} size = "lg" block >
            {props.role}
          </Button>
      : <Button variant= "outline-danger" onClick ={()=>clickActivate()} size = "lg" block >
          {props.role}
        </Button>
    )
}

export default EvilButton