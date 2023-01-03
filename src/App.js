import './App.css';
import React, { Component } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";

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
  databaseURL: "https://dj-skeeterb-default-rtdb.firebaseio.com/"
};

const userEmail = 'Kastor438@hotmail.com';
const userPassword = 'a2AwDnBy8hCsRZ2';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const database = getDatabase(app);
  
class App extends Component {
  constructor(props) {
    super(props)

    // Bind the this context to the handler function
    // this.SignInHandler = this.SignInHandler.bind(this);

    // Set some state
    this.state = {
      signedIn: false,
      authUser: null
    };
    this.Setup = this.Setup.bind(this);
    this.SignInHandler = this.SignInHandler.bind(this);
    this.SignOutHandler = this.SignOutHandler.bind(this);
  }

  componentDidMount(){
    console.log("test");
    this.Setup();
  }

  async Setup(){
    console.log("test");
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
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
            <Main signinHandler={(authUser) => this.SignInHandler(authUser)} authUser={this.state.authUser}/>
          </header>
        </div>
      </div>
    );
  }
}

export default App;