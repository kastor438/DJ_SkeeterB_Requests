import './App.css';
import skeeterLogo from './skeeterB-Logo.png'
import React, { Component } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, onChildAdded, set, update } from "firebase/database";
import addNotification from 'react-push-notification';

import NavBar from "./Components/NavBar";
import Main from "./Main";

const firebaseConfig = {
  apiKey: "AIzaSyAXh2tjWcUeOvEhUIyeZVNBRBwtn7BebgI",
  authDomain: "dj-skeeterb.firebaseapp.com",
  databaseURL: "https://dj-skeeterb-default-rtdb.firebaseio.com",
  projectId: "dj-skeeterb",
  storageBucket: "dj-skeeterb.appspot.com",
  messagingSenderId: "222672756825",
  appId: "1:222672756825:web:974f65737776a233265148",
  measurementId: "G-E5J0711GSP",
};

const publicRecaptchaKey = '6LdqIxskAAAAADVCIjtf00Sj76bY2vB3KA-J-6-D';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
  
const db = getDatabase();

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      signedIn: false,
      authUser: null,
      upcomingEventID : ''
    };
    this.Setup = this.Setup.bind(this);
    this.SignInHandler = this.SignInHandler.bind(this);
    this.SignOutHandler = this.SignOutHandler.bind(this);
  }

  componentDidMount(){
    this.Setup();
  }

  SystemNotification = (requestData) =>{
    addNotification({
      title: 'DJ-SkeeterB - New Request',
      message: `${requestData.SongName} by ${requestData.ArtistName}`,
      duration: 6000,
      icon: skeeterLogo,
      native: true
    })
  }

  async Setup(){
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log(user);
        this.SignInHandler(user);
        if((user.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || user.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83')){
          const dbPreapprovalRequestsRef = ref(db, `PreapprovalRequests/`);
          return onChildAdded(dbPreapprovalRequestsRef, (snapshot) => {
            if(snapshot.val().AdminNotified != null && !snapshot.val().AdminNotified){
              const requestData = snapshot.val();
              this.SystemNotification(requestData)
              update(ref(db, `PreapprovalRequests/${snapshot.key}/`), {
                AdminNotified: true,
              });
            }
          });
        }
      } 
      else {
        this.SignOutHandler();
      }
    });
  }

  SignInHandler(user) {
    this.setState({
      signedIn: true,
      authUser: user
    });
  }

  SignOutHandler() {
    this.setState({
      signedIn: false,
      authUser: null
    });
  }

  render(){
    return (
      <div>
        <div className="App">
          <header className="App-header">
            <NavBar signoutHandler={() => this.SignOutHandler()} authUser={this.state.authUser} />
            <Main 
            signinHandler={(authUser) => this.SignInHandler(authUser)} 
            upcomingEventHandler={(eventID) => this.UpcomingEventSelectedHandler(eventID)}
            authUser={this.state.authUser}
            eventID={this.state.upcomingEventID}/>
          </header>
        </div>
      </div>
    );
  }
}

export default App;