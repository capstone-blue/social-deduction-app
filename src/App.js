import React, { useEffect } from 'react';
import { auth, db } from './firebase';

function App() {
  useEffect(() => {
    function checkAuthStatus() {
      auth().onAuthStateChanged(async (user) => {
        try {
          if (user) {
            const uid = user.uid;
            const snapshot = await db.ref(`/users/${uid}`).once('value');
            if (snapshot.exists())
              return console.log(`User ${uid} already in database!`);
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
  }, []);

  return <h1>This is the App</h1>;
}

export default App;
