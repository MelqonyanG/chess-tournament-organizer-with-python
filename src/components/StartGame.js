import React from 'react';
import {socket} from "../index";
import Chess from "../../node_modules/chess.js/chess";
import ChessBoard from "chessboardjs";

class StartGame extends React.Component {
  constructor(props) {
    super(props);
    const currentPgn = this.props.gameData[5];
    const currentFen = this.props.gameData[7];
    const whiteTime = this.props.gameData[3];
    const blackTime = this.props.gameData[4];
    const restWaitTime = this.countRestWaitTime(currentPgn, this.props.gameData[9]);
    const userTurn = (this.props.userId === this.props.gameData[1]) ? "white":"black";
    this.state = {
      userId:this.props.userId,
      userTurn: userTurn,
      flip : userTurn,
      fen: currentFen,
      pgn: currentPgn,
      whiteTime: this.secondsToTime(whiteTime),
      whiteSeconds: whiteTime,
      blackTime: this.secondsToTime(blackTime),
      blackSeconds: blackTime,
      waitTime: this.secondsToTime(restWaitTime),
      waitSeconds: restWaitTime,
      gameState: this.props.cmd
    }
    this.whiteTimer = 0;
    this.blackTimer = 0;
    this.waitTimer = 0;
    this.countRestWaitTime = this.countRestWaitTime.bind(this);
    this.flipBoard = this.flipBoard.bind(this);
    this.countDownWhite = this.countDownWhite.bind(this);
    this.countDownBlack = this.countDownBlack.bind(this);
    this.countDown = this.countDown.bind(this);
    this.updatePgn = this.updatePgn.bind(this);
    this.setStep = this.setStep.bind(this);
    this.gameOver = this.gameOver.bind(this);
    this.back = this.back.bind(this);
    this.resign = this.resign.bind(this);
    this.offerDraw = this.offerDraw.bind(this);
  }

  secondsToTime(secs){
      let minutes = Math.floor(secs / 60);
      let divisor_for_seconds = secs % 60;
      var seconds = Math.ceil(divisor_for_seconds);
      if (seconds === 60){
        seconds -= 1;
      }
      if(seconds < 10){
        seconds  = "0" + seconds;
      }
      let obj = {
        "m": minutes,
        "s": seconds
      };
      return obj;
    }

    componentWillReceiveProps(nextProps){
      clearInterval(this.waitTimer);
      const isOnline = nextProps.gameData[8];
      var wTime = nextProps.gameData[3];
      var bTime = nextProps.gameData[4];
      var fen = nextProps.gameData[7];
      var pgn = nextProps.gameData[5];
      const startDate = nextProps.gameData[9];
      var pgnList = pgn.split(" ");
      var fenData = fen.split(" ")
      var turn = fenData[1];
      this.setState({
        pgn: nextProps.gameData[5],
        fen: nextProps.gameData[7],
        waitTime: this.secondsToTime(this.countRestWaitTime(pgn, startDate)),
        waitSeconds: this.countRestWaitTime(pgn, startDate),
        gameState: nextProps.cmd
      });
      clearInterval(this.whiteTimer);
      clearInterval(this.blackTimer);
      if(pgnList.length > 2 && isOnline){
        if(turn === "w"){
          //set white clock
          this.setState({
            whiteTime: this.secondsToTime(wTime),
            whiteSeconds: wTime,
            blackTime: this.secondsToTime(bTime),
            blackSeconds: bTime
          });
          this.whiteTimer = setInterval(this.countDownWhite, 1000);
        }else if(turn === "b"){
          //set black clock
          clearInterval(this.whiteTimer);
          clearInterval(this.blackTimer);
          this.setState({
            whiteTime: this.secondsToTime(wTime),
            whiteSeconds: wTime,
            blackTime: this.secondsToTime(bTime),
            blackSeconds: bTime
          });
          this.blackTimer = setInterval(this.countDownBlack, 1000);
        }
      }
    }

  countRestWaitTime(pgn, gameStart){
    const roundData = this.props.roundData;
    const waitTime = roundData[2];
    const gameStartTime = new Date(gameStart);
    const currentDate = new Date();
    const pgnList = pgn.split(" ");
    var restWaitTime = 0;
    if(this.props.cmd === "play" && pgnList.length <= 2){
        restWaitTime = Math.floor(waitTime - (currentDate.getTime() - gameStartTime.getTime())/1000);
    }
    return restWaitTime;
  }


  countDownWhite() {
    let seconds = this.state.whiteSeconds - 1;
    if (seconds >= 0) {
      this.setState({
        whiteTime: this.secondsToTime(seconds),
        whiteSeconds: seconds,
      });
    }
    if (seconds === 0) {
      clearInterval(this.whiteTimer);
      this.setState({
        gameState: "Game is over. The white player's time is over"
      });
      var data = {
        "gameId": this.props.gameData[0],
        "winner": "black",
        "msg": "Game is over. The white player's time is over",
        "sid" : socket.id
      }
      socket.emit('gameResult', data);
    }
  }

  countDownBlack() {
    let seconds = this.state.blackSeconds - 1;
    if(seconds >= 0){
      this.setState({
        blackTime: this.secondsToTime(seconds),
        blackSeconds: seconds,
      });
    }
    if (seconds === 0) {
      clearInterval(this.blackTimer);
      this.setState({
        gameState: "Game is over. The black player's time is over"
      });
      var data = {
        "gameId": this.props.gameData[0],
        "winner": "white",
        "msg": "Game is over. The black player's time is over",
        "sid" : socket.id
      }
      socket.emit('gameResult', data);
    }
  }

  countDown(){
    const currentPgn = this.state.pgn;
    let seconds = this.countRestWaitTime(currentPgn, this.props.gameData[9]);
    if(seconds >= 0){
      this.setState({
        waitTime: this.secondsToTime(seconds),
        waitSeconds: seconds,
      });
    }
    if (seconds <= 0) {
      clearInterval(this.waitTimer);
      var pgnStr = this.state.pgn;
      var pgnSan = pgnStr.split(" ");
      pgnSan = pgnSan.splice(0, pgnSan.length - 1);
      var winner;
      var msg;
      if (pgnSan.length === 0){
        winner = "black";
        msg = "Game is over. White player does not make first move."
      }else if (pgnSan.length === 1){
        winner = "white";
        msg = "Game is over. Black player does not make first move."
      }
      var data = {
        "gameId": this.props.gameData[0],
        "winner": winner,
        "msg": msg,
        "sid" : socket.id
      }
      socket.emit('gameResult', data);
    }
  }
    render() {
      var pgnStr = this.state.pgn;
      var pgnSan = pgnStr.split(" ");
      pgnSan = pgnSan.splice(0, pgnSan.length - 1);
      var num = 1;
      var uKey = 1;
      var pgnButton = [];
      for (let g = 0; g < pgnSan.length - 1; g += 2) {
        pgnButton.push(<span key = {uKey++}>
            <span onClick={(step) => this.setStep(g)}>{(num++)  + ". " +pgnSan[g]}</span>
            {'\u00A0'}
            <span onClick={(step) => this.setStep(g+1)}>{pgnSan[g+1] + " "}</span>
            </span>);
        }
        if (pgnSan.length % 2 === 1) {
          pgnButton.push(<span key = {uKey++}>
            <span onClick={(step) => this.setStep(pgnSan.length - 1)}>
              {(num++)  + ". " + pgnSan[pgnSan.length - 1]}
              </span>
            </span>)
        }
      var whiteClock = this.state.whiteTime;
      var blackClock = this.state.blackTime;
      var gameMode = this.props.cmd;
      const whitePlayer = this.props.whitePlayer;
      const blackPlayer = this.props.blackPlayer;
      const waitTime = this.state.waitTime;
      const waitSeconds = this.state.waitSeconds;
      return (
        <div className="container">
        <div className="row">
          <div>
            <span>{this.props.userName}</span>
            <button type="button" onClick={this.back} style={{backgroundColor:"black",color:"white"}}><i className="fa fa-arrow-left"></i></button>
          </div>
        </div>
          <div className="row">
            {
                  waitSeconds > 0 ?
                  (
                    pgnSan.length === 0 ?(
                      <div className="registerbtn" style={{backgroundColor:"white"}}>
                        <h5 style={{color:"black"}}>{"White Player Please make your first move during:"} {waitTime.m}m : {waitTime.s}s</h5>
                      </div>
                    ):(
                      <div className="registerbtn" style={{backgroundColor:"black"}}>
                        <h5 style={{color:"white"}}>{"Black Player Please make your first move during:"} {waitTime.m}m : {waitTime.s}s</h5>
                      </div>
                    )
                  ):""
            }
            </div>
          <div className="row">
          <div className="col-md-1">
            <button type="button" title="Flip Board" onClick={this.flipBoard}><i className="fa fa-refresh fa-spin fa-3x fa-fw"></i></button>
            {
            gameMode === "play" && pgnSan.length > 1?
              (<div>
                <button type="button" title="Resign" onClick={this.resign}><i className="fa fa-flag fa-3x fa-fw" aria-hidden="true"></i></button>
              <button type="button" title="Draw" onClick={this.offerDraw}><i className="fa fa-handshake-o fa-3x fa-fw"></i></button>
            </div>):""
            }
          </div>
            <div className="col-md-7">
              <div className="row" style={{"width": "100%"}} id="clockDIV">
                <div className="col-md-5" style={{textAlign: 'center', width:"100%"}}>
                  <button className="btn-lg bg-light text-black" disabled>
                  <span>{whitePlayer}</span><br/>
                  <span>{whiteClock.m} : {whiteClock.s}</span>
                  </button>
                </div>
                <div className="col-md-2">
                <h4 style={{textAlign: 'center'}}>{this.props.gameData[6]}</h4>
                </div>
                <div className="col-md-5" style={{textAlign: 'center', width:"100%"}}>
                  <button className="btn-lg bg-dark text-white" disabled>
                  <span>{blackPlayer}</span><br/>
                  <span>{blackClock.m} : {blackClock.s}</span>
                  </button>
                </div>
              </div>
              <div id="chessboard" style={{"width": "100%"}}></div>
            </div>
            <div className="col-md-4">
              <div className="container">
                <div className="scrollmenu" id="displayPGN" style={{weight: '100%'}}>
                  <h1 style={{textAlign: 'center'}}>PGN</h1>
                  <hr/>
                  <div id="pgnList">
                    {pgnButton}
                  </div>
                </div>
                <div id="result">
                {this.state.gameState}
                </div>
                <div id="offerDraw"></div>
                <div id="response"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    updateComponent(){
        var fen = this.state.fen;
        var turn = this.state.flip;
        const userTurn = this.state.userTurn;
        var gameId = this.props.gameData[0];
        var pgn = this.props.gameData[5];
        var foo = this.updatePgn;
        var gameMode = this.state.gameState;
        var userId = this.state.userId;
        var draggable = (gameMode === "play") ? true: false;
        var board,
        move,
        game = new Chess(fen);

        var onDragStart = function(source, piece, position, orientation) {
          if(userTurn.charAt(0) === 'w'){
            if (game.in_checkmate() === true || game.in_draw() === true ||
            piece.search(/^b/) !== -1) {
              return false;
            }
          }else{
            if (game.in_checkmate() === true || game.in_draw() === true ||
            piece.search(/^w/) !== -1) {
            return false;
            }
          }
        };

        var onDrop = function(source, target) {
          move = game.move({
          from: source,
          to: target,
          promotion: 'q'
          });

          if (move === null) return 'snapback';
        };

        if(game.game_over()){
          this.gameOver(game);
        }

        var onSnapEnd = function() {
          board.position(game.fen());
          var move = game.history()[(game.history()).length - 1];
          pgn += (move + " ");
          foo(pgn, game.fen());
          var sendingData = {
            "fen": game.fen(),
            "pgn": pgn,
            "gameId": gameId,
            "userId": userId,
            "sid" : socket.id,
            "cmd": gameMode
          };
          socket.emit('sendFen', sendingData);
        };

        var cfg = {
          draggable: draggable,
          orientation: turn,
          position:fen,
          onDragStart: onDragStart,
          onDrop: onDrop,
          onSnapEnd: onSnapEnd
        };
        board = ChessBoard('chessboard', cfg);
    }

    updatePgn(currentPgn, currentFen){
      this.setState({
        pgn: currentPgn,
        fen: currentFen
      });
    }

    gameOver(game){
      clearInterval(this.whiteTimer);
      clearInterval(this.blackTimer);
      let winner = game.turn() === "b" ? "white" : "black";
      var msg = "";
      if(this.state.gameState === "play"){
        if(game.insufficient_material()){
          winner = "draw";
          msg = "Game is drawn due to insufficient material.";
          this.setState({
            gameState: "Game is drawn due to insufficient material."
          });
        }else if(game.in_checkmate()){
          msg = "Game is over due to move has been checkmated. \n" + winner + " won";
          this.setState({
            gameState: "Game is over due to move has been checkmated. \n" + winner + " won"
          });
        }else if(game.in_stalemate()){
          winner = "draw";
          msg = "Game is drawn due to move has been stalemated.";
          this.setState({
            gameState: "Game is drawn due to move has been stalemated."
          });
        }else{
          winner = "draw";
          msg = "Game ended in a draw";
          this.setState({
            gameState: "Game ended in a draw"
          });
        }
      }
      var data = {
        "gameId": this.props.gameData[0],
        "winner": winner,
        "msg": msg,
        "sid" : socket.id
      }
      socket.emit('gameResult', data);
    }

    componentDidUpdate(prevState){
      clearInterval(this.waitTimer);
      if(this.state.waitSeconds > 0){
        this.waitTimer = setInterval(this.countDown, 1000);
      }
      this.updateComponent();
     }

    componentDidMount() {
      const isOnline = this.props.gameData[8];
      const pgn = this.state.pgn;
      var pgnList = pgn.split(" ");
      pgnList = pgnList.splice(0, pgnList.length - 1);
      if(pgnList.length >= 2 && isOnline){
        clearInterval(this.whiteTimer);
        clearInterval(this.blackTimer);
        if(pgnList.length % 2 === 0){
          this.whiteTimer = setInterval(this.countDownWhite, 1000);
        }else{
          this.blackTimer = setInterval(this.countDownBlack, 1000);
        }
      }
      if(this.state.waitSeconds > 0){
        this.waitTimer = setInterval(this.countDown, 1000);
      }
      this.updateComponent()
      }

    componentWillUnmount() {
      clearInterval(this.whiteTimer);
      clearInterval(this.blackTimer);
      clearInterval(this.waitTimer);
      }

    setStep(num){
      const pgn = this.state.pgn;
      const pgnList = pgn.split(" ");
      if(pgnList[pgnList.length-1] === ""){
        pgnList.splice(-1,1);
      }
      var turn = (this.props.userId === this.props.gameData[1]) ? "white":"black";
      const step = ((turn === "black" && pgnList.length % 2 ===1) ||
      (turn === "white" && pgnList.length % 2 === 0)) ? true : false;
      if((num === pgnList.length - 1) && step){
        this.updateComponent()
      }else{
        const chessSelect = new Chess();
        for (var i = 0; i <= num; i++) {
          chessSelect.move(pgnList[i]);
        }
        var newFen = chessSelect.fen();
        this.setState({
          fen: newFen
        });
      }
    }

    flipBoard(){
      const flip = this.state.flip;
        if(flip === "white"){
          this.setState({flip : "black"});
        }else{
          this.setState({flip : "white"});
        }
      }

      resign(){
        const userId = this.state.userId;
        const player1ID = this.props.gameData[1];
        var winner;
        var msg;
        if(userId === player1ID){
          winner = "black";
          msg = "Game is over. White player resigns."
        }else{
          winner = "white";
          msg = "Game is over. Black player resigns."
        }
        const responseData = {
          "gameId": this.props.gameData[0],
          "userId": userId,
          "response": "resign"
        }
        socket.emit("responsResignOrDraw", responseData);
        var data = {
          "gameId": this.props.gameData[0],
          "winner": winner,
          "msg": msg,
          "sid" : socket.id
        }
        socket.emit('gameResult', data);
      }

      offerDraw(){
        const data ={
          "userId": this.state.userId,
          "gameId": this.props.gameData[0],
          "sid": socket.id
        }
        socket.emit("offerDraw", data)
      }

    back(){
      var data = {
          "userId": this.state.userId,
          "gameId": this.props.gameData[0],
          "sid": socket.id
        }
        socket.emit('leaveGame', data);
      }
}

export default StartGame;
