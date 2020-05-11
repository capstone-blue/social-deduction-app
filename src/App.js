import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useUserId } from './context/userContext';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { HomePage, LobbyPage, GameSession } from './components';

function App() {
  const [userId, setUserId] = useUserId();
  const [usersRef] = useState(db.ref().child('users'));
  const [user, loading] = useAuthState(auth());

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        if (user) {
          const uid = user.uid;
          setUserId(uid);
          const userSnap = await usersRef.child(uid).once('value');
          if (userSnap.exists()) {
            console.log(uid, 'already exists');
          }
        } else {
          await auth().signInAnonymously();
          const uid = auth().currentUser.uid;
          setUserId(uid);
          await usersRef.child(uid).set({ signedIn: true });
          console.log(`Added user ${uid} to database!`);
        }
      } catch (e) {
        console.error(e);
      }
    }
    checkAuthStatus();
  }, [user, usersRef, setUserId]);

  return loading || !userId ? (
    <div>...Loading</div>
  ) : (
      <div>
        <Routes user={user} />
      </div>
    );
}

function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/lobbies/:id" component={LobbyPage} />
        <Route path="/gamesession/:id" component={GameSession} />
        <Route path="/" component={HomePage} />
      </Switch>
    </Router>
  );
}

export default App;
