@namespace
class SpriteKind:
    EnemyProjectile = SpriteKind.create()

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
    global screenFlash, enemyHealth
    # Enemy Bullets
    for value in sprites.all_of_kind(SpriteKind.EnemyProjectile):
        # Step 1 Check whether the sprite is in view - if not destroy it.
        dist = calcDist(value.x,value.y,scene.screen_width() / 2,scene.screen_height() / 2)
        if dist >= scene.screen_width():
            # # Off screen remove it.
            sprites.destroy(value)
            continue
        # Step 2 Check whether the sprites a close too each other - if not skip
        dist = calcDist(value.x, value.y, playerOne.x, playerOne.y)
        if dist >= 10:
            continue
        # Step 3 Check for collision
        if playerOne.overlaps_with(value):
            value.start_effect(effects.fire, 100)
            sprites.destroy(value)
            info.change_life_by(-1)
            screenFlash = True
            screenFlashTimer.reset()
    # Player Bullets This is the same as the first for loop but for the player attacking the enemy
    for value1 in sprites.all_of_kind(SpriteKind.projectile):
        dist = calcDist(value1.x,value1.y,scene.screen_width() / 2,scene.screen_height() / 2)
        if dist >= scene.screen_width():
            # # Off screen remove it.
            sprites.destroy(value1)
            continue
        dist = calcDist(value1.x, value1.y, enemyOne.x, enemyOne.y)
        if dist >= 10:
            continue
        if enemyOne.overlaps_with(value1):
            value1.start_effect(effects.fire, 100)
            sprites.destroy(value1)
            enemyHealth += 0 - 1

# PlayerUpdate this will only contain code related to the player.
def updatePlayer():
    global moveSpeed, fireType, fireDelay, screenFlash, screenFlashTimer
    #Slow move switch
    if controller.B.is_pressed():
        moveSpeed = 1##TODO add a foreward facing shield.
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
        if fireDelay.passed(500):
            projectile2 = sprites.create_projectile_from_sprite(assets.image("""PlayerBullet"""), playerOne, 0, -50)
            fireDelay.reset()
    if screenFlash:
        scene.set_background_color(2)
        if screenFlashTimer.passed(200):
            scene.set_background_color(0)
            screenFlash = False


# This updates the enemy the stage system is here to add more enemies.
def updateEnemy():
    global waypoint, enemyStage, enemyOne, fireType, enemyHealth, enemyNormalImage, intro
    info.set_score(enemyHealth)
    if not intro:
        if enemyStage == 0:
            if enemyFireDelay.passed(2000):
                # # if 2000 ms passed the enemy will shoot.
                angle = 60
                if Math.percent_chance(50):
                    angle = -60
                # 1 is the lowest.
                # 30 max
                shootBullets(enemyOne.x, enemyOne.y, 15, angle, fireType, 4)
                enemyOne.set_image(assets.image("""EnemyShoot"""))
                enemyAnimDelay.reset()
                enemyFireDelay.reset()
            elif Math.percent_chance(2):
                # 2% chance to generate a new waypoint.
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
                if fireType == 0:
                    fireType = 1
                else:
                    fireType = 0
            else:
                if(enemyAnimDelay.passed(500)):
                    enemyOne.set_image(enemyNormalImage)
        elif enemyStage == 1:
            pass
        else:
            game.set_game_over_message(True, "GAME OVER!")

    if waypoint != None:
        # # IF we have a waypoint we move towards it.
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
                enemyNormalImage = assets.image("""EnemyNormal""")
                setImage = True
        elif enemyOne.y > waypoint[1]:
            enemyOne.y -= 1
            if not setImage:
                enemyNormalImage = assets.image("""EnemyNormal""")
                setImage = True

        if Math.round(calcDist(enemyOne.x, enemyOne.y, waypoint[0], waypoint[1])) <= 1:
            enemyNormalImage = assets.image("""EnemyNormal""")
            waypoint = None
            intro = False

    if enemyHealth <= 0:
        enemyStage = 1
        sprites.destroy(enemyOne)

# Distance Caculation.
# Provide x1 and y1 and it'll calculate the distance to x2 and y2
def calcDist(posX: number, posY: number, posX1: number, posY1: number):
    xDiff = posX - posX1
    yDiff = posY - posY1
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff)

#Calculates the angle from one position to another.
def calcAngle(posX: number, posY: number, posX1: number, posY1: number):
    xDiff = posX - posX1
    yDiff = posY - posY1
    dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff)
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

# Event listener for when the players health reaches 0 if so reset game.
def on_life_zero():
    game.reset()
info.on_life_zero(on_life_zero)

# The Maths side can't be done in blocks.
# This is the pattern shooter for the enemy.
def shootBullets(posX2: number, posY2: number, distance: number, angleOffset: number, typeBullet: number, numBullets: number):
    if typeBullet == 0:
        # Circle shoot.
        angle2 = -180
        while angle2 <= 180:
            oPosX = posX2 + distance * Math.sin(Math.PI * angle2 / 180)
            oPosY = posY2 + distance * (0 - Math.cos(Math.PI * angle2 / 180))
            velX = Math.sin(Math.PI * (angle2 + angleOffset) / 180) * distance
            velY = (0 - Math.cos(Math.PI * (angle2 + angleOffset) / 180)) * distance
            enemyProjectile = sprites.create(assets.image("""EnemyBullet """),SpriteKind.EnemyProjectile)
            enemyProjectile.set_position(oPosX, oPosY)
            enemyProjectile.set_velocity(velX, velY)
            angle2 += numBullets * 10
    elif typeBullet == 1:
        # Laser Shoot
        angle = calcAngle(enemyOne.x - (enemyOne.width / 2), enemyOne.y - (enemyOne.height / 2), playerOne.x- (playerOne.width / 2), playerOne.y - (playerOne.height / 2)) * 0.017453292519943295
        for x in range(-6, 6):
            enemyProjectile = sprites.create(assets.image("""LaserPixel"""),SpriteKind.EnemyProjectile)
            if not (angle <= 1.8 and angle >= 0.8  or angle <= -1.8 and angle >= -0.8 ):
                enemyProjectile.set_position(posX2 + (x * enemyProjectile.width), posY2)
            else:
                enemyProjectile.set_position(posX2, posY2 + (x * enemyProjectile.height))
            velX = Math.sin(angle) * 50
            velY = Math.cos(angle) * 50
            enemyProjectile.set_velocity(velX, velY)
    elif typeBullet == 2:
        pass#TODO add another shooter type.

moveSpeed = 0
screenFlash = False
playerOne: Sprite = None
enemyHealth = 0
enemyOne: Sprite = None
waypoint: any = (80, 15)
fireDelay = msDelay()
enemyFireDelay = msDelay()
enemyHealth = 30
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

# Game Loop
#
# Block of instructions that must be ran every game tick / frame.
#
# Handle all the logic related to Collision, Movement and Controls.
def on_forever():
    game.stats = True
    updatePlayer()
    collision()
    updateEnemy()
forever(on_forever)