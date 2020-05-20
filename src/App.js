import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useUserId } from './context/userContext';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ReactComponent as Graveyard } from './assets/graveyard.svg';

import {
  HomePage,
  LobbyPage,
  RoleAssignment,
  GameScreen,
  NavigationBar,
} from './components';

const OuterPage = styled.div`
  position: relative;
  height: 100%;
  z-index: 0;
  min-height: 100vh;
`;

const GraveyardContainer = styled.div`
  position: absolute;
  width: 100%;
  z-index: -1;
  bottom: 0;
`;

const Footer = styled.footer`
  background-color: black;
  height: 10rem;
`;

// const userList = db.ref('users');
// function UserRef(props) {
//   const [snapshot, loading, error] = useList(userList);
//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error!</p>;
//   return (
//     <div>
//       <ul>
//         {snapshot.map((user) => (
//           <li key={user.key}>
//             <h1>{user.val()}</h1>
//             <h1>hey</h1>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
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
          await usersRef.child(uid).set({ signedIn: true, inLobby: false });
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
      <NavigationBar />
      <OuterPage>
        <Routes user={user} />
        <GraveyardContainer>
          <Graveyard viewBox="0 0 2000 1100" />
        </GraveyardContainer>
      </OuterPage>
      <Footer className="text-center ">
        {/*
        If we use the wolf icon, we're supposed to credit the site
        <small>
          Icons made by{' '}
          <a href="https://smashicons.com/" title="Smashicons">
            Smashicons
          </a>{' '}
          from{' '}
          <a href="https://www.flaticon.com/" title="Flaticon">
            {' '}
            www.flaticon.com
          </a>
        </small> */}
      </Footer>
    </div>
  );
}

function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/lobbies/:id" component={LobbyPage} />
        {/* <Route path="/gamesession/:id/gameover" component={GameEnd} />
        {/* <Route path="/gamesession/:id/vote" component={VotingPage} /> */}
        {/* <Route path="/gamesession/:id" component={GameSession} />  */}
        <Route path="/hostScreen/:id" component={RoleAssignment} />
        <Route path="/gameSessions/:id" component={GameScreen} />
        <Route path="/" component={HomePage} />
      </Switch>
    </Router>
  );
}

export default App;
