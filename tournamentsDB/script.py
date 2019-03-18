import psycopg2
import json
import sys

with open('../serverConfig.json') as json_data_file:
    data = json.load(json_data_file)

psql = data['postgreSQL']

def createConnect():
    try:
        global conn
        conn = psycopg2.connect(database=psql['database'],
         user=psql['user'], password=psql['password'], host=psql['host'],port=psql['port'])
    except psycopg2.Error as e:
        print(e)
        sys.exit(0)

    try:
        global cur
        cur = conn.cursor()
    except psycopg2.Error as e:
        print(e)
        sys.exit(0)
    return cur

cur = createConnect()

try:
    cur.execute('''DROP TABLE if exists USERS cascade;;''')
except psycopg2.Error as e:
    print(e)
    createConnect()

try:
    cur.execute('''DROP TABLE if exists TOURNAMENTS cascade;;''')
except psycopg2.Error as e:
    print(e)
    createConnect()

try:
    cur.execute('''DROP TABLE if exists ROUNDS cascade;;''')
except psycopg2.Error as e:
    print(e)
    createConnect()

try:
    cur.execute('''DROP TABLE if exists GAMES cascade;;''')
except psycopg2.Error as e:
    print(e)
    createConnect()

#create users table
try:
    cur.execute('''CREATE TABLE USERS
        (
            ID          SERIAL PRIMARY KEY,
            name        VARCHAR(100)    NOT NULL,
            surname     VARCHAR(100)    NOT NULL,
            email       VARCHAR(100)    NOT NULL,
            password    VARCHAR(100)    NOT NULL,
            userType    VARCHAR(100)    NOT NULL
        );''')
except psycopg2.Error as e:
    print(e)
    createConnect()

#create tournaments table
try:
    cur.execute('''CREATE TABLE TOURNAMENTS
        (
            ID          SERIAL PRIMARY KEY,
            title       VARCHAR(100)    NOT NULL,
            place       VARCHAR(100)    NOT NULL,
            startDate   timestamp    NOT NULL,
            endDate     timestamp    NOT NULL,
            tourTime    INT    NOT NULL,
            tourInc     INT    NOT NULL,
            roundsCount INT    NOT NULL,
            roundsId    integer[]    NOT NULL,
            usersIdAndPoint   TEXT[][]    NOT NULL
        );''')
except psycopg2.Error as e:
    print(e)
    createConnect()

#create rounds table
try:
    cur.execute('''CREATE TABLE ROUNDS
        (
            ID              SERIAL PRIMARY KEY,
            roundNum        INT    NOT NULL,
            startDate       timestamp    NOT NULL,
            endDate         timestamp    NOT NULL,
            tourId          INT      references TOURNAMENTS(ID),
            gamesId         integer[]    NOT NULL,
            couplesId       integer[][]    NOT NULL,
            usersIdAndPoint TEXT[][]    NOT NULL,
            waitTime   INT NOT NULL,
            roundObserveList TEXT[][]    NOT NULL
        );''')
except psycopg2.Error as e:
    print(e)
    createConnect()

#create games table
try:
    cur.execute('''CREATE TABLE GAMES
        (
            ID          SERIAL PRIMARY KEY,
            roundId     INT     references ROUNDS(ID),
            tourId      INT      references TOURNAMENTS(ID),
            player1ID   INT   references USERS(ID),
            player2ID   INT   references USERS(ID),
            player1SID  VARCHAR(100),
            player2SID  VARCHAR(100),
            player1TimeS   INT   NOT NULL,
            player2TimeS   INT   NOT NULL,
            pgn         TEXT    NOT NULL,
            result      VARCHAR(100)    NOT NULL,
            fen         VARCHAR(100)    NOT NULL,
            observeList TEXT[][]    NOT NULL,
            isOnline    BOOLEAN NOT NULL,
            gameStart   VARCHAR(100) NOT NULL
        );''')
except psycopg2.Error as e:
    print(e)
    createConnect()

conn.commit()
conn.close()
