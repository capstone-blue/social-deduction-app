import RoleAssignment from './RoleAssignment'
import WerewolfGamePage from './WerewolfGamePage'
import DayTime from './DayTime'
import VoteScreen from './VoteScreen'
import NavigationBar from './NavigationBar'
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal, useList, useListKeys } from 'react-firebase-hooks/database';

function GameScreen({match}){
    const gameRef = db.ref().child('gameSessions').child(match.params.id)
    const [rolesSet] = useObjectVal(gameRef.child("rolesSet"))
    const [isNight] = useObjectVal(gameRef.child("isNight"))
    const [isDay] = useObjectVal(gameRef.child("isDay"))
    const [voting] = useObjectVal(gameRef.child("voting"))
    const [status] = useObjectVal(gameRef.child("status"))

    return(

        <React.Fragment>
        <NavigationBar/>
        {status === "roleSelect"
        ? <RoleAssignment match = {match}/>
        : status === "nightPhase"
           ? <WerewolfGamePage match = {match}/>
           : status === "dayPhase"
            ? <DayTime match = {match}/>
            :status === "voting"
                ? <VoteScreen match = {match}/>
                :<h1>Result screen</h1>
        }
    </React.Fragment>
        
    )
}

export default GameScreen