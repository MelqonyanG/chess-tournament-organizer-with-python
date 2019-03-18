import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.css'
import * as $ from 'jquery';
import '../node_modules/chessboardjs/www/css/chessboard.css'
import data from './clientConfig.json';
import './app.css';
import ChessBoard from 'chessboardjs'
import MainPage from "./components/MainPage";
import ShowAdminPage from "./components/ShowAdminPage";
import ShowTournaments from "./components/ShowTournaments";
import ShowRounds from "./components/ShowRounds";
import ShowGames from "./components/ShowGames";
import StartGame from "./components/StartGame";
import OfferDraw from "./components/OfferDraw";

window.jQuery = window.$ = $;


var socket = io.connect(data.server.host + ':' + data.server.port);

socket.on('connect', function () {
    ReactDOM.render(<MainPage />,document.getElementById("root"));
});

socket.on('showAdminPage', function (fromServer) {
    ReactDOM.render(<ShowAdminPage response={fromServer["msg"]} cmd={fromServer["cmd"]} data={fromServer["showData"]}/>,document.getElementById("root"));
});

socket.on('showTournaments', function (data) {
  ReactDOM.render(<ShowTournaments userId={data["userId"]}
  tournaments={data["tournaments"]} userName={data["userName"]}/>,
  document.getElementById("root"));
})

socket.on('showRounds', function (data) {
  if (document.getElementById("tourData") !== null) {
    ReactDOM.render(<ShowRounds userId={data["userId"]} points={data["points"]} rounds={data["rounds"]}/>,
    document.getElementById("tourData"));
  }
})

socket.on('showGames', function (data) {
  ReactDOM.render(<ShowGames userId={data["userId"]} tournament={data["tournament"]}
  round={data["round"]} games={data["games"]} userName={data["userName"]}/>,
  document.getElementById("root"));
})

socket.on('showGamesMove', function (data) {
    var gid = 'gm' + data['gid'];
    var isLiveBtn = 'live' + data['gid'];
    if (document.getElementById(gid) !== null) {
        ChessBoard(gid, data['fen']);
        if(data['isOnline'] && document.getElementById(isLiveBtn) !== null){
          document.getElementById(isLiveBtn).innerHTML = "Online";
        }
    }
});

socket.on('startGame', function (data) {
  ReactDOM.render(<StartGame userId={data["userId"]} userName={data["userName"]}
    whitePlayer={data["whitePlayer"]} blackPlayer={data["blackPlayer"]}
    roundData={data["roundData"]} gameData={data["gameData"]}
    cmd={data["cmd"]}/>, document.getElementById("root"));
})

socket.on('offerDraw', function (data) {
  if (document.getElementById("offerDraw") !== null) {
    ReactDOM.render(<OfferDraw userId={data["userId"]}
    gameId={data["gameId"]}/>, document.getElementById("offerDraw"));
  }
})

socket.on('responseMessage', function (data) {
  if (document.getElementById("response") !== null) {
    document.getElementById("response").innerHTML = data;
  }
})

export {socket};
