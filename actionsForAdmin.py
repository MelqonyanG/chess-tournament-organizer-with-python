import psycopg2
import json
import sys
from datetime import datetime

with open('server_config.json') as json_data_file:
    dataServer = json.load(json_data_file)
psql = dataServer['postgreSQL']

def createConnect():
    try:
        global conn
        conn = psycopg2.connect(database=psql['database'],
         user=psql['user'], password=psql['password'], host=psql['host'],port=psql['port'])
    except psycopg2.Error as e:
        conn.close()
        print(e)
        sys.exit(0)
    try:
        global cur
        cur = conn.cursor()
    except psycopg2.Error as e:
        conn.close()
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

def createAdmin(dataServer):
    try:
        admin = dataServer["adminData"]
        login = admin["login"]
        password = admin["password"]
        cur = createConnect()
        cur.execute("SELECT email from users")
        emailTuple = cur.fetchall()
        emails = [i[0] for i in emailTuple]
        if len(emails) == 0 or login not in emails:
            admin = {
                "name": "admin",
                "surname": "admin",
                "email": login,
                "pass": password,
                "userType": "admin"
            }
            addUser(admin)
        else:
            msg = "admin already exist"
            print(msg)
        conn.close()
    except:
        conn.close()
        print("admin has not added")

def getUserName(cur,userId):
    cur = createConnect()
    cur.execute("SELECT name, surname from USERS where id=(%s)", (userId,))
    userData = cur.fetchall()[0]
    userName = userData[0] + " " + userData[1]
    conn.close()
    return userName

def getRoundById(cur,roundId):
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

def getGamesByRoundId(cur,roundId):
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

def getGamesByTourId(cur,tourId):
    cur = createConnect()
    cur.execute("SELECT ID,roundId,player1ID,player2ID,fen,player1SID,player2SID,\
    pgn,result,observeList,player1TimeS,player2TimeS,isOnline,\
    tourId,gameStart from GAMES where tourId=(%s)", (tourId,))
    games = cur.fetchall()
    for i in range(len(games)):
        games[i] = list(games[i])
        games[i][12] = gameIsOnline(games[i][0])
    conn.close()
    return games

def getTour(cur):
    cur = createConnect()
    cur.execute("SELECT ID,title,place,startDate,endDate,tourTime,tourInc,roundsCount,roundsId,usersIdAndPoint from tournaments ORDER BY id")
    tournaments = cur.fetchall()
    tournaments = [[str(y) if isinstance(y, datetime) else y for y in x] for x in tournaments]
    conn.close()
    return tournaments

def getRounds(cur):
    cur = createConnect()
    cur.execute("SELECT ID,tourId,startDate,endDate,waitTime from ROUNDS ORDER BY id")
    rounds = cur.fetchall()
    rounds = [[str(y) if isinstance(y, datetime) else y for y in x] for x in rounds]
    conn.close()
    return rounds

def getGames(cur):
    cur = createConnect()
    cur.execute("SELECT ID,roundId,player1ID,player2ID,fen,player1SID,player2SID,\
    pgn,result,observeList,player1TimeS,player2TimeS,isOnline,\
    tourId,gameStart from GAMES ORDER BY id")
    games = cur.fetchall()
    games = [[str(y) if isinstance(y, datetime) else y for y in x] for x in games]
    conn.close()
    return games

def getUsers(cur):
    cur = createConnect()
    cur.execute("SELECT id,name,surname,email,password,userType from USERS")
    users = cur.fetchall()
    conn.close()
    return users

def getUsersByTourId(cur,tourId):
    cur = createConnect()
    cur.execute("SELECT usersIdAndPoint from TOURNAMENTS where id=(%s)", (tourId,))
    tourUsers = cur.fetchall()[0][0]
    userIds = [x[0] for x in tourUsers]
    users = []
    for userId in userIds:
        cur.execute("SELECT id,name,surname,email,password,userType from USERS where id=(%s)", (userId,))
        userData = cur.fetchall()[0]
        users.append(list(userData))
    conn.close()
    return users

def getRoundByTourId(cur, tourId):
    cur = createConnect()
    cur.execute("SELECT ID,tourId,startDate,endDate,waitTime from ROUNDS where tourId=(%s)", (tourId,))
    rounds = cur.fetchall()
    rounds = [[str(y) if isinstance(y, datetime) else y for y in x] for x in rounds]
    conn.close()
    return rounds

def on_getDataForAdmin(data):
    cmd = data["cmd"]
    sid = data["sid"]
    cur = createConnect()
    dataForAdmin = ""
    if cmd == "users":
        dataForAdmin = getUsers(cur)
    elif cmd == "games":
        dataForAdmin = getGames(cur)
    elif cmd == "rounds":
        dataForAdmin = getRounds(cur)
    elif cmd == "tournaments":
        dataForAdmin = getTour(cur)
    elif cmd == "tournamentRounds":
        cmd = "rounds"
        tourId = data["tourId"]
        dataForAdmin = getRoundByTourId(cur, tourId)
    elif cmd == "tournamentGames":
        cmd = 'games'
        tourId = data["tourId"]
        dataForAdmin = getGamesByTourId(cur,tourId)
    elif cmd == "tournamentUsers":
        cmd = 'users'
        tourId = data["tourId"]
        dataForAdmin = getUsersByTourId(cur,tourId)
    elif cmd == "roundGames":
        cmd = 'games'
        roundId = data["roundId"]
        dataForAdmin = getGamesByRoundId(cur,roundId)
    conn.close()
    return dataForAdmin, cmd, ""

def on_addTournament(data):
    try:
        tour = data["tour"]
        cur = createConnect()
        startDate = datetime.strptime(tour[3].strip(), '%Y-%m-%d %H:%M:%S')
        endDate = datetime.strptime(tour[4].strip(), '%Y-%m-%d %H:%M:%S')
        tourTime = int(tour[5])
        tourInc = int(tour[6])
        roundCount = int(tour[7])
        cur.execute("INSERT INTO TOURNAMENTS (id,title, place, startDate, endDate, tourTime, tourInc, roundsCount, roundsId, usersIdAndPoint)\
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", (tour[0],tour[1], tour[2], startDate, endDate, tourTime, tourInc, roundCount, [], []))
        conn.commit()
        msg = "Tournament has been successfully added."
        conn.close()
    except:
        conn.close()
        msg = "Your entered data is incorrect․ Tournament has not been added"
    dataForAdmin = getTour(cur)
    return dataForAdmin, "tournaments", msg

def on_updateTournament(data):
    try:
        tour = data["tour"]
        cur = createConnect()
        startDate = datetime.strptime(tour[3].strip(), '%Y-%m-%d %H:%M:%S')
        endDate = datetime.strptime(tour[4].strip(), '%Y-%m-%d %H:%M:%S')
        tourTime = int(tour[5])
        tourInc = int(tour[6])
        roundCount = int(tour[7])
        cur.execute("UPDATE TOURNAMENTS set title =(%s),place=(%s),startDate=(%s),endDate=(%s),tourTime=(%s),tourInc=(%s), roundsCount=(%s) where id = (%s)",(tour[1],tour[2],startDate,endDate,tourTime,tourInc,roundCount, tour[0]))
        conn.commit()
        msg = "Tournament has been successfully changed."
        conn.close()
    except:
        msg = "Your entered Data is incorrect․ Tournament has not been changed."
        conn.close()
    dataForAdmin = getTour(cur)
    return dataForAdmin, "tournaments", msg

def on_deleteTournament(data):
    try:
        tourId = int(data["tourId"])
        cur = createConnect()
        cur.execute("DELETE from GAMES where tourId=(%s)", (tourId,))
        conn.commit()
        cur.execute("DELETE from ROUNDS where tourId=(%s)", (tourId,))
        conn.commit()
        cur.execute("DELETE from TOURNAMENTS where id=(%s)", (tourId,))
        conn.commit()
        msg = "Tournament has been successfully deleted."
        conn.close()
    except:
        msg = "Your entered Data is incorrect․ Tournament has not been deleted"
        conn.close()
    dataForAdmin = getTour(cur)
    return dataForAdmin, "tournaments", msg

def on_addRound(data):
    try:
        import createRound
        roundData = data["round"]
        tourId = int(roundData[1])
        cur = createConnect()
        cur.execute("SELECT startDate from TOURNAMENTS where id=(%s)", (tourId,))
        tourData = cur.fetchall()
        if len(tourData) != 0:
            tourStartDate = tourData[0][0]
            now = datetime.today()
            difference = (now - tourStartDate).total_seconds()
            if difference >= 0:
                startDate = datetime.strptime(roundData[2].strip(), '%Y-%m-%d %H:%M:%S')
                endDate = datetime.strptime(roundData[3].strip(), '%Y-%m-%d %H:%M:%S')
                waitTime = int(roundData[4])
                createRound.createRound(tourId,waitTime,startDate,endDate)
                msg = "Round has been successfully added."
            else:
                msg = "This tournament has not started yet. Round has not been added."
        else:
            msg = "Tournament does not exist."
        conn.close()
    except:
        conn.close()
        msg = "Your entered Data is incorrect․ Round has not been added"
    dataForAdmin = getRounds(cur)
    return dataForAdmin, "rounds", msg

def on_updateRound(data):
    try:
        roundData = data["round"]
        cur = createConnect()
        roundId = int(roundData[0])
        tourId = int(roundData[1])
        startDate = datetime.strptime(roundData[2].strip(), '%Y-%m-%d %H:%M:%S')
        endDate = datetime.strptime(roundData[3].strip(), '%Y-%m-%d %H:%M:%S')
        waitTime = int(roundData[4])
        cur.execute("UPDATE ROUNDS set tourId=(%s),startDate=(%s),endDate=(%s),waitTime=(%s) where id = (%s)",(tourId,startDate,endDate,waitTime,roundId))
        conn.commit()
        msg = "Round has been successfully changed."
        conn.close()
    except:
        msg = "Your entered Data is incorrect․ Round has not been changed"
        conn.close()
    dataForAdmin = getRounds(cur)
    return dataForAdmin, "rounds", msg

def on_deleteRound(data):
    try:
        roundId = int(data["roundId"])
        cur = createConnect()
        cur.execute("DELETE from GAMES where roundId=(%s)", (roundId,))
        conn.commit()
        cur.execute("SELECT tourId from ROUNDS where id=(%s)", (roundId,))
        tourId = cur.fetchall()[0][0]
        cur.execute("DELETE from ROUNDS where id=(%s)", (roundId,))
        conn.commit()
        cur.execute("SELECT roundsId from TOURNAMENTS where id=(%s)", (tourId,))
        roundsId = cur.fetchall()[0][0]
        roundsId.remove(roundId)
        cur.execute("UPDATE TOURNAMENTS set roundsId=(%s) where id = (%s)",(roundsId,tourId))
        conn.commit()
        msg = "Round has been successfully deleted."
        conn.close()
    except:
        msg = "Your entered Data is incorrect․ Round has not been deleted"
        conn.close()
    dataForAdmin = getRounds(cur)
    return dataForAdmin, "rounds", msg
