import React, { useRef, useState } from 'react';
import './App.css';

//Firebase e sua estrutura
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

//login e senha firebase
import { useAuthState } from 'react-firebase-hooks/auth';
//acessar os dados da base firebase
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  // minha configuração pessoal
  apiKey: "AIzaSyDq1xK87atFnpvxd1Ah-ph9vXGQbi9gMJE",
  authDomain: "superchat-c5fd5.firebaseapp.com",
  projectId: "superchat-c5fd5",
  storageBucket: "superchat-c5fd5.appspot.com",
  messagingSenderId: "930360715377",
  appId: "1:930360715377:web:b766a41dbcdcf9168493d0",
  measurementId: "G-268F8DJH3L"
})

//variaveis dos serviçoes firebase
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  //estado do usuario
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <div className="logo">
        <h1>Abraço</h1>
        <h2>para todos</h2>
        <SignOut />
      </div>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

//faz o login do usuário com o google
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

//faz o logout do google

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sair</button>
  )
}

// leitura das mensagens e entrada do chat
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Abrace Alguém" />

      <button type="submit" disabled={!formValue}> Enviar </button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;

