import logo from './skeeterB-Logo.png';
import './App.css';
import React, { Component } from 'react';
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

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
        // firebase.database.ref('Request').push().set({
        //     Song: songName,
        //     Author: authorName
        // })
        // .then((doc) => {
        //     // nothing to do here since you already have a 
        //     // connection pulling updates to Todos
        // })
        // .catch((error) => {
        //     dispatch(todoActions.showError("Error adding Todo to database"));
		// 	console.error(error);
		// })
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
                    </header>
                </div>
            </div>
        );
    }
}

export default App;