import React from "react";
import {socket} from "../index";
import ChessBoard from "chessboardjs";

class ShowGames extends React.Component {
  constructor(props) {
    super(props);
    var currentDate = new Date();
    var roundDate = new Date(props.round[2]);
    var difference = Math.floor((roundDate.getTime() - currentDate.getTime())/1000);
    this.state = {
      time: this.secondsToTime(difference),
      seconds: difference
    };
    this.timer = 0;
    this.countDown = this.countDown.bind(this);
    this.back = this.back.bind(this);
    this.getGame = this.getGame.bind(this);
  }

  checkTime(startTime, endTime){
    var currentDate = new Date();
    var roundStartDate = new Date(startTime);
    var roundEndDate = new Date(endTime);
    var cur = currentDate.getTime();
    var start = roundStartDate.getTime();
    var end = roundEndDate.getTime();
    var relation;
    if(cur < start){
      relation = "before";
    }else if (cur >= start && cur < end){
      relation = "during";
    }else{
      relation = "after";
    }
    return relation;
  }

  checkRestTime(startTime, waitTime){
    var currentDate = new Date();
    var roundStart = new Date(startTime);
    var restTime = Math.floor(waitTime - (currentDate.getTime() - roundStart.getTime())/1000);
    return restTime;
  }

  secondsToTime(secs){
      let days = Math.floor(secs / (24 * 60 * 60));
      let divisor_for_hours = secs % (24 * 60 * 60);
      let hours = Math.floor(divisor_for_hours / (60 * 60));
      let divisor_for_minutes = secs % (60 * 60);
      let minutes = Math.floor(divisor_for_minutes / 60);
      let divisor_for_seconds = divisor_for_minutes % 60;
      var seconds = Math.ceil(divisor_for_seconds);
      if(seconds < 10){
        seconds  = "0" + seconds;
      }
      let obj = {
        "d": days,
        "h": hours,
        "m": minutes,
        "s": seconds
      };
      return obj;
    }

    countDown() {
      let seconds = this.state.seconds - 1;
      if (seconds >= 0) {
        this.setState({
          time: this.secondsToTime(seconds),
          seconds: seconds,
        });
      }
      if (seconds <= 0) {
        clearInterval(this.whiteTimer);
      }
    }

    getGame(data){
      const games = this.props.games;
      var game;
      for(var i = 0; i < games.length; i++){
        if(games[i][0] === data){
          game = games[i];
          break;
        }
      }
      const isOnline = game[12];
      const result = game[8];
      const roundData = this.props.round;
      const roundStart = roundData[2];
      const roundEnd = roundData[3];
      const waitTime = roundData[8];
      const gameStart = game[14];
      const gameState = this.checkTime(roundStart, roundEnd);
      const userId = this.props.userId;
      var sendMSG = true;
      var cmd;
      if(gameState === "before"){
        sendMSG = false;
      }else if(gameState === "during"){
        if(isOnline){
            if(userId === game[2] || userId === game[3]){
              cmd = "play";
            }else{
              cmd = "observeOnlineGame";
            }
        }else{
            const restTime = this.checkRestTime(gameStart,waitTime);
            if(restTime > 0 && result === "0-0"){
              if(userId === game[2] || userId === game[3]){
                cmd = "play";
              }else{
                cmd = "observeOnlineGame";
              }
            }else{
              cmd = "observeEndedGame";
            }
        }
      }else if(gameState === "after"){
        cmd = "observeEndedGame";
      }
      if(sendMSG){
        const msg = {
            "userId": userId,
            'gameId': data,
            "cmd": cmd,
            "sid" : socket.id
          }
          socket.emit('startGame', msg);
      }else{
        if(document.getElementById("msg" + data).innerHTML === "This game hasn't started yet."){
          document.getElementById("msg" + data).innerHTML = ""
        }else{
          document.getElementById("msg" + data).innerHTML = "This game hasn't started yet."
        }
      }
    }

    render() {
      const roundData = this.props.round;
      const tourData = this.props.tournament;
      const roundNum = roundData[1];
      const roundStart = roundData[2];
      const roundEnd = roundData[3];
      const couplesId = roundData[6];
      const usersData = roundData[7];
      const games = this.props.games;
      var opponents = [];
      for(var i = 0; i < couplesId.length; i++){
        let cpl = {}
        let user1Id = parseInt(couplesId[i][0],10);
        let user2Id = parseInt(couplesId[i][1],10);
        for(var j = 0; j < usersData.length; j++){
          if(user1Id !== user2Id){
            if(user1Id === parseInt(usersData[j][0],10)){
              cpl.user1Name = usersData[j][2] + " " + usersData[j][3];
              cpl.user1Point = usersData[j][1];
            }else if(user2Id === parseInt(usersData[j][0],10)){
              cpl.user2Name = usersData[j][2] + " " + usersData[j][3];
              cpl.user2Point = usersData[j][1];
            }
            for(var k = 0; k < games.length; k++){
              if(parseInt(games[k][2],10)===user1Id && parseInt(games[k][3],10)===user2Id){
                cpl.gameId = games[k][0];
                cpl.isLive = games[k][12];
              }
            }
          }else if(user1Id === parseInt(usersData[j][0],10)){
            cpl.user1Name = usersData[j][2] + " " + usersData[j][3];
            cpl.user1Point = 1.0;
            cpl.user2Name = "";
            cpl.user2Point = "_";
            cpl.gameId = "";
          }
        }
        opponents.push(cpl);
      }
      let uKey = 0;
      var rows = opponents.map((couple) => {
        return <tr key = {uKey++}>
                    <td>{couple["user1Name"]}</td>
                    <td>{couple['user1Point']}</td>
                    <td>-</td>
                    <td>{couple['user2Point']}</td>
                    <td>{couple['user2Name']}</td>
                </tr>
    });
    const live = (  <span id="on-air">
      <i className="fa fa-circle fa-xs"></i>
      <span className="live">Online</span>
    </span>);
    const listDIVS = opponents.map((game) =>
       (game["gameId"] !== ""?
       (<div key={game["gameId"]} id={game["gameId"]} onClick={(gm) => this.getGame(game["gameId"])}>
          <div id={"msg" + game["gameId"]}></div>
         <h4>{game["user2Name"]} {game["user2Point"]}</h4>
            <div className="row">
              <div className="col-md-6">
                <div id={"gm" + game["gameId"]} style={{"width": "200px"}}></div>
              </div>
              <div className="col-md-6" id={"live" + game["gameId"]}>
              <h6 style={{textAlign:"left"}}>{game["isLive"]?live:""}</h6>
              </div>
            </div>
         <h4>{game["user1Name"]} {game["user1Point"]}</h4>
         <br/>
       </div>):"")
    );
    var time = this.state.time;
    var seconds = this.state.seconds;
        return (
          <div className="container">
          <div className="row">
            <div>
              <span>{this.props.userName}</span>
              <button type="button" onClick={this.back} style={{backgroundColor:"black",color:"white"}}><i className="fa fa-arrow-left"></i></button>
            </div>
          </div>
            <div className="row">
              <div className="col-md-6">
              <div>
              {
                (
                  this.checkTime(roundStart, roundEnd) === "after" ?
                  (
                    (<div className="registerbtn">
                    The round already ended
                    </div>)
                  ):
                  (seconds > 0 ?
                    (<div className="registerbtn">
                    <h5>The Round begins in:</h5>
                    <h2>{time.d}d : {time.h}h : {time.m}m : {time.s}s</h2>
                    </div>):
                    (<div className="registerbtn">
                    The round already started
                    </div>)
                  )
              )
              }
              </div>

              <div>
                <h1>{tourData[0]}</h1>
                <h4>{tourData[1]} - {tourData[2]}</h4>
                <h3>Round {roundNum}</h3>
                <h5>Start: {roundStart}</h5>
                <h5>End: {roundEnd}</h5>
              </div>
              <h1 style={{textAlign:"center"}}>Standings</h1>
              <div className="scrollmenu" style={{height: '300px'}}>
                  <table className="table">
                  <tbody>
                    {rows}
                  </tbody>
                  </table>
              </div>
              </div>
              <div className="col-md-6">
              {listDIVS}
              </div>
            </div>
          </div>
      )
    }
    componentDidMount() {
      var seconds = this.state.seconds;
      if(seconds > 0){
        this.timer = setInterval(this.countDown, 1000);
      }
    const games = this.props.games;
      games.map((game) =>
          ChessBoard('gm' + game[0], game[4])
      );
    }

    back(){
      var data = {
        "roundId": this.props.round[0],
        "userId": this.props.userId,
        "sid": socket.id
      }
      socket.emit('backTour', data);
    }
}

export default ShowGames;
