namespace SpriteKind {
    export const EnemyProjectile = SpriteKind.create()
    export const EnemyProjFlak = SpriteKind.create()
    export const EnemyProjLaser = SpriteKind.create()
    export const EnemyHeatSeeker = SpriteKind.create()
    export const EnemySpaceShip = SpriteKind.create()
    export const EnemyBoosterShot = SpriteKind.create()
}

// Standard Milliseconde delay tracker.
class msDelay {
    static counter: number
    private ___counter_is_set: boolean
    private ___counter: number
    get counter(): number {
        return this.___counter_is_set ? this.___counter : msDelay.counter
    }
    set counter(value: number) {
        this.___counter_is_set = true
        this.___counter = value
    }
    
    public static __initmsDelay() {
        msDelay.counter = null
    }
    
    constructor() {
        this.counter = game.runtime()
    }
    
    public passed(amount: number) {
        let returnVar = game.runtime() - this.counter >= amount
        if (returnVar) {
            this.reset()
        }
        
        return returnVar
    }
    
    public reset() {
        this.counter = game.runtime()
    }
    
}

msDelay.__initmsDelay()

function collision() {
    let dist: number;
    let lifeTimer: number;
    let speed: number;
    let angle: number;
    let velX: number;
    let velY: number;
    let boostState: boolean;
    let distToPlayer: number;
    let highest: number;
    
    if (!screenFlash) {
        // Normal Bullet code.
        for (let value of sprites.allOfKind(SpriteKind.EnemyProjectile)) {
            dist = Math.round(calcDist(value.x, value.y, playerOne.x, playerOne.y))
            if (dist >= 10) {
                continue
            }
            
            if (playerOne.overlapsWith(value)) {
                applyDamageAndDestroy(value)
                break
            }
            
        }
        //  Heat Seeking Bullets
        for (let seeker of sprites.allOfKind(SpriteKind.EnemyHeatSeeker)) {
            lifeTimer = sprites.readDataNumber(seeker, "lifeTimer")
            if (lifeTimer <= 50) {
                speed = sprites.readDataNumber(seeker, "speed")
                angle = calcAngle(seeker.x - seeker.width / 2, seeker.y - seeker.height / 2, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) * 0.017453292519943295
                velX = Math.sin(angle) * speed
                velY = Math.cos(angle) * speed
                seeker.setVelocity(velX, velY)
                sprites.setDataNumber(seeker, "lifeTimer", lifeTimer + 1)
            } else {
                seeker.setImage(assets.image`EnemyInactiveSeeker`)
            }
            
            if (playerOne.overlapsWith(seeker)) {
                applyDamageAndDestroy(seeker)
                break
            }
            
        }
        // Booster shot projectile
        for (let booster of sprites.allOfKind(SpriteKind.EnemyBoosterShot)) {
            boostState = sprites.readDataBoolean(booster, "Boosting")
            if (!boostState) {
                distToPlayer = calcDist(booster.x + booster.vx / 2, booster.y + booster.vy / 2, playerOne.x, playerOne.y)
                if (distToPlayer <= 40) {
                    booster.setImage(assets.image`BoosterShotBoost`)
                    sprites.setDataBoolean(booster, "Boosting", true)
                    angle = sprites.readDataNumber(booster, "Angle")
                    speed = sprites.readDataNumber(booster, "speed") * 2.5
                    velX = Math.sin(angle) * speed
                    velY = Math.cos(angle) * speed
                    booster.setVelocity(velX, velY)
                }
                
            }
            
            if (playerOne.overlapsWith(booster)) {
                applyDamageAndDestroy(booster)
                break
            }
            
        }
        // Laser Segments
        for (let laserSeg of sprites.allOfKind(SpriteKind.EnemyProjLaser)) {
            lifeTimer = sprites.readDataNumber(laserSeg, "lifeTimer")
            sprites.setDataNumber(laserSeg, "lifeTimer", lifeTimer + 1)
            if (lifeTimer >= 40) {
                sprites.setDataBoolean(laserSeg, "charged", true)
                laserSeg.setImage(assets.image`LaserSegment`)
                if (lifeTimer >= 60) {
                    if (Math.percentChance(22)) {
                        laserSeg.startEffect(effects.fire, 100)
                    }
                    
                    sprites.destroy(laserSeg)
                }
                
                if (playerOne.overlapsWith(laserSeg)) {
                    applyDamageAndDestroy(laserSeg)
                    break
                }
                
            }
            
        }
        // Flak Bullets
        for (let value2 of sprites.allOfKind(SpriteKind.EnemyProjFlak)) {
            dist = calcDist(value2.x, value2.y, playerOne.x, playerOne.y)
            if (dist >= 25) {
                continue
            } else {
                value2.startEffect(effects.fire, 100)
                sprites.destroy(value2)
                shootBullets(value2.x, value2.y, 15, 5, 0, 0, 6)
                break
            }
            
        }
    }
    
    // Player Bullet Code
    // Cleaned up - Projectile Collision Detection
    for (let value3 of sprites.allOfKind(SpriteKind.Projectile)) {
        for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
            dist = calcDist(value3.x, value3.y, enemy.x, enemy.y)
            highest = enemy.width
            if (enemy.height > highest) {
                highest = enemy.height
            }
            
            if (dist >= enemy.width) {
                continue
            }
            
            if (enemy.overlapsWith(value3)) {
                value3.startEffect(effects.fire, 100)
                sprites.destroy(value3)
                sprites.changeDataNumberBy(enemy, "health", -1)
                score += 100
            }
            
        }
    }
}

function applyDamageAndDestroy(projSprite: Sprite) {
    
    projSprite.startEffect(effects.fire, 100)
    sprites.destroy(projSprite)
    info.changeLifeBy(-1)
    screenFlash = true
    screenFlashTimer.reset()
}

function updatePlayer() {
    let delay: number;
    let projectile2: Sprite;
    
    // Player Movement speed.
    let isBPressed = controller.B.isPressed()
    if (isBPressed) {
        moveSpeed = 0.5
    } else {
        moveSpeed = 2
    }
    
    // Directional Movement.
    let noMove = true
    if (controller.down.isPressed()) {
        playerOne.y += moveSpeed
        noMove = false
    } else if (controller.up.isPressed()) {
        playerOne.y += moveSpeed * -1
        noMove = false
    }
    
    if (controller.left.isPressed()) {
        playerOne.x += moveSpeed * -1
        scroller.scrollBackgroundWithSpeed(-10, bgVSpeed)
        noMove = false
    } else if (controller.right.isPressed()) {
        playerOne.x += moveSpeed
        scroller.scrollBackgroundWithSpeed(10, bgVSpeed)
        noMove = false
    }
    
    // Scrolling background pausing.
    if (noMove) {
        scroller.scrollBackgroundWithSpeed(0, bgVSpeed)
    }
    
    // Player Shooting code
    if (controller.A.isPressed()) {
        delay = 500
        if (isBPressed) {
            delay = 200
        }
        
        if (fireDelay.passed(delay)) {
            projectile2 = sprites.createProjectileFromSprite(assets.image`PlayerBullet`, playerOne, 0, -50)
            fireDelay.reset()
        }
        
    }
    
    // When damaged flashes screen and shakes camera
    if (screenFlash) {
        scene.setBackgroundImage(assets.image`BackgroundLayer2`)
        scene.cameraShake(2, 400)
        if (screenFlashTimer.passed(400)) {
            scene.setBackgroundImage(assets.image`BackgroundLayer1`)
            screenFlash = false
        }
        
    }
    
}

// Updates the Skeletion Enemy for phase 1 and 2
function updateEnemy() {
    let numBullets: number;
    let angle: number;
    let speed: number;
    let tPosX: number;
    let tPosY: number;
    let distToPlayer: number;
    let setImage: boolean;
    let isAgro: any;
    
    let enemyHealth = sprites.readDataNumber(enemyOne, "health")
    info.setScore(enemyHealth)
    if (!intro) {
        if (enemyStage == 0) {
            // Stage 1
            if (enemyFireDelay.passed(1500)) {
                numBullets = null
                if (fireType == 0) {
                    numBullets = 4
                    angle = 60
                    if (Math.percentChance(50)) {
                        angle = -60
                    }
                    
                } else {
                    angle = 0
                    numBullets = 6
                }
                
                speed = 15
                if (fireType == 1) {
                    speed = 50
                } else if (fireType == 2) {
                    speed = 90
                }
                
                shootBullets(enemyOne.x, enemyOne.y, speed, 15, angle, fireType, numBullets)
                enemyOne.setImage(assets.image`EnemyShoot`)
                enemyAnimDelay.reset()
                enemyFireDelay.reset()
            } else if (Math.percentChance(2)) {
                if (waypoint == null) {
                    // Min and Max check.
                    tPosX = Math.clamp(0, scene.screenWidth(), Math.round(Math.random() * 100))
                    tPosY = Math.clamp(0, scene.screenHeight(), Math.round(Math.random() * 100))
                    distToPlayer = calcDist(tPosX, tPosY, playerOne.x, playerOne.y)
                    if (distToPlayer >= 60) {
                        waypoint = [tPosX, tPosY]
                    }
                    
                }
                
            } else if (Math.percentChance(0.001)) {
                // 0.001 chance to change the type of bullet to be shot.
                if (fireType == 0) {
                    fireType = 1
                } else {
                    fireType = 0
                }
                
            } else if (enemyAnimDelay.passed(500)) {
                // Animation reset.
                enemyOne.setImage(enemyNormalImage)
            }
            
        } else if (enemyStage == 1) {
            // Stage 2 Same as stage 1 but shoot faster, move more frequantly and more.
            if (enemyFireDelay.passed(1200)) {
                numBullets = null
                if (fireType == 0) {
                    numBullets = 4
                    angle = 80
                    if (Math.percentChance(50)) {
                        angle = -80
                    }
                    
                } else {
                    angle = 0
                    numBullets = 7
                }
                
                speed = 15
                if (fireType == 1) {
                    speed = 50
                } else if (fireType == 2) {
                    speed = 90
                }
                
                shootBullets(enemyOne.x, enemyOne.y, speed, 15, angle, fireType, numBullets)
                enemyOne.setImage(assets.image`EnemyShootAgro`)
                enemyAnimDelay.reset()
                enemyFireDelay.reset()
            } else if (Math.percentChance(4)) {
                if (waypoint == null) {
                    //  Min and Max check
                    tPosX = Math.clamp(0, scene.screenWidth(), Math.round(Math.random() * 100))
                    tPosY = Math.clamp(0, scene.screenHeight(), Math.round(Math.random() * 100))
                    distToPlayer = calcDist(tPosX, tPosY, playerOne.x, playerOne.y)
                    if (distToPlayer >= 35) {
                        waypoint = [tPosX, tPosY]
                    }
                    
                }
                
            } else if (Math.percentChance(8)) {
                fireType += 1
                if (fireType >= 3) {
                    fireType = 0
                }
                
            } else if (enemyAnimDelay.passed(500)) {
                enemyOne.setImage(enemyNormalImage)
            }
            
        } else {
            return
        }
        
    }
    
    if (waypoint != null) {
        // If we have a waypoint we move towards it. This also applies animations to the enemy.
        setImage = false
        //  X
        if (enemyOne.x < waypoint[0]) {
            //  TODO Put the animations into Arrays and then use that instead of the else if statements.
            enemyOne.x += 1
            if (!setImage) {
                enemyNormalImage = assets.image`EnemyRight`
                setImage = true
            }
            
        } else if (enemyOne.x > waypoint[0]) {
            enemyOne.x -= 1
            if (!setImage) {
                enemyNormalImage = assets.image`EnemyLeft`
                setImage = true
            }
            
        }
        
        //  Y
        isAgro = enemyStage == 2
        if (enemyOne.y < waypoint[1]) {
            enemyOne.y += 1
            if (!setImage) {
                if (isAgro) {
                    enemyNormalImage = assets.image`EnemyNormalAgro`
                } else {
                    enemyNormalImage = assets.image`EnemyNormal`
                }
                
                setImage = true
            }
            
        } else if (enemyOne.y > waypoint[1]) {
            enemyOne.y -= 1
            if (!setImage) {
                if (isAgro) {
                    enemyNormalImage = assets.image`EnemyNormalAgro`
                } else {
                    enemyNormalImage = assets.image`EnemyNormal`
                }
                
                setImage = true
            }
            
        }
        
        if (Math.round(calcDist(enemyOne.x, enemyOne.y, waypoint[0], waypoint[1])) <= 1) {
            // If we're 1 pixel away we have reached the waypoint. So we remove the waypoint to a None.
            if (isAgro) {
                enemyNormalImage = assets.image`EnemyNormalAgro`
            } else {
                enemyNormalImage = assets.image`EnemyNormal`
            }
            
            waypoint = null
            intro = false
        }
        
    }
    
    if (enemyHealth <= 0) {
        // Checks if the enemy is dead if so next stage. If its end stage it'll destroy the enemy.
        info.setLife(info.life() + 3)
        enemyStage += 1
        if (debug) {
            enemyHealth = 1
        } else {
            // 25
            enemyHealth = 25
        }
        
        sprites.setDataNumber(enemyOne, "health", enemyHealth)
        if (enemyStage >= 2) {
            sprites.destroy(enemyOne)
            spawnEnemy()
            spawnEnemy()
        }
        
    }
    
}

// Finishes the game and displays the players score.
function endGame() {
    // Final stage is beaten send win screen.
    info.setScore(score)
    game.setGameOverMessage(true, "GAMEOVER! YOU WIN!")
    game.gameOver(true)
}

// Calculates the Distance between one position to another.
function calcDist(posX: number, posY: number, posX1: number, posY1: number): number {
    let xDiff = posX - posX1
    let yDiff = posY - posY1
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
}

// Calculates the angle from one position to another.
function calcAngle(posX: number, posY: number, posX1: number, posY1: number): number {
    let xDiff = posX - posX1
    let yDiff = posY - posY1
    return wrapDegrees(toDegrees(Math.atan2(xDiff, yDiff)) - 180)
}

//  -180
// Wraps the given degrees within 0 to 360 when given -160 to 160 range.
function wrapDegrees(degrees: number): number {
    let d = degrees % 360.0
    if (d >= 180.0) {
        d -= 360.0
    }
    
    if (d < -180.0) {
        d += 360.0
    }
    
    return d
}

// Radians to degrees.
function toDegrees(rot: number): number {
    return rot * 57.29577951308232
}

// Converts degrees to radians
function toRadians(degrees: number): number {
    return degrees * Math.PI / 180
}

//  Event listener for when the players health reaches 0 if so show lose screen.
info.onLifeZero(function on_life_zero() {
    
    info.setScore(score)
    game.setGameOverMessage(true, "GAME OVER! YOU LOSE!")
    game.gameOver(true)
})
// Customisable shoot bullet function.
function shootBullets(posX: number, posY: number, speed: number, distance: number, angleOffset: number, typeBullet: number, numBullets: number) {
    let angle2: number;
    let oPosX: number;
    let oPosY: number;
    let velX: number;
    let velY: number;
    let enemyProjectile: Sprite;
    let angle: number;
    let currentPosX: number;
    let currentPosY: number;
    let step: number;
    let sin: number;
    let cos: number;
    let toPos: any[];
    let enProj: Sprite;
    // TODO Create limits for the shoot types. and defaults
    if (typeBullet == 0) {
        //  Circle shot.
        angle2 = -180
        while (angle2 <= 180) {
            oPosX = posX + distance * Math.sin(Math.PI * angle2 / 180)
            oPosY = posY + distance * (0 - Math.cos(Math.PI * angle2 / 180))
            velX = Math.sin(Math.PI * (angle2 + angleOffset) / 180) * speed
            velY = (0 - Math.cos(Math.PI * (angle2 + angleOffset) / 180)) * speed
            enemyProjectile = sprites.create(assets.image`EnemyBullet `, SpriteKind.EnemyProjectile)
            enemyProjectile.setPosition(oPosX, oPosY)
            enemyProjectile.setVelocity(velX, velY)
            enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
            angle2 += numBullets * 10
        }
    } else if (typeBullet == 1) {
        //  Laser Line Shot
        angle = (calcAngle(posX, posY, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) + angleOffset) * 0.017453292519943295
        for (let x = -numBullets; x < numBullets; x++) {
            enemyProjectile = sprites.create(assets.image`LaserPixel`, SpriteKind.EnemyProjectile)
            enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
            if (!(angle <= 1.8 && angle >= 0.8 || angle <= -1.8 && angle >= -0.8)) {
                enemyProjectile.setPosition(posX + x * enemyProjectile.width, posY)
            } else {
                enemyProjectile.setPosition(posX, posY + x * enemyProjectile.height)
            }
            
            velX = Math.sin(angle) * speed
            velY = Math.cos(angle) * speed
            enemyProjectile.setVelocity(velX, velY)
        }
    } else if (typeBullet == 2) {
        // Flak Shot Will explode when near a player of a cirle shot.
        enemyProjectile = sprites.create(assets.image`EnemyFlak`, SpriteKind.EnemyProjFlak)
        enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
        enemyProjectile.setPosition(posX, posY)
        angle = (calcAngle(posX, posY, playerOne.x, playerOne.y) + angleOffset) * 0.017453292519943295
        velX = Math.sin(angle) * speed
        velY = Math.cos(angle) * speed
        enemyProjectile.setVelocity(velX, velY)
    } else if (typeBullet == 3) {
        // Direct laser shot towards the a target.
        currentPosX = posX
        currentPosY = posY
        step = 0
        angle = calcAngle(posX, posY, playerOne.x, playerOne.y)
        sin = Math.sin(toRadians(angle))
        cos = Math.cos(toRadians(angle))
        toPos = [currentPosX + distance * cos, currentPosY + distance * sin]
        while (step != distance) {
            if (currentPosX <= 0 || currentPosX >= 160 || currentPosY <= 0 || currentPosY >= 120) {
                break
            }
            
            enemyProjectile = sprites.create(assets.image`LaserSegmentUncharged`, SpriteKind.EnemyProjLaser)
            enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
            enemyProjectile.setPosition(currentPosX, currentPosY)
            sprites.setDataBoolean(enemyProjectile, "charged", false)
            sprites.setDataNumber(enemyProjectile, "lifeTimer", 0)
            currentPosX += enemyProjectile.width * sin
            currentPosY += enemyProjectile.height * cos
            step += 1
        }
    } else if (typeBullet == 4) {
        // Seeking bullets
        enProj = sprites.create(assets.image`EnemyActiveSeeker`, SpriteKind.EnemyHeatSeeker)
        enProj.setFlag(SpriteFlag.AutoDestroy, true)
        enProj.setPosition(posX, posY)
        sprites.setDataNumber(enProj, "lifeTimer", 0)
        sprites.setDataNumber(enProj, "speed", speed)
        angle = (calcAngle(posX, posY, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) + angleOffset) * 0.017453292519943295
        velX = Math.sin(angle) * speed
        velY = Math.cos(angle) * speed
        enProj.setVelocity(velX, velY)
    } else if (typeBullet == 5) {
        // BoosterShot when close to enemy will rapidly speed up.
        enProj = sprites.create(assets.image`BoosterShotIdle`, SpriteKind.EnemyBoosterShot)
        enProj.setFlag(SpriteFlag.AutoDestroy, true)
        enProj.setPosition(posX, posY)
        sprites.setDataBoolean(enProj, "Boosting", false)
        sprites.setDataNumber(enProj, "speed", speed)
        angle = (calcAngle(posX, posY, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) + angleOffset) * 0.017453292519943295
        sprites.setDataNumber(enProj, "Angle", angle)
        velX = Math.sin(angle) * speed
        velY = Math.cos(angle) * speed
        enProj.setVelocity(velX, velY)
    }
    
}

// Updates the Ship Enemy Group.
function updateEnemyGroup() {
    let waypointPos: number[];
    let waypointDist: number;
    let playerDist: number;
    let enemyShootDelay: number;
    let enemyMoveDelay: number;
    let shootToggle: boolean;
    let shootCount: number;
    let goodWaypoint: boolean;
    let distToPlayer: number;
    let iterLimit: number;
    let tPosX: number;
    let tPosY: number;
    
    // End stage detect.
    if (sprites.allOfKind(SpriteKind.Enemy).length <= 0) {
        startBigBoss()
        enemyStage += 1
        info.changeLifeBy(3)
        return
    }
    
    let totalHealth = 0
    for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
        // Varible collection.
        waypointPos = [sprites.readDataNumber(enemy, "waypointX"), sprites.readDataNumber(enemy, "waypointY")]
        waypointDist = calcDist(enemy.x, enemy.y, waypointPos[0], waypointPos[1])
        playerDist = calcDist(enemy.x, enemy.y, playerOne.x, playerOne.y)
        enemyShootDelay = sprites.readDataNumber(enemy, "shootDelay")
        enemyMoveDelay = sprites.readDataNumber(enemy, "moveDelay")
        shootToggle = sprites.readDataBoolean(enemy, "shootToggle")
        totalHealth += sprites.readDataNumber(enemy, "health")
        // Death check
        if (sprites.readDataNumber(enemy, "health") <= 0) {
            sprites.destroy(enemy)
            continue
        }
        
        // Shoot code
        if (enemyShootDelay <= 0 && playerDist <= 90 && !(playerDist <= 40)) {
            if (shootToggle) {
                // Shoot laser here
                shootBullets(enemy.x, enemy.y + enemy.height / 2, 200, 100, 0, 3, 0)
                sprites.setDataBoolean(enemy, "shootToggle", !shootToggle)
                sprites.setDataNumber(enemy, "shootDelay", 40 + randint(5, 10))
            } else {
                // Shoot seekers here
                shootCount = sprites.readDataNumber(enemy, "shootCounter")
                shootBullets(enemy.x, enemy.y + enemy.height / 2, 60, 100, 0, 4, 0)
                if (shootCount >= 1) {
                    sprites.setDataNumber(enemy, "shootCounter", 0)
                    sprites.setDataBoolean(enemy, "shootToggle", !shootToggle)
                } else {
                    sprites.setDataNumber(enemy, "shootCounter", shootCount + 1)
                }
                
                sprites.setDataNumber(enemy, "shootDelay", 15)
            }
            
        } else {
            sprites.setDataNumber(enemy, "shootDelay", enemyShootDelay - 1)
        }
        
        // Movement Code this code creates a movement position.
        if (waypointDist <= 2.5) {
            if (enemyMoveDelay <= 0 || sprites.readDataNumber(enemy, "anim")) {
                sprites.setDataNumber(enemy, "moveDelay", 60)
                if (sprites.readDataBoolean(enemy, "anim")) {
                    sprites.setDataBoolean(enemy, "anim", false)
                }
                
                goodWaypoint = false
                // TODO change this to a screen scan.
                distToPlayer = 0
                iterLimit = 200
                while (goodWaypoint == false) {
                    iterLimit = iterLimit - 1
                    if (iterLimit == 0) {
                        break
                    }
                    
                    //  Min and Max check
                    tPosX = Math.clamp(0, scene.screenWidth(), Math.round(Math.random() * 100))
                    tPosY = Math.clamp(0, scene.screenHeight(), Math.round(Math.random() * 100))
                    distToPlayer = calcDist(tPosX, tPosY, playerOne.x, playerOne.y)
                    if (playerDist >= 50) {
                        goodWaypoint = true
                    }
                    
                }
                if (goodWaypoint) {
                    sprites.setDataNumber(enemy, "waypointX", tPosX)
                    sprites.setDataNumber(enemy, "waypointY", tPosY)
                }
                
            } else {
                sprites.setDataNumber(enemy, "moveDelay", enemyMoveDelay - 1)
            }
            
        } else {
            // This code movement enemy to the position.
            if (waypointPos[0] < enemy.x) {
                enemy.x -= 2
            } else if (waypointPos[0] > enemy.x) {
                enemy.x += 2
            }
            
            if (waypointPos[1] < enemy.y) {
                enemy.y -= 2
            } else if (waypointPos[1] > enemy.y) {
                enemy.y += 2
            }
            
        }
        
    }
    info.setScore(totalHealth)
}

// Spawn the enemy space ships.
function spawnEnemy() {
    
    let tempEnemy = sprites.create(assets.image`Space Ship`, SpriteKind.Enemy)
    // Position
    let randomX = randint(20, 140)
    let randomY = randint(0, 20)
    tempEnemy.setPosition(randomX, -20)
    // Data
    sprites.setDataNumber(tempEnemy, "waypointX", randomX)
    sprites.setDataNumber(tempEnemy, "waypointY", randomY)
    if (debug) {
        sprites.setDataNumber(tempEnemy, "health", 1)
    } else {
        sprites.setDataNumber(tempEnemy, "health", 10)
    }
    
    sprites.setDataNumber(tempEnemy, "shootDelay", 30)
    sprites.setDataNumber(tempEnemy, "moveDelay", 60)
    sprites.setDataBoolean(tempEnemy, "shootToggle", false)
    sprites.setDataNumber(tempEnemy, "shootCounter", 0)
    // Spawn animation
    sprites.setDataBoolean(tempEnemy, "anim", true)
}

// Starts the scrolling background.
function startScrollingBG() {
    
    scene.setBackgroundImage(assets.image`BackgroundLayer1`)
    scroller.scrollBackgroundWithSpeed(0, bgVSpeed)
}

// Creates and spawns the big boss.
function startBigBoss() {
    
    // BigBoss
    bigBoss = sprites.create(assets.image`BigBoss0`, SpriteKind.Enemy)
    bigBoss.setScale(2.0)
    bigBoss.setPosition(80, -bigBoss.height * 2)
    bigBoss.setPosition(80, -60)
    if (debug) {
        sprites.setDataNumber(bigBoss, "health", 1)
    } else {
        sprites.setDataNumber(bigBoss, "health", 300)
    }
    
    sprites.setDataNumber(bigBoss, "bullletType", 0)
    sprites.setDataNumber(bigBoss, "shootDelay", 35)
    sprites.setDataNumber(bigBoss, "waypointX", 80)
    sprites.setDataNumber(bigBoss, "waypointY", -60)
    sprites.setDataBoolean(bigBoss, "anim", false)
}

// Updates the bigboss executing his movement and shooting.
function updateBigBoss() {
    let randomSlot: number;
    let goodPos: boolean;
    let randomX: number;
    let randomY: number;
    
    let health = sprites.readDataNumber(bigBoss, "health")
    info.setScore(health)
    if (health <= 0) {
        sprites.destroy(bigBoss)
        return
    }
    
    let waypoint = [sprites.readDataNumber(bigBoss, "waypointX"), sprites.readDataNumber(bigBoss, "waypointY")]
    let waypointDist = calcDist(bigBoss.x, bigBoss.y, waypoint[0], waypoint[1])
    //  Shooting Code
    let shootDelay = sprites.readDataNumber(bigBoss, "shootDelay")
    if (shootDelay <= 0) {
        randomSlot = randint(0, 4)
        // Creates and random number between 0-4
        if (randomSlot == 0) {
            //  Lasers eyes
            shootBullets(bigBoss.x - 8, bigBoss.y - 8, 200, 100, 0, 3, 0)
            shootBullets(bigBoss.x + 8, bigBoss.y - 8, 200, 100, 0, 3, 0)
        } else if (randomSlot == 1) {
            // Flake shot
            shootBullets(bigBoss.x, bigBoss.y, 100, 15, 0, 2, 0)
        } else if (randomSlot == 2) {
            // Circle shot
            shootBullets(bigBoss.x, bigBoss.y, 40, 10, 80, 0, 4)
        } else if (randomSlot == 3) {
            // Line
            shootBullets(bigBoss.x, bigBoss.y, 70, 0, 80, 1, 0)
        } else if (randomSlot == 4) {
            // Heat Seeker
            shootBullets(bigBoss.x, bigBoss.y, 80, 0, 0, 4, 0)
        }
        
        sprites.setDataNumber(bigBoss, "shootDelay", 35)
    } else {
        sprites.setDataNumber(bigBoss, "shootDelay", shootDelay - 1)
    }
    
    // Movement Code
    if (waypointDist <= 2) {
        goodPos = false
        while (goodPos == false) {
            randomX = randint(0, 160)
            randomY = randint(0, 120)
            sprites.setDataNumber(bigBoss, "waypointX", randomX)
            sprites.setDataNumber(bigBoss, "waypointY", randomY)
            goodPos = true
        }
    } else {
        if (bigBoss.x < waypoint[0]) {
            bigBoss.x += 1
        } else if (bigBoss.x > waypoint[0]) {
            bigBoss.x -= 1
        }
        
        // 
        if (bigBoss.y < waypoint[1]) {
            bigBoss.y += 1
        } else if (bigBoss.y > waypoint[1]) {
            bigBoss.y -= 1
        }
        
    }
    
}

// 
//  TODO add Menu system
//  With custmisable classes and diffculty levels.
//    Rapid fire Class
//    Shield class
//    Missile Class
//    1 Heart Mode
//    Free mode (select any stage)
//    Nightmare Mode
// 
let bigBoss : Sprite = null
let moveSpeed = 0
let screenFlash = false
let playerOne : Sprite = null
let enemyOne : Sprite = null
let waypoint = [80, 15]
let fireDelay = new msDelay()
let enemyFireDelay = new msDelay()
enemyOne = sprites.create(assets.image`
    EnemyNormal
`, SpriteKind.Enemy)
enemyOne.setPosition(80, -15)
playerOne = sprites.create(assets.image`
    PlayerClass1
`, SpriteKind.Player)
playerOne.setPosition(80, 90)
playerOne.setStayInScreen(true)
playerOne.setScale(0.4, ScaleAnchor.Middle)
let enemyStage = 0
let screenFlashTimer = new msDelay()
let enemyNormalImage = assets.image`EnemyNormal`
let enemyAnimDelay = new msDelay()
let intro = true
info.setLife(3)
let fireType = 0
// isAgro = False
let score = 0
let bgVSpeed = 50
let playersClass = 0
let hasStarted = true
// False
let inputDelay = new msDelay()
function nextClass() {
    
    playersClass += 1
}

function prevClass() {
    
    playersClass -= 1
}

let debug = false
if (debug) {
    sprites.setDataNumber(enemyOne, "health", 1)
} else {
    sprites.setDataNumber(enemyOne, "health", 30)
}

// enemyStage = 2
// spawnEnemy()
// spawnEnemy()
// enemyStage = 2
// startBigBoss()
startScrollingBG()
forever(function on_forever() {
    game.stats = true
    if (hasStarted == true) {
        collision()
        updatePlayer()
        if (enemyStage == 0 || enemyStage == 1) {
            updateEnemy()
        }
        
        if (enemyStage == 2) {
            updateEnemyGroup()
        }
        
        if (enemyStage == 3) {
            updateBigBoss()
        }
        
    } else {
        if (inputDelay.passed(300)) {
            if (controller.left.isPressed()) {
                nextClass()
            } else if (controller.right.isPressed()) {
                prevClass()
            }
            
        }
        
        info.setScore(playersClass)
    }
    
})
