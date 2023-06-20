@namespace
class SpriteKind:
    EnemyProjectile = SpriteKind.create()

#Reusable MiliSecond timer.
#Why? - This is a better and more consistant compared to using a counter / tick delay system.
#This is beacuse its fixed on the speed of the CPU. not the current time. Meaning when the CPU is slowed down the
#counter it slowed down.
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
        dist = calcDist(value.x,
            value.y,
            scene.screen_width() / 2,
            scene.screen_height() / 2)
        if dist >= scene.screen_width():
            # # Off screen remove it.
            sprites.destroy(value)
            continue
        # Step 2 Check whether the sprites a close too each other - if not skip
        dist = calcDist(value.x, value.y, PlayerOne.x, PlayerOne.y)
        if dist >= 7:
            continue
        # Step 3 Check for collision
        if PlayerOne.overlaps_with(value):
            value.start_effect(effects.fire, 100)
            sprites.destroy(value)
            info.change_life_by(-1)
            screenFlash = True
    # Player Bullets This is the same as the first for loop but for the player attacking the enemy
    for value1 in sprites.all_of_kind(SpriteKind.projectile):
        dist = calcDist(value1.x,
            value1.y,
            scene.screen_width() / 2,
            scene.screen_height() / 2)
        if dist >= scene.screen_width():
            # # Off screen remove it.
            sprites.destroy(value1)
            continue
        dist = calcDist(value1.x, value1.y, EnemyOne.x, EnemyOne.y)
        if dist >= 7:
            continue
        if EnemyOne.overlaps_with(value1):
            value1.start_effect(effects.fire, 100)
            sprites.destroy(value1)
            enemyHealth += 0 - 1
# Movement Function.
# 
# This block of code gets executed by the game loop its only job is to check what keys are pressed if a certain key is pressed run.
def movement():
    global moveSpeed
    if controller.B.is_pressed():
        moveSpeed = 1
    else:
        moveSpeed = 2
    if controller.down.is_pressed():
        PlayerOne.y += moveSpeed
    if controller.up.is_pressed():
        PlayerOne.y += moveSpeed * -1
    if controller.left.is_pressed():
        PlayerOne.x += moveSpeed * -1
    if controller.right.is_pressed():
        PlayerOne.x += moveSpeed
# This updates the enemy the stage system is here to add more enemies.
def updateEnemy():
    global waypoint, EnemyStage
    if EnemyStage == 0:
        if enemyFireDelay.passed(2000):
            # # if 2000 ms passed the enemy will shoot.
            angle = 60
            if Math.percent_chance(50):
                angle = -60
            # 1 is the lowest.
            # 30 max
            shootBullets(EnemyOne.x, EnemyOne.y, 15, angle, 1, 4)
            enemyFireDelay.reset()
        elif Math.percent_chance(2):
            # # 2% chance to generate a new waypoint.
            if waypoint == None:
                tPosX = Math.round(Math.random() * 100)
                tPosY = Math.round(Math.random() * 100)
                # Max check
                tPosX = min(tPosX, scene.screen_width())
                tPosY = min(tPosY, scene.screen_height())
                # #Min check
                tPosX = max(tPosX, 0)
                tPosY = max(tPosY, 0)
                distToPlayer = calcDist(tPosX, tPosY, PlayerOne.x, PlayerOne.y)
                if distToPlayer >= 60:
                    waypoint = [tPosX, tPosY]
    elif EnemyStage == 1:
        pass
    else:
        game.set_game_over_message(True, "GAME OVER!")
    if waypoint != None:
        # # IF we have a waypoint we move towards it.
        # X
        if EnemyOne.x < waypoint[0]:
            EnemyOne.x += 1
        elif EnemyOne.x > waypoint[0]:
            EnemyOne.x -= 1
        # Y
        if EnemyOne.y < waypoint[1]:
            EnemyOne.y += 1
        elif EnemyOne.y > waypoint[1]:
            EnemyOne.y -= 1
        if Math.round(calcDist(EnemyOne.x, EnemyOne.y, waypoint[0], waypoint[1])) <= 1:
            waypoint = None
    if enemyHealth <= 0:
        EnemyStage = 1
        sprites.destroy(EnemyOne)
# Players shooting code.
def shoot():
    if controller.A.is_pressed():
        if fireDelay.passed(500):
            projectile2 = sprites.create_projectile_from_sprite(assets.image("""
                PlayerBullet
            """), PlayerOne, 0, -50)
            fireDelay.reset()
# Distance Caculation.
# Provide x1 and y1 and it'll calculate the distance to x2 and y2
def calcDist(posX: number, posY: number, posX1: number, posY1: number):
    global xDiff, yDiff
    xDiff = posX - posX1
    yDiff = posY - posY1
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
# Event listener for when the players health reaches 0 if so reset game.

def on_life_zero():
    game.reset()
info.on_life_zero(on_life_zero)

"""

On start here.

"""
# The Maths side can't be done in blocks.
# This is the pattern shooter for the enemy.
def shootBullets(posX2: number, posY2: number, distance: number, angleOffset: number, typeBullet: number, numBullets: number):
    global enemyProjectile
    # Laser Shoot
    if typeBullet == 0:
        # Circle shoot.
        angle2 = -180
        while angle2 <= 180:
            oPosX = posX2 + distance * Math.sin(Math.PI * angle2 / 180)
            oPosY = posY2 + distance * (0 - Math.cos(Math.PI * angle2 / 180))
            velX = Math.sin(Math.PI * (angle2 + angleOffset) / 180) * distance
            velY = (0 - Math.cos(Math.PI * (angle2 + angleOffset) / 180)) * distance
            enemyProjectile = sprites.create(assets.image("""EnemyBullet """),SpriteKind.EnemyProjectile)
            enemyProjectile.set_velocity(velX, velY)
            enemyProjectile.set_position(oPosX, oPosY)
            angle2 += numBullets * 10
    elif typeBullet == 1:
        enemyProjectile = sprites.create(assets.image("""LaserPixel"""),SpriteKind.EnemyProjectile)
        enemyProjectile.set_position(posX2, posY2)
    else:
        pass
enemyProjectile: Sprite = None
yDiff = 0
xDiff = 0
moveSpeed = 0
screenFlash = False
EnemyStage = 0
PlayerOne: Sprite = None
enemyHealth = 0
projectile22 = None
EnemyOne: Sprite = None
waypoint: List[number] = None
fireDelay = msDelay()
enemyFireDelay = msDelay()
enemyHealth = 30
EnemyOne = sprites.create(assets.image("""
    myImage1
"""), SpriteKind.enemy)
EnemyOne.set_position(80, 15)
PlayerOne = sprites.create(assets.image("""
    myImage
"""), SpriteKind.player)
PlayerOne.set_position(80, 90)
PlayerOne.set_stay_in_screen(True)
PlayerOne.set_scale(0.4, ScaleAnchor.MIDDLE)
EnemyStage = 0
screenFlashTimer = msDelay()
intro = 1
info.set_life(3)
# Game Loop
# 
# Block of instructions that must be ran every game tick / frame.
# 
# Handle all the logic related to Collision, Movement and Controls.

def on_forever():
    game.stats = True
    movement()
    shoot()
    collision()
    updateEnemy()
forever(on_forever)
