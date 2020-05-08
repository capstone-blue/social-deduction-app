import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY_TEST,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN_TEST,
  databaseURL: process.env.REACT_APP_DATABASE_URL_TEST,
  projectId: process.env.REACT_APP_PROJECT_ID_TEST,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET_TEST,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID_TEST,
  appId: process.env.REACT_APP_APP_ID_TEST,
};

firebase.initializeApp(firebaseConfig);

export default firebase;

export const auth = firebase.auth;
export const db = firebase.database();
