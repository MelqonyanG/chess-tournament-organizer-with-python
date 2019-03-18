import psycopg2
import json
from datetime import datetime

with open('serverConfig.json') as json_data_file:
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

def createRandomCouples(users):
    import random
    result = []
    while len(users) >= 2:
        player1 = random.choice(users)
        users.remove(player1)
        player2 = random.choice(users)
        users.remove(player2)
        result.append([player1, player2])
    if len(users) == 1:
        result.append([users[0], users[0]])
    return result

def createGames(couples, roundId, tourId):
    startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    res = []
    cur.execute("SELECT tourTime, tourInc from TOURNAMENTS where id=(%s)", (tourId,))
    times = cur.fetchall()[0]
    time = times[0] * 60
    inc = times[1]
    for couple in couples:
        if couple[0] != couple[1]:
            try:
                cur.execute("SELECT startDate from ROUNDS where id=(%s)", (roundId,))
                startDate = cur.fetchall()[0][0]
                cur.execute("INSERT INTO GAMES (id,roundId,tourId, player1ID, player2ID, player1SID, player2SID,player1TimeS,player2TimeS,pgn,result,fen,observeList,isOnline,gameStart)\
                VALUES (DEFAULT,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id", (roundId,tourId,couple[0], couple[1], None, None,time,time,"","0-0",startFen,[],False,startDate))
                gameId = cur.fetchone()[0]
                conn.commit()
            except psycopg2.Error as e:
                print(e)
                return 0
            res.append(gameId)
        else:
            cur.execute("SELECT usersIdAndPoint from ROUNDS where id=(%s)", (roundId,))
            userPoints = cur.fetchall()[0][0]
            for i in range(len(userPoints)):
                if int(userPoints[i][0]) == couple[0]:
                    userPoints[i][1] = str(float(userPoints[i][1]) + 1)
            cur.execute("UPDATE ROUNDS set usersIdAndPoint = (%s) where id=(%s)", (userPoints, roundId))
            conn.commit()
            cur.execute("SELECT usersIdAndPoint from TOURNAMENTS where id=(%s)", (tourId,))
            userPoints = cur.fetchall()[0][0]
            for i in range(len(userPoints)):
                if int(userPoints[i][0]) == couple[0]:
                    userPoints[i][1] = str(float(userPoints[i][1]) + 1)
            cur.execute("UPDATE TOURNAMENTS set usersIdAndPoint = (%s) where id=(%s)", (userPoints, tourId))
            conn.commit()
    return res


def createRound(tourId,waitTime,startDate,endDate):
    cur = createConnect()
    cur.execute("SELECT usersIdAndPoint from TOURNAMENTS where id=(%s)", (tourId,))
    usersId = cur.fetchall()[0][0]
    usersId = [int(x[0]) for x in usersId]
    usersIdPoints = [[str(x),str(0)] for x in usersId]
    couples = createRandomCouples(usersId)
    cur.execute("SELECT roundsId from TOURNAMENTS where id=(%s)", (tourId,))
    rounds = cur.fetchall()[0][0]
    roundNum = len(rounds) + 1
    try:
        cur.execute("INSERT INTO ROUNDS (id,roundNum,startDate,endDate,tourId,gamesId, couplesId, usersIdAndPoint,waitTime,roundObserveList)\
        VALUES (DEFAULT,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id", (roundNum,startDate, endDate, tourId, [], couples, usersIdPoints,waitTime,[]))
        roundId = cur.fetchone()[0]
        conn.commit()
    except psycopg2.Error as e:
        print(e)
        return 0
    rounds.append(roundId)
    cur.execute("UPDATE TOURNAMENTS set roundsId = (%s) where id=(%s)", (rounds, tourId))
    conn.commit()
    gamesId = createGames(couples, roundId, tourId)
    cur.execute("UPDATE ROUNDS set gamesId = (%s) where id=(%s)", (gamesId, roundId))
    conn.commit()
