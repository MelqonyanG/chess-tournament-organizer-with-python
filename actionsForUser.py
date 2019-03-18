#!usr/bin/python3
import psycopg2
import json
import sys
from datetime import datetime

with open('server_config.json') as json_data_file:
    dataServer = json.load(json_data_file)

psql = dataServer['postgreSQL']
serv = dataServer['server']

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

def addUser(user):
    try:
        cur = createConnect()
        cur.execute("INSERT INTO USERS (id,name, surname, email, password,userType)\
        VALUES (DEFAULT,%s,%s,%s,%s,%s)", (user["name"], user["surname"], user["email"], user["pass"], user["userType"]))
        conn.commit()
        conn.close()
    except psycopg2.Error as e:
        conn.close()
        print(e)
        return 0

def getUserName(userId):
    try:
        cur = createConnect()
        cur.execute("SELECT name, surname from USERS where id=(%s)", (userId,))
        userData = cur.fetchall()[0]
        userName = userData[0] + " " + userData[1]
        conn.close()
        return userName
    except:
        conn.close()
        return 0

def tourIsLive(tournaments):
    cur = createConnect()
    for i in range(len(tournaments)):
        tourId = tournaments[i][0]
        cur.execute("SELECT id from GAMES where tourId=(%s)", (tourId,))
        games = cur.fetchall()
        tourIsOnline = False
        for game in games:
            gameId = game[0]
            if gameIsOnline(gameId):
                tourIsOnline = True
                break
        tournaments[i].append(tourIsOnline)
    conn.close()
    return tournaments

def roundIsLive(rounds):
    cur = createConnect()
    for i in range(len(rounds)):
        roundId = rounds[i][0]
        cur.execute("SELECT id from GAMES where roundId=(%s)", (roundId,))
        games = cur.fetchall()
        roundIsOnline = False
        for game in games:
            gameId = game[0]
            if gameIsOnline(gameId):
                roundIsOnline = True
                break
        rounds[i].append(roundIsOnline)
    conn.close()
    return rounds

def gameIsOnline(gameId):
    now = datetime.now()
    cur = createConnect()
    cur.execute("SELECT player1TimeS,player2TimeS,pgn,gameStart,result from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    pgn = gameData[2]
    result = gameData[4]
    pgnList = pgn.split(" ")
    pgnList = pgnList[:-1]
    isOnline = False
    if len(pgnList) >= 2 and result == "0-0":
        gameStart = gameData[3]
        startTime = datetime.strptime(gameStart,'%Y-%m-%d %H:%M:%S.%f')
        difference = (now - startTime).total_seconds()
        if len(pgnList) % 2 == 0:
            player1TimeS = gameData[0]
            if player1TimeS - difference > 0:
                isOnline = True
        else:
            player2TimeS = gameData[1]
            if player2TimeS - difference > 0:
                isOnline = True
    conn.close()
    return isOnline

def countRestWaitTime(roundDate, nowTime):
    rndStart = roundDate[0]
    rndEnd = roundDate[1]
    waitTime = roundDate[2]
    restWaitTime = 0
    if (nowTime - rndStart).total_seconds() >= 0 and (rndEnd - nowTime).total_seconds() >= 0:
        restWaitTime = waitTime - (nowTime - rndStart).total_seconds()
    return restWaitTime

def winnerWhite(gameId):
    cur = createConnect()
    cur.execute("SELECT player1ID, player2ID, roundId, tourId from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    player1ID = gameData[0]
    player2ID = gameData[1]
    roundId = gameData[2]
    tourId = gameData[3]
    cur.execute("UPDATE GAMES set result = (%s) where id = (%s)",("1-0", gameId))
    conn.commit()
    cur.execute("SELECT usersIdAndPoint from ROUNDS where id=(%s)", (roundId,))
    userPoints = cur.fetchall()[0][0]
    for i in range(len(userPoints)):
        if int(userPoints[i][0]) == player1ID:
            userPoints[i][1] = str(int(userPoints[i][1]) + 1)
    cur.execute("UPDATE ROUNDS set usersIdAndPoint = (%s) where id=(%s)", (userPoints, roundId))
    conn.commit()
    cur.execute("SELECT usersIdAndPoint from TOURNAMENTS where id=(%s)", (tourId,))
    userPoints = cur.fetchall()[0][0]
    for i in range(len(userPoints)):
        if int(userPoints[i][0]) == player1ID:
            userPoints[i][1] = str(float(userPoints[i][1]) + 1)
    cur.execute("UPDATE TOURNAMENTS set usersIdAndPoint = (%s) where id=(%s)", (userPoints, tourId))
    conn.commit()
    conn.close()

def winnerBlack(gameId):
    cur = createConnect()
    cur.execute("SELECT player1ID, player2ID, roundId, tourId from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    player1ID = gameData[0]
    player2ID = gameData[1]
    roundId = gameData[2]
    tourId = gameData[3]
    cur.execute("UPDATE GAMES set result = (%s) where id = (%s)",("0-1", gameId))
    conn.commit()
    cur.execute("SELECT usersIdAndPoint from ROUNDS where id=(%s)", (roundId,))
    userPoints = cur.fetchall()[0][0]
    for i in range(len(userPoints)):
        if int(userPoints[i][0]) == player2ID:
            userPoints[i][1] = str(float(userPoints[i][1]) + 1)
    cur.execute("UPDATE ROUNDS set usersIdAndPoint = (%s) where id=(%s)", (userPoints, roundId))
    conn.commit()
    cur.execute("SELECT usersIdAndPoint from TOURNAMENTS where id=(%s)", (tourId,))
    userPoints = cur.fetchall()[0][0]
    for i in range(len(userPoints)):
        if int(userPoints[i][0]) == player2ID:
            userPoints[i][1] = str(float(userPoints[i][1]) + 1)
    cur.execute("UPDATE TOURNAMENTS set usersIdAndPoint = (%s) where id=(%s)", (userPoints, tourId))
    conn.commit()
    conn.close()

def drawResult(gameId):
    cur = createConnect()
    cur.execute("SELECT player1ID, player2ID, roundId, tourId from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    player1ID = gameData[0]
    player2ID = gameData[1]
    roundId = gameData[2]
    tourId = gameData[3]
    cur.execute("UPDATE GAMES set result = (%s) where id = (%s)",("1/2-1/2", gameId))
    conn.commit()
    cur.execute("SELECT usersIdAndPoint from ROUNDS where id=(%s)", (roundId,))
    userPoints = cur.fetchall()[0][0]
    for i in range(len(userPoints)):
        if int(userPoints[i][0]) == player1ID:
            userPoints[i][1] = str(float(userPoints[i][1]) + 0.5)
        if int(userPoints[i][0]) == player2ID:
            userPoints[i][1] = str(float(userPoints[i][1]) + 0.5)
    cur.execute("UPDATE ROUNDS set usersIdAndPoint = (%s) where id=(%s)", (userPoints, roundId))
    conn.commit()
    cur.execute("SELECT usersIdAndPoint from TOURNAMENTS where id=(%s)", (tourId,))
    userPoints = cur.fetchall()[0][0]
    for i in range(len(userPoints)):
        if int(userPoints[i][0]) == player1ID:
            userPoints[i][1] = str(float(userPoints[i][1]) + 0.5)
        if int(userPoints[i][0]) == player2ID:
            userPoints[i][1] = str(float(userPoints[i][1]) + 0.5)
    cur.execute("UPDATE TOURNAMENTS set usersIdAndPoint = (%s) where id=(%s)", (userPoints, tourId))
    conn.commit()
    conn.close()

def deleteUserFromRoundObserveList(roundId,userId):
    cur = createConnect()
    cur.execute("SELECT roundObserveList from ROUNDS where id=(%s)", (roundId,))
    obsList = cur.fetchall()[0][0]
    newObsList = []
    for obs in obsList:
        if obs[0] != str(userId):
            newObsList.append(obs)
        cur.execute("UPDATE ROUNDS set roundObserveList = (%s) where id=(%s)", (newObsList, roundId))
        conn.commit()
    conn.close()

def addUserToRoundObserveList(roundId,userId,sid):
    cur = createConnect()
    cur.execute("SELECT roundObserveList from ROUNDS where id=(%s)", (roundId,))
    obsUsers = cur.fetchall()[0][0]
    ids = [x[0] for x in obsUsers]
    if str(userId) not in ids:
        obsUsers.append([str(userId),sid])
    else:
        obsUsers = [x if x[0] != str(userId) else [str(userId),sid] for x in obsUsers]
    cur.execute("UPDATE ROUNDS set roundObserveList = (%s) where id=(%s)", (obsUsers, roundId))
    conn.commit()
    conn.close()

def getRoundById(roundId):
    cur = createConnect()
    cur.execute("SELECT ID,roundNum,startDate,endDate,tourId,gamesId,couplesId,\
    usersIdAndPoint,waitTime from ROUNDS where id=(%s)", (roundId,))
    rounds = cur.fetchall()[0]
    rounds = [str(y) if isinstance(y, datetime) else y for y in rounds]
    usersId = rounds[7]
    for i in range(len(usersId)):
        usrId = int(usersId[i][0])
        cur.execute("SELECT name, surname from USERS where id=(%s)", (usrId,))
        rounds[7][i].extend(cur.fetchall()[0])
    conn.close()
    return rounds

def getGamesByRoundId(roundId):
    cur = createConnect()
    cur.execute("SELECT ID,roundId,player1ID,player2ID,fen,player1SID,player2SID,\
    pgn,result,observeList,player1TimeS,player2TimeS,isOnline,\
    tourId,gameStart from GAMES where roundId=(%s)", (roundId,))
    games = cur.fetchall()
    for i in range(len(games)):
        games[i] = list(games[i])
        games[i][12] = gameIsOnline(games[i][0])
    conn.close()
    return games

def getTournaments():
    cur = createConnect()
    cur.execute("SELECT ID,title,place,startDate,endDate,tourTime,tourInc,roundsCount,roundsId,usersIdAndPoint from tournaments ORDER BY id")
    tournaments = cur.fetchall()
    tournaments = [[str(y) if isinstance(y, datetime) else y for y in x] for x in tournaments]
    conn.close()
    return tournaments

def getRoundByTourId(tourId):
    cur = createConnect()
    cur.execute("SELECT ID,tourId,startDate,endDate,waitTime,roundNum from ROUNDS where tourId=(%s)", (tourId,))
    rounds = cur.fetchall()
    rounds = [[str(y) if isinstance(y, datetime) else y for y in x] for x in rounds]
    conn.close()
    return rounds

def setUserSidInGame(userId,player1ID,player2ID,sid,gameId):
    cur = createConnect()
    if userId == player1ID:
        player1SID = sid
        cur.execute("UPDATE GAMES set player1SID = (%s) where id = (%s)",(sid, gameId))
        conn.commit()
    elif userId == player2ID:
        player2SID = sid
        cur.execute("UPDATE GAMES set player2SID = (%s) where id = (%s)",(sid, gameId))
        conn.commit()
    conn.close()

def setUserInGameObserveList(gameId, userId, sid):
    cur = createConnect()
    cur.execute("SELECT observeList from GAMES where id=(%s)", (gameId,))
    obsUsers = cur.fetchall()[0][0]
    ids = [x[0] for x in obsUsers]
    if str(userId) not in ids:
        obsUsers.append([str(userId),sid])
    else:
        obsUsers = [x if x[0] != str(userId) else [str(userId),sid] for x in obsUsers]
    cur.execute("UPDATE GAMES set observeList = (%s) where id=(%s)", (obsUsers, gameId))
    conn.commit()
    conn.close()

def getGameData(gameId, now):
    cur = createConnect()
    cur.execute("SELECT id,player1ID,player2ID,player1TimeS,player2TimeS,pgn,result,fen,isOnline,gameStart from GAMES where id=(%s)", (gameId,))
    gameData = list(cur.fetchall()[0])
    pgn = gameData[5]
    pgnList = pgn.split(" ")
    pgnList = pgnList[:-1]
    if len(pgnList) >= 2:
        gameStart = gameData[9]
        startTime = datetime.strptime(gameStart,'%Y-%m-%d %H:%M:%S.%f')
        difference = (now - startTime).total_seconds()
        if len(pgnList) % 2 == 0:
            player1TimeS = gameData[3]
            gameData[3] = player1TimeS - difference
            if gameData[3] < 0:
                gameData[3] = 0
        else:
            player2TimeS = gameData[4]
            gameData[4] = player2TimeS - difference
            if gameData[4] < 0:
                gameData[4] = 0
    conn.close()
    return gameData

def getRoundByIdForGame(roundId):
    cur = createConnect()
    cur.execute("SELECT startDate,endDate,waitTime from ROUNDS where id=(%s)", (roundId,))
    roundData = cur.fetchall()[0]
    roundData = [str(x) for x in roundData]
    conn.close()
    return roundData

def updatePlayersTime(gameId,stepTime,userId):
    cur = createConnect()
    cur.execute("SELECT player1ID,player2ID from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    player1ID = gameData[0]
    player2ID = gameData[1]
    cur.execute("SELECT player1TimeS, player2TimeS, gameStart from GAMES where id=(%s)", (gameId,))
    times = cur.fetchall()[0]
    gameStart = times[2]
    startTime = datetime.strptime(gameStart,'%Y-%m-%d %H:%M:%S.%f')
    difference = (stepTime - startTime).total_seconds()
    cur.execute("SELECT tourId from GAMES where id=(%s)", (gameId,))
    tourId = cur.fetchall()[0][0]
    cur.execute("SELECT tourInc from TOURNAMENTS where id=(%s)", (tourId,))
    inc = cur.fetchall()[0][0]
    if userId == player1ID:
        restTime = round(times[0] - difference + inc) + 1
        cur.execute("UPDATE GAMES set player1TimeS = (%s) where id = (%s)",(restTime, gameId))
        conn.commit()
    else:
        restTime = round(times[1] - difference + inc) + 1
        cur.execute("UPDATE GAMES set player2TimeS = (%s) where id = (%s)",(restTime, gameId))
        conn.commit()
    conn.close()

def updateFenAndPGNAndTime(gameId, fen, pgn, stepTime):
    cur = createConnect()
    cur.execute("UPDATE GAMES set fen = (%s) where id = (%s)",(fen, gameId))
    conn.commit()
    cur.execute("UPDATE GAMES set pgn = (%s) where id = (%s)",(pgn, gameId))
    conn.commit()
    cur.execute("UPDATE GAMES set gameStart = (%s) where id = (%s)",(stepTime, gameId))
    conn.commit()
    conn.close()

def sendMoveOpponent(socketio, gameId, userId, dataForUser):
    cur = createConnect()
    cur.execute("SELECT player1SID, player2SID, player1ID,player2ID from GAMES where id=(%s)", (gameId,))
    couple = cur.fetchall()[0]
    whiteSid = couple[0]
    blackSid = couple[1]
    player1ID = couple[2]
    player2ID = couple[3]
    if userId == player1ID:
        if blackSid != None:
            dataForUser["userName"] = getUserName(player2ID)
            socketio.emit('startGame', dataForUser, room=blackSid)
        else:
            print("black opponent does not avaible")
    else:
        if whiteSid != None:
            dataForUser["userName"] = getUserName(player1ID)
            socketio.emit('startGame', dataForUser, room=whiteSid)
        else:
            print("white opponent does not avaible")
    conn.close()

def sendMoveGameObservers(socketio, gameId, dataForUser):
    cur = createConnect()
    cur.execute("SELECT observeList from GAMES where id=(%s)", (gameId,))
    observers = cur.fetchall()[0][0]
    for user in observers:
        sid = user[1]
        dataForUser["userId"] = user[0]
        dataForUser["cmd"] =  "observeOnlineGame"
        socketio.emit('startGame', dataForUser, room=sid)
    conn.close()

def sendMoveRoundObservers(socketio, gameId):
    cur = createConnect()
    cur.execute("SELECT roundId,isOnline,fen from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    roundId = gameData[0]
    isOnline = gameData[1]
    fen = gameData[2]
    cur.execute("SELECT roundObserveList from ROUNDS where id=(%s)", (roundId,))
    observers = cur.fetchall()[0][0]
    for user in observers:
        sid = user[1]
        gamesData = {
            'gid': gameId,
            'fen':fen,
            'isOnline': isOnline
        }
        socketio.emit('showGamesMove', gamesData, room=sid)
    conn.close()

def createGameData(gameId, gameState, userId, userName):
    cur = createConnect()
    cur.execute("SELECT id,player1ID,player2ID,player1TimeS,player2TimeS,pgn,result,fen,isOnline,gameStart from GAMES where id=(%s)", (gameId,))
    gameData = cur.fetchall()[0]
    player1ID = gameData[1]
    player2ID = gameData[2]
    whitePlayer = getUserName(player1ID)
    blackPlayer = getUserName(player2ID)
    cur.execute("SELECT roundId from GAMES where id=(%s)", (gameId,))
    roundId = cur.fetchall()[0][0]
    roundData = getRoundByIdForGame(roundId)
    dataForUser = {
        "userId": userId,
        "cmd": gameState,
        "whitePlayer": whitePlayer,
        "blackPlayer": blackPlayer,
        "gameData": gameData,
        "roundData": roundData,
        "userName": userName
    }
    conn.close()
    return dataForUser

def sendResultPlayers(socketio, gameId, dataForUser):
    cur = createConnect()
    cur.execute("SELECT player1SID, player2SID, player1ID, player2ID from GAMES where id=(%s)", (gameId,))
    sids = cur.fetchall()[0]
    player1SID = sids[0]
    player2SID = sids[1]
    player1ID =  sids[2]
    player2ID =  sids[3]
    dataForUser["userId"] = player1ID
    dataForUser["userName"] = getUserName(player1ID)
    print(dataForUser)
    socketio.emit('startGame', dataForUser, room=player1SID)
    dataForUser["userId"] = player2ID
    dataForUser["userName"] = getUserName(player2ID)
    socketio.emit('startGame', dataForUser, room=player2SID)
    conn.close()

def sendResultObservers(socketio,gameId, dataForUser):
    cur = createConnect()
    cur.execute("SELECT observeList from GAMES where id=(%s)", (gameId,))
    observers = cur.fetchall()[0][0]
    for user in observers:
        sid = user[1]
        dataForUser["userId"] = user[0]
        dataForUser["userName"] = getUserName(user[0])
        socketio.emit('startGame', dataForUser, room=sid)
    conn.close()

def deleteUserFromGameObserveListById(gameId, userId):
    cur = createConnect()
    cur.execute("SELECT observeList from GAMES where id=(%s)", (gameId,))
    obsList = cur.fetchall()[0][0]
    newObsList = []
    for obs in obsList:
        if obs[0] != str(userId):
            newObsList.append(obs)
        cur.execute("UPDATE GAMES set observeList = (%s) where id=(%s)", (newObsList, gameId))
        conn.commit()
    conn.close()

def deleteUserSidFromGamePlayerListById(gameId, userId):
    cur = createConnect()
    cur.execute("SELECT player1ID,player2ID from GAMES where id=(%s)", (gameId,))
    players = cur.fetchall()[0]
    player1ID = players[0]
    player2ID = players[1]
    if userId == player1ID:
        cur.execute("UPDATE GAMES set player1SID=(%s) where id=(%s)", (None,gameId))
        conn.commit()
    else:
        cur.execute("UPDATE GAMES set player2SID=(%s) where id=(%s)", (None,gameId))
        conn.commit()
    conn.close()

def disconnectUserFromGameObserveListBySid(sid):
    cur = createConnect()
    cur.execute("SELECT id, observeList from GAMES")
    obsListsAndIds = cur.fetchall()
    for data in obsListsAndIds:
        gameId = data[0]
        obsList = data[1]
        if len(obsList) != 0:
            newObsList = []
            for obs in obsList:
                if obs[1] != sid:
                    newObsList.append(obs)
            cur.execute("UPDATE GAMES set observeList = (%s) where id=(%s)", (newObsList, gameId))
            conn.commit()
    conn.close()

def disconnectUserFromGamePlayerBySid(sid):
    cur = createConnect()
    cur.execute("SELECT id,player1SID,player2SID from GAMES where isOnline=True and (player1SID=(%s) or player2SID=(%s))", (sid, sid))
    games = cur.fetchall()[0]
    if len(games) > 0:
        gmId = games[0]
        player1SID = games[1]
        player2SID = games[2]
        if player1SID == sid:
            cur.execute("UPDATE GAMES set player1SID=(%s) where id=(%s)", (None,gmId))
            conn.commit()
        elif player2SID == sid:
            cur.execute("UPDATE GAMES set player2SID=(%s) where id=(%s)", (None,gmId))
            conn.commit()

def disconnectUserFromRoundObserveListBySid(sid):
    cur = createConnect()
    cur.execute("SELECT id, roundObserveList from ROUNDS")
    obsListsAndIds = cur.fetchall()
    for data in obsListsAndIds:
        roundId = data[0]
        obsList = data[1]
        if len(obsList) != 0:
            newObsList = []
            for obs in obsList:
                if obs[1] != sid:
                    newObsList.append(obs)
            cur.execute("UPDATE ROUNDS set roundObserveList = (%s) where id=(%s)", (newObsList, roundId))
            conn.commit()
    conn.close()
