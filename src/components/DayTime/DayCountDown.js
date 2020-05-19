import { useObjectVal} from 'react-firebase-hooks/database';
import { useUserId } from '../../context/userContext';
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';

function DayCountDown({gameRef, host}) {
    const [userId] = useUserId();
    const [count, setCount] = useState('');
    const [endDayTime, loadingDayEndTime] = useObjectVal(gameRef.child('endDayTime'));
    const gameHasntStarted = !loadingDayEndTime && !endDayTime;
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
      if(host[userId]){
          if (gameHasntStarted) {
            // set an expiration time for 15 seconds into the future
            setEndTimeInDB();
          }else if (countDownReached) {
            gameRef.child('status').set('voting');
          }
      } 
    }, [
      gameRef,
      host,
      userId,
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
  
    return(
        seconds > 9
        ?<h2>Time Left: {minutes}:{seconds}</h2>
        :<h2>Time Left: {minutes}:0{seconds}</h2>
        )
}

export default DayCountDown