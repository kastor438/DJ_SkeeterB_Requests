import logo from './skeeterB-Logo.png';
import './App.css';
import React, { Component } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
        firebase.database.ref('Request').push().set({
            Song: songName,
            Author: authorName
        })
        .then((doc) => {
            // nothing to do here since you already have a 
            // connection pulling updates to Todos
        })
        .catch((error) => {
            dispatch(todoActions.showError("Error adding Todo to database"));
			console.error(error);
		})

        // Submit button animation
        $('.button--bubble').each(function() {
            var $circlesTopLeft = $(this).parent().find('.circle.top-left');
            var $circlesBottomRight = $(this).parent().find('.circle.bottom-right');
          
            var tl = new TimelineLite();
            var tl2 = new TimelineLite();
          
            var btTl = new TimelineLite({ paused: true });
          
            tl.to($circlesTopLeft, 1.2, { x: -25, y: -25, scaleY: 2, ease: SlowMo.ease.config(0.1, 0.7, false) });
            tl.to($circlesTopLeft.eq(0), 0.1, { scale: 0.2, x: '+=6', y: '-=2' });
            tl.to($circlesTopLeft.eq(1), 0.1, { scaleX: 1, scaleY: 0.8, x: '-=10', y: '-=7' }, '-=0.1');
            tl.to($circlesTopLeft.eq(2), 0.1, { scale: 0.2, x: '-=15', y: '+=6' }, '-=0.1');
            tl.to($circlesTopLeft.eq(0), 1, { scale: 0, x: '-=5', y: '-=15', opacity: 0 });
            tl.to($circlesTopLeft.eq(1), 1, { scaleX: 0.4, scaleY: 0.4, x: '-=10', y: '-=10', opacity: 0 }, '-=1');
            tl.to($circlesTopLeft.eq(2), 1, { scale: 0, x: '-=15', y: '+=5', opacity: 0 }, '-=1');
          
            var tlBt1 = new TimelineLite();
            var tlBt2 = new TimelineLite();
            
            tlBt1.set($circlesTopLeft, { x: 0, y: 0, rotation: -45 });
            tlBt1.add(tl);
          
            tl2.set($circlesBottomRight, { x: 0, y: 0 });
            tl2.to($circlesBottomRight, 1.1, { x: 30, y: 30, ease: SlowMo.ease.config(0.1, 0.7, false) });
            tl2.to($circlesBottomRight.eq(0), 0.1, { scale: 0.2, x: '-=6', y: '+=3' });
            tl2.to($circlesBottomRight.eq(1), 0.1, { scale: 0.8, x: '+=7', y: '+=3' }, '-=0.1');
            tl2.to($circlesBottomRight.eq(2), 0.1, { scale: 0.2, x: '+=15', y: '-=6' }, '-=0.2');
            tl2.to($circlesBottomRight.eq(0), 1, { scale: 0, x: '+=5', y: '+=15', opacity: 0 });
            tl2.to($circlesBottomRight.eq(1), 1, { scale: 0.4, x: '+=7', y: '+=7', opacity: 0 }, '-=1');
            tl2.to($circlesBottomRight.eq(2), 1, { scale: 0, x: '+=15', y: '-=5', opacity: 0 }, '-=1');
            
            tlBt2.set($circlesBottomRight, { x: 0, y: 0, rotation: 45 });
            tlBt2.add(tl2);
          
            btTl.add(tlBt1);
            btTl.to($(this).parent().find('.button.effect-button'), 0.8, { scaleY: 1.1 }, 0.1);
            btTl.add(tlBt2, 0.2);
            btTl.to($(this).parent().find('.button.effect-button'), 1.8, { scale: 1, ease: Elastic.easeOut.config(1.2, 0.4) }, 1.2);
          
            btTl.timeScale(2.6);
          
            $(this).on('mouseover', function() {
              btTl.restart();
            });
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
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="goo">
                            <defs>
                                <filter id="goo">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                                <feComposite in="SourceGraphic" in2="goo"/>
                                </filter>
                            </defs>
                            </svg>

                            <span class="button--bubble__container">
                            <a href="#campaign" class="button button--bubble">
                                Hover me
                            </a>
                            <span class="button--bubble__effect-container">
                                <span class="circle top-left"></span>
                                <span class="circle top-left"></span>
                                <span class="circle top-left"></span>

                                <span class="button effect-button"></span>

                                <span class="circle bottom-right"></span>
                                <span class="circle bottom-right"></span>
                                <span class="circle bottom-right"></span>
                            </span>
                            </span>
                            </div>
                    </header>
                </div>
            </div>
        );
    }
}

export default App;