import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal, useList, useListKeys } from 'react-firebase-hooks/database';

function VoteScreen({match}){
    const gameRef = db.ref().child('gameSessions').child(match.params.id)
    function skipToResults(){
        gameRef.update({"status":"results"})
    }
    return(
        <div>
            <h1>******placeholder Component******</h1>
            <h1>This is the vote screen. cast a vote for someone!</h1>
            <button onClick = {()=>skipToResults()}>
                test use only: skip to results
            </button>
            <h1>******placeholder Component******</h1>
        </div>
        
    )
}

export default VoteScreen