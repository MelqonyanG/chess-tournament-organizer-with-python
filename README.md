# chess-tournament-organizer-with-python

chess-tournament-organizer-with-python is a chess-tournament organizer app.
## Features

  - In login page, you can login as admin or as user
  - **As Admin**
  --- Login and password of first admin is written in server_config.json file. This admin can add new admins
  --- **Admin can**:
            1. Look at all tournaments', rounds', games', users' lists
            2. Create new tournament, Edit tournaments, Delete tournaments
            3. Create new round, Edit rounds, Delete rounds
            4. Create new user (including new admins: set userType -> admin), Edit users, Delete users
 --- **User can**
            1. Look at all tournaments' list, Registrate on unregistere in the tournament
            2. Look at tournament's standings, games
            3. If user is registered in the tournament, he or she should star game in certain time
            4. After round, admin will create new round until tournament's end.
            5. If user don't start game in time, he or she will lost.

 ### Tech

real-time-chess uses a number of open source projects to work properly:
**client side**
* React js
* Bootstrap
* socket.io-client
* chessboardjs
* chess.js

**server side**
* Python3
* Flask
* eventlet
* psycopg2
* PostgreSQL

### Installation

real-time-chess client side requires [Node.js](https://nodejs.org/) v4+ and [npm](https://www.npmjs.com/). Server side requires [PostgreSQL](https://www.mongodb.com/) database.

Install the dependencies and start the server.
1. First of all you need start mongodb server
```sh
$ sudo service mongodb start
```
2.  Then you need to start real-time-chess server
```sh
$ cd real-time-chess/
$ pip install -r requirements.txt
$ python server.py
```

Install the dependencies and start the client.
```sh
$ cd real-time-chess/client
$ npm install
$ npm start
```
Verify the deployment by navigating to your server address in your preferred browser.

```sh
127.0.0.1:3000
```
or
```sh
localhost:3000
```
**screenshots**
![screenshot](/screenshot_game.png)
![screenshot](/screenshot_games_list.png)

# Tournament

Tournaments Organizer

To run this project you must have Python3,NodeJS,npm,PostgreSQL
    you can check versions
        python3 --version
        nodejs --version
        npm --version
        psql --version


1. for install Python3 [link](https://www.python.org/downloads/)
2. for install NodeJS [link](https://nodejs.org/en/download/package-manager/)
3. for install npm [link](https://docs.npmjs.com/)
3. for install PostgreSQL [link](http://postgresguide.com/setup/install.html)
    set your password in postgres [link](http://suite.opengeo.org/docs/latest/dataadmin/pgGettingStarted/firstconnect.html)

1. cd chess_tournaments
2. npm install
3. through the terminal create database  with name  tournamentsDB (DB type postgreSQL)

    createdb -h localhost -p 5432 -U postgres tournamentsDB
4. change  configurations  in the following files

    Server_side
       chess_tournaments/serverConfig.json

    Client_side
       chess_tournaments/src/clientConfig.json
5. install pip3

    sudo apt-get install python3-pip

6. you need to install  psycopg2 ,Flask , flask_socketio ,python-chess ,socketIO-client(for python)

    psycopg2         pip3 install psycopg2

    Flask            pip3 install Flask

    flask_socketio   pip3 install flask-socketio

    python-chess     pip3 install python-chess

    socketIO-client  pip3 install socketIO-client


Commands to start the program

// creating DB data
1. cd chess_tournaments
2. cd tournamentsDB
3. python3 script.py

// running server
1. cd chess_tournaments
2. python3 server.py

// running react - server
1. cd chess_tournaments
2. npm start

// running tournament generator
1. cd chess_tournaments
2. python3 createTournament.py

If the server was turned off after creating a tour, the server will not automatically create chess couples.
you should run `createTourCuples.py` and enter tournament's title, for creating chess couples
