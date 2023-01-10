import firebase from 'firebase'
require ('@firebase/firestore')


const firebaseConfig = {
  apiKey: "AIzaSyCwSOD1GVXPTrVXMHqnkn0VQmtI5v_CMg0",
  authDomain: "elibdatabasenew.firebaseapp.com",
  projectId: "elibdatabasenew",
  storageBucket: "elibdatabasenew.appspot.com",
  messagingSenderId: "328413531924",
  appId: "1:328413531924:web:21a94e2988b28192a73c01"
};



firebase.initializeApp(firebaseConfig)
export default firebase.firestore()