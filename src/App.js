import React, {useState, useRef} from "react";
import './App.css';
// imported hooks and firebase dev kit 
import firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import { fromValue } from "long";

// help us find our app 
firebase.initializeApp({
  apiKey: "AIzaSyDVl4ufhHWFEFuiowuRyiUUgUip4EFjiwE",
  authDomain: "superchat-box.firebaseapp.com",
  databaseURL: "https://superchat-box.firebaseio.com",
  projectId: "superchat-box",
  storageBucket: "superchat-box.appspot.com",
  messagingSenderId: "994789881612",
  appId: "1:994789881612:web:1a1cd486c2633b15be3b29",
  measurementId: "G-MTX7ZDZ65Z"
})

//  this will give us access to the database
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <SignOut />
        </header>
       <section>
         {user ? <ChatRoom /> : <SignIn />}
       </section>
    </div>
  );
}

// component that will perform a popup when click
function SignIn() {
  // instantiate a sign in
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);

  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google </button>
  )
}


function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}> Sign out </button>
  )
}
// we are calling the qery to pull everything and sort by created at, at a limit of 25 records
// messagesRef is the query
// query is pulling and sorting 
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
// this is the query and will return the mssages for us , this constantly watches data to constantly render messages 

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  // the above manages the "state"
  const sendMessage = async(e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue('');
    
    dummy.current.scrollIntoView({ behavior: 'smooth'});

  }


return (
// if messages exist it will change the ui 
  <>
   <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
    <div ref={dummy}></div>

   </main>

    <form onSubmit= {sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
      <button type='submit'>🕊️</button>

    </form>
  </>
)
}

function ChatMessage(props) {
  // saying sent or received 
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
//importing each photo when message is sent 
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}


export default App;
