import React, { useEffect, useState } from 'react';

function MasonButton(props){
    const [active, setActive] = useState(false)
    function clickActivate(){
        setActive(!active)
        props.masonButtonClicked()
    }
    return(
        <div>
            <button onClick ={()=>clickActivate()} >
                Mason 1
            </button>
            <button onClick ={()=>clickActivate()}>
                Mason 2
            </button>
        </div>
    )
}

export default MasonButton