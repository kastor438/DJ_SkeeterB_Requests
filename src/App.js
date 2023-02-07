import './App.css';
import React, { Component } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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

  async Setup(){
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        this.SignInHandler(user);
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