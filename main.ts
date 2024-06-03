namespace SpriteKind {
    export const EnemyProjectile = SpriteKind.create()
    export const EnemyProjFlak = SpriteKind.create()
    export const EnemyProjLaser = SpriteKind.create()
}

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
    
    if (!screenFlash) {
        for (let value of sprites.allOfKind(SpriteKind.EnemyProjectile)) {
            dist = Math.round(calcDist(value.x, value.y, playerOne.x, playerOne.y))
            if (dist >= 10) {
                continue
            }
            
            if (playerOne.overlapsWith(value)) {
                value.startEffect(effects.fire, 100)
                sprites.destroy(value)
                info.changeLifeBy(-1)
                screenFlash = true
                screenFlashTimer.reset()
                break
            }
            
        }
    }
    
    if (enemyStage < 2) {
        for (let value1 of sprites.allOfKind(SpriteKind.Projectile)) {
            dist = calcDist(value1.x, value1.y, enemyOne.x, enemyOne.y)
            if (dist >= 10) {
                continue
            }
            
            if (enemyOne.overlapsWith(value1)) {
                value1.startEffect(effects.fire, 100)
                sprites.destroy(value1)
                enemyHealth += 0 - 1
                score += 100
            }
            
        }
    } else {
        for (let value3 of sprites.allOfKind(SpriteKind.Projectile)) {
            for (let enemy of enemyList) {
                dist = calcDist(value3.x, value3.y, enemy.x, enemy.y)
                if (dist >= 10) {
                    continue
                }
                
                if (enemy.overlapsWith(value3)) {
                    value3.startEffect(effects.fire, 100)
                    sprites.destroy(value3)
                    sprites.changeDataNumberBy(enemy, "health", -1)
                    if (sprites.readDataNumber(enemy, "Health") <= 0) {
                        sprites.destroy(enemy)
                        enemyList.removeElement(enemy)
                    }
                    
                    score += 100
                }
                
            }
        }
    }
    
    for (let value2 of sprites.allOfKind(SpriteKind.EnemyProjFlak)) {
        dist = calcDist(value2.x, value2.y, playerOne.x, playerOne.y)
        if (dist >= 25) {
            continue
        } else {
            value2.startEffect(effects.fire, 100)
            sprites.destroy(value2)
            shootBullets(value2.x, value2.y, 15, 5, 0, 0, 6)
        }
        
    }
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
            
            if (!screenFlash && playerOne.overlapsWith(laserSeg)) {
                laserSeg.startEffect(effects.fire, 100)
                sprites.destroy(laserSeg)
                info.changeLifeBy(-1)
                screenFlash = true
                screenFlashTimer.reset()
            }
            
        }
        
    }
}

function updatePlayer() {
    let delay: number;
    let projectile2: Sprite;
    
    let isBPressed = controller.B.isPressed()
    if (isBPressed) {
        moveSpeed = 0.5
    } else {
        moveSpeed = 2
    }
    
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
    
    if (noMove) {
        scroller.scrollBackgroundWithSpeed(0, bgVSpeed)
    }
    
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
    
    if (screenFlash) {
        scene.setBackgroundImage(assets.image`BackgroundLayer2`)
        scene.cameraShake(2, 400)
        if (screenFlashTimer.passed(400)) {
            scene.setBackgroundImage(assets.image`BackgroundLayer1`)
            screenFlash = false
        }
        
    }
    
}

function updateEnemy() {
    let numBullets: number;
    let angle: number;
    let speed: number;
    let tPosX: number;
    let tPosY: number;
    let distToPlayer: number;
    let setImage: boolean;
    let isAgro: any;
    
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
                    tPosX = Math.round(Math.random() * 100)
                    tPosY = Math.round(Math.random() * 100)
                    //  Min check
                    tPosX = Math.min(tPosX, scene.screenWidth())
                    tPosY = Math.min(tPosY, scene.screenHeight())
                    //  Max check
                    tPosX = Math.max(tPosX, 0)
                    tPosY = Math.max(tPosY, 0)
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
                    tPosX = Math.round(Math.random() * 100)
                    tPosY = Math.round(Math.random() * 100)
                    //  Min check
                    tPosX = Math.min(tPosX, scene.screenWidth())
                    tPosY = Math.min(tPosY, scene.screenHeight())
                    //  Max check
                    tPosX = Math.max(tPosX, 0)
                    tPosY = Math.max(tPosY, 0)
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
        enemyHealth = 25
        if (enemyStage >= 2) {
            sprites.destroy(enemyOne)
            spawnEnemy()
            spawnEnemy()
        }
        
    }
    
}

function endGame() {
    // Final stage is beaten send win screen.
    info.setScore(score)
    game.setGameOverMessage(true, "GAMEOVER! YOU WIN!")
    game.gameOver(true)
}

function calcDist(posX: number, posY: number, posX1: number, posY1: number): number {
    let xDiff = posX - posX1
    let yDiff = posY - posY1
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
}

function calcAngle(posX: number, posY: number, posX1: number, posY1: number): number {
    let xDiff = posX - posX1
    let yDiff = posY - posY1
    return wrapDegrees(toDegrees(Math.atan2(xDiff, yDiff)) - 180)
}

//  -180
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

function toDegrees(rot: number): number {
    return rot * 57.29577951308232
}

//  Event listener for when the players health reaches 0 if so show lose screen.
info.onLifeZero(function on_life_zero() {
    
    info.setScore(score)
    game.setGameOverMessage(true, "GAME OVER! YOU LOSE!")
    game.gameOver(true)
})
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
    // TODO Create limits for the shoot types. and defaults
    if (typeBullet == 0) {
        //  Circle shoot.
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
        //  Laser Line Shoot
        angle = (calcAngle(enemyOne.x - enemyOne.width / 2, enemyOne.y - enemyOne.height / 2, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) + angleOffset) * 0.017453292519943295
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
        angle = (calcAngle(enemyOne.x - enemyOne.width / 2, enemyOne.y - enemyOne.height / 2, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) + angleOffset) * 0.017453292519943295
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
    }
    
}

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180
}

function updateEnemyGroup() {
    let enemy: Sprite;
    let waypointPos: number[];
    let waypointDist: number;
    let playerDist: number;
    let enemyShootDelay: number;
    let enemyMoveDelay: number;
    let goodWaypoint: boolean;
    let distToPlayer: number;
    let iterLimit: number;
    let tPosX: number;
    let tPosY: number;
    console.log(enemyList.length)
    let toRemove = []
    if (enemyList.length == 0) {
        endGame()
    }
    
    let index = 0
    while (index != enemyList.length) {
        enemy = enemyList[index]
        index += 1
        waypointPos = [sprites.readDataNumber(enemy, "waypointX"), sprites.readDataNumber(enemy, "waypointY")]
        waypointDist = calcDist(enemy.x, enemy.y, waypointPos[0], waypointPos[1])
        playerDist = calcDist(enemy.x, enemy.y, playerOne.x, playerOne.y)
        enemyShootDelay = sprites.readDataNumber(enemy, "shootDelay")
        enemyMoveDelay = sprites.readDataNumber(enemy, "moveDelay")
        if (sprites.readDataNumber(enemy, "health") <= 0) {
            sprites.destroy(enemy)
            toRemove.push(index)
            continue
        }
        
        if (enemyShootDelay <= 0 && playerDist <= 90 && !(playerDist <= 40)) {
            shootBullets(enemy.x, enemy.y + enemy.height / 2, 0, 100, 0, 3, 0)
            sprites.setDataNumber(enemy, "shootDelay", 45 + randint(10, 20))
        } else {
            sprites.setDataNumber(enemy, "shootDelay", enemyShootDelay - 1)
        }
        
        if (waypointDist <= 2) {
            if (enemyMoveDelay <= 0 || sprites.readDataNumber(enemy, "anim")) {
                sprites.setDataNumber(enemy, "moveDelay", 50)
                if (sprites.readDataBoolean(enemy, "anim")) {
                    sprites.setDataBoolean(enemy, "anim", false)
                }
                
                goodWaypoint = false
                distToPlayer = 0
                iterLimit = 200
                while (goodWaypoint == false) {
                    iterLimit = iterLimit - 1
                    if (iterLimit == 0) {
                        break
                    }
                    
                    tPosX = Math.round(Math.random() * 100)
                    tPosY = Math.round(Math.random() * 100)
                    //  Min check
                    tPosX = Math.min(tPosX, scene.screenWidth())
                    tPosY = Math.min(tPosY, scene.screenHeight())
                    //  Max check
                    tPosX = Math.max(tPosX, 0)
                    tPosY = Math.max(tPosY, 0)
                    distToPlayer = calcDist(tPosX, tPosY, playerOne.x, playerOne.y)
                    if (playerDist >= 70) {
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
    for (let slot of toRemove) {
        enemyList.removeAt(slot)
    }
}

function spawnEnemy() {
    let tempEnemy = sprites.create(assets.image`Space Ship`, SpriteKind.Enemy)
    // Position
    let randomX = randint(20, 140)
    let randomY = randint(0, 20)
    tempEnemy.setPosition(randomX, -20)
    // Data
    sprites.setDataNumber(tempEnemy, "waypointX", randomX)
    sprites.setDataNumber(tempEnemy, "waypointY", randomY)
    sprites.setDataNumber(tempEnemy, "health", 10)
    sprites.setDataNumber(tempEnemy, "shootDelay", 55)
    sprites.setDataNumber(tempEnemy, "moveDelay", 50)
    // Spawn animation
    sprites.setDataBoolean(tempEnemy, "anim", true)
    // Push to list
    enemyList.push(tempEnemy)
}

function startScrollingBG() {
    
    scene.setBackgroundImage(assets.image`BackgroundLayer1`)
    scroller.scrollBackgroundWithSpeed(0, bgVSpeed)
}

let enemyList : Sprite[] = []
let moveSpeed = 0
let screenFlash = false
let playerOne : Sprite = null
let enemyHealth = 30
let enemyOne : Sprite = null
let waypoint = [80, 15]
let fireDelay = new msDelay()
let enemyFireDelay = new msDelay()
enemyOne = sprites.create(assets.image`
    EnemyNormal
`, SpriteKind.Enemy)
enemyOne.setPosition(80, -15)
playerOne = sprites.create(assets.image`
    myImage
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
// Update 2
// spawnEnemy()
// spawnEnemy()
// enemyStage = 3
startScrollingBG()
forever(function on_forever() {
    game.stats = true
    collision()
    updatePlayer()
    if (enemyStage < 2) {
        updateEnemy()
    } else {
        updateEnemyGroup()
    }
    
})
