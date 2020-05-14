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

    return(
        <React.Fragment>
            <NavigationBar/>
            {rolesSet
            ? isNight
               ? <WerewolfGamePage match = {match}/>
               : isDay
                ? <DayTime match = {match}/>
                :voting
                    ? <VoteScreen match = {match}/>
                    :<h1>Result screen</h1>
            : <RoleAssignment match = {match}/>
            }
        </React.Fragment>
        
    )
}

export default GameScreen