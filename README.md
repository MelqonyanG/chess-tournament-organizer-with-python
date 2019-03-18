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
