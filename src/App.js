import React, { useEffect } from 'react';
import { auth, db } from './firebase';
import { useUser } from './context/userContext';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import HomePage from './components/HomePage';

function App() {
  const [, setCurrUser] = useUser();

  useEffect(() => {
    function checkAuthStatus() {
      auth().onAuthStateChanged(async (user) => {
        try {
          if (user) {
            const uid = user.uid;
            const userSnap = await db.ref(`/users/${uid}`).once('value');
            if (userSnap.exists()) setCurrUser(userSnap);
          } else {
            await auth().signInAnonymously();
            const uid = auth().currentUser.uid;
            await db.ref(`/users/${uid}`).set({ signedIn: true });
            console.log(`Added user ${uid} to database!`);
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
    checkAuthStatus();
  }, [setCurrUser]);

  return (
    <div>
      <Routes />
    </div>
  );
}

function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={HomePage} />
      </Switch>
    </Router>
  );
}

export default App;
