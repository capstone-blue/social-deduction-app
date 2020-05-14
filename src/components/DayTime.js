import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal, useList, useListKeys } from 'react-firebase-hooks/database';

function DayTime({match}){
    const gameRef = db.ref().child('gameSessions').child(match.params.id)
    function skipToVote(){
        gameRef.update({"isDay":false})
        gameRef.update({"voting":true})
    }
    return(
        <div>
            <h1>******placeholder Component******</h1>
            <h1>it's day time. Try to reconstruct what happened.</h1>
            <button onClick = {()=>skipToVote()}>
                test use only: skip to voting
            </button>
            <h1>******placeholder Component******</h1>
        </div>
        
    )
}

export default DayTime