@namespace
class SpriteKind:
    EnemyProjectile = SpriteKind.create()
    EnemyProjFlak = SpriteKind.create()   
    EnemyProjLaser = SpriteKind.create()
    EnemyHeatSeeker = SpriteKind.create()
    EnemySpaceShip = SpriteKind.create()
    EnemyBoosterShot = SpriteKind.create()

#Standard Milliseconde delay tracker.
class msDelay():
    counter = None

    def __init__(self):
        self.counter = game.runtime()

    def passed(self, amount):
        returnVar = game.runtime() - self.counter >= amount
        if(returnVar):
            self.reset()
        return returnVar

    def reset(self):
        self.counter = game.runtime()

def collision():#TODO this will need a clean up.
    global screenFlash, score
    if not screenFlash:
        #Normal Bullet code.
        for value in sprites.all_of_kind(SpriteKind.EnemyProjectile):
            dist = Math.round(calcDist(value.x, value.y, playerOne.x, playerOne.y))
            if dist >= 10:
                continue
            if playerOne.overlaps_with(value):
                value.start_effect(effects.fire, 100)
                sprites.destroy(value)
                info.change_life_by(-1)
                screenFlash = True
                screenFlashTimer.reset()
                break
        # Heat Seeking Bullets
        for seeker in sprites.all_of_kind(SpriteKind.EnemyHeatSeeker):
                lifeTimer = sprites.read_data_number(seeker, "lifeTimer")

                if lifeTimer <= 50:
                    speed = sprites.read_data_number(seeker, "speed")
                    angle = ( calcAngle(seeker.x - (seeker.width / 2), seeker.y - (seeker.height / 2), playerOne.x - (playerOne.width / 2), playerOne.y - (playerOne.height / 2)) )  * 0.017453292519943295
                    velX = Math.sin(angle) * speed
                    velY = Math.cos(angle) * speed
                    seeker.set_velocity(velX, velY)
                    sprites.set_data_number(seeker, "lifeTimer", lifeTimer + 1)
                else:
                    seeker.set_image(assets.image("EnemyInactiveSeeker"))

                if playerOne.overlaps_with(seeker):
                    seeker.start_effect(effects.fire, 100)
                    sprites.destroy(seeker)
                    info.change_life_by(-1)
                    screenFlash = True
                    screenFlashTimer.reset()
                    break

        #Booster shot projectile
        for booster in sprites.all_of_kind(SpriteKind.EnemyBoosterShot):
            boostState = sprites.read_data_boolean(booster, "Boosting")

            if not boostState:
                distToPlayer = calcDist(booster.x + (booster.vx / 2), booster.y + (booster.vy / 2), playerOne.x, playerOne.y)

                if distToPlayer <= 40:
                    booster.set_image(assets.image("BoosterShotBoost"))
                    sprites.set_data_boolean(booster, "Boosting", True)
                    angle = sprites.read_data_number(booster, "Angle")
                    speed = sprites.read_data_number(booster, "speed") * 2.5
                    velX = Math.sin(angle) * speed
                    velY = Math.cos(angle) * speed
                    booster.set_velocity(velX, velY)

            if playerOne.overlaps_with(booster):
                booster.start_effect(effects.fire, 100)
                sprites.destroy(booster)
                info.change_life_by(-1)
                screenFlash = True
                screenFlashTimer.reset()
                break

        #Laser Segments
        for laserSeg in sprites.all_of_kind(SpriteKind.EnemyProjLaser):
            lifeTimer = sprites.read_data_number(laserSeg, "lifeTimer")
            sprites.set_data_number(laserSeg, "lifeTimer", lifeTimer + 1)

            if lifeTimer >= 40:
                sprites.set_data_boolean(laserSeg, "charged", True)
                laserSeg.set_image(assets.image("""LaserSegment"""))

                if lifeTimer >= 60:
                    if Math.percent_chance(22):
                        laserSeg.start_effect(effects.fire, 100)
                    sprites.destroy(laserSeg)

                if playerOne.overlaps_with(laserSeg):
                    laserSeg.start_effect(effects.fire, 100)
                    sprites.destroy(laserSeg)
                    info.change_life_by(-1)
                    screenFlash = True
                    screenFlashTimer.reset()
                    break
        #Flak Bullets
        for value2 in sprites.all_of_kind(SpriteKind.EnemyProjFlak):
            dist = calcDist(value2.x, value2.y, playerOne.x, playerOne.y)
            if dist >= 25:
                continue
            else:
                value2.start_effect(effects.fire, 100)
                sprites.destroy(value2)
                shootBullets(value2.x, value2.y, 15, 5, 0, 0, 6)
                break

    #Player Bullet Code
    #Cleaned up - Projectile Collision Detection
    for value3 in sprites.all_of_kind(SpriteKind.projectile):
        for enemy in sprites.all_of_kind(SpriteKind.enemy):
            dist = calcDist(value3.x, value3.y, enemy.x, enemy.y)
            highest = enemy.width
            if enemy.height > highest:
                highest = enemy.height
            if dist >= enemy.width:
                continue
            if enemy.overlaps_with(value3):
                value3.start_effect(effects.fire, 100)
                sprites.destroy(value3)
                sprites.change_data_number_by(enemy, "health", -1)
                score += 100
    
def updatePlayer():
    global moveSpeed, fireType, fireDelay, screenFlash, screenFlashTimer, bgVSpeed
    #Player Movement speed.
    isBPressed = controller.B.is_pressed()
    if isBPressed:
        moveSpeed = 0.5
    else:
        moveSpeed = 2

    #Directional Movement.
    noMove = True
    if controller.down.is_pressed():
        playerOne.y += moveSpeed
        noMove = False
    elif controller.up.is_pressed():
        playerOne.y += moveSpeed * -1
        noMove = False
    if controller.left.is_pressed():
        playerOne.x += moveSpeed * -1
        scroller.scroll_background_with_speed(-10, bgVSpeed)
        noMove = False
    elif controller.right.is_pressed():
        playerOne.x += moveSpeed
        scroller.scroll_background_with_speed(10, bgVSpeed)
        noMove = False

    #Scrolling background pausing.
    if noMove:
        scroller.scroll_background_with_speed(0, bgVSpeed)

    #Player Shooting code
    if controller.A.is_pressed():
        delay = 500
        if isBPressed:
            delay = 200
        if fireDelay.passed(delay):
            projectile2 = sprites.create_projectile_from_sprite(assets.image("""PlayerBullet"""), playerOne, 0, -50)
            fireDelay.reset()

    #When damaged flashes screen and shakes camera
    if screenFlash:
        scene.set_background_image(assets.image("""BackgroundLayer2"""))
        scene.camera_shake(2, 400)
        if screenFlashTimer.passed(400):
            scene.set_background_image(assets.image("""BackgroundLayer1"""))
            screenFlash = False

#Updates the Skeletion Enemy for phase 1 and 2
def updateEnemy():
    global waypoint, enemyStage, enemyOne, fireType, enemyNormalImage, intro, score
    enemyHealth = sprites.read_data_number(enemyOne, "health")
    info.set_score(enemyHealth)
    if not intro:
        if enemyStage == 0:#Stage 1
            if enemyFireDelay.passed(1500):
                numBullets = None
                if(fireType == 0):
                    numBullets = 4
                    angle = 60
                    if Math.percent_chance(50):
                        angle = -60
                else:
                    angle = 0
                    numBullets = 6
                speed = 15
                if fireType == 1:
                    speed = 50
                elif fireType == 2:
                    speed = 90

                shootBullets(enemyOne.x, enemyOne.y, speed, 15, angle, fireType, numBullets)
                enemyOne.set_image(assets.image("""EnemyShoot"""))
                enemyAnimDelay.reset()
                enemyFireDelay.reset()
            elif Math.percent_chance(2): 
                if waypoint == None:
                    tPosX = Math.round(Math.random() * 100)
                    tPosY = Math.round(Math.random() * 100)
                    # Min check
                    tPosX = min(tPosX, scene.screen_width())
                    tPosY = min(tPosY, scene.screen_height())
                    # Max check
                    tPosX = max(tPosX, 0)
                    tPosY = max(tPosY, 0)
                    distToPlayer = calcDist(tPosX, tPosY, playerOne.x, playerOne.y)
                    if distToPlayer >= 60:
                        waypoint = [tPosX, tPosY]
            elif Math.percent_chance(0.001):
                #0.001 chance to change the type of bullet to be shot.
                if fireType == 0:
                    fireType = 1
                else:
                    fireType = 0
            elif(enemyAnimDelay.passed(500)):
                #Animation reset.
                enemyOne.set_image(enemyNormalImage)
        elif enemyStage == 1:#Stage 2 Same as stage 1 but shoot faster, move more frequantly and more.
            if enemyFireDelay.passed(1200):
                numBullets = None
                if(fireType == 0):
                    numBullets = 4
                    angle = 80
                    if Math.percent_chance(50):
                        angle = -80
                else:
                    angle = 0
                    numBullets = 7

                speed = 15
                if fireType == 1:
                    speed = 50
                elif fireType == 2:
                    speed = 90

                shootBullets(enemyOne.x, enemyOne.y, speed, 15, angle, fireType, numBullets)
                enemyOne.set_image(assets.image("""EnemyShootAgro"""))
                enemyAnimDelay.reset()
                enemyFireDelay.reset()
            elif Math.percent_chance(4):
                if waypoint == None:
                    tPosX = Math.round(Math.random() * 100)
                    tPosY = Math.round(Math.random() * 100)
                    # Min check
                    tPosX = min(tPosX, scene.screen_width())
                    tPosY = min(tPosY, scene.screen_height())
                    # Max check
                    tPosX = max(tPosX, 0)
                    tPosY = max(tPosY, 0)
                    distToPlayer = calcDist(tPosX, tPosY, playerOne.x, playerOne.y)
                    if distToPlayer >= 35:
                        waypoint = [tPosX, tPosY]
            elif Math.percent_chance(8):
                fireType += 1
                if fireType >= 3:
                    fireType = 0
            elif(enemyAnimDelay.passed(500)):
                enemyOne.set_image(enemyNormalImage)
        else:
            return

    if waypoint != None:
        #If we have a waypoint we move towards it. This also applies animations to the enemy.
        setImage = False
        # X
        if enemyOne.x < waypoint[0]:
            enemyOne.x += 1
            if not setImage:
                enemyNormalImage = assets.image("""EnemyRight""")
                setImage = True
        elif enemyOne.x > waypoint[0]:
            enemyOne.x -= 1
            if not setImage:
                enemyNormalImage = assets.image("""EnemyLeft""")
                setImage = True
        # Y
        isAgro = (enemyStage == 2)
        if enemyOne.y < waypoint[1]:
            enemyOne.y += 1
            if not setImage:
                if isAgro:
                    enemyNormalImage = assets.image("""EnemyNormalAgro""")
                else:
                    enemyNormalImage = assets.image("""EnemyNormal""")
                setImage = True
        elif enemyOne.y > waypoint[1]:
            enemyOne.y -= 1
            if not setImage:
                if isAgro:
                    enemyNormalImage = assets.image("""EnemyNormalAgro""")
                else:
                    enemyNormalImage = assets.image("""EnemyNormal""")
                setImage = True

        if Math.round(calcDist(enemyOne.x, enemyOne.y, waypoint[0], waypoint[1])) <= 1:#If we're 1 pixel away we have reached the waypoint. So we remove the waypoint to a None.
            if isAgro:
                enemyNormalImage = assets.image("""EnemyNormalAgro""")
            else:
                enemyNormalImage = assets.image("""EnemyNormal""")
            waypoint = None
            intro = False

    if enemyHealth <= 0:
        #Checks if the enemy is dead if so next stage. If its end stage it'll destroy the enemy.
        info.set_life(info.life() + 3)
        enemyStage += 1
        if debug:
            enemyHealth = 1#25
        else:
            enemyHealth = 25
        sprites.set_data_number(enemyOne, "health", enemyHealth)

        if enemyStage >= 2:
            sprites.destroy(enemyOne)
            spawnEnemy()
            spawnEnemy()

#Finishes the game and displays the players score.
def endGame():
    #Final stage is beaten send win screen.
    info.set_score(score)
    game.set_game_over_message(True, "GAMEOVER! YOU WIN!")
    game.game_over(True)

#Calculates the Distance between one position to another.
def calcDist(posX: number, posY: number, posX1: number, posY1: number):
    xDiff = posX - posX1
    yDiff = posY - posY1
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff)

#Calculates the angle from one position to another.
def calcAngle(posX: number, posY: number, posX1: number, posY1: number):
    xDiff = posX - posX1
    yDiff = posY - posY1
    return wrapDegrees(toDegrees(Math.atan2(xDiff, yDiff)) - 180) # -180

#Wraps the given degrees within 0 to 360 when given -160 to 160 range.
def wrapDegrees(degrees):
    d = degrees % 360.0;
    if (d >= 180.0):
        d -= 360.0;
    if (d < -180.0):
        d += 360.0;
    return d;

#Radians to degrees.
def toDegrees(rot):
    return rot * 57.29577951308232

#Converts degrees to radians
def toRadians(degrees):
    return degrees * Math.PI / 180

# Event listener for when the players health reaches 0 if so show lose screen.
def on_life_zero():
    global score
    info.set_score(score)
    game.set_game_over_message(True, "GAME OVER! YOU LOSE!")
    game.game_over(True)
info.on_life_zero(on_life_zero)

#Customisable shoot bullet function.
def shootBullets(posX: number, posY: number, speed: number, distance: number, angleOffset: number, typeBullet: number, numBullets: number):
    #TODO Create limits for the shoot types. and defaults
    if typeBullet == 0:
        # Circle shot.
        angle2 = -180
        while angle2 <= 180:
            oPosX = posX + distance * Math.sin(Math.PI * angle2 / 180)
            oPosY = posY + distance * (0 - Math.cos(Math.PI * angle2 / 180))
            velX = Math.sin(Math.PI * (angle2 + angleOffset) / 180) * speed
            velY = (0 - Math.cos(Math.PI * (angle2 + angleOffset) / 180)) * speed
            enemyProjectile = sprites.create(assets.image("""EnemyBullet """),SpriteKind.EnemyProjectile)
            enemyProjectile.set_position(oPosX, oPosY)
            enemyProjectile.set_velocity(velX, velY)
            enemyProjectile.set_flag(SpriteFlag.AUTO_DESTROY, True)
            angle2 += numBullets * 10
    elif typeBullet == 1:
        # Laser Line Shot
        angle = ( calcAngle(posX, posY, playerOne.x- (playerOne.width / 2), playerOne.y - (playerOne.height / 2)) + angleOffset )  * 0.017453292519943295
        for x in range(-numBullets, numBullets):
            enemyProjectile = sprites.create(assets.image("""LaserPixel"""),SpriteKind.EnemyProjectile)
            enemyProjectile.set_flag(SpriteFlag.AUTO_DESTROY, True)
            if not (angle <= 1.8 and angle >= 0.8  or angle <= -1.8 and angle >= -0.8 ):
                enemyProjectile.set_position(posX + (x * enemyProjectile.width), posY)
            else:
                enemyProjectile.set_position(posX, posY + (x * enemyProjectile.height))
            velX = Math.sin(angle) * speed
            velY = Math.cos(angle) * speed
            enemyProjectile.set_velocity(velX, velY)
    elif typeBullet == 2:
        #Flak Shot Will explode when near a player of a cirle shot.
        enemyProjectile = sprites.create(assets.image("""EnemyFlak"""),SpriteKind.EnemyProjFlak)
        enemyProjectile.set_flag(SpriteFlag.AUTO_DESTROY, True)
        enemyProjectile.set_position(posX, posY)
        angle = ( calcAngle(posX, posY, playerOne.x, playerOne.y) + angleOffset )  * 0.017453292519943295
        velX = Math.sin(angle) * speed
        velY = Math.cos(angle) * speed
        enemyProjectile.set_velocity(velX, velY)
    elif typeBullet == 3:
        #Direct laser shot towards the a target.
        currentPosX = posX
        currentPosY = posY
        step = 0
        angle = ( calcAngle(posX, posY, playerOne.x, playerOne.y) )
        sin = Math.sin(toRadians(angle))
        cos = Math.cos(toRadians(angle))
        toPos = (currentPosX + (distance * cos), currentPosY + (distance * sin))

        while step != distance:
            if currentPosX <= 0 or currentPosX >= 160 or currentPosY <= 0 or currentPosY >= 120:
                break
            enemyProjectile = sprites.create(assets.image("""LaserSegmentUncharged"""),SpriteKind.EnemyProjLaser)
            enemyProjectile.set_flag(SpriteFlag.AUTO_DESTROY, True)
            enemyProjectile.set_position(currentPosX, currentPosY)
            sprites.set_data_boolean(enemyProjectile, "charged", False)
            sprites.set_data_number(enemyProjectile, "lifeTimer", 0)
            currentPosX += (enemyProjectile.width) * sin
            currentPosY += (enemyProjectile.height) * cos
            step += 1
    elif typeBullet == 4:
        #Seeking bullets
        enProj = sprites.create(assets.image("""EnemyActiveSeeker"""), SpriteKind.EnemyHeatSeeker)
        enProj.set_flag(SpriteFlag.AUTO_DESTROY, True)
        enProj.set_position(posX, posY)
        sprites.set_data_number(enProj, "lifeTimer", 0)
        sprites.set_data_number(enProj, "speed", speed)
        angle = ( calcAngle(posX, posY, playerOne.x- (playerOne.width / 2), playerOne.y - (playerOne.height / 2)) + angleOffset )  * 0.017453292519943295
        velX = Math.sin(angle) * speed
        velY = Math.cos(angle) * speed
        enProj.set_velocity(velX, velY)
    elif typeBullet == 5:
        #BoosterShot when close to enemy will rapidly speed up.
        enProj = sprites.create(assets.image("""BoosterShotIdle"""), SpriteKind.EnemyBoosterShot)
        enProj.set_flag(SpriteFlag.AUTO_DESTROY, True)
        enProj.set_position(posX, posY)
        sprites.set_data_boolean(enProj, "Boosting", False)
        sprites.set_data_number(enProj, "speed", speed)
        angle = ( calcAngle(posX, posY, playerOne.x- (playerOne.width / 2), playerOne.y - (playerOne.height / 2)) + angleOffset )  * 0.017453292519943295
        sprites.set_data_number(enProj, "Angle", angle)
        velX = Math.sin(angle) * speed
        velY = Math.cos(angle) * speed
        enProj.set_velocity(velX, velY)

#Updates the Ship Enemy Group.
def updateEnemyGroup():
    global enemyStage
    #End stage detect.
    if len(sprites.all_of_kind(SpriteKind.enemy))<= 0:
        startBigBoss()
        enemyStage += 1
        info.change_life_by(3)
        return

    totalHealth = 0
    for enemy in sprites.all_of_kind(SpriteKind.enemy):
        #Varible collection.
        waypointPos = (
            sprites.read_data_number(enemy, "waypointX"),
            sprites.read_data_number(enemy, "waypointY")
        )
        waypointDist = calcDist(enemy.x, enemy.y, waypointPos[0], waypointPos[1])
        playerDist = calcDist(enemy.x, enemy.y, playerOne.x, playerOne.y)
        enemyShootDelay = sprites.read_data_number(enemy, "shootDelay")
        enemyMoveDelay = sprites.read_data_number(enemy, "moveDelay")
        shootToggle = sprites.read_data_boolean(enemy, "shootToggle")
    
        totalHealth += sprites.read_data_number(enemy, "health")

        #Death check
        if sprites.read_data_number(enemy, "health") <= 0:
            sprites.destroy(enemy)
            continue

        #Shoot code
        if enemyShootDelay <= 0 and playerDist <= 90 and not playerDist <= 40:
            if shootToggle:
                #Shoot laser here
                shootBullets(enemy.x, enemy.y + (enemy.height / 2), 200, 100, 0, 3, 0)
                sprites.set_data_boolean(enemy, "shootToggle", not shootToggle)
                sprites.set_data_number(enemy, "shootDelay", 40 + randint(5, 10))
            else:
                #Shoot seekers here
                shootCount = sprites.read_data_number(enemy, "shootCounter")
                shootBullets(enemy.x, enemy.y + (enemy.height / 2), 60, 100, 0, 5, 0)

                if shootCount >= 1:
                    sprites.set_data_number(enemy, "shootCounter", 0)
                    sprites.set_data_boolean(enemy, "shootToggle", not shootToggle)
                else:
                    sprites.set_data_number(enemy, "shootCounter", shootCount + 1)
                sprites.set_data_number(enemy, "shootDelay", 15)  
        else:
            sprites.set_data_number(enemy, "shootDelay", enemyShootDelay - 1)

        #Movement Code this code creates a movement position.
        if waypointDist <= 2.5:
            if enemyMoveDelay <= 0 or sprites.read_data_number(enemy, "anim"):
                sprites.set_data_number(enemy, "moveDelay", 60)
                if sprites.read_data_boolean(enemy, "anim"):
                    sprites.set_data_boolean(enemy, "anim", False)

                goodWaypoint = False
                #TODO change this to a screen scan.
                distToPlayer = 0
                iterLimit = 200
                while goodWaypoint == False:
                    iterLimit = iterLimit - 1
                    if iterLimit == 0:
                        break
                    tPosX = Math.round(Math.random() * 100)
                    tPosY = Math.round(Math.random() * 100)
                    # Min check
                    tPosX = min(tPosX, scene.screen_width())
                    tPosY = min(tPosY, scene.screen_height())
                    # Max check
                    tPosX = max(tPosX, 0)
                    tPosY = max(tPosY, 0)
                    distToPlayer = calcDist(tPosX, tPosY, playerOne.x, playerOne.y)
                    if  playerDist >= 50:
                        goodWaypoint = True

                if goodWaypoint:
                    sprites.set_data_number(enemy, "waypointX", tPosX)
                    sprites.set_data_number(enemy, "waypointY", tPosY)
            else:
                sprites.set_data_number(enemy, "moveDelay", enemyMoveDelay - 1)
        else:#This code movement enemy to the position.
            if waypointPos[0] < enemy.x:
                enemy.x -= 2
            elif waypointPos[0] > enemy.x:
                enemy.x += 2

            if waypointPos[1] < enemy.y:
                enemy.y -= 2
            elif waypointPos[1] > enemy.y:
                enemy.y += 2

    info.set_score(totalHealth)

#Spawn the enemy space ships.
def spawnEnemy():
    global debug
    tempEnemy = sprites.create(assets.image("""Space Ship"""), SpriteKind.enemy)

    #Position
    randomX = randint(20, 140)
    randomY = randint(0, 20)

    tempEnemy.set_position(randomX, -20)

    #Data
    sprites.set_data_number(tempEnemy, "waypointX", randomX)
    sprites.set_data_number(tempEnemy, "waypointY", randomY)
    if debug:
        sprites.set_data_number(tempEnemy, "health", 1)
    else:
        sprites.set_data_number(tempEnemy, "health", 10)
    sprites.set_data_number(tempEnemy, "shootDelay", 30)
    sprites.set_data_number(tempEnemy, "moveDelay", 60)
    sprites.set_data_boolean(tempEnemy, "shootToggle", False)
    sprites.set_data_number(tempEnemy, "shootCounter", 0)

    #Spawn animation
    sprites.set_data_boolean(tempEnemy, "anim", True)

#Starts the scrolling background.
def startScrollingBG():
    global bgVSpeed
    scene.set_background_image(assets.image("""BackgroundLayer1"""))
    scroller.scroll_background_with_speed(0, bgVSpeed)

#Creates and spawns the big boss.
def startBigBoss():
    global bigBoss
    #BigBoss
    bigBoss = sprites.create(assets.image("""BigBoss0"""), SpriteKind.enemy)
    bigBoss.set_scale(2.0)
    bigBoss.set_position(80, (-bigBoss.height * 2))

    bigBoss.set_position(80, -60)

    if debug:
        sprites.set_data_number(bigBoss, "health", 1)
    else:
        sprites.set_data_number(bigBoss, "health", 300)
    sprites.set_data_number(bigBoss, "bullletType", 0)
    sprites.set_data_number(bigBoss, "shootDelay", 35)
    sprites.set_data_number(bigBoss, "waypointX", 80)
    sprites.set_data_number(bigBoss, "waypointY", -60)
    sprites.set_data_boolean(bigBoss, "anim", False)

#Updates the bigboss executing his movement and shooting.
def updateBigBoss():
    global bigBoss
    health = sprites.read_data_number(bigBoss, "health")
    info.set_score(health)
    if health <= 0:
        sprites.destroy(bigBoss)
        return

    waypoint = ( sprites.read_data_number(bigBoss, "waypointX"), sprites.read_data_number(bigBoss, "waypointY") )
    waypointDist = calcDist(bigBoss.x, bigBoss.y, waypoint[0], waypoint[1])

    # Shooting Code
    shootDelay = sprites.read_data_number(bigBoss, "shootDelay")
    if shootDelay <= 0:
        randomSlot = randint(0, 4)#Creates and random number between 0-4
        if randomSlot == 0:# Lasers eyes
            shootBullets(bigBoss.x - 8, bigBoss.y - 8, 200, 100, 0, 3, 0)
            shootBullets(bigBoss.x + 8, bigBoss.y - 8, 200, 100, 0, 3, 0)
        elif randomSlot == 1:#Flake shot
            shootBullets(bigBoss.x, bigBoss.y, 100, 15, 0, 2, 0)
        elif randomSlot == 2:#Circle shot
            shootBullets(bigBoss.x, bigBoss.y, 40, 10, 80, 0, 4)
        elif randomSlot == 3:#Line
            shootBullets(bigBoss.x, bigBoss.y, 70, 0, 80, 1, 0)
        elif randomSlot == 4:#Heat Seeker
            shootBullets(bigBoss.x, bigBoss.y, 80, 0, 0, 4, 0)

        sprites.set_data_number(bigBoss, "shootDelay", 35)
    else:
        sprites.set_data_number(bigBoss, "shootDelay",  shootDelay - 1)
    
    #Movement Code
    if waypointDist <= 2:
        goodPos = False
        while goodPos == False:
            randomX = randint(0, 160)
            randomY = randint(0, 120)

            sprites.set_data_number(bigBoss, "waypointX", randomX)
            sprites.set_data_number(bigBoss, "waypointY", randomY)

            goodPos = True
    else:
        if bigBoss.x < waypoint[0]:
            bigBoss.x += 1        
        elif bigBoss.x > waypoint[0]:
            bigBoss.x -= 1#

        if bigBoss.y < waypoint[1]:
            bigBoss.y += 1
        elif bigBoss.y > waypoint[1]:
            bigBoss.y -= 1



#
# TODO add Menu system
# With custmisable classes and diffculty levels.
#   Rapid fire Class
#   Shield class
#   Missile Class
#   1 Heart Mode
#   Free mode (select any stage)
#   Nightmare Mode
#
bigBoss: Sprite = None
moveSpeed = 0
screenFlash = False
playerOne: Sprite = None
enemyOne: Sprite = None
waypoint: any = (80, 15)
fireDelay = msDelay()
enemyFireDelay = msDelay()
enemyOne = sprites.create(assets.image("""
    EnemyNormal
"""), SpriteKind.enemy)
enemyOne.set_position(80, -15)
playerOne = sprites.create(assets.image("""
    PlayerClass1
"""), SpriteKind.player)
playerOne.set_position(80, 90)
playerOne.set_stay_in_screen(True)
playerOne.set_scale(0.4, ScaleAnchor.MIDDLE)
enemyStage = 0
screenFlashTimer = msDelay()
enemyNormalImage = assets.image("""EnemyNormal""")
enemyAnimDelay = msDelay()
intro = True
info.set_life(3)
fireType = 0
#isAgro = False
score = 0
bgVSpeed = 50
playersClass = 0
hasStarted = True#False
inputDelay = msDelay()

def nextClass():
    global playersClass
    playersClass += 1

def prevClass():
    global playersClass
    playersClass -= 1

debug = False

if debug:
    sprites.set_data_number(enemyOne, "health", 1)
else:
    sprites.set_data_number(enemyOne, "health", 30)



enemyStage = 2

spawnEnemy()
spawnEnemy()
#startBigBoss()

startScrollingBG()
def on_forever():
    game.stats = True
    if hasStarted == True:
        collision()
        updatePlayer()
        if enemyStage == 0 or enemyStage == 1:
            updateEnemy()
        if enemyStage == 2: 
            updateEnemyGroup()
        if enemyStage == 3:
            updateBigBoss()
    else:
        if inputDelay.passed(300):
            if controller.left.is_pressed():
                nextClass()
            elif controller.right.is_pressed():
                prevClass()

        info.set_score(playersClass)

forever(on_forever)