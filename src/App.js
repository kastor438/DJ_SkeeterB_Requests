import logo from './skeeterB-Logo.png';
import './App.css';
import React, { Component } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, child, get } from "firebase/database";
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Zoom';

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
            artistName : '',
            hasListener : false
        }
        
        this.UpdateSongName = this.UpdateSongName.bind(this);
        this.UpdateartistName = this.UpdateartistName.bind(this);
        this.CheckValidInput = this.CheckValidInput.bind(this);
        this.SubmitRequest = this.SubmitRequest.bind(this);
        this.AddRequest = this.AddRequest.bind(this);
    }

    UpdateSongName(event){
        this.setState({songName : event.target.value});
    }

    UpdateartistName(event){
        this.setState({artistName : event.target.value});
    }

    CheckValidInput(){
        if(this.state.songName.length <= 1 || this.state.artistName.length <= 1){
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
            for(i = 0; i < this.state.artistName.length; i++){
                if(this.state.invalidChars.includes(this.state.artistName.substring(i, i+1))){
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

        if(prevState.songName !== this.state.songName || prevState.artistName !== this.state.artistName){
            this.CheckValidInput();
        }
    }

    SubmitRequest(){
        if(this.state.canSubmit){            
            this.AddRequest(this.state.songName, this.state.artistName);
            
            document.getElementById('songNameInput').value = '';
            document.getElementById('artistNameInput').value = '';

            this.setState({songName : ''});
            this.setState({artistName : ''});
        }
    }

    AddRequest(songName, artistName){
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
                    if(songRequests[i].SongName == songName && songRequests[i].ArtistName == artistName){
                        addRequestBool = false;
                    }
                }

                console.log(songRequests[0].artistName);
                if(addRequestBool){
                    for(i = 0; i < songIDs.length; i++){
                        if(songIDs[i] >= nextSongID){
                            nextSongID = parseInt(songIDs[i]) + 1;
                        }
                    }
    
                    const db = getDatabase();
                    set(ref(db, 'Requests/' + nextSongID + '/'), {
                        SongName: songName,
                        ArtistName: artistName,
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
                    ArtistName: artistName,
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
                        <h2 id='pageHeader'>Song Requests</h2>
                        <div id='gridContainer'>
                            <div id='logoDiv'>
                                <div id="imageEffects"></div>
                                <img src={logo} className="App-logo" alt="logo" />
                            </div>
                            <div id='formDiv'>
                                <div id='songDiv'>
                                    <label for='songNameInput' className='requestLabel'>
                                        <input id='songNameInput' className='requestInput' name='songNameInput' type='text' placeholder="&nbsp;" onChange={this.UpdateSongName}/>
                                        <span className='label'>Song</span>
                                        <span className='focus-bg'></span>
                                    </label>
                                </div>
                                <div id='artistDiv'>
                                    <label for='artistNameInput' className='requestLabel'>
                                        <input id='artistNameInput' className='requestInput' name='artistNameInput' type='text' placeholder="&nbsp;" onChange={this.UpdateartistName}/>
                                        <span className='label'>Artist</span>
                                        <span className='focus-bg'></span>
                                    </label>
                                </div>
                                <div>
                                    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 400 }} title="Must provide a song and artist name." placement="right-start">
                                        <span>
                                            <button type='submit' id='submitBtn' disabled='disabled'>Submit Request</button>
                                        </span>
                                    </Tooltip>
                                </div>
                                <div>
                                    <h4 id='submissionText'></h4>
                                </div>
                            </div>
                        </div>
                    </header>
                </div>
            </div>
        );
    }
}

export default App;