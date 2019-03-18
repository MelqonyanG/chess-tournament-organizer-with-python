import React from "react";
import ReactDOM from 'react-dom';
import {socket} from "../index";
import MainPage from "./MainPage";
import Standings from "./Standings";

class ShowRounds extends React.Component {
       Comparator(a, b) {
         if (a[1] < b[1]) return 1;
         if (a[1] > b[1]) return -1;
         return 0;
       }
       ComparatorForRounds(a, b) {
        if (a[0] < b[0]) return 1;
        if (a[0] > b[0]) return -1;
        return 0;
      }
      render() {
        let users = this.props.points;
        users = users.sort(this.Comparator)
        let uKey = 0;
        var rows = users.map((user) => {
          let rowID = `row${user[0]}`;
          return <tr key = {uKey++} id={rowID}>
                      <td><b>{uKey}.</b></td>
                      <td>{user[2]} {user[3]}</td>
                      <td>{user[1]}</td>
                  </tr>
      });

      var rounds = this.props.rounds;
      rounds = rounds.sort(this.ComparatorForRounds)
      const live = (  <span id="on-air">
        <i className="fa fa-circle fa-xs"></i>
        <span className="live">Online</span>
      </span>);
      let uKeyR = 0;
      var roundRows = rounds.map((round) => {
        let rowID = `row${round[0]}`;
        return <li key = {uKeyR++} id={rowID} onClick={(rnd) => this.getRound(round)}>
              <h6>Round: {round[5]} {round[8]?live:""}</h6>
              <h6>Start: {round[2]}</h6>
              <h6>End: {round[3]}</h6>
              <hr/>
        </li>
    });
        return (
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <Standings standing={rows}/>
              </div>
              <div className="col-md-6">
              <div>
                  <table className="table">
                    <tbody>
                      <tr>
                        <td><h1>Rounds</h1></td>
                      </tr>
                    </tbody>
                  </table>
              </div>
              <div className="scrollmenu" style={{height: '300px'}}>
                <ul id="myUL">
                  {roundRows}
                </ul>
              </div>
              </div>
            </div>
          </div>
      )
    }

    getRound(data){
      const msg = {
        "userId": this.props.userId,
        "roundId": data[0],
        "sid": socket.id
      }
      socket.emit('getGames', msg);
    }

    back(){
      ReactDOM.render(<MainPage />,document.getElementById("root"));
    }
}

export default ShowRounds;
