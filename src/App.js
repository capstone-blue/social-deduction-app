import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useUserId } from './context/userContext';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LobbyPage from './components/LobbyPage';



const userList = db.ref("users");
function UserRef(props){
  const [snapshot,loading,error] = useList(userList)
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return (
    <div>
      <ul>
        {snapshot.map(user=>(
          <li key = {user.key}>
            <h1>{user.val().name}</h1>
            <h1>hey</h1>

          </li>
        )
        )}
      </ul>
    </div>
  );
}
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
        <Route path="/lobbies/:id" component={LobbyPage} />} />
        <Route path="/" component={HomePage} />} />
      </Switch>
    </Router>
  );
}




export default App;
