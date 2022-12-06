import logo from './skeeterB-Logo.png';
import './App.css';
import React, { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, child, get } from "firebase/database";
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Zoom';
import { render } from '@testing-library/react';

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
    const [canSubmit, SetCanSubmit] = useState(false);
    const [invalidChars, SetInvalidChars] = useState('\'"\\/');
    const [inputSongName, SetInputSongName] = useState("");
    const [inputArtistName, SetInputArtistName] = useState("");
    const [hasListener, SetHasListener] = useState(false);
    const [renderedTracks, SetRenderedTracks] = useState([]);
    const [trackName, SetTrackName] = useState('');
    const [artistName, SetArtistName] = useState('');


    useEffect(() => {
        InitializeSpotify();
    }, []);

    useEffect(() => {
        CheckValidInput();
    }, [inputSongName, inputArtistName]);

    useEffect(() => {
        if(!canSubmit){
            document.getElementById('submitBtn').setAttribute("disabled", "disabled");
        }
        else{
            document.getElementById('submitBtn').removeAttribute("disabled");
        }
    }, [canSubmit]);

    useEffect(() => {
        console.log(trackName + ", " + artistName);
    }, [trackName, artistName]);
    
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
            .then(data => SetAccessToken(data.access_token));
    }

    function UpdateSongName(value){
        SetInputSongName(value);
    }

    function UpdateArtistName(value){
        SetInputArtistName(value);
    }

    function CheckValidInput(){
        for(var i = 0; i < 10; i++){
            var option = document.getElementById("option" + i);
            if(option){
                option.style.color = "white";
            }
            else{
                break;
            }
        }
        SetTrackName("");
        SetArtistName("");
        document.getElementById('submitBtn').setAttribute("disabled", "disabled");
        SetCanSubmit(false);

        if(inputSongName.length <= 1 || inputArtistName.length <= 1){
            return;
        }
        else{
            for(var i = 0; i < inputSongName.length; i++){
                if(invalidChars.includes(inputSongName.substring(i, i+1))){
                    return;
                }
            }
            for(i = 0; i < inputArtistName.length; i++){
                if(invalidChars.includes(inputArtistName.substring(i, i+1))){
                    return;
                }
            }
        }

        if (hasListener === false) {
            document.getElementById('submitBtn').addEventListener("click", () => SubmitRequest());
            SetHasListener(true);
        }
        FetchSpotifySongs();
    }

    function SubmitRequest(){
        if(canSubmit){
            console.log('Your input value is: ' + trackName + ", " + artistName);
            
            AddRequest(trackName, artistName);
            
            document.getElementById('songNameInput').value = '';
            document.getElementById('artistNameInput').value = '';

            SetInputSongName('');
            SetInputArtistName('');
        }
        else{
            console.log('Your input is invalid! (' + inputSongName + ", " + inputArtistName + ')');
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
        var songParams = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        }

        var songID = await fetch('https://api.spotify.com/v1/search?q=' + inputSongName + '&type=track', songParams)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                var tracks = [];
                var searchedTracks = data.tracks.items;
                for(var i = 0; i < 10; i++){
                    if(searchedTracks[i] == null)
                        break;
                    var track = React.createElement('div', {key : 'option' + i, id : 'option' + i, className : 'songOption', onClick : (e) => SelectSong(e)},
                        React.createElement('img', {className : 'songOptionImage', src : searchedTracks[i].album.images[0].url, alt : ''}),
                        React.createElement('div', {className : 'songOptionInfo'},
                            React.createElement('p', {id : 'trackName' + i}, searchedTracks[i].name),
                            React.createElement('p', {id : 'artistName' + i}, searchedTracks[i].artists[0].name)
                        )
                    );
                    tracks.push(track);
                }
                SetRenderedTracks(tracks);
            });        
    }

    function SelectSong(e){
        var element = e.target;
        while(element.nodeName !== "DIV" || element.className != "songOption"){
            element = element.parentNode;
        }

        for(var i = 0; i < 10; i++){
            var option = document.getElementById("option" + i);
            if(option){
                option.style.color = "white";
            }
            else{
                break;
            }
        }
        console.log("trackName: " + trackName + " artistsName: " + artistName + ", eleTrack: " + element.children[1].children[0].innerHTML + ", eleArtist: " + element.children[1].children[1].innerHTML)
        if(trackName != element.children[1].children[0].innerHTML && artistName != element.children[1].children[1].innerHTML){
            element.style.color = "red";    
            SetTrackName(element.children[1].children[0].innerHTML);
            SetArtistName(element.children[1].children[1].innerHTML);
            SetCanSubmit(true);
        }
        else{
            SetTrackName("");
            SetArtistName("");
            SetCanSubmit(false);
        }
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
                                    <div id='appleMusicTab'>
                                        <img id='appleMusicImage' src='Spotify_Logo_CMYK_Green.png'/>
                                    </div>
                                </div>
                                <div id='spotifySearchDiv'>
                                    {renderedTracks}
                                </div>
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

export default App;