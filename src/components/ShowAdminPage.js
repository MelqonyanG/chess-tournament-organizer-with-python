import React from "react";
import ReactDOM from 'react-dom';
import {socket} from "../index";
import MainPage from "./MainPage";

class ShowAdminPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        cmd: this.props.cmd,
        data: this.props.data,
        actionWithRow: "view",
        response: this.props.response
      };
      this.showUsers = this.showUsers.bind(this);
      this.showGames = this.showGames.bind(this);
      this.showRounds = this.showRounds.bind(this);
      this.showTournaments = this.showTournaments.bind(this);
      this.addRow = this.addRow.bind(this);
    }

    showUsers(){
      var users = this.state.data;
      var uKey = 1;
      var rows = users.map((user) => {
        let rowID = `row${users.indexOf(user)}`;
        return <tr key = {uKey++} id={rowID}>
                <td>{user[0]}</td>
                <td>{user[1]}</td>
                <td>{user[2]}</td>
                <td>{user[3]}</td>
                <td>{user[4]}</td>
                <td>{user[5]}</td>
                <td>
                  <button><i className="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                  <button><i className="fa fa-trash" aria-hidden="true"></i></button>
                  <button><i className="fa fa-eye" aria-hidden="true"></i></button>
                </td>
              </tr>
      });
      return rows;
    }

    showGames(){
      var games = this.state.data;
      var uKey = 1;
      var rows = games.map((game) => {
        let rowID = `row${games.indexOf(game)}`;
        return <tr key = {uKey++} id={rowID}>
                <td>{game[0]}</td>
                <td>{game[13]}</td>
                <td>{game[1]}</td>
                <td>{game[2]}</td>
                <td>{game[3]}</td>
                <td>{game[10]}</td>
                <td>{game[11]}</td>
                <td>{game[8]}</td>
                <td>
                  <button><i className="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                  <button><i className="fa fa-trash" aria-hidden="true"></i></button>
                  <button><i className="fa fa-eye" aria-hidden="true"></i></button>
                </td>
              </tr>
      });
      return rows;
    }

    showRounds(){
      var rounds = this.state.data;
      var uKey = 1;
      var rows = rounds.map((round) => {
        let rowID = `row${rounds.indexOf(round)}`;
        return <tr key = {uKey++} id={rowID}>
                <td>{round[0]}</td>
                <td>{round[1]}</td>
                <td>{round[2]}</td>
                <td>{round[3]}</td>
                <td>{round[4]}</td>
                {
                  (typeof round[2] === typeof "")?(
                    <td>
                      <button onClick={(t) => this.updateRound(round[0])}><i className="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                      <button onClick={(t) => this.deleteRound(round[0])}><i className="fa fa-trash" aria-hidden="true"></i></button>
                      <button onClick={(cmd,roundId) => this.getData("roundGames",round[0])}><i className="fa fa-eye" aria-hidden="true"></i></button>
                    </td>
                  ):(
                    <td>
                      <button onClick={(t) => this.addRound(round[0])}><i className="fa fa-check" aria-hidden="true"></i></button>
                      <button onClick={(t) => this.closeRow(round[0])}><i className="fa fa-close" aria-hidden="true"></i></button>
                    </td>
                  )
                }
              </tr>
      });
      return rows;
    }

    showTournaments(){
      var tours = this.state.data;
      var uKey = 1;
      var rows = tours.map((tour) => {
      let rowID = `row${tours.indexOf(tour)}`;
      return <tr key = {uKey++} id={rowID}>
                <td>{tour[0]}</td>
                <td>{tour[1]}</td>
                <td>{tour[2]}</td>
                <td>{tour[3]}</td>
                <td>{tour[4]}</td>
                <td>{tour[5]}</td>
                <td>{tour[6]}</td>
                <td>{tour[7]}</td>
                {
                  (typeof tour[1] === typeof "")?(
                    <td>
                      <button onClick={(t) => this.updateTour(tour[0])}><i className="fa fa-pencil-square-o" aria-hidden="true"></i></button>
                      <button onClick={(t) => this.deleteTour(tour[0])}><i className="fa fa-trash" aria-hidden="true"></i></button>
                      <button onClick={(cmd,tourId) => this.getData("tournamentRounds",tour[0])}><i className="fa fa-eye" aria-hidden="true"></i></button>
                    </td>
                  ):(
                    <td>
                      <button onClick={(t) => this.addTour(tour[0])}><i className="fa fa-check" aria-hidden="true"></i></button>
                      <button onClick={(t) => this.closeRow(tour[0])}><i className="fa fa-close" aria-hidden="true"></i></button>
                    </td>
                  )
                }
              </tr>
      });
      return rows;
    }

    componentWillReceiveProps(nextProps){
      this.setState({
        cmd: nextProps.cmd,
        data: nextProps.data,
        response: nextProps.response
      });
    }

    render() {
        var rows;
        var theadRows;
        if(this.state.cmd === "tournaments"){
          rows = this.showTournaments();
          theadRows = (
            <tr>
              <th>{"Id"}</th>
              <th>{"Event"}</th>
              <th>Place</th>
              <th>{"Start Date"}</th>
              <th>{"End Date"}</th>
              <th>{"Time"}</th>
              <th>{"Increase"}</th>
              <th>Rounds Count</th>
            </tr>
          );
        }else if(this.state.cmd === "rounds"){
          rows = this.showRounds();
          theadRows = (
            <tr>
              <th>{"Id"}</th>
              <th>{"Tour Id"}</th>
              <th>{"Start Date"}</th>
              <th>{"End Date"}</th>
              <th>{"Wait Time"}</th>
            </tr>
          );
        }else if(this.state.cmd === "games"){
          rows = this.showGames();
          theadRows = (
            <tr>
              <th>{"Id"}</th>
              <th>Tour Id</th>
              <th>Round Id</th>
              <th>{'Player1 ID'}</th>
              <th>{'Player2 ID'}</th>
              <th>{"Player1 Time"}</th>
              <th>{"Player2 Time"}</th>
              <th>Result</th>
            </tr>
          );
        }else if(this.state.cmd === "users"){
          rows = this.showUsers();
          theadRows = (
            <tr>
              <th>{"Id"}</th>
              <th>Name</th>
              <th>Surname</th>
              <th>Email</th>
              <th>Password</th>
              <th>User Type</th>
            </tr>
          );
        }
        return (
          <div  style={{"padding":"5%"}}>
            <div className="row">
                <button type="button" onClick={this.back} style={{backgroundColor:"black",color:"white"}}><i className="fa fa-arrow-left"></i></button>
            </div>
            <div className="row">
              <div className="col-md-3">
                <button type="button" className="registerbtn" id="tournamentsBTN" onClick={(cmd) => this.getData("tournaments")}>Tournaments</button>
              </div>
              <div className="col-md-3">
                <button type="button" className="registerbtn" id="roundBTN" onClick={(cmd) => this.getData("rounds")}>Round</button>
              </div>
              <div className="col-md-3">
                <button type="button" className="registerbtn" id="gamesBTN" onClick={(cmd) => this.getData("games")}>Games</button>
              </div>
              <div className="col-md-3">
                <button type="button" className="registerbtn" id="usersBTN" onClick={(cmd) => this.getData("users")}>Users</button>
              </div>
            </div>
              <div className="row" id="formDiv" style={{"width":"100%"}}>
                <div className="adminData">
                  {
                    this.state.cmd === "tournaments"?(
                      <button type="button" className="registerbtn" id="addTournamentBTN" onClick={(cmd,num) => this.addRow("t",7)}>Add Tournament</button>
                    ):(
                      this.state.cmd === "rounds"?(
                        <button type="button" className="registerbtn" id="addRoundBTN" onClick={(cmd,num) => this.addRow("r",4)}>Add Round</button>
                      ):("")
                    )
                  }
                  <div id="responseMessage">{this.state.response}</div>
                    <table id="simple-board">
                      <thead>
                        {theadRows}
                      </thead>
                      <tbody>
                      {rows}
                      </tbody>
                    </table>
              </div>
            </div>
          </div>
      )
    }

    addTour(tourId){
        var tour = [tourId];
        var item;
        var send = true;
        for(var j = 1; j <= 7; j++){
          item = document.getElementById("t" + tourId + j).value;
          if(item.length === 0){
            send = false;
            document.getElementById("t" + tourId + j).placeholder = "Please fill out this field";
          }else{
            if(this.state.actionWithRow === "add" && (j === 3 || j === 4)){
              item = item.replace("T", " ");
              item += ":00"
            }
            tour.push(item);
          }
        }
      if(send){
        if(this.state.actionWithRow === "add"){
          socket.emit("addTournament",{"tour":tour, "sid":socket.id});
        }else if(this.state.actionWithRow === "edit"){
          socket.emit("updateTournament",{"tour":tour, "sid":socket.id});
        }
      }else{
        document.getElementById("responseMessage").innerHTML = "Please complete all fields correct";
      }
    }

    deleteTour(tourId){
        socket.emit("deleteTournament",{"tourId":tourId, "sid":socket.id})
      }

      updateTour(tourId){
          var tours = this.state.data;
          for(let i = 0; i < tours.length; i++){
            if(tours[i][0] === tourId){
              var newRow = [tourId];
              for(var k = 1; k <= 7; k++){
                newRow.push(<input type="text" id={`t${tourId}${k}`} defaultValue={tours[i][k]} className="form-control"/>)
              }
              tours[i] = newRow;
            }
          }
          this.setState({
            data: tours,
            actionWithRow: "edit"
          });
        }

    addRound(data){
      var round = [data];
      var item;
      var send = true;
      for(var j = 1; j <= 4; j++){
        item = document.getElementById("r" + data + j).value;
        if(item.length === 0){
          send = false;
          document.getElementById("r" + data + j).placeholder = "Please fill out this field";
        }else{
          if(this.state.actionWithRow === "add" && (j === 2 || j === 3)){
            item = item.replace("T", " ");
            item += ":00"
          }
          round.push(item);
        }
      }
      if(send){
        if(this.state.actionWithRow === "add"){
          socket.emit("addRound",{"round":round, "sid":socket.id})
        }else if(this.state.actionWithRow === "edit"){
          socket.emit("updateRound",{"round":round, "sid":socket.id});
        }
      }else {
        document.getElementById("responseMessage").innerHTML = "Please complete all fields";
      }
    }

    deleteRound(roundId){
        socket.emit("deleteRound",{"roundId":roundId, "sid":socket.id})
      }

      updateRound(roundId){
          var rounds = this.state.data;
          for(let i = 0; i < rounds.length; i++){
            if(rounds[i][0] === roundId){
              var newRow = [roundId];
              for(var k = 1; k <= 4; k++){
                newRow.push(<input type="text" id={`r${roundId}${k}`} defaultValue={rounds[i][k]} className="form-control"/>)
              }
              rounds[i] = newRow;
            }
          }
          this.setState({
            data: rounds,
            actionWithRow: "edit"
          });
        }

    closeRow(deleteId){
      const num = (this.state.cmd === "rounds")? 4 : 7;
      if(this.state.actionWithRow === "add"){
        let data = this.state.data;
        for(let i = 0; i < data.length; i++){
          if(data[i][0] === deleteId){
            data.splice(i,1)
          }
        }
        this.setState({
          data: data
        });
      }else if(this.state.actionWithRow === "edit"){
        let data = this.state.data;
        for(let i = 0; i < data.length; i++){
          if(data[i][0] === deleteId){
            var newRow = [deleteId];
            for(var k = 1; k <= num; k++){
              newRow.push(data[i][k]["props"]["defaultValue"]);
            }
            data[i] = newRow;
          }
        }
        this.setState({
          data: data
        });
      }
    }

    addRow(cmd, num){
      var data = this.state.data;
      var ids = data.map((row) => {return row[0]});
      var currentId;
      if(ids.length === 0){
        currentId = 1;
      }else{
        const maxId = ids.reduce(function(a, b) {
            return Math.max(a, b);
        });
        currentId = maxId + 1;
      }
      var newRow = [currentId];
      for(var k = 1; k <= num; k++){
        if((cmd === "t" && (k === 3 || k === 4))|| (cmd === "r" && (k === 2 || k === 3))){
          newRow.push(<input type="datetime-local" id={`${cmd}${currentId}${k}`} className="form-control"/>)
        }else if((cmd === "t" && (k === 5 || k === 6 || k === 7))|| cmd === "r"){
          newRow.push(<input type="number" id={`${cmd}${currentId}${k}`} className="form-control"/>)
        }else{
          newRow.push(<input type="text" id={`${cmd}${currentId}${k}`} className="form-control"/>)
        }
      }
      data.push(newRow)
      this.setState({
        data: data,
        actionWithRow: "add"
      });
    }

    getData(cmd,num){
      var data;
      if(cmd === "users" || cmd === "games" || cmd === "rounds" || cmd === "tournaments"){
        data = {
          "cmd": cmd,
          "sid": socket.id
        }
      }else if(cmd === "tournamentRounds"){
        data = {
          "cmd": cmd,
          "tourId": num,
          "sid": socket.id
        }
      }else if(cmd === "tournamentRounds" || cmd === "tournamentGames" || cmd === "tournamentUsers"){
        data = {
          "cmd": cmd,
          "tourId": num,
          "sid": socket.id
        }
      }else if(cmd === "roundGames"){
        data = {
          "cmd": cmd,
          "roundId": num,
          "sid": socket.id
        }
      }else{
        data = ""
      }
      socket.emit("getDataForAdmin", data)
    }

    back(){
      ReactDOM.render(<MainPage />,document.getElementById("root"));
    }
}

export default ShowAdminPage;
