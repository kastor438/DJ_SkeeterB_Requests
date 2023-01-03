import logo from '../skeeterB-Logo.png';
import '../StyleSheets/SongRequests.css';
import '../StyleSheets/RequestLineup.css';
import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, ref, set, remove, child, get, onValue } from "firebase/database";
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Zoom';
import axios from 'axios';

require('upvote/lib/jquery.upvote.js');
// require('upvote/lib/jquery.upvote.css');
require('upvote/lib/images/sprites-stackoverflow.png');

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
const auth = getAuth(app);
const analytics = getAnalytics(app);
const database = getDatabase(app);

const clientID = '822b607fa31944ca91f198b9f5e31613';
const clientSecret = '4aae0065891841c197af65473ac00b49';

const SongRequests = () => {
  const [sortChoice, SetSortChoice] = useState('Chronological');
  const [accessToken, SetAccessToken] = useState("");
  const [canSubmit, SetCanSubmit] = useState(false);
  const [invalidChars, SetInvalidChars] = useState('\'"\\/');
  const [inputSongName, SetInputSongName] = useState("");
  const [inputArtistName, SetInputArtistName] = useState("");
  const [hasListener, SetHasListener] = useState(false);
  const [renderedTracks, SetRenderedTracks] = useState([]);
  const [lineupTracks, SetLineupTracks] = useState([]);
  const [trackImageLink, SetTrackImageLink] = useState("");
  const [trackName, SetTrackName] = useState('');
  const [artistName, SetArtistName] = useState('');
  const [trackSpotifyURL, SetTrackSpotifyURL] = useState("");
  const [spotifyActive, SetSpotifyActive] = useState(true);
  const [customActive, SetCustomActive] = useState(false);
  const [trackStats, SetTrackStats] = useState(false);
  const [requestSnapshot, SetRequestSnapShot] = useState({});

  const requestSnapshotRef = useRef({});
  requestSnapshotRef.current = requestSnapshot;

  const sortChoiceRef = useRef("Chronological");
  sortChoiceRef.current = sortChoice;

  const accessTokenRef = useRef("");
  accessTokenRef.current = accessToken;

  const inputSongNameRef = useRef("");
  inputSongNameRef.current = inputSongName;

  const inputArtistNameRef = useRef("");
  inputArtistNameRef.current = inputArtistName;

  const spotifyActiveRef = useRef(true);
  spotifyActiveRef.current = spotifyActive;

  const customActiveRef = useRef(false);
  customActiveRef.current = customActive;

  const renderedTracksRef = useRef([]);
  renderedTracksRef.current = renderedTracks;

  const lineupTracksRef = useRef([]);
  lineupTracksRef.current = lineupTracks;

  const canSubmitRef = useRef(false);
  canSubmitRef.current = canSubmit;

  const trackImageLinkRef = useRef("");
  trackImageLinkRef.current = trackImageLink;

  const trackNameRef = useRef("");
  trackNameRef.current = trackName;

  const artistNameRef = useRef("");
  artistNameRef.current = artistName;

  const trackSpotifyURLRef = useRef("");
  trackSpotifyURLRef.current = trackSpotifyURL;

  const trackStatsRef = useRef(false);
  trackStatsRef.current = trackStats;

  const db = getDatabase();
  const dbRef = ref(getDatabase());

  useEffect(() => {
    var currentUrl = window.location.href;
    var requestSongButton = document.getElementById("requestSongButton");
    requestSongButton.style.borderBottom = "1px solid white";
    requestSongButton.style.color = "#b1afaf";
    document.getElementById("requestGridContainer").style.display = "grid";

    var lineupButton = document.getElementById("lineupButton");
    lineupButton.style.borderBottom = "none";
    lineupButton.style.color = "white";
    document.getElementById("lineupGridContainer").style.display = "none"
    
    if(currentUrl.includes("dj")){
      SetTrackStats(true);
    }

    InitializeSpotify();

    const requestsRef = ref(db, '/');
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if(data){
        if(!data.Requests || !requestSnapshotRef.current || !requestSnapshotRef.current.Requests || data.Requests != requestSnapshotRef.current.Requests){
          SetRequestSnapShot(data);
          UpdateLineup(data.Requests);
        }
      } 
    });
  }, []);

  useEffect(() => {
    CheckValidInput();
  }, [inputSongName, inputArtistName, spotifyActive, customActive]);

  useEffect(() => {
    if(!canSubmitRef.current){
      document.getElementById('submitBtn').setAttribute("disabled", "disabled");
    }
    else{
      document.getElementById('submitBtn').removeAttribute("disabled");
    }
  }, [canSubmit]);
  
  useEffect(() => {
    if(requestSnapshotRef.current && requestSnapshotRef.current.Requests){
      UpdateLineup(requestSnapshotRef.current.Requests);
    }
  }, [sortChoice]);

  useEffect(() => {
    if(trackStatsRef.current){
      getUserData();
    }
  }, [trackStats]);
  const getUserData = async () => {
    const res = await axios.get('https://geolocation-db.com/json/');
    // console.log(res.data);

    if(trackStatsRef.current){
      var visitorCount = 0;
      get(child(dbRef, 'Vistors/' + res.data['country_code'] + '/' + res.data.city)).then((snapshot) => {
        if(snapshot != null){
          visitorCount = snapshot.val();
          // console.log(snapshot.val())
        }
        set(ref(db, 'Vistors/' + res.data['country_code'] + '/' + res.data.city), (visitorCount+1));
      });
    }
  }

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

  function InitializeAppleMusic(){

  }

  function SwitchToRequestSong(){
    var requestSongButton = document.getElementById("requestSongButton");
    requestSongButton.style.borderBottom = "1px solid white";
    requestSongButton.style.color = "#b1afaf";
    document.getElementById("requestGridContainer").style.display = "grid";

    var lineupButton = document.getElementById("lineupButton");
    lineupButton.style.borderBottom = "none";
    lineupButton.style.color = "white";
    document.getElementById("lineupGridContainer").style.display = "none"
  }

  function SwitchToCurrentLineup(){
    var requestSongButton = document.getElementById("requestSongButton");
    requestSongButton.style.borderBottom = "none";
    requestSongButton.style.color = "white";
    document.getElementById("requestGridContainer").style.display = "none";

    var lineupButton = document.getElementById("lineupButton");
    lineupButton.style.borderBottom = "1px solid white";
    lineupButton.style.color = "#b1afaf";
    document.getElementById("lineupGridContainer").style.display = "block";
  }

  function SwitchToSpotify(e){
    if(!spotifyActiveRef.current){
      let screenWidth = window.innerWidth;
      var spotifyTab = document.getElementById("spotifyTab");
      spotifyTab.style.backgroundColor = "#36393f";
      spotifyTab.style.zIndex = "3";
      // spotifyTab.style.borderWidth = "1px 1px 0 1px";
      spotifyTab.children[0].style.width = "55%";
      spotifyTab.children[0].style.marginTop = "8%";

      if(screenWidth <= 660){
        spotifyTab.children[0].style.marginTop = "4%";
        spotifyTab.children[0].style.width = "50%";
      }

      var customTab = document.getElementById("customTab");
      customTab.style.backgroundColor = "#2e2f32";
      customTab.style.zIndex = "2";
      // appleMusicTab.style.borderWidth = "1px";
      // if(screenWidth >= 1465){
      //   customTab.children[0].style.marginTop = "10%";
      //   customTab.children[0].style.fontSize = "24px";
      // }
      // else if(screenWidth >= 1250){
      //   customTab.children[0].style.marginTop = "8%";
      //   customTab.children[0].style.fontSize = "20px";
      // }
      // else if(screenWidth >= 1100){
      //   customTab.children[0].style.marginTop = "5%";
      //   customTab.children[0].style.fontSize = "18px";
      // }
      // else if(screenWidth >= 660){
      //   customTab.children[0].style.marginTop = "0%";
      //   customTab.children[0].style.fontSize = "16px";
      // }
      if(screenWidth <= 800)
        document.getElementById("renderedTracksDiv").style.height = "95%";
      else
        document.getElementById("renderedTracksDiv").style.height = "320px";

      SetSpotifyActive(true);
      SetCustomActive(false);
    }
  }

  function SwitchToCustom(e){
    if(!customActiveRef.current){
      var spotifyTab = document.getElementById("spotifyTab");
      spotifyTab.style.backgroundColor = "#2e2f32";
      spotifyTab.style.zIndex = "2";
      // spotifyTab.style.borderWidth = "1px";
      spotifyTab.children[0].style.width = "40%";
      spotifyTab.children[0].style.marginTop = "9%";

      var customTab = document.getElementById("customTab");
      customTab.style.backgroundColor = "#36393f";
      customTab.style.zIndex = "3";
      // appleMusicTab.style.borderWidth = "1px 1px 0 1px";
      // if(screenWidth >= 1465){
      //   customTab.children[0].style.marginTop = "10%";
      //   customTab.children[0].style.fontSize = "28px";
      // }
      // else if(screenWidth >= 1250){
      //   // customTab.children[0].style.marginTop = "10%";
      //   customTab.children[0].style.fontSize = "26px";
      // }
      // else if(screenWidth >= 1100){
      //   customTab.children[0].style.marginTop = "6%";
      //   customTab.children[0].style.fontSize = "20px";
      // }
      // else if(screenWidth >= 660){
      //   customTab.children[0].style.marginTop = "6%";
      //   customTab.children[0].style.fontSize = "18px";
      // }
      // document.getElementById("tracksDiv").style.display = "none";
      document.getElementById("tracksDiv").style.height = "0";
      document.getElementById("renderedTracksDiv").style.height = "0px";

      SetSpotifyActive(false);
      SetCustomActive(true);
      // CheckValidInput();
    }
  }

  function UpdateSongName(value){
    SetInputSongName(value);
  }

  function UpdateArtistName(value){
    SetInputArtistName(value);
  }

  function CheckValidInput(){
    let screenWidth = window.innerWidth;
    if(screenWidth <= 800)
      document.getElementById("tracksDiv").style.height = "0px";

    for(var i = 0; i < 50; i++){
      var option = document.getElementById("option" + i);
      if(option){
        option.style.color = "white";
      }
    }
      
    if(!customActiveRef.current || inputSongNameRef.current.length <= 1 || inputArtistNameRef.current.length <= 1){
      SetTrackName("");
      SetArtistName("");
      document.getElementById('submitBtn').setAttribute("disabled", "disabled");
      SetCanSubmit(false);
      SetRenderedTracks([]);
    }

    document.getElementById("renderedTracksDiv").style.overflowY = "hidden";

    if(inputSongNameRef.current.length <= 1){
      document.getElementById("renderedTracksDiv").style.display = "none";
      return;
    }
    else{
      for(var i = 0; i < inputSongNameRef.current.length; i++){
        if(invalidChars.includes(inputSongNameRef.current.substring(i, i+1))){
          document.getElementById("renderedTracksDiv").style.display = "none";
          return;
        }
      }
      for(i = 0; i < inputArtistNameRef.current.length; i++){
        if(invalidChars.includes(inputArtistNameRef.current.substring(i, i+1))){
          document.getElementById("renderedTracksDiv").style.display = "none";
          return;
        }
      }
    }
    if (hasListener === false) {
      document.getElementById('submitBtn').addEventListener("click", () => SubmitRequest());
      SetHasListener(true);
    }
    if(spotifyActiveRef.current){
      FetchSpotifySongs();
    }
    else if(customActiveRef.current && inputArtistNameRef.current.length > 1){
      CustomSetup();
    }
  }

  async function SubmitRequest(){
      if(canSubmitRef.current){
        
        if(auth.currentUser == null){
          const userEmail = 'Kastor438@hotmail.com';
          const userPassword = 'a2AwDnBy8hCsRZ2';
          try {
            await signInWithEmailAndPassword(auth, userEmail, userPassword);
            if(spotifyActiveRef.current){ 
              AddRequest(trackNameRef.current, artistNameRef.current, trackSpotifyURLRef.current, trackImageLinkRef.current);
            }
            else if(customActiveRef.current){
              AddRequest(inputSongNameRef.current, inputArtistNameRef.current, '', '');
            }
            signOut(auth);
          } catch (err) {
            console.error(err);
          }
        }
        else{
          if(spotifyActiveRef.current){ 
            AddRequest(trackNameRef.current, artistNameRef.current, trackSpotifyURLRef.current, trackImageLinkRef.current);
          }
          else if(customActiveRef.current){
            AddRequest(inputSongNameRef.current, inputArtistNameRef.current, '', '');
          }
        }

        
        document.getElementById('songNameInput').value = '';
        document.getElementById('artistNameInput').value = '';

        SetInputSongName('');
        SetInputArtistName('');
        SetTrackSpotifyURL('');
        SetTrackImageLink('')
        SetRenderedTracks([]);
      }
  }

  function AddRequest(songName, artistName, spotifyURL, spotifyImageLink){
    var nextSongID = 1;
    var songIDs = [];
    var songRequests = [];
    var addRequestBool = true;
    var songExistsID = -1;
    var prevRequestCount = 0;

    if(auth.currentUser != null){
      get(child(dbRef, 'Requests/')).then((snapshot) => {
        if (snapshot.exists()) {
          //console.log(snapshot.val());

          Object.entries(snapshot.val()).forEach(([key, value]) => {
            songIDs.push(key);
            songRequests.push(value);
          });

          for(var i = 0; i < songRequests.length; i++){
            if(songRequests[i].SongName == songName && songRequests[i].ArtistName == artistName){
              addRequestBool = false;
              prevRequestCount = songRequests[i].RequestCount;
              songExistsID = songIDs[i];
            }
          }

          if(addRequestBool){
            for(i = 0; i < songIDs.length; i++){
              if(songIDs[i] >= nextSongID){
                nextSongID = parseInt(songIDs[i]) + 1;
              }
            }
            set(ref(db, 'Requests/' + nextSongID + '/'), {
              SongName: songName,
              ArtistName: artistName,
              RequestCount: 1,
              SpotifyURL: spotifyURL,
              SpotifyImageURL: spotifyImageLink,
              Upvotes: 0,
              Downvotes: 0,
              Voters : {},
              RequestedBy : auth.currentUser.uid
            });
            document.getElementById('submissionText').innerHTML = "Request Sent!";
          }
          else{
            set(ref(db, 'Requests/' + songExistsID + '/RequestCount'), (prevRequestCount+1));
            document.getElementById('submissionText').innerHTML = "Request Already in Pool.";
          }
        } 
        else {
          set(ref(db, 'Requests/1/'), {
            SongName: songName,
            ArtistName: artistName,
            RequestCount: 1,
            SpotifyURL: spotifyURL,
            SpotifyImageURL: spotifyImageLink,
            Upvotes: 0,
            Downvotes: 0,
            Voters : {},
            RequestedBy : auth.currentUser.uid
          });
          document.getElementById('submissionText').innerHTML = "Request Sent!";
        }
        setTimeout(function(){document.getElementById('submissionText').innerHTML = "";}, 5000);
      }).catch((error) => {
        console.error(error);
      });

      if(trackStatsRef.current){
        get(child(dbRef, 'SongStatistics/')).then((snapshot) => {
          var songKey = -1;
          var newKeyIndex = 0;
          var statsSong;
          if (snapshot.exists()) {  
            Object.entries(snapshot.val()).forEach(([key, value]) => {
              var currKey = parseInt(key);
              if(value.SongName == songName){
                songKey = currKey;
                statsSong = value;
              }
              else if(newKeyIndex <= currKey){
                newKeyIndex = currKey+1;
              }
            });
          }

          if(songKey > -1){
            set(ref(db, 'SongStatistics/' + songKey + '/RequestCount'), (statsSong.RequestCount+1));
          }
          else{
            set(ref(db, 'SongStatistics/' + newKeyIndex + '/'), {
              SongName: songName,
              ArtistName: artistName,
              RequestCount: 1,
              SpotifyURL: spotifyURL
            });
          }
        }).catch((error) => {
          console.error(error);
        });
      }
    }
  }

  async function FetchSpotifySongs(){
    var songParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessTokenRef.current
      }
    }

    var songID = await fetch('https://api.spotify.com/v1/search?q=' + inputSongName + '&type=track&limit=50', songParams)
      .then(response => response.json())
      .then(data => {
        // console.log(data);
        var tracks = [];
        var searchedTracks = data.tracks.items;
        for(var i = 0; i < 50; i++){
          if(searchedTracks[i] == null)
            break;

          var artistFound = false;
          var searchingArtist = inputArtistName.length > 0 ? true : false;
          if(searchingArtist){
            for(var j = 0; j < searchedTracks[i].artists.length; j++){
              var currArtistName = searchedTracks[i].artists[j].name;
              var inputArtistNameIndex = 0;
              for(var k = 0; k < currArtistName.length; k++){
                if(currArtistName.length > k && currArtistName.substring(k, k+1).toLowerCase() == inputArtistName.substring(inputArtistNameIndex, inputArtistNameIndex+1).toLowerCase()){
                  inputArtistNameIndex++;
                  if(inputArtistNameIndex == inputArtistName.length){
                    artistFound = true;
                    break;
                  }
                }
              }
              if(artistFound){
                break;
              }
            }
          }
          var artistNames = searchedTracks[i].artists[0].name;
          for(var j = 1; j < searchedTracks[i].artists.length; j++){
            artistNames += ", " + searchedTracks[i].artists[j].name;
          }
          if(artistFound || !searchingArtist){
            var track = React.createElement('div', {key : 'option' + i, id : 'option' + i, className : 'songOption', onClick : (e) => SelectSong(e)},
              React.createElement('img', {className : 'songOptionImage', src : searchedTracks[i].album.images[0].url, alt : ''}),
              React.createElement('div', {className : 'songOptionInfo'},
                React.createElement('p', {id : 'trackName' + i, 'data-spotifyurl' : searchedTracks[i].external_urls.spotify}, searchedTracks[i].name),
                React.createElement('p', {id : 'artistName' + i}, artistNames)
              )
            );
            tracks.push(track);
          }
          if(tracks.length >= 10)
            break;
        }
        SetRenderedTracks(tracks);
        document.getElementById("renderedTracksDiv").style.display = "block";
        document.getElementById("renderedTracksDiv").style.overflowY = "scroll";
        let screenWidth = window.innerWidth;
        if(screenWidth <= 800){
          document.getElementById("tracksDiv").style.height = "40vh";      
          document.getElementById("renderedTracksDiv").style.height = "95%";
        }
        else{
          document.getElementById("renderedTracksDiv").style.height = "320px";
          document.getElementById("tracksDiv").style.height = "fit-content"
        }  
      }).catch((error) => {
        InitializeSpotify();
        FetchSpotifySongs();
      });        
  }

  // async function FetchAppleMusicSongs(){
  //   var songParams = {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': 'Bearer ' + accessToken
  //     }
  //   }

  //   var songID = await fetch('https://api.music.apple.com/v1/catalog/ca/search?types=songs&term=' + inputSongName, songParams)
  //     .then(response => response.json())
  //     .then(data => {
  //       // console.log(data);
  //       var tracks = [];
  //       var searchedTracks = data.tracks.items;
  //       for(var i = 0; i < 10; i++){
  //         if(searchedTracks[i] == null)
  //             break;

  //         var artistFound = false;
  //         var searchingArtist = inputArtistName.length > 0 ? true : false;
  //         if(searchingArtist){
  //           for(var j = 0; j < searchedTracks[i].artists.length; j++){
  //             var currArtistName = searchedTracks[i].artists[j].name;
  //             var inputArtistNameIndex = 0;
  //             for(var k = 0; k < currArtistName.length; k++){
  //               if(currArtistName.length > k && currArtistName.substring(k, k+1).toLowerCase() == inputArtistName.substring(inputArtistNameIndex, inputArtistNameIndex+1).toLowerCase()){
  //                 inputArtistNameIndex++;
  //                 if(inputArtistNameIndex == inputArtistName.length){
  //                   artistFound = true;
  //                   break;
  //                 }
  //               }
  //             }
  //             if(artistFound){
  //               break;
  //             }
  //           }
  //         }
  //         var artistNames = searchedTracks[i].artists[0].name;
  //         for(var j = 1; j < searchedTracks[i].artists.length; j++){
  //           artistNames += ", " + searchedTracks[i].artists[j].name;
  //         }
  //         if(artistFound || !searchingArtist){
  //           var track = React.createElement('div', {key : 'option' + i, id : 'option' + i, className : 'songOption', onClick : (e) => SelectSong(e)},
  //               React.createElement('img', {className : 'songOptionImage', src : searchedTracks[i].album.images[0].url, alt : ''}),
  //               React.createElement('div', {className : 'songOptionInfo'},
  //                   React.createElement('p', {id : 'trackName' + i}, searchedTracks[i].name),
  //                   React.createElement('p', {id : 'artistName' + i}, artistNames)
  //               )
  //           );
  //           tracks.push(track);
  //         }
  //       }
  //       SetRenderedTracks(tracks);
  //     });        
  // }

  function CustomSetup(){
    SetCanSubmit(true);
  }

  function SelectSong(e){
    var element = e.target;
    while(element.nodeName !== "DIV" || element.className != "songOption"){
      element = element.parentNode;
    }

    for(var i = 0; i < 50; i++){
      var option = document.getElementById("option" + i);
      if(option){
        option.style.color = "white";
      }
    }

    if(trackNameRef.current != element.children[1].children[0].innerHTML && artistNameRef.current != element.children[1].children[1].innerHTML){
      element.style.color = "red";   
      SetTrackImageLink(element.children[0].src); 
      SetTrackName(element.children[1].children[0].innerHTML);
      SetArtistName(element.children[1].children[1].innerHTML);
      SetTrackSpotifyURL(element.children[1].children[0].dataset.spotifyurl);
      // console.log(trackSpotifyURLRef.current + " " + element.children[1].children[0].dataset.spotifyurl);
      SetCanSubmit(true);
    }
    else{
      SetTrackImageLink("");
      SetTrackName("");
      SetArtistName("");
      SetCanSubmit(false);
    }
  }

  function UpdateLineup(data){
    var lineup = [];
    var sortedKeys = [];
    SetLineupTracks([]);

    if(data != null){
      // console.log("Data Before: " + data['1'].SongName);
      sortedKeys = SortLineup(data);
      for(var i = 0; i < sortedKeys.length; i++){
        if(data[sortedKeys[i]] != null){
          var userVote = 'none';
          var upvoteOn = false;
          var downvoteOn = false;
          // userID check
          if(auth.currentUser && data[sortedKeys[i]].Voters != null && data[sortedKeys[i]].Voters[auth.currentUser.uid]){
            userVote = data[sortedKeys[i]].Voters[auth.currentUser.uid];
            if(userVote == 'up'){
              upvoteOn = true;
            }
            else if(userVote == 'down'){
              downvoteOn = true;
            }
          }

          var track = 
          React.createElement('div', {key : 'lineup' + sortedKeys[i], id : 'lineup' + sortedKeys[i], className : 'lineupSong'},
            data[sortedKeys[i]].SpotifyImageURL != '' ?
            React.createElement('div', {className : 'lineupSongImageDiv'}, 
              React.createElement('img', {className : 'lineupSongImage', src : data[sortedKeys[i]].SpotifyImageURL, alt : 'Song Image'})
            ) : 
            React.createElement('div', {className : 'lineupSongImage'}, 
              React.createElement('h4', {className : 'customRequestHeader'}, 'Custom Request')
            ),
            React.createElement('div', {className : 'lineupSongInfo'},
              React.createElement('p', {id : 'lineupSongName' + sortedKeys[i], className : 'lineupSongName'}, data[sortedKeys[i]].SongName),
              React.createElement('p', {id : 'lineupArtistName' + sortedKeys[i]}, data[sortedKeys[i]].ArtistName),
              React.createElement('p', {id : 'lineupRequestCount' + sortedKeys[i]}, "Requests: " + data[sortedKeys[i]].RequestCount)
            ),
            React.createElement('div', {className : 'lineupVoteDiv upvote', 'data-requestkey' : sortedKeys[i], 'data-currvote' : userVote},
              React.createElement('a', {id : 'lineup' + sortedKeys[i] + 'upvoteButton', className : 'lineupUpvoteButton upvote' + (upvoteOn ? ' upvote-on' : '') + (auth.currentUser ? '' : ' disabledVoteButton'), onClick : (e) => UpvoteSong(e.target)}, ),
              React.createElement('span', {className : 'count lineupVoteCount'}, data[sortedKeys[i]].Upvotes - data[sortedKeys[i]].Downvotes), 
              React.createElement('a', {id : 'lineup' + sortedKeys[i] + 'downvoteButton', className : 'lineupDownVoteButton downvote' + (downvoteOn ? ' downvote-on' : '') + (auth.currentUser ? '' : ' disabledVoteButton'), onClick : (e) => DownvoteSong(e.target)}, )
            ), 
            React.createElement('div', {id : 'spotifyLinkDiv' + sortedKeys[i], className : 'spotifyLinkDiv'},
              React.createElement('span', {}, ''),
              React.createElement('a', {id : 'lineupSpotifyLink' + sortedKeys[i], className : ((data[sortedKeys[i]].SpotifyURL != '' ? ' lineupSpotifyLink' : 'noSpotifyLink')), href : data[sortedKeys[i]].SpotifyURL, target : 'blank'}, '\uD83D\uDD17'),
              React.createElement('span', {}, ''))
          );
          lineup.push(track);
        }
        // else if(localStorage.getItem('voted' + sortedKeys[i])){
        //   localStorage.removeItem('voted' + sortedKeys[i]);
        // }
      }
    }
    else{
      var noLineup = 
        React.createElement('p', {id : 'noLineup', key : 'noLineup'}, 'No requests yet!');
        lineup.push(noLineup);
    }
    SetLineupTracks(lineup);
    // console.log(lineupTracksRef.current);
  }

  function UpvoteSong(element){
    if(auth.currentUser){
      var currUpvotes = 0;
      var parent = element.parentNode;
      var voteChange = 0;
      var downvoteChange = false;

      if(parent.dataset.currvote === 'up'){
        element.classList.remove('upvote-on');
        parent.dataset.currvote = 'none';
        voteChange = -1;
        // localStorage.setItem('voted' + parent.dataset.requestkey, 'none');
        remove(ref(db, 'Requests/' + parent.dataset.requestkey + '/Voters/' + auth.currentUser.uid));
      }
      else if(parent.dataset.currvote === 'down'){
        element.classList.add('upvote-on');
        parent.children[2].classList.remove('downvote-on');
        parent.dataset.currvote = 'up';
        voteChange = 1;
        downvoteChange = true;
        // localStorage.setItem('voted' + parent.dataset.requestkey, 'up');
        set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Voters/' + auth.currentUser.uid), 'up');
      }
      else if(parent.dataset.currvote === 'none'){
        element.classList.add('upvote-on');
        parent.dataset.currvote = 'up';
        voteChange = 1;
        // localStorage.setItem('voted' + parent.dataset.requestkey, 'up');
        set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Voters/' + auth.currentUser.uid), 'up');
      }

      get(child(dbRef, 'Requests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
        currUpvotes = snapshot.val().Upvotes;
        set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Upvotes'), currUpvotes + voteChange);
        if(downvoteChange == true)
          set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Downvotes'), snapshot.val().Downvotes -1);
      }).catch((error) => {
        console.error(error);
      });
    }
  }

  function DownvoteSong(element){
    if(auth.currentUser){
      var currDownvotes = 0;
      var parent = element.parentNode;
      var voteChange = 0;
      var upvoteChange = false;

      if(parent.dataset.currvote === 'down'){
        element.classList.remove('downvote-on');
        parent.dataset.currvote = 'none';
        voteChange = -1;
        // localStorage.setItem('voted' + parent.dataset.requestkey, 'none');
        remove(ref(db, 'Requests/' + parent.dataset.requestkey + '/Voters/' + auth.currentUser.uid));
      }
      else if(parent.dataset.currvote === 'up'){
        element.classList.add('downvote-on');
        parent.children[0].classList.remove('upvote-on');
        parent.dataset.currvote = 'down';
        voteChange = 1;
        upvoteChange = true;
        // localStorage.setItem('voted' + parent.dataset.requestkey, 'down');
        set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Voters/' + auth.currentUser.uid), 'down');
      }
      else if(parent.dataset.currvote === 'none'){
        element.classList.add('downvote-on');
        parent.dataset.currvote = 'down';
        voteChange = 1;
        // localStorage.setItem('voted' + parent.dataset.requestkey, 'down');
        set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Voters/' + auth.currentUser.uid), 'down');
      }

      get(child(dbRef, 'Requests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
        currDownvotes = snapshot.val().Downvotes;
        set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Downvotes'), currDownvotes + voteChange);
        if(upvoteChange == true)
          set(ref(db, 'Requests/' + parent.dataset.requestkey + '/Upvotes'), snapshot.val().Upvotes -1);
      }).catch((error) => {
        console.error(error);
      });
    }
  }

  function SortMethodOnChange(e){
    SetSortChoice(e.target.value);
  }

  function SortLineup(data){
    const sortedKeys = [];
    var sortedDataType = [];
    if(sortChoiceRef.current == 'Chronological'){
      Object.entries(data).forEach(([key, value]) => {
        sortedKeys.push(key);
      });
    }
    else if(sortChoiceRef.current == 'SongName'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.SongName);
      });
      sortedDataType.sort();
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if(value.SongName === sortedDataType[i]){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'RevSongName'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.SongName);
      });
      sortedDataType.sort();
      for(var i = sortedDataType.length -1; i >= 0; i--){
        Object.entries(data).forEach(([key, value]) => {
          if(value.SongName === sortedDataType[i]){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'ArtistName'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.ArtistName);
      });
      sortedDataType.sort();
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if(value.ArtistName === sortedDataType[i]){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'RevArtistName'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.ArtistName);
      });
      sortedDataType.sort();
      for(var i = sortedDataType.length - 1; i >= 0; i--){
        Object.entries(data).forEach(([key, value]) => {
          if(value.ArtistName === sortedDataType[i]){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'TopRated'){
      Object.entries(data).forEach(([key, value]) => {
        if(!sortedDataType.includes(value.Downvotes - value.Upvotes)){
          sortedDataType.push(value.Downvotes - value.Upvotes);
        }
      });
      sortedDataType.sort(function(a,b){
        return a-b;
      });
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if((value.Downvotes - value.Upvotes) === sortedDataType[i] && !sortedKeys.includes(key)){
            sortedKeys.push(key);
          }
        });
      }
    }
    else if(sortChoiceRef.current == 'MostHated'){
      Object.entries(data).forEach(([key, value]) => {
        if(!sortedDataType.includes(value.Upvotes - value.Downvotes)){
          sortedDataType.push(value.Upvotes - value.Downvotes);
        }
      });
      sortedDataType.sort(function(a,b){
        return a-b;
      });
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if((value.Upvotes - value.Downvotes) === sortedDataType[i] && !sortedKeys.includes(key)){
            sortedKeys.push(key);
          }
        });
      }
    }

    return sortedKeys;
  }

  return (
    <div id='songRequestsDiv'>
      <ul id='requestAndLineupList'>
          <li id='requestSongOption' className='contentOption'><button id='requestSongButton' onClick={SwitchToRequestSong}>Request Song</button></li>
          <li id='lineupOption' className='contentOption'><button id='lineupButton' onClick={SwitchToCurrentLineup}>Current Lineup</button></li>
      </ul>
      <div id='contentDiv'>
        <div id='requestGridContainer'>
          <div id='formDiv'>
            <div id='songSearchTabs'>
              <div id='spotifyTab' onClick={e => SwitchToSpotify(e)}>
                <img id='spotifyImage' src='SpotifyLogo.png'/>
              </div>
              <div id='customTab' onClick={e => SwitchToCustom(e)}>
                <h4 id='customTag'>Custom</h4>
              </div>
            </div>
            <div id='searchDiv'>
              <div id='songDiv'>
                <label htmlFor='songNameInput' className='requestLabel'>
                  <input id='songNameInput' className='requestInput' name='songNameInput' type='text' placeholder="&nbsp;" autoComplete="off" onChange={e => UpdateSongName(e.target.value)}/>
                  <span className='label'>Song</span>
                  <span className='focus-bg'></span>
                </label>
              </div>
              <div id='artistDiv'>
                <label htmlFor='artistNameInput' className='requestLabel'>
                  <input id='artistNameInput' className='requestInput' name='artistNameInput' type='text' placeholder="&nbsp;" autoComplete="off" onChange={e => UpdateArtistName(e.target.value)}/>
                  <span className='label'>Artist</span>
                  <span className='focus-bg'></span>
                </label>
              </div>
              <div id='tracksDiv'>
                <div id='renderedTracksDiv'>
                  {renderedTracksRef.current}
                </div>
              </div>
            </div>
            <div>
              {/* <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 300 }} title="Must provide a song and artist name." placement="top-start"> */}
                  <span>
                    <button type='submit' id='submitBtn' disabled='disabled'>Submit Request</button>
                  </span>
              {/* </Tooltip> */}
            </div>
            <div id='submissionTextDiv'>
              <h4 id='submissionText'></h4>
            </div>
          </div>
        </div>
        <div id='lineupGridContainer'>
          <select id='sortSelect' defaultValue={'Chronological'} onChange={SortMethodOnChange}>
            <option value='Chronological'>Chronological</option>
            <option value='SongName'>Song A&#8594;Z</option>
            <option value='RevSongName'>Song Z&#8594;A</option>
            <option value='ArtistName'>Artist A&#8594;Z</option>
            <option value='RevArtistName'>Artist Z&#8594;A</option>
            <option value='TopRated'>Top Rated</option>
            <option value='MostHated'>Most Hated</option>
          </select>
          <div id='lineupDiv'>
            <div id='lineupTracksDiv'>
              {lineupTracksRef.current}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SongRequests;