import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal, useList, useListKeys } from 'react-firebase-hooks/database';

function DayTime({match}){
    const gameRef = db.ref().child('gameSessions').child(match.params.id)
    function skipToVote(){
        gameRef.update({"status":"voting"})
    }
    function DayCountdown() {
        const [count, setCount] = useState('');
        const [endDayTime, loadingEndTime] = useObjectVal(gameRef.child('endDayTime'));
        const gameHasntStarted = !loadingEndTime && !endDayTime;
        const countDownReached = !gameHasntStarted && endDayTime < new Date().getTime();
        const timeLeft = Math.floor(endDayTime - new Date().getTime())
        const minutes = Math.floor((timeLeft / 1000)/60)
        const seconds = Math.floor((timeLeft/1000) -((minutes)*60))
        // EFFECTS
        useEffect(() => {
          function setEndTimeInDB() {
            db.ref('/.info/serverTimeOffset').once('value', function (snap) {
              const offset = snap.val();
              const rightNow = new Date().getTime() + offset;
              const endDayTime = rightNow + 300000;
              gameRef.child('endDayTime').set(endDayTime);
            });
          } 
            if (gameHasntStarted) {
              // set an expiration time for 15 seconds into the future
              setEndTimeInDB();
            }else if (countDownReached) {
              gameRef.child('status').set('voting');
            }
        }, [
          gameRef,
          gameHasntStarted,
          countDownReached,
        ]);
      
        // every second, client checks their time against server end time
        useEffect(() => {
          const interval = setInterval(() => {
            let secondsLeft = Math.floor((endDayTime - new Date().getTime()) / 1000);
            setCount(secondsLeft);
          }, 1000);
          return () => clearInterval(interval);
        }, [count, endDayTime]);
      
        // VIEW
        return loadingEndTime ? (
          <h2>loading</h2>
        ) : (
            seconds > 9
                ?
          <h2>
            Daytime left
            {`: ${minutes}:${seconds}`}
          </h2>
                :
                <h2>
            Daytime left
            {`: ${minutes}:0${seconds}`}
          </h2>
        );
      }
    return(
        <div>
            <h1>******placeholder Component******</h1>
            <h1>it's day time. Try to reconstruct what happened.</h1>
            <DayCountdown/>
            <button onClick = {()=>skipToVote()}>
                test use only: skip to voting
            </button>
            <h1>******placeholder Component******</h1>
        </div>
        
    )
}


export default DayTime