import logo from './skeeterB-Logo.png';
import './App.css';
import React, { Component } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, child, get } from "firebase/database";

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
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const database = getDatabase(app);
  

class App extends Component {

    constructor(props){
        super(props);
        
        this.state = {
            canSubmit : false,
            invalidChars : '\'"\\/',
            songName : '',
            authorName : '',
            hasListener : false
        }
        
        this.UpdateSongName = this.UpdateSongName.bind(this);
        this.UpdateAuthorName = this.UpdateAuthorName.bind(this);
        this.CheckValidInput = this.CheckValidInput.bind(this);
        this.SubmitRequest = this.SubmitRequest.bind(this);
        this.AddRequest = this.AddRequest.bind(this);
    }

    UpdateSongName(event){
        this.setState({songName : event.target.value});
    }

    UpdateAuthorName(event){
        this.setState({authorName : event.target.value});
    }

    CheckValidInput(){
        if(this.state.songName.length <= 1 || this.state.authorName.length <= 1){
            this.setState({canSubmit : false});
            return;
        }
        else{
            for(var i = 0; i < this.state.songName.length; i++){
                if(this.state.invalidChars.includes(this.state.songName.substring(i, i+1))){
                    this.setState({canSubmit : false});
                    return;
                }
            }
            for(i = 0; i < this.state.authorName.length; i++){
                if(this.state.invalidChars.includes(this.state.authorName.substring(i, i+1))){
                    this.setState({canSubmit : false});
                    return;
                }
            }
        }
        this.setState({canSubmit : true});
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevState.canSubmit !== this.state.canSubmit) {
            if(this.state.canSubmit === true){
                document.getElementById('submitBtn').removeAttribute("disabled");
                if (this.state.hasListener === false) {
                    document.getElementById('submitBtn').addEventListener("click", () => this.SubmitRequest());
                    this.setState({hasListener : true});
                }
            }
            else{
                document.getElementById('submitBtn').setAttribute("disabled", "disabled");
            }
        }

        if(prevState.songName !== this.state.songName || prevState.authorName !== this.state.authorName){
            this.CheckValidInput();
        }
    }

    SubmitRequest(){
        if(this.state.canSubmit){
            console.log('Your input value is: ' + this.state.songName + ", " + this.state.authorName);
            
            this.AddRequest(this.state.songName, this.state.authorName);
            
            document.getElementById('songNameInput').value = '';
            document.getElementById('authorNameInput').value = '';

            this.AddRequest(this.state.songName, this.state.authorName);

            this.setState({songName : ''});
            this.setState({authorName : ''});
        }
        else{
            console.log('Your input is invalid! (' + this.state.songName + ", " + this.state.authorName + ')');
        }
    }

    AddRequest(songName, authorName){
        const dbRef = ref(getDatabase());
        var nextSongID = 1;
        var songIDs = [];
        var songRequests = [];
        var addRequestBool = true;

        get(child(dbRef, 'Requests/')).then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());

                Object.entries(snapshot.val()).forEach(([key, value]) => {
                    songIDs.push(key);
                    songRequests.push(value);
                });
                for(var i = 0; i < songRequests.length; i++){
                    if(songRequests[i].SongName == songName && songRequests[i].AuthorName == authorName){
                        addRequestBool = false;
                    }
                }

                console.log(songRequests[0].AuthorName);
                if(addRequestBool){
                    for(i = 0; i < songIDs.length; i++){
                        if(songIDs[i] >= nextSongID){
                            nextSongID = parseInt(songIDs[i]) + 1;
                        }
                    }
    
                    const db = getDatabase();
                    set(ref(db, 'Requests/' + nextSongID + '/'), {
                        SongName: songName,
                        AuthorName: authorName,
                    });
                    document.getElementById('submissionText').innerHTML = "Request Sent!";
                }
                else{
                    document.getElementById('submissionText').innerHTML = "Request Already in Pool."
                }
            } 
            else {
                const db = getDatabase();
                set(ref(db, 'Requests/1/'), {
                    SongName: songName,
                    AuthorName: authorName,
                });
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    render(){
        return (
            <div>
                <div className="App">
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <div>
                            <label>Song Name: </label>
                            <input id='songNameInput' name='songNameInput' type='text' onChange={this.UpdateSongName}/>
                        </div>
                        <div>
                            <label>Author Name: </label>
                            <input id='authorNameInput' name='authorNameInput' type='text' onChange={this.UpdateAuthorName}/>
                        </div>
                        <div>
                            <input type="submit" id="submitBtn" disabled></input>
                        </div>
                        <div>
                            <h4 id='submissionText'></h4>
                        </div>
                    </header>
                </div>
            </div>
        );
    }
}

export default App;