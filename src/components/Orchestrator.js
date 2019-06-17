import React from 'react';
import { notes } from "../knowledge/piano_notes"
import _ from "lodash";
import Sound from "react-sound";


export class Orchestrator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sequence: [],
      single_notes: [],
      text_sequence: "",
      number_of_note: 0,
      current_note: "",
      path_seq: [],
      x: 0,
      y: 0
    };
  }

  componentWillMount() {
    this.makeSequence();

    document.addEventListener("mousemove", e => {
      // this.setState({
      //   x: e.clientX,
      //   y: e.clientY
      // });
    });

    document.addEventListener("click", () => {
      this.setState({single_notes: [...this.state.single_notes, _.sample(this.props.gin.store.fetched_sequence)]});
    });

    this.props.gin.params.helpers.requestSequence(this.props.gin);
  }


  makeBeat() {
    let octave = _.sample([4, 5, 6]);

    let nextBeat = [];

    if (this.props.gin.store.sequence) {
      _.map(this.props.gin.store.sequence, item => {
        this.props.gin.params.helpers.fetchSequence(item);
        nextBeat.push(_.sample(_.filter(notes, note => note.note === item)));
      });
    }
    return _.shuffle(nextBeat);
  }

  makeSequence() {
    this.setState({sequence: [...this.makeBeat(), ...this.makeBeat(), ...this.makeBeat(), ...this.makeBeat()]});
  }

  nextParticle(timeout) {
    setTimeout(this.setState({number_of_note: this.state.number_of_note + 1}), _.random(5, 10) / timeout);
    if (this.state.number_of_note === this.state.sequence.length + this.state.path_seq.length) {
      this.makeSequence();
      this.setState({number_of_note: 0});
    }
  }

  render() {
    let sequence = this.state.sequence;
    let gin = this.props.gin;
    {console.log(this.props.gin.store.rhythm)}
    return (
        <div className="orchestrator" id="orchestrator-wrapper">
          <div className="">
            <button className="btn btn-sequence" onClick={() => gin.params.helpers.requestSequence(gin)}>Generate a sequence</button>
          </div>
          <div className="paths">

            {_.map(sequence, (item, key) => {
              return <div key={key}
                          className={this.state.number_of_note === key ? "current-note" : ""}>{item.note + item.octave}
                <Sound
                    url={item.file}
                    playbackRate={1 + ((this.state.y - this.state.x + 1) * 0.001)}
                    volume={10}
                    playStatus={Sound.status.PLAYING}
                    onFinishedPlaying={() => this.nextParticle(key)}
                />
              </div>
            })}

            {_.map(this.state.single_notes, (item, key) => {
              return <Sound
                  key={key}
                  url={item.file}
                  playbackRate={1}
                  volume={10}
                  playStatus={Sound.status.PLAYING}
                  onFinishedPlaying={() => this.setState({single_notes: _.filter(this.state.single_notes, note => note.file !== item.file)})}
              />
            })}

            {this.props.gin.store.fetched_sequence ?
                _.map(this.props.gin.store.fetched_sequence, (item, key) => {
                  return <div key={key}
                              className={this.state.number_of_note === key ? "current-note" : ""}>{item.note + item.octave}
                    <Sound
                        url={item.file}
                        playbackRate={1 + ((this.state.y - this.state.x + 1) * 0.001)}
                        volume={10}
                        playStatus={Sound.status.PLAYING}
                        onFinishedPlaying={() => this.nextParticle(key)}
                    />
                  </div>
                })
                : ""}

            {gin.store.rhythm ? gin.params.helpers.createOrchestrator(gin.store.rhythm)
              : "" }
          </div>
        </div>
    )

  }
}