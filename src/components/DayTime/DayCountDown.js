import { useObjectVal } from 'react-firebase-hooks/database';
import { useUserId } from '../../context/userContext';
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import styled from 'styled-components';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';

const TurnHeading = styled.div`
  color: #ffc108;
  font-size: 3.5rem;
  margin: 0 auto;
`;

const Timer = styled.div`
  color: #ffc108;
  font-size: 3.5rem;
`;

function DayCountDown({ gameRef, host }) {
  const [userId] = useUserId();
  const [count, setCount] = useState('');
  const [endDayTime, loadingDayEndTime] = useObjectVal(
    gameRef.child('endDayTime')
  );
  const gameHasntStarted = !loadingDayEndTime && !endDayTime;
  const countDownReached =
    !gameHasntStarted && endDayTime < new Date().getTime();
  const timeLeft = Math.floor(endDayTime - new Date().getTime());
  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor(timeLeft / 1000 - minutes * 60);
  // EFFECTS
  useEffect(() => {
    function setEndTimeInDB() {
      db.ref('/.info/serverTimeOffset').once('value', function (snap) {
        const offset = snap.val();
        const rightNow = new Date().getTime() + offset;
        const endTime = rightNow + 300000;
        gameRef.child('endDayTime').set(endTime);
      });
    }
    if (host[userId]) {
      if (gameHasntStarted) {
        // set an expiration time for 15 seconds into the future
        setEndTimeInDB();
      } else if (countDownReached) {
        // gameRef.child('status').set('voting'); //! Comment this line back in
      }
    }
  }, [gameRef, host, userId, gameHasntStarted, countDownReached]);

  // every second, client checks their time against server end time
  useEffect(() => {
    const interval = setInterval(() => {
      let secondsLeft = Math.floor((endDayTime - new Date().getTime()) / 1000);
      setCount(secondsLeft);
    }, 1000);
    return () => clearInterval(interval);
  }, [count, endDayTime]);

  return loadingDayEndTime ? (
    <Spinner animation="border" role="status" />
  ) : (
    <React.Fragment>
      <Col />
      <Col xs="auto">
        <TurnHeading>Find the Werewolf!</TurnHeading>
      </Col>
      <Col>
        <Timer>
          {minutes ? minutes : ''}
          <span style={{ color: 'white' }}>:</span>
          {seconds > 9 ? `${seconds}` : `0${seconds}`}
        </Timer>
      </Col>
    </React.Fragment>
  );
}

export default DayCountDown;
