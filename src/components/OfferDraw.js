import React from "react";
import {socket} from "../index";

class OfferDraw extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      offerDraw:true
    }
    this.accept = this.accept.bind(this);
    this.decline = this.decline.bind(this);
  }

  componentWillReceiveProps(){
    this.setState({offerDraw: true})
  }

    render() {
        return (
          <div className="container">
            {
              this.state.offerDraw?
              (<div className="offerDiv">
              <h3>Your opponent offers draw</h3>
              <button type="button" title="accept" className="btn-lg" onClick={this.accept} style={{backgroundColor:"white",color:"green"}}><i className="fa fa-check"></i></button>
              <button type="button" title="decline" className="btn-lg" onClick={this.decline} style={{backgroundColor:"white",color:"red"}}><i className="fa fa-close"></i></button>
              </div>):""
            }
          </div>
      )
    }

    accept(){
      const responseData = {
        "gameId": this.props.gameId,
        "userId": this.props.userId,
        "response": "accept"
      }
      this.setState({offerDraw: false})
      socket.emit("responsResignOrDraw", responseData);

      var data = {
        "gameId": this.props.gameId,
        "winner": "draw",
        "userId": this.props.userId,
        "msg": "Game ended in a draw",
        "sid" : socket.id
      }
      socket.emit('gameResult', data);
    }

    decline(){
        this.setState({offerDraw: false})
        const responseData = {
        "gameId": this.props.gameId,
        "userId": this.props.userId,
        "response": "decline"
      }
      socket.emit("responsResignOrDraw", responseData)
    }
}

export default OfferDraw;
