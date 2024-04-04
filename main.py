@namespace
class SpriteKind:
    EnemyProjectile = SpriteKind.create()
    EnemyProjFlak = SpriteKind.create()   

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

def collision():
    global screenFlash, enemyHealth, score
    if not screenFlash:
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

    if enemyStage < 2:
        for value1 in sprites.all_of_kind(SpriteKind.projectile):
            dist = calcDist(value1.x, value1.y, enemyOne.x, enemyOne.y)
            if dist >= 10:
                continue
            if enemyOne.overlaps_with(value1):
                value1.start_effect(effects.fire, 100)
                sprites.destroy(value1)
                enemyHealth += 0 - 1
                score += 100
    else:
        for value3 in sprites.all_of_kind(SpriteKind.projectile):
            for enemy in enemyList:
                dist = calcDist(value3.x, value3.y, enemy.x, enemy.y)
                if dist >= 10:
                    continue
                if enemy.overlaps_with(value3):
                    value3.start_effect(effects.fire, 100)
                    sprites.destroy(value3)
                    sprites.change_data_number_by(enemy, "health", -1)
                    if sprites.read_data_number(enemy, "Health") <= 0:
                        sprites.destroy(enemy)
                        enemyList.remove_element(enemy)
                    score += 100  

    for value2 in sprites.all_of_kind(SpriteKind.EnemyProjFlak):
        dist = calcDist(value2.x, value2.y, playerOne.x, playerOne.y)
        if dist >= 25:
            continue
        else:
            value2.start_effect(effects.fire, 100)
            sprites.destroy(value2)
            shootBullets(value2.x, value2.y, 15, 5, 0, 0, 6)

def updatePlayer():
    global moveSpeed, fireType, fireDelay, screenFlash, screenFlashTimer
    isBPressed = controller.B.is_pressed()
    if isBPressed:
        moveSpeed = 0.5
    else:
        moveSpeed = 2

    if controller.down.is_pressed():
        playerOne.y += moveSpeed
    if controller.up.is_pressed():
        playerOne.y += moveSpeed * -1
    if controller.left.is_pressed():
        playerOne.x += moveSpeed * -1
    if controller.right.is_pressed():
        playerOne.x += moveSpeed

    if controller.A.is_pressed():
        delay = 500
        if isBPressed:
            delay = 200
        if fireDelay.passed(delay):
            projectile2 = sprites.create_projectile_from_sprite(assets.image("""PlayerBullet"""), playerOne, 0, -50)
            fireDelay.reset()

    if screenFlash:
        scene.set_background_color(2)
        if screenFlashTimer.passed(200):
            scene.set_background_color(0)
            screenFlash = False

def updateEnemy():
    global waypoint, enemyStage, enemyOne, fireType, enemyHealth, enemyNormalImage, intro, score
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
        enemyHealth = 30
        if enemyStage >= 3:
            sprites.destroy(enemyOne)

def endGame():
    #Final stage is beaten send win screen.
    info.set_score(score)
    game.set_game_over_message(True, "GAMEOVER! YOU WIN!")
    game.game_over(True)

def calcDist(posX: number, posY: number, posX1: number, posY1: number):
    xDiff = posX - posX1
    yDiff = posY - posY1
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff)

def calcAngle(posX: number, posY: number, posX1: number, posY1: number):
    xDiff = posX - posX1
    yDiff = posY - posY1
    return wrapDegrees(toDegrees(Math.atan2(xDiff, yDiff)) - 180)

def wrapDegrees(degrees):
    d = degrees % 360.0;
    if (d >= 180.0):
        d -= 360.0;
    if (d < -180.0):
        d += 360.0;
    return d;

def toDegrees(rot):
    return rot * 57.29577951308232

# Event listener for when the players health reaches 0 if so show lose screen.
def on_life_zero():
    global score
    info.set_score(score)
    game.set_game_over_message(True, "GAME OVER! YOU LOSE!")
    game.game_over(True)
info.on_life_zero(on_life_zero)

def shootBullets(posX2: number, posY2: number, speed: number, distance: number, angleOffset: number, typeBullet: number, numBullets: number):
    #TODO Create limits for the shoot types. and defaults
    if typeBullet == 0:
        # Circle shoot.
        angle2 = -180
        while angle2 <= 180:
            oPosX = posX2 + distance * Math.sin(Math.PI * angle2 / 180)
            oPosY = posY2 + distance * (0 - Math.cos(Math.PI * angle2 / 180))
            velX = Math.sin(Math.PI * (angle2 + angleOffset) / 180) * speed
            velY = (0 - Math.cos(Math.PI * (angle2 + angleOffset) / 180)) * speed
            enemyProjectile = sprites.create(assets.image("""EnemyBullet """),SpriteKind.EnemyProjectile)
            enemyProjectile.set_position(oPosX, oPosY)
            enemyProjectile.set_velocity(velX, velY)
            enemyProjectile.set_flag(SpriteFlag.AUTO_DESTROY, True)
            angle2 += numBullets * 10
    elif typeBullet == 1:
        # Laser Shoot
        angle = ( calcAngle(enemyOne.x - (enemyOne.width / 2), enemyOne.y - (enemyOne.height / 2), playerOne.x- (playerOne.width / 2), playerOne.y - (playerOne.height / 2)) + angleOffset )  * 0.017453292519943295
        for x in range(-numBullets, numBullets):
            enemyProjectile = sprites.create(assets.image("""LaserPixel"""),SpriteKind.EnemyProjectile)
            enemyProjectile.set_flag(SpriteFlag.AUTO_DESTROY, True)
            if not (angle <= 1.8 and angle >= 0.8  or angle <= -1.8 and angle >= -0.8 ):
                enemyProjectile.set_position(posX2 + (x * enemyProjectile.width), posY2)
            else:
                enemyProjectile.set_position(posX2, posY2 + (x * enemyProjectile.height))
            velX = Math.sin(angle) * speed
            velY = Math.cos(angle) * speed
            enemyProjectile.set_velocity(velX, velY)
    elif typeBullet == 2:
        #Flak Shot Will explode when near a player of a cirle shot.
        enemyProjectile = sprites.create(assets.image("""EnemyFlak"""),SpriteKind.EnemyProjFlak)
        enemyProjectile.set_flag(SpriteFlag.AUTO_DESTROY, True)
        enemyProjectile.set_position(posX2, posY2)
        angle = ( calcAngle(enemyOne.x - (enemyOne.width / 2), enemyOne.y - (enemyOne.height / 2), playerOne.x- (playerOne.width / 2), playerOne.y - (playerOne.height / 2)) + angleOffset )  * 0.017453292519943295
        velX = Math.sin(angle) * speed
        velY = Math.cos(angle) * speed
        enemyProjectile.set_velocity(velX, velY)

def updateEnemyGroup():
    for enemy in enemyList:
        print(enemy)
        waypointPos = (
            sprites.read_data_number(enemy, "waypointX"),
            sprites.read_data_number(enemy, "waypointY")
        )
        waypointDist = calcDist(enemy.x, enemy.y, waypointPos[0], waypointPos[1])
        
        if Math.percent_chance(0.00001):
            enemyProjectile = sprites.create(assets.image("""EnemyFlak"""),SpriteKind.EnemyProjFlak)
            enemyProjectile.set_flag(SpriteFlag.AUTO_DESTROY, True)
            enemyProjectile.set_position(enemy.x, enemy.y)
            angle = ( calcAngle(enemy.x - (enemy.width / 2), enemy.y - (enemy.height / 2), playerOne.x- (playerOne.width / 2), playerOne.y - (playerOne.height / 2)) )  * 0.017453292519943295
            angle += randint(-0.5, 0.5)
            velX = Math.sin(angle) * 200
            velY = Math.cos(angle) * 200
            enemyProjectile.set_velocity(velX, velY)       
        
        if waypointDist <= 1:
            if sprites.read_data_boolean(enemy, "anim"):
                sprites.set_data_boolean(enemy, "anim", False)

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
                sprites.set_data_number(enemy, "waypointX", tPosX)
                sprites.set_data_number(enemy, "waypointY", tPosY)

        else:
            if waypointPos[0] < enemy.x:
                enemy.x -= 1
            elif waypointPos[0] > enemy.x:
                enemy.x += 1

            if waypointPos[1] < enemy.y:
                enemy.y -= 1
            elif waypointPos[1] > enemy.y:
                enemy.y += 1

def spawnEnemy():
    tempEnemy = sprites.create(assets.image("""Space Ship"""), SpriteKind.enemy)

    #Position
    randomX = randint(20, 140)
    randomY = randint(0, 20)

    tempEnemy.set_position(randomX, -20)

    #Data
    sprites.set_data_number(tempEnemy, "waypointX", randomX)
    sprites.set_data_number(tempEnemy, "waypointY", randomY)
    sprites.set_data_number(tempEnemy, "health", 30)

    #Spawn animation
    sprites.set_data_boolean(tempEnemy, "anim", True)

    #Push to list
    enemyList.push(tempEnemy)

enemyList: List[Sprite] = []
moveSpeed = 0
screenFlash = False
playerOne: Sprite = None
enemyHealth = 30
enemyOne: Sprite = None
waypoint: any = (80, 15)
fireDelay = msDelay()
enemyFireDelay = msDelay()
enemyOne = sprites.create(assets.image("""
    EnemyNormal
"""), SpriteKind.enemy)
enemyOne.set_position(80, -15)
playerOne = sprites.create(assets.image("""
    myImage
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

#Update 2

spawnEnemy()
spawnEnemy()

enemyStage = 3

def on_forever():
    game.stats = True
    collision()
    updatePlayer()
    if enemyStage < 2:
        updateEnemy()
    else:
        updateEnemyGroup()
forever(on_forever)