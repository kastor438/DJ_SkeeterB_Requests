import logo from './skeeterB-Logo.png';
import './App.css';
import React, { Component, useEffect, useState } from 'react';
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
  
const clientID = '822b607fa31944ca91f198b9f5e31613';
const clientSecret = '4aae0065891841c197af65473ac00b49';

const App = () => {
    const [accessToken, SetAccessToken] = useState("");
    const [canSubmit, SetCanSubmit] = useState("");
    const [invalidChars, SetInvalidChars] = useState("");
    const [songName, SetSongName] = useState("");
    const [artistName, SetArtistName] = useState("");
    const [hasListener, SetHasListener] = useState(false);
    const [spotifySongs, SetSpotifySongs] = useState([]);
    const [spotifyArtists, SetSpotifyArtists] = useState([]);

    useEffect(() => {
        InitializeSpotify();
    }, [])

    function InitializeSpotify(){
        var authParams = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials&client_id=' + clientID + '&client_secret=' + clientSecret
        }

        fetch('https://accounts.spotify.com/api/token', authParams)
            .then(result => result.json())
            .then(data => SetAccessToken(data.accessToken));
    }

    function UpdateSongName(value){
        SetSongName(value);
        CheckValidInput();
        console.log(songName + " " + artistName);
    }

    function UpdateArtistName(value){
        SetArtistName(value);
        CheckValidInput();
    }

    function CheckValidInput(){
        if(songName.length <= 1 || artistName.length <= 1){
            SetCanSubmit(false);
            return;
        }
        else{
            for(var i = 0; i < songName.length; i++){
                if(invalidChars.includes(songName.substring(i, i+1))){
                    SetCanSubmit(false);
                    return;
                }
            }
            for(i = 0; i < artistName.length; i++){
                if(invalidChars.includes(artistName.substring(i, i+1))){
                    SetCanSubmit(false);
                    return;
                }
            }
        }
        SetCanSubmit(true);
        FetchSpotifySongs();
    }

    function SubmitRequest(){
        if(canSubmit){
            console.log('Your input value is: ' + songName + ", " + artistName);
            
            this.AddRequest(songName, artistName);
            
            document.getElementById('songNameInput').value = '';
            document.getElementById('artistNameInput').value = '';

            this.AddRequest(songName, artistName);

            SetSongName('');
            SetArtistName('');
        }
        else{
            console.log('Your input is invalid! (' + songName + ", " + artistName + ')');
        }
    }

    function AddRequest(songName, artistName){
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
                    if(songRequests[i].SongName == songName && songRequests[i].artistName == artistName){
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

    async function FetchSpotifySongs(){

    }

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
                                <label htmlFor='songNameInput' className='requestLabel'>
                                    <input id='songNameInput' className='requestInput' name='songNameInput' type='text' placeholder="&nbsp;" onChange={e => UpdateSongName(e.target.value)}/>
                                    <span className='label'>Song</span>
                                    <span className='focus-bg'></span>
                                </label>
                            </div>
                            <div id='artistDiv'>
                                <label htmlFor='artistNameInput' className='requestLabel'>
                                    <input id='artistNameInput' className='requestInput' name='artistNameInput' type='text' placeholder="&nbsp;" onChange={e => UpdateArtistName(e.target.value)}/>
                                    <span className='label'>Artist</span>
                                    <span className='focus-bg'></span>
                                </label>
                            </div>
                            <div id='songSearchDiv'>
                                <div id='songSearchTabs'>
                                    <div id='spotifyTab'>
                                        <img id='spotifyImage' src='Spotify_Logo_CMYK_Green.png'/>
                                    </div>
                                    {/* <div id='appleMusicTab'>
                                        <img id='appleMusicImage' src='Spotify_Logo_CMYK_Green.png'/>
                                    </div> */}
                                </div>
                                <div id='spotifySearchDiv'>
                                    <div className='songOption'>
                                        <img className='songOptionImage' src='' alt='Song Image'></img>
                                        <div className='songOptionInfo'>
                                            <p>Song Title</p>
                                            <p>Artist Name</p>
                                        </div>
                                    </div>
                                    <div className='songOption'>
                                        <img className='songOptionImage' src='' alt='Song Image'></img>
                                        <div className='songOptionInfo'>
                                            <p>Song Title</p>
                                            <p>Artist Name</p>
                                        </div>
                                    </div>
                                    <div className='songOption'>
                                        <img className='songOptionImage' src='' alt='Song Image'></img>
                                        <div className='songOptionInfo'>
                                            <p>Song Title</p>
                                            <p>Artist Name</p>
                                        </div>
                                    </div>
                                    <div className='songOption'>
                                        <img className='songOptionImage' src='' alt='Song Image'></img>
                                        <div className='songOptionInfo'>
                                            <p>Song Title</p>
                                            <p>Artist Name</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 400 }} title="Must provide a song and artist name." placement="right-start">
                                    <span>
                                        <button type='submit' id='submitBtn' disabled='disabled' onSubmit={SubmitRequest}>Submit Request</button>
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

export default App;