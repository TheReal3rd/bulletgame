@namespace
class SpriteKind:
    EnemyProjectile = SpriteKind.create()

@namespace
class SpriteKind:
    EnemyProjFlak = SpriteKind.create()

#Reusable MiliSecond timer.
#Why? - Tick or counter delays depends on the CPU speed and how busy it is. This fixes issues that it causes.
#Because it doesn't depend on CPU speed.
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

# On start is a initialization block.
def collision():
    global screenFlash, enemyHealth, score
    #I prefer to create my own destroy system but this fixes a possible memory issue? IDK as i can't see memory usage or any readouts.
    # Enemy Bullets
    if not screenFlash:
        for value in sprites.all_of_kind(SpriteKind.EnemyProjectile):
            # Step 1 Check whether the bullet is near the player. if it isn't its definalty not touching the player. So we skip.
            dist = Math.round(calcDist(value.x, value.y, playerOne.x, playerOne.y))
            if dist >= 10:
                continue
            # Step 2 Check if the player is overlapping the byullet if so we apply damage.
            if playerOne.overlaps_with(value):
                value.start_effect(effects.fire, 100)
                sprites.destroy(value)
                info.change_life_by(-1)
                screenFlash = True
                screenFlashTimer.reset()
                break

    # Player Bullets This is the same as the first for loop but for the player attacking the enemy
    for value1 in sprites.all_of_kind(SpriteKind.projectile):
        dist = calcDist(value1.x, value1.y, enemyOne.x, enemyOne.y)
        if dist >= 10:
            continue
        if enemyOne.overlaps_with(value1):
            value1.start_effect(effects.fire, 100)
            sprites.destroy(value1)
            enemyHealth += 0 - 1
            score += 100
    # Special loop for the Flak bullet. It simply checks if the bullet is near the player if so and meets range requirements it explodes.
    for value2 in sprites.all_of_kind(SpriteKind.EnemyProjFlak):
        dist = calcDist(value2.x, value2.y, playerOne.x, playerOne.y)
        if dist >= 25:
            continue
        else:
            value2.start_effect(effects.fire, 100)
            sprites.destroy(value2)
            shootBullets(value2.x, value2.y, 15, 5, 0, 0, 6)

# PlayerUpdate this will only contain code related to the player.
def updatePlayer():
    global moveSpeed, fireType, fireDelay, screenFlash, screenFlashTimer
    #Slow move switch
    isBPressed = controller.B.is_pressed()
    if isBPressed:
        moveSpeed = 0.5
    else:
        moveSpeed = 2
    #Movement
    if controller.down.is_pressed():
        playerOne.y += moveSpeed
    if controller.up.is_pressed():
        playerOne.y += moveSpeed * -1
    if controller.left.is_pressed():
        playerOne.x += moveSpeed * -1
    if controller.right.is_pressed():
        playerOne.x += moveSpeed
    #Shooting
    if controller.A.is_pressed():
        delay = 500
        if isBPressed:
            delay = 200
        if fireDelay.passed(delay):
            projectile2 = sprites.create_projectile_from_sprite(assets.image("""PlayerBullet"""), playerOne, 0, -50)
            fireDelay.reset()
    #Screenflash
    if screenFlash:
        scene.set_background_color(2)
        if screenFlashTimer.passed(200):
            scene.set_background_color(0)
            screenFlash = False


# This updates the enemy the stage system is here to add more enemies.
def updateEnemy():
    global waypoint, enemyStage, enemyOne, fireType, enemyHealth, enemyNormalImage, intro, isAgro, score
    info.set_score(enemyHealth)
    if not intro:
        if enemyStage == 0:#Stage 1
            if enemyFireDelay.passed(2000):
                #Get the number of bullets to shoot. This is based on the type it'll be shooting.
                numBullets = None
                if(fireType == 0):
                    numBullets = 4
                    angle = 60
                    if Math.percent_chance(50):
                        angle = -60
                else:
                    angle = 0
                    numBullets = 6
                #The speed of the bullet. Get changed when the bullet type is changed.
                speed = 15
                if fireType == 1:
                    speed = 50
                elif fireType == 2:
                    speed = 90

                #Shoot and reset delays.
                shootBullets(enemyOne.x, enemyOne.y, speed, 15, angle, fireType, numBullets)
                enemyOne.set_image(assets.image("""EnemyShoot"""))
                enemyAnimDelay.reset()
                enemyFireDelay.reset()
            elif Math.percent_chance(2): 
                # 2% chance to generate a new waypoint.
                if waypoint == None:#If we already have a waypoint don't create a new one.
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
            if enemyFireDelay.passed(1500):
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
            #Final stage is beaten send win screen.
            info.set_score(score)
            game.set_game_over_message(True, "GAMEOVER! YOU WIN!")
            game.game_over(True)

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
        if not isAgro:
            isAgro = True
        else:
            sprites.destroy(enemyOne)

# Distance Calculation. Distance from pos1 to pos2
def calcDist(posX: number, posY: number, posX1: number, posY1: number):
    xDiff = posX - posX1
    yDiff = posY - posY1
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff)

#Calculates the angle from one position to another.
def calcAngle(posX: number, posY: number, posX1: number, posY1: number):
    xDiff = posX - posX1
    yDiff = posY - posY1
    return wrapDegrees(toDegrees(Math.atan2(xDiff, yDiff)) - 180)

#Copied from Java Math library due to it not exist in this Math lib
def wrapDegrees(degrees):
    d = degrees % 360.0;
    if (d >= 180.0):
        d -= 360.0;
    if (d < -180.0):
        d += 360.0;
    return d;

#Copied from Java Math library due to it not exist in this Math lib
def toDegrees(rot):
    return rot * 57.29577951308232

# Event listener for when the players health reaches 0 if so show lose screen.
def on_life_zero():
    global score
    info.set_score(score)
    game.set_game_over_message(True, "GAME OVER! YOU LOSE!")
    game.game_over(True)
info.on_life_zero(on_life_zero)

# The Maths side can't be done in blocks.
# This is the pattern shooter for the enemy.
def shootBullets(posX2: number, posY2: number, speed: number, distance: number, angleOffset: number, typeBullet: number, numBullets: number):
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
isAgro = False
score = 0

# Game Loop
#
# Block of instructions that must be ran every game tick / frame.
#
# Handle all the logic related to Collision, Movement and Controls.
def on_forever():
    game.stats = True
    collision()
    updatePlayer()
    updateEnemy()
forever(on_forever)