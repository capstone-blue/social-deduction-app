import React, { useEffect } from 'react';
import { auth, db } from './firebase';
import { useList } from "react-firebase-hooks/database"



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
            console.log('entered');
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

  return (
    <div>
      <h1>This is the App</h1>
      <UserRef/>
    </div>
  )
}




export default App;
