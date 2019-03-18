import React from "react";
import ReactDOM from 'react-dom';
import {socket} from "../index";
import MainPage from "./MainPage";

class ShowTournaments extends React.Component {
  checkTime(startTime, endTime){
    var currentDate = new Date();
    var tournamentStartDate = new Date(startTime);
    var tournamentEndDate = new Date(endTime);
    var cur = currentDate.getTime();
    var start = tournamentStartDate.getTime();
    var end = tournamentEndDate.getTime();
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

  isRegisterTour(userId, tourUsersId){
    var ids = tourUsersId.map((user) => {
      return parseInt(user[0],10)
    });
    return ids.includes(userId);
  }

  registerTour(e, data){
      e.stopPropagation();
      const msg = {
        "userId": this.props.userId,
        "tourId": data[0],
        "sid": socket.id
      }
      socket.emit('registerInTour', msg);
  }

  unregisterTour(e, data){
      e.stopPropagation();
      const msg = {
        "userId": this.props.userId,
        "tourId": data[0],
        "sid": socket.id
      }
      socket.emit('unregisterInTour', msg);
  }

  getTour(data){
    const msg = {
      "userId": this.props.userId,
      "tourId": data[0],
      "sid": socket.id
    }
    socket.emit('getTournamentsRounds', msg);
  }
  Comparator(a, b) {
   if (a[0] < b[0]) return 1;
   if (a[0] > b[0]) return -1;
   return 0;
 }

    render() {
      const live = (  <div id="on-air">
        <i className="fa fa-circle fa-xs"></i>
        <span className="live">Online</span>
      </div>);
      var uKey = 1;
      var tours = this.props.tournaments;
      tours = tours.sort(this.Comparator)
      var rows = tours.map((tour) => {
      let userId = this.props.userId;
      let rowID = `row${tours.indexOf(tour)}`;
      return <li key = {uKey++} id={rowID} onClick={(t) => this.getTour(tour)}>
              <a style={{textAlign: 'left'}}>
                <div className="row">
                  <div className="col-md-8">
                    <h6>{"Event"}: {tour[1]}</h6>
                    <h6>Place: {tour[2]}</h6>
                    <h6>{"Start Date"}: {tour[3]}</h6>
                    <h6>{"End Date"}: {tour[4]}</h6>
                    <h6>Move rate: {tour[5]} minutes + {tour[6]} seconds per move</h6>
                    <h6>Rounds Count: {tour[7]}</h6>
                  </div>
                  <div className="col-md-4">
                    {
                      this.checkTime(tour[3], tour[4]) === "before" ?
                      (
                        this.isRegisterTour(userId, tour[9])?
                        (
                          <span style={{'float' : "right"}}>
                          <button type="button" id="unregisterBTN" onClick={(e, t) => this.unregisterTour(e, tour)}>Unregister</button>
                          </span>
                        ):(
                          <span style={{'float' : "right"}}>
                          <button type="button" id="registerBTN" onClick={(e, t) => this.registerTour(e, tour)}>Register</button>
                          </span>
                        )
                      ):
                      (
                        this.isRegisterTour(userId, tour[9])?
                        (
                          <i className="fa fa-check" aria-hidden="true"></i>
                        ):(
                          ""
                        )
                      )
                    }
                    <h5>{tour[10]?live:""}</h5>
                  </div>
                </div>
              </a>
            </li>
      });

        return (
          <div className="container">
          <div className="row">
            <div>
              <span>{this.props.userName}</span>
              <button type="button" onClick={this.back} style={{backgroundColor:"black",color:"white"}}><i className="fa fa-arrow-left"></i></button>
            </div>
          </div>
            <div className="row">
              <div className="col-md-4">
                <ul id="myUL">
                  {rows}
                </ul>
              </div>
              <div className="col-md-8">
                <div id="tourData">
                </div>
              </div>
            </div>
          </div>

      )
    }

    back(){
      ReactDOM.render(<MainPage />,document.getElementById("root"));
    }
}

export default ShowTournaments;
