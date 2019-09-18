import React, {Component} from 'react';
import './App.css';
import { Orchestrator } from "./components/Orchestrator";
import { Dropdown } from "./components/Dropdown";
import { getDefaultState } from "./knowledge/default_state.js";

import { Gin } from "./knowledge/Gin";
import Helpers from "./knowledge/Helpers";
import { rules } from "./knowledge/rules";
import { airport } from "./knowledge/piano_notes";
import $ from "jquery";
import CSlider from "./components/Controls";
import { soundManager } from "soundmanager2";
import Tone from "tone";
import _ from "lodash";



class App extends Component {
  constructor(props) {
    super(props);

    this.gin = new Gin("Generative", getDefaultState);
    this.gin.init();
    this.gin.registerRules(rules);
    this.gin.newGame();
    this.state = {
      fetched_sequence: [],
      sequence: []
    };

    this.helpers = new Helpers(this.gin);

    this.gin.addViewHandler(state => {
      console.log("set state " + state.tick);
      this.setState(state);
    });
    //this.gin.connectReact(this);
    this.gin.initLoop();
    this.state.initDone = false;
    this.gin.params["helpers"] = this.helpers;

  }

  componentDidMount() {
    this.gin.setState({
      initDone: true,
      fetched_sequence: []
    });
    this.helpers.requestSequence(this.gin);
    //this.helpers.drawCanvas();

    var note = _.sample(airport);



    //var synth = new Tone.FatOscillator(note.note + note.octave, "sine", 40).toMaster().start();

      setInterval(function() {
          note = _.sample(airport);
      }, 1000);

      soundManager.setup({
        url: '/path/to/swf-directory/',
        onready: function() {
          console.log("SM2 has loaded");
        },

        ontimeout: function() {
          console.log("Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue\n")
        }

      });
  }


  render() {
    return (
      
        <div className="App">
          <Dropdown/>
          <div className="app-content">
            {/* <canvas className="canvas" width="1050" height="700"></canvas> */}
            <h3 className="instructions">Each click generates sound (just wait for some notes to appear in the sequence table before clicking)</h3>
            {/* <CSlider value={this.gin.store.orchestrator.playback_rate} onChange={e => this.helpers.changePlaybackRate(this.state, e)} gin={this.gin} /> */}
            {!this.gin.store.game_paused ?
                (<div className="flex-container-row" style={{ height: "100%", justifyContent: "space-around"}}>
              <div className="controls">
                <div>{"Time: " + this.gin.store.frame}</div>
                <div>{"BPM: " + this.gin.store.frame_rate * 100}</div>
              </div>
              <div className="flex-container-column">
                {this.gin.store.fetched_sequence.length > 0  ? <Orchestrator fetched={false} state={this.state} gin={this.gin} /> : <div className="lds-dual-ring"></div>}
                </div>
            </div>) : <div><button className="btn btn-sequence" onClick={() => this.gin.playGame()}>Generate</button></div>}
          </div>
        </div>
    );
  }
}

export default App;
