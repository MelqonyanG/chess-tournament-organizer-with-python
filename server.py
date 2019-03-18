#!usr/bin/python3
import psycopg2
from flask import Flask
import socketio
import eventlet
import os
import json
import sys
from datetime import datetime
import actionsForAdmin
import actionsForUser

with open('server_config.json') as json_data_file:
    data_server = json.load(json_data_file)

SERVER = data_server.get('server')
psql = data_server['postgreSQL']
serv = data_server['server']

APP = Flask(__name__)
SIO = socketio.Server()

actionsForAdmin.createAdmin(data_server)

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

@SIO.on('registerUser')
def joined(sid, data):
    cur = createConnect()
    cur.execute("SELECT email from users")
    emailTuple = cur.fetchall()
    emails = [i[0] for i in emailTuple]
    email = data["email"]
    data["userType"] = "user"
    if len(emails) == 0 or email not in emails:
        msg = "Successful registration"
        actionsForUser.addUser(data)
    else:
        msg = "Email already exist"
    SIO.emit('responseMessage', msg, room=sid)

@SIO.on('loginUser')
def on_getTournaments(sid, data):
    print(data)
    cur = createConnect()
    cur.execute("SELECT email, password from users")
    emailTuple = cur.fetchall()
    if (data["email"], data["password"]) in emailTuple:
        cur.execute("SELECT id, userType from USERS where email=(%s)", (data["email"],))
        userData = cur.fetchall()[0]
        userId = userData[0]
        userType = userData[1]
        if userType == "user":
            cur.execute("SELECT ID,title,place,startDate,endDate,tourTime,tourInc,roundsCount,roundsId,usersIdAndPoint from tournaments ORDER BY id")
            tournaments = cur.fetchall()
            tournaments = [[str(y) if isinstance(y, datetime) else y for y in x] for x in tournaments]
            userName = actionsForUser.getUserName(userId)
            SIO.emit('showTournaments', {"tournaments": actionsForUser.tourIsLive(tournaments), "userId": userId, "userName":userName}, room=sid)
        elif userType == "admin":
            SIO.emit('showAdminPage', {"cmd":"mainPage", "showData":""}, room=sid)
    else:
        msg = "You are not a registered user"
        SIO.emit('responseMessage', msg, room=sid)

@SIO.on('registerInTour')
def joined(sid, data):
    userId = data["userId"]
    tourId = data["tourId"]
    cur = createConnect()
    cur.execute("SELECT usersIdAndPoint from TOURNAMENTS where id=(%s)", (tourId,))
    tourUsers = cur.fetchall()[0][0]
    tourUsers.append([str(userId),str(0)])
    cur.execute("UPDATE TOURNAMENTS set usersIdAndPoint = (%s) where id=(%s)", (tourUsers, tourId))
    conn.commit()
    tournaments = actionsForUser.getTournaments()
    userName = actionsForUser.getUserName(userId)
    SIO.emit('showTournaments', {"tournaments": actionsForUser.tourIsLive(tournaments), "userId": userId, "userName":userName}, room=sid)

@SIO.on('unregisterInTour')
def joined(sid, data):
    userId = data["userId"]
    tourId = data["tourId"]
    cur = createConnect()
    cur.execute("SELECT usersIdAndPoint from TOURNAMENTS where id=(%s)", (tourId,))
    tourUsers = cur.fetchall()[0][0]
    tourUsers.remove([str(userId),str(0)])
    cur.execute("UPDATE TOURNAMENTS set usersIdAndPoint = (%s) where id=(%s)", (tourUsers, tourId))
    conn.commit()
    tournaments = actionsForUser.getTournaments()
    userName = actionsForUser.getUserName(userId)
    SIO.emit('showTournaments', {"tournaments": actionsForUser.tourIsLive(tournaments), "userId": userId, "userName":userName}, room=sid)

@SIO.on('getTournamentsRounds')
def joined(sid, data):
    userId = data["userId"]
    tourId = data["tourId"]
    cur = createConnect()
    rounds = actionsForUser.getRoundByTourId(tourId)
    cur.execute("SELECT usersIdAndPoint from TOURNAMENTS where id=(%s)", (tourId,))
    points = cur.fetchall()[0][0]
    for i in range(len(points)):
        usrId = int(points[i][0])
        cur.execute("SELECT name, surname from USERS where id=(%s)", (usrId,))
        points[i].extend(cur.fetchall()[0])
    SIO.emit('showRounds', {"points": points, "rounds":actionsForUser.roundIsLive(rounds), "userId": userId}, room=sid)

@SIO.on('getGames')
def on_getGames(sid, data):
    sid = sid
    userId = data["userId"]
    roundId = data["roundId"]
    cur = createConnect()
    actionsForUser.addUserToRoundObserveList(roundId,userId,sid)
    rounds = actionsForUser.getRoundById(roundId)
    tourId = rounds[4]
    games = actionsForUser.getGamesByRoundId(roundId)
    cur.execute("SELECT title, startDate, endDate from TOURNAMENTS where id=(%s)", (tourId,))
    tour = cur.fetchall()[0]
    tour = [str(y) if isinstance(y, datetime) else y for y in tour]
    userName = actionsForUser.getUserName(userId)
    SIO.emit('showGames', {"games":games, "round":rounds, "userId": userId, "tournament":tour, "userName":userName}, room=sid)

@SIO.on('startGame')
def joined(sid, data):
    now = datetime.now()
    cur = createConnect()
    cmd = data["cmd"]
    sid = sid
    userId = data["userId"]
    gameId = data["gameId"]
    cur.execute("SELECT player1ID,player2ID,roundId from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    player1ID = gameData[0]
    player2ID = gameData[1]
    roundId = gameData[2]
    actionsForUser.deleteUserFromRoundObserveList(roundId,userId)
    if cmd == "play":
        actionsForUser.setUserSidInGame(userId,player1ID,player2ID,sid,gameId)
    elif cmd == "observeOnlineGame":
        actionsForUser.setUserInGameObserveList(gameId, userId, sid)
    gameData = actionsForUser.getGameData(gameId, now)
    whitePlayer = actionsForUser.getUserName(player1ID)
    blackPlayer = actionsForUser.getUserName(player2ID)
    userName = actionsForUser.getUserName(userId)
    roundData = actionsForUser.getRoundByIdForGame(roundId)
    dataForUser = {
        "userId": userId,
        "cmd": cmd,
        "whitePlayer": whitePlayer,
        "blackPlayer": blackPlayer,
        "gameData": gameData,
        "roundData": roundData,
        "userName": userName
    }
    SIO.emit('startGame', dataForUser, room=sid)

@SIO.on('sendFen')
def joined(sid, data):
    stepTime = datetime.today()
    userId = data["userId"]
    gameId = data["gameId"]
    fen = data["fen"]
    pgn = data["pgn"]
    sid = sid
    cur = createConnect()
    actionsForUser.updateFenAndPGNAndTime(gameId, fen, pgn, str(stepTime))
    if len(pgn.split(" ")) == 3:
        cur.execute("UPDATE GAMES set isOnline=True where id = (%s)",(gameId,))
        conn.commit()
    if len(pgn.split(" ")) > 3:
        actionsForUser.updatePlayersTime(gameId,stepTime,userId)
    userName = actionsForUser.getUserName(userId)
    dataForUser = actionsForUser.createGameData(gameId, data["cmd"], userId, userName)
    SIO.emit('startGame', dataForUser, room=sid)
    actionsForUser.sendMoveOpponent(SIO, gameId, userId, dataForUser)
    actionsForUser.sendMoveGameObservers(SIO, gameId, dataForUser)
    actionsForUser.sendMoveRoundObservers(SIO, gameId)


@SIO.on('gameResult')
def joined(sid, data):
    gameId = data["gameId"]
    winner = data['winner']
    msg = data["msg"]
    cur = createConnect()
    cur.execute("SELECT isOnline from GAMES where id=(%s)", (gameId,))
    isOnline = cur.fetchall()[0][0]
    if isOnline:
        cur.execute("UPDATE GAMES set isOnline=False where id = (%s)",(gameId,))
        conn.commit()
        if winner == "white":
            actionsForUser.winnerWhite(gameId)
        elif winner == "black":
            actionsForUser.winnerBlack(gameId)
        elif winner == "draw":
            actionsForUser.drawResult(gameId)
        dataForUser = actionsForUser.createGameData(gameId, "observeEndedGame", 0, "")
        actionsForUser.sendResultPlayers(SIO, gameId, dataForUser)
        actionsForUser.sendResultObservers(SIO, gameId, dataForUser)

@SIO.on('leaveGame')
def on_leaveGame(sid, data):
    userId = data["userId"]
    gameId = data["gameId"]
    sid = sid
    cur = createConnect()
    actionsForUser.deleteUserFromGameObserveListById(gameId, userId)
    actionsForUser.deleteUserSidFromGamePlayerListById(gameId, userId)
    cur.execute("SELECT roundId from GAMES where id=(%s)", (gameId,))
    roundId = cur.fetchall()[0][0]
    msg = {
        "userId": userId,
        "roundId": roundId,
        "sid": sid
        }
    on_getGames(msg)


@SIO.on('backTour')
def on_backTour(sid, data):
    roundId = data["roundId"]
    userId = data["userId"]
    cur = createConnect()
    actionsForUser.deleteUserFromRoundObserveList(roundId,userId)
    cur.execute("SELECT email, password from users where id=(%s)", (userId,))
    emailTuple = cur.fetchall()[0]
    msg = {
        "email": emailTuple[0],
        "password": emailTuple[1],
        "sid": sid
        }
    on_getTournaments(msg)

@SIO.on('offerDraw')
def on_offerDraw(sid, data):
    gameId = data["gameId"]
    userId = data["userId"]
    cur.execute("SELECT player1SID, player2SID, player1ID, player2ID from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    player1SID = gameData[0]
    player2SID = gameData[1]
    player1ID = gameData[2]
    player2ID = gameData[3]
    if userId == player1ID:
        if player2SID != None:
            SIO.emit('offerDraw', {"gameId": gameId, "userId":player2ID}, room=player2SID)
        else:
            print("black opponent does not avaible")
    elif userId == player2ID:
        if player1SID != None:
            SIO.emit('offerDraw', {"gameId": gameId, "userId":player1ID}, room=player1SID)
        else:
            print("white opponent does not avaible")

@SIO.on("responsResignOrDraw")
def on_responsResignOrDraw(sid, data):
    cmd = data["response"]
    gameId = data["gameId"]
    userId = data["userId"]
    cur.execute("SELECT player1SID, player2SID, player1ID, player2ID from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    player1SID = gameData[0]
    player2SID = gameData[1]
    player1ID = gameData[2]
    player2ID = gameData[3]
    if cmd == "resign":
        response = "Your opponent resigns."
    else:
        response = "Your opponent " + cmd + "s your offer"
    if userId == player1ID:
        if player2SID != None:
            SIO.emit('responseMessage', response, room=player2SID)
        else:
            print("black opponent does not avaible")
    elif userId == player2ID:
        if player1SID != None:
            SIO.emit('responseMessage', response, room=player1SID)
        else:
            print("white opponent does not avaible")

@SIO.on("getDataForAdmin")
def on_getDataForAdmin(sid, data):
    dataForAdmin, cmd, msg = actionsForAdmin.on_getDataForAdmin(data)
    SIO.emit('showAdminPage', {"showData": dataForAdmin, "cmd": cmd, "msg":msg}, room=sid)

@SIO.on('addTournament')
def on_addTournament(sid, data):
    dataForAdmin, cmd, msg = actionsForAdmin.on_addTournament(data)
    SIO.emit('showAdminPage', {"showData": dataForAdmin, "cmd": cmd, "msg":msg}, room=sid)

@SIO.on('updateTournament')
def on_updateTournament(sid, data):
    dataForAdmin, cmd, msg = actionsForAdmin.on_updateTournament(data)
    SIO.emit('showAdminPage', {"showData": dataForAdmin, "cmd": cmd, "msg":msg}, room=sid)

@SIO.on('deleteTournament')
def on_deleteTournament(sid, data):
    dataForAdmin, cmd, msg = actionsForAdmin.on_deleteTournament(data)
    SIO.emit('showAdminPage', {"showData": dataForAdmin, "cmd": cmd, "msg":msg}, room=sid)

@SIO.on('addRound')
def on_addRound(sid, data):
    dataForAdmin, cmd, msg = actionsForAdmin.on_addRound(data)
    SIO.emit('showAdminPage', {"showData": dataForAdmin, "cmd": cmd, "msg":msg}, room=sid)

@SIO.on('updateRound')
def on_addRound(sid, data):
    dataForAdmin, cmd, msg = actionsForAdmin.on_updateRound(data)
    SIO.emit('showAdminPage', {"showData": dataForAdmin, "cmd": cmd, "msg":msg}, room=sid)

@SIO.on('deleteRound')
def on_addRound(sid, data):
    dataForAdmin, cmd, msg = actionsForAdmin.on_deleteRound(data)
    SIO.emit('showAdminPage', {"showData": dataForAdmin, "cmd": cmd, "msg":msg}, room=sid)

@SIO.on('disconnect')
def deleteClientFromClientDict(sid):
    print("disconnect--------------------------")
    print(sid)
    #actionsForUser.disconnectUserFromGamePlayerBySid(sid)
    #actionsForUser.disconnectUserFromGameObserveListBySid(sid)
    #actionsForUser.disconnectUserFromRoundObserveListBySid(sid)

if __name__ == '__main__':
    APP = socketio.Middleware(SIO, APP)
    eventlet.wsgi.server(eventlet.listen((SERVER.get('host'), SERVER.get('port'))), APP)
