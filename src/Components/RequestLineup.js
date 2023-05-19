import '../StyleSheets/RequestLineup.css';
import '../StyleSheets/SkeeterSpecificsRequestLineup.css'

import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, remove, child, get, onValue, update, enableLogging } from "firebase/database";
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Zoom';
import axios from 'axios';

import SkeeterPanel from './SkeeterPanel';

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
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const database = getDatabase(app);

const clientID = '822b607fa31944ca91f198b9f5e31613';
const clientSecret = '4aae0065891841c197af65473ac00b49';

const RequestLineup = props => {
  const [selectedPreapprovalSongIDs, SetSelectedPreapprovalSongIDs] = useState([]);
  const [sortChoice, SetSortChoice] = useState('Chronological');
  const [lineupTracks, SetLineupTracks] = useState([]);
  const [preapprovalLineupTracks, SetPreapprovalLineupTracks] = useState([]);
  const [recentSnapshot, SetRecentSnapshot] = useState({});

  const recentSnapshotRef = useRef({});
  recentSnapshotRef.current = recentSnapshot;

  const sortChoiceRef = useRef("Chronological");
  sortChoiceRef.current = sortChoice;

  const lineupTracksRef = useRef([]);
  lineupTracksRef.current = lineupTracks;
  
  const preapprovalLineupTracksRef = useRef([]);
  preapprovalLineupTracksRef.current = preapprovalLineupTracks;

  const db = getDatabase();
  const dbRef = ref(getDatabase());

  // DOM Refs
  const lineupGridContainerRef = useRef();
  const popupDivRef = useRef();
  const popupSpanRef = useRef();
  const skeeterLineupSelectDivRef = useRef();
  const lineupSelectButtonsDivRef = useRef();
  const preapprovalLineupOptionDivRef = useRef();
  const preapprovalButtonRef = useRef();
  const approvedLineupOptionDivRef = useRef();
  const lineupButtonRef = useRef();
  const preapprovalLineupDivRef = useRef();
  const lineupDivRef = useRef();
  const skeeterPreapprovalOptionsDivRef = useRef();

  useEffect(() => {
    const dbRootRef = ref(db, '/');
    onValue(dbRootRef, (snapshot) => {
      const data = snapshot.val();
      if(data){
        if(!data.Requests || !recentSnapshotRef.current || !recentSnapshotRef.current.Requests || data.Requests != recentSnapshotRef.current.Requests){
          SetRecentSnapshot(data);
          UpdateLineup(data.Requests);
        }        
        if(!data.PreapprovalRequests || !recentSnapshotRef.current || !recentSnapshotRef.current.PreapprovalRequests || data.PreapprovalRequests != recentSnapshotRef.current.PreapprovalRequests){
          UpdatePreapprovalLineup(data.PreapprovalRequests);
        }
      } 
    });
  }, []);
  
  useEffect(() => {
    if(props.showLineup){
      lineupGridContainerRef.current.style.display = "grid";
    }
    else{
      lineupGridContainerRef.current.style.display = "none"
    }
  }, [props.showLineup]);

  useEffect(() => {
    if(recentSnapshotRef.current && recentSnapshotRef.current.Requests){
      UpdateLineup(recentSnapshotRef.current.Requests);
    }
    if(recentSnapshotRef.current && recentSnapshotRef.current.PreapprovalRequests){
      UpdatePreapprovalLineup(recentSnapshotRef.current.PreapprovalRequests);
    }
  }, [sortChoice]);

  useEffect(() => {
    SwitchToPreapproval();
    get(child(dbRef, '/')).then((snapshot) => {
      if(snapshot != null){
        SetRecentSnapshot(snapshot.val());
        UpdateLineup(snapshot.val().Requests);
      }
    });
  }, [props.authUser]);

  function SwitchToPreapproval(){
    preapprovalLineupDivRef.current.style.display = 'block';
    preapprovalLineupOptionDivRef.current.style.backgroundColor = '#36393f';
    preapprovalButtonRef.current.style.color = '#f0f8ff'
    preapprovalButtonRef.current.style.borderBottom = '0px';
    preapprovalButtonRef.current.style.borderRight = '0px';
    preapprovalLineupOptionDivRef.current.style.borderRadius = '0 0 0 0';
    preapprovalButtonRef.current.style.borderRadius = '0 0 0 0';

    lineupDivRef.current.style.display = 'none';
    approvedLineupOptionDivRef.current.style.backgroundColor = '#292c33';
    lineupButtonRef.current.style.color = '#b4b7bb'
    lineupButtonRef.current.style.borderBottom = '1px solid black';
    lineupButtonRef.current.style.borderLeft = '1px solid black';
    approvedLineupOptionDivRef.current.style.borderRadius = '0 0 0 20px';
    lineupButtonRef.current.style.borderRadius = '0 0 0 20px';
    if(auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83') && selectedPreapprovalSongIDs.length > 0){
      skeeterPreapprovalOptionsDivRef.current.style.display = 'grid';
    }
  }

  function SwitchToLineup(){
    preapprovalLineupDivRef.current.style.display = 'none';
    preapprovalLineupOptionDivRef.current.style.backgroundColor = '#292c33';
    preapprovalButtonRef.current.style.color = '#b4b7bb'
    preapprovalButtonRef.current.style.borderBottom = '1px solid black';
    preapprovalButtonRef.current.style.borderRight = '1px solid black';
    preapprovalLineupOptionDivRef.current.style.borderRadius = '0 0 20px 0';
    preapprovalButtonRef.current.style.borderRadius = '0 0 20px 0';

    lineupDivRef.current.style.display = 'block';
    approvedLineupOptionDivRef.current.style.backgroundColor = '#36393f';
    lineupButtonRef.current.style.color = '#f0f8ff'
    lineupButtonRef.current.style.borderBottom = '0px';
    lineupButtonRef.current.style.borderLeft = '0px';
    approvedLineupOptionDivRef.current.style.borderRadius = '0 0 0 0';
    lineupButtonRef.current.style.borderRadius = '0 0 0 0';
    skeeterPreapprovalOptionsDivRef.current.style.display = 'none';
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
                (auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83') ? 
                  React.createElement('button', {id : 'removeRequestButton', 'data-requestkey' : sortedKeys[i], onClick : (e) => SkeeterRemoveSong(e.target)}, 'X')
                  :
                  React.createElement('span', {}, '')
                ),
                React.createElement('a', {id : 'lineupSpotifyLink' + sortedKeys[i], className : ((data[sortedKeys[i]].SpotifyURL != '' ? ' lineupSpotifyLink' : 'noSpotifyLink')), href : data[sortedKeys[i]].SpotifyURL, target : 'blank'}, '\uD83D\uDD17'),
                React.createElement('span', {}, ''))
            );
          lineup.push(track);
        }
        lineupButtonRef.current.innerHTML = `Lineup (${lineup.length})`;
      }
    }
    else{
      var noLineup = 
        React.createElement('p', {id : 'noLineup', key : 'noLineup'}, 'No requests yet!');
        lineup.push(noLineup);
        lineupButtonRef.current.innerHTML = 'Lineup';
    }
    SetLineupTracks(lineup);
    // console.log(lineupTracksRef.current);
  }

  function UpdatePreapprovalLineup(data){
    var preapprovalLineup = [];
    var sortedKeys = [];
    SetPreapprovalLineupTracks([]);

    if(data != null){
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
          React.createElement('div', {key : 'preapprovalLineup' + sortedKeys[i], id : 'preapprovalLineup' + sortedKeys[i], 'data-requestkey' : sortedKeys[i], className : (auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83') ? 'lineupSong lineupSongAdmin' : 'lineupSong'), onClick : (auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83') ? (e) => SelectPreapprovalSong(e.target) : null)},
            data[sortedKeys[i]].SpotifyImageURL != '' ?
            React.createElement('div', {className : 'lineupSongImageDiv'}, 
              React.createElement('img', {className : 'lineupSongImage', src : data[sortedKeys[i]].SpotifyImageURL, alt : 'Song Image'})
            ) : 
            React.createElement('div', {className : 'lineupSongImage'}, 
              React.createElement('h4', {className : 'customRequestHeader'}, 'Custom Request')
            ),
            React.createElement('div', {className : 'lineupSongInfo'},
              React.createElement('p', {id : 'preapprovalLineupSongName' + sortedKeys[i], className : 'lineupSongName'}, data[sortedKeys[i]].SongName),
              React.createElement('p', {id : 'preapprovalLineupArtistName' + sortedKeys[i]}, data[sortedKeys[i]].ArtistName),
              React.createElement('p', {id : 'preapprovalLineupRequestCount' + sortedKeys[i]}, "Requests: " + data[sortedKeys[i]].RequestCount)
            ),
            React.createElement('div', {className : 'preapprovalLineupVoteDiv upvote', 'data-requestkey' : sortedKeys[i], 'data-currvote' : userVote},
              React.createElement('a', {id : 'preapprovalLineup' + sortedKeys[i] + 'upvoteButton', className : 'lineupUpvoteButton upvote' + (upvoteOn ? ' upvote-on' : '') + (auth.currentUser ? '' : ' disabledVoteButton'), onClick : (e) => PreapprovalUpvoteSong(e.target)}, ),
              React.createElement('span', {className : 'count lineupVoteCount'}, data[sortedKeys[i]].Upvotes - data[sortedKeys[i]].Downvotes), 
              React.createElement('a', {id : 'preapprovalLineup' + sortedKeys[i] + 'downvoteButton', className : 'lineupDownVoteButton downvote' + (downvoteOn ? ' downvote-on' : '') + (auth.currentUser ? '' : ' disabledVoteButton'), onClick : (e) => PreapprovalDownvoteSong(e.target)}, )
            ), 
            React.createElement('div', {id : 'preapprovalSpotifyLinkDiv' + sortedKeys[i], className : 'spotifyLinkDiv'},
              React.createElement('span', {}, ''),
              React.createElement('a', {id : 'preapprovalLineupSpotifyLink' + sortedKeys[i], className : ((data[sortedKeys[i]].SpotifyURL != '' ? ' lineupSpotifyLink' : 'noSpotifyLink')), href : data[sortedKeys[i]].SpotifyURL, target : 'blank'}, '\uD83D\uDD17'),
              React.createElement('span', {}, ''))
          );
          preapprovalLineup.push(track);
        }
      }
      preapprovalButtonRef.current.innerHTML = `Preapproval (${preapprovalLineup.length})`
    }
    else{
      var noLineup = 
        React.createElement('div', {key : 'noUnapprovedLineup'}, 
          React.createElement('p', {className : 'noUnapprovedLineupText'}, 'No preapproval requests!'),
          React.createElement('p', {className : 'noUnapprovedLineupText'}, 'Get the word out bro...')
        );
        preapprovalLineup.push(noLineup);
        preapprovalButtonRef.current.innerHTML = 'Preapproval'
    }
    SetPreapprovalLineupTracks(preapprovalLineup);
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
      }
      else if(parent.dataset.currvote === 'down'){
        element.classList.add('upvote-on');
        parent.children[2].classList.remove('downvote-on');
        parent.dataset.currvote = 'up';
        voteChange = 1;
        downvoteChange = true;
      }
      else if(parent.dataset.currvote === 'none'){
        element.classList.add('upvote-on');
        parent.dataset.currvote = 'up';
        voteChange = 1;
      }

      get(child(dbRef, 'Requests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
        var voters = {};
        if(snapshot.val() != null && snapshot.val().Voters != null){
          Object.entries(snapshot.val().Voters).forEach(([key, value]) => {
            voters[key] = value;
          });
        }
        voters[auth.currentUser.uid] = parent.dataset.currvote !== 'none' ? parent.dataset.currvote : null;
        currUpvotes = snapshot.val().Upvotes;
        update(ref(db, 'Requests/' + parent.dataset.requestkey + '/'), {
          Upvotes : currUpvotes + voteChange,
          Downvotes : downvoteChange ? snapshot.val().Downvotes -1 : snapshot.val().Downvotes,
          Voters : voters
        });
      }).catch((error) => {
        console.error(error);
      });
    }
    else{
      popupSpanRef.current.innerHTML = 'You must be signed in to vote on requests!';
      popupDivRef.current.classList.add('popupOn');
      setTimeout(function(){
        popupDivRef.current.classList.remove('popupOn');
      }, 4000);
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
      }
      else if(parent.dataset.currvote === 'up'){
        element.classList.add('downvote-on');
        parent.children[0].classList.remove('upvote-on');
        parent.dataset.currvote = 'down';
        voteChange = 1;
        upvoteChange = true;
      }
      else if(parent.dataset.currvote === 'none'){
        element.classList.add('downvote-on');
        parent.dataset.currvote = 'down';
        voteChange = 1;
      }

      get(child(dbRef, 'Requests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
        var voters = {};
        if(snapshot.val() != null && snapshot.val().Voters != null){
          Object.entries(snapshot.val().Voters).forEach(([key, value]) => {
            voters[key] = value;
          });
        }
        voters[auth.currentUser.uid] = parent.dataset.currvote !== 'none' ? parent.dataset.currvote : null;
        currDownvotes = snapshot.val().Downvotes;
        update(ref(db, 'Requests/' + parent.dataset.requestkey + '/'), {
          Upvotes : upvoteChange ? snapshot.val().Upvotes -1 : snapshot.val().Upvotes,
          Downvotes : currDownvotes + voteChange,
          Voters : voters
        });
      }).catch((error) => {
        console.error(error);
      });
    }
    else{
      popupSpanRef.current.innerHTML = 'You must be signed in to vote on requests!';
      popupDivRef.current.classList.add('popupOn');
      setTimeout(function(){
        popupDivRef.current.classList.remove('popupOn');
      }, 4000);
    }
  }

  function PreapprovalUpvoteSong(element){
    if(auth.currentUser){
      var currUpvotes = 0;
      var parent = element.parentNode;
      var voteChange = 0;
      var downvoteChange = false;

      if(parent.dataset.currvote === 'up'){
        element.classList.remove('upvote-on');
        parent.dataset.currvote = 'none';
        voteChange = -1;
      }
      else if(parent.dataset.currvote === 'down'){
        element.classList.add('upvote-on');
        parent.children[2].classList.remove('downvote-on');
        parent.dataset.currvote = 'up';
        voteChange = 1;
        downvoteChange = true;
      }
      else if(parent.dataset.currvote === 'none'){
        element.classList.add('upvote-on');
        parent.dataset.currvote = 'up';
        voteChange = 1;
      }

      get(child(dbRef, 'PreapprovalRequests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
        var voters = {};
        if(snapshot.val() != null && snapshot.val().Voters != null){
          Object.entries(snapshot.val().Voters).forEach(([key, value]) => {
            voters[key] = value;
          });
        }
        voters[auth.currentUser.uid] = parent.dataset.currvote !== 'none' ? parent.dataset.currvote : null;
        currUpvotes = snapshot.val().Upvotes;
        update(ref(db, 'PreapprovalRequests/' + parent.dataset.requestkey + '/'), {
          Upvotes : currUpvotes + voteChange,
          Downvotes : downvoteChange ? snapshot.val().Downvotes -1 : snapshot.val().Downvotes,
          Voters : voters
        });
      }).catch((error) => {
        console.error(error);
      });
    }
    else{
      popupSpanRef.current.innerHTML = 'You must be signed in to vote on requests!';
      popupDivRef.current.classList.add('popupOn');
      setTimeout(function(){
        popupDivRef.current.classList.remove('popupOn');
      }, 4000);
    }
  }

  function PreapprovalDownvoteSong(element){
    if(auth.currentUser){
      var currDownvotes = 0;
      var parent = element.parentNode;
      var voteChange = 0;
      var upvoteChange = false;

      if(parent.dataset.currvote === 'down'){
        element.classList.remove('downvote-on');
        parent.dataset.currvote = 'none';
        voteChange = -1;
      }
      else if(parent.dataset.currvote === 'up'){
        element.classList.add('downvote-on');
        parent.children[0].classList.remove('upvote-on');
        parent.dataset.currvote = 'down';
        voteChange = 1;
        upvoteChange = true;
      }
      else if(parent.dataset.currvote === 'none'){
        element.classList.add('downvote-on');
        parent.dataset.currvote = 'down';
        voteChange = 1;
      }

      get(child(dbRef, 'PreapprovalRequests/' + parent.dataset.requestkey + '/')).then((snapshot) => {
        var voters = {};
        if(snapshot.val() != null && snapshot.val().Voters != null){
          Object.entries(snapshot.val().Voters).forEach(([key, value]) => {
            voters[key] = value;
          });
        }
        voters[auth.currentUser.uid] = parent.dataset.currvote !== 'none' ? parent.dataset.currvote : null;
        currDownvotes = snapshot.val().Downvotes;
        update(ref(db, 'PreapprovalRequests/' + parent.dataset.requestkey + '/'), {
          Upvotes : upvoteChange ? snapshot.val().Upvotes -1 : snapshot.val().Upvotes,
          Downvotes : currDownvotes + voteChange,
          Voters : voters
        });
      }).catch((error) => {
        console.error(error);
      });
    }
    else{
      popupSpanRef.current.innerHTML = 'You must be signed in to vote on requests!';
      popupDivRef.current.classList.add('popupOn');
      setTimeout(function(){
        popupDivRef.current.classList.remove('popupOn');
      }, 4000);
    }
  }

  function SelectPreapprovalSong(element){
    if(element.tagName == 'DIV'){
      var currSelectedSongIDs = selectedPreapprovalSongIDs;
      while(element.classList.contains('lineupSong') == false){
        element = element.parentNode;
      }
      if(element.classList.contains('selectedPreapprovalSongOption')){
        var preapprovalSongIDIndex = currSelectedSongIDs.indexOf(element.dataset.requestkey);
        currSelectedSongIDs.splice(preapprovalSongIDIndex, 1);
        element.classList.remove('selectedPreapprovalSongOption');
      }
      else{
        currSelectedSongIDs.push(element.dataset.requestkey);
        element.classList.add('selectedPreapprovalSongOption');
        SetSelectedPreapprovalSongIDs(currSelectedSongIDs);
      }
  
      console.log(currSelectedSongIDs);
      if(auth.currentUser && (auth.currentUser.uid === 'GXoCbNpX6lPq3hYxRvIrfvUXMsx1' || auth.currentUser.uid === 'bExKDb4uJTbis2GZOL8fm6clrw83') && selectedPreapprovalSongIDs.length > 0){
        skeeterPreapprovalOptionsDivRef.current.style.display = 'grid';
      }
      else{
        skeeterPreapprovalOptionsDivRef.current.style.display = 'none';
      }
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
    else if(sortChoiceRef.current == 'MostRecent'){
      Object.entries(data).forEach(([key, value]) => {
        var requestDateTime = new Date(value.DateTime);
        sortedDataType.push(requestDateTime);
      });
      sortedDataType.sort((a,b) =>  b - a);
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if(new Date(value.DateTime) - sortedDataType[i] == 0 && !sortedKeys.includes(key)){
            sortedKeys.push(key);
          }
        });
      }
      // console.log(sortedKeys);
    }
    else if(sortChoiceRef.current == 'SongName'){
      Object.entries(data).forEach(([key, value]) => {
        sortedDataType.push(value.SongName);
      });
      sortedDataType.sort();
      for(var i = 0; i < sortedDataType.length; i++){
        Object.entries(data).forEach(([key, value]) => {
          if(value.SongName === sortedDataType[i] && !sortedKeys.includes(key)){
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
          if(value.SongName === sortedDataType[i] && !sortedKeys.includes(key)){
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
          if(value.ArtistName === sortedDataType[i] && !sortedKeys.includes(key)){
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
          if(value.ArtistName === sortedDataType[i] && !sortedKeys.includes(key)){
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

  async function ApproveSongs(){
    skeeterPreapprovalOptionsDivRef.current.style.display = 'none';
    await get(child(dbRef, `/`)).then((snapshot) => {
      var nextKey = 1;
      if(snapshot.val().Requests){
        nextKey = Object.keys(snapshot.val().Requests).reduce((k1, k2) => parseInt(k1) >= parseInt(k2) ? parseInt(k1) : parseInt(k2)) + 1;
      }
      for(var i = 0; i < selectedPreapprovalSongIDs.length; i++){
        const songData = snapshot.val().PreapprovalRequests[selectedPreapprovalSongIDs[i]];
        set(ref(db, `Requests/${nextKey}`), {
          SongName : songData.SongName,
          ArtistName : songData.ArtistName,
          RequestCount: songData.RequestCount,
          SpotifyURL: songData.SpotifyURL,
          SpotifyImageURL: songData.SpotifyImageURL,
          Upvotes: songData.Upvotes,
          Downvotes: songData.Downvotes,
          RequestedBy: songData.RequestedBy,
          DateTime : (new Date()).toUTCString(),
          Approved : true
        });
        remove(ref(db, `PreapprovalRequests/${selectedPreapprovalSongIDs[i]}`));
      }
    });
    var currSelectedSongElements = document.querySelectorAll('.selectedPreapprovalSongOption');
    for(var i = 0; i < currSelectedSongElements.length; i++){
      currSelectedSongElements.classList.remove('selectedPreapprovalSongOption');
    }
    SetSelectedPreapprovalSongIDs([]);
  }

  async function DenySongs(){
    skeeterPreapprovalOptionsDivRef.current.style.display = 'none';
    for(var i = 0; i < selectedPreapprovalSongIDs.length; i++){
      if(recentSnapshot.PreapprovalRequests[selectedPreapprovalSongIDs[i]] != null){
        const songData = recentSnapshot.PreapprovalRequests[selectedPreapprovalSongIDs[i]];
        const requestDateTime = new Date(songData.DateTime);
        await get(child(dbRef, `/History/${requestDateTime.getDate()}-${requestDateTime.getMonth()+1}-${requestDateTime.getFullYear()}/`)).then((snapshot) => {
          var nextKey = 1;
          console.log(snapshot.val())
          if(snapshot.exists()){
            nextKey = parseInt(Object.keys(snapshot.val()).reduce((k1, k2) => parseInt(k1) >= parseInt(k2) ? parseInt(k1) : parseInt(k2))) + 1;
          }
          set(ref(db, `History/${requestDateTime.getDate()}-${requestDateTime.getMonth()+1}-${requestDateTime.getFullYear()}/${nextKey}`), {
            SongName : songData.SongName,
            ArtistName : songData.ArtistName,
            RequestCount: songData.RequestCount,
            SpotifyURL: songData.SpotifyURL,
            SpotifyImageURL: songData.SpotifyImageURL,
            Upvotes: songData.Upvotes,
            Downvotes: songData.Downvotes,
            RequestedBy: songData.RequestedBy,
            DateTime : songData.DateTime,
            Approved : false
          });
          remove(ref(db, `PreapprovalRequests/${selectedPreapprovalSongIDs[i]}`));
        });
      }
    }
    SetSelectedPreapprovalSongIDs([]);
  }

  function SkeeterRemoveSong(element){
    set(ref(db, 'Requests/' + element.dataset.requestkey), null);
  }

  return (
    <div id='lineupGridContainer' className='skeeterLineupGridContainer' ref={lineupGridContainerRef}>
      <select id='sortSelect' defaultValue={'Chronological'} onChange={SortMethodOnChange}>
        <option value='Chronological'>Chronological</option>
        <option value='MostRecent'>Most Recent</option>
        <option value='SongName'>Song A&#8594;Z</option>
        <option value='RevSongName'>Song Z&#8594;A</option>
        <option value='ArtistName'>Artist A&#8594;Z</option>
        <option value='RevArtistName'>Artist Z&#8594;A</option>
        <option value='TopRated'>Top Rated</option>
        <option value='MostHated'>Most Hated</option>
      </select>
      <div id='preapprovalAndLineupSelectDiv' ref={skeeterLineupSelectDivRef}>
        <div id='lineupSelectButtonsDiv' ref={lineupSelectButtonsDivRef}>
          <div id='preapprovalLineupOptionDiv' ref={preapprovalLineupOptionDivRef} className='lineupSelectButtonDiv'>
            <button ref={preapprovalButtonRef} className='lineupSelectButton' onClick={() => SwitchToPreapproval()}>Preapproval</button>
          </div>
          <div id='approvedLineupOptionDiv' ref={approvedLineupOptionDivRef} className='lineupSelectButtonDiv'>
            <button ref={lineupButtonRef} className='lineupSelectButton' onClick={() => SwitchToLineup()}>Lineup</button>
          </div>
        </div>
        <div id='preapprovalLineupDiv' ref={preapprovalLineupDivRef}>
          <div id='preapprovalLineupTracksDiv'>
            {preapprovalLineupTracksRef.current}
          </div>
        </div>
        <div id='lineupDiv' ref={lineupDivRef}>
          <div id='lineupTracksDiv'>
            {lineupTracksRef.current}
          </div>
        </div>
      </div>
      <div id='skeeterPreapprovalOptionsDiv' ref={skeeterPreapprovalOptionsDivRef}>
        <div id='skeeterPreapprovalApproveOptionDiv' className='skeeterPreapprovalOptionDiv'>
          <button id='skeeterPreapprovalApproveButton' className='skeeterPreapprovalOptionButton' onClick={() => ApproveSongs()}>Accept</button>
        </div>
        <div id='skeeterPreapprovalDenyOptionDiv' className='skeeterPreapprovalOptionDiv'>
          <button id='skeeterPreapprovalDenyButton' className='skeeterPreapprovalOptionButton' onClick={() => DenySongs()}>Deny</button>
        </div>
      </div>
      <div id='popupDiv' ref={popupDivRef}>
        <span id='popupSpan' ref={popupSpanRef}></span>
      </div>
    </div>
  );
}

export default RequestLineup;