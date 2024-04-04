namespace SpriteKind {
    export const EnemyProjectile = SpriteKind.create()
    export const EnemyProjFlak = SpriteKind.create()
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
    
    if (controller.down.isPressed()) {
        playerOne.y += moveSpeed
    }
    
    if (controller.up.isPressed()) {
        playerOne.y += moveSpeed * -1
    }
    
    if (controller.left.isPressed()) {
        playerOne.x += moveSpeed * -1
    }
    
    if (controller.right.isPressed()) {
        playerOne.x += moveSpeed
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
        scene.setBackgroundColor(2)
        if (screenFlashTimer.passed(200)) {
            scene.setBackgroundColor(0)
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
        enemyHealth = 30
        if (enemyStage >= 3) {
            sprites.destroy(enemyOne)
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
function shootBullets(posX2: number, posY2: number, speed: number, distance: number, angleOffset: number, typeBullet: number, numBullets: number) {
    let angle2: number;
    let oPosX: number;
    let oPosY: number;
    let velX: number;
    let velY: number;
    let enemyProjectile: Sprite;
    let angle: number;
    // TODO Create limits for the shoot types. and defaults
    if (typeBullet == 0) {
        //  Circle shoot.
        angle2 = -180
        while (angle2 <= 180) {
            oPosX = posX2 + distance * Math.sin(Math.PI * angle2 / 180)
            oPosY = posY2 + distance * (0 - Math.cos(Math.PI * angle2 / 180))
            velX = Math.sin(Math.PI * (angle2 + angleOffset) / 180) * speed
            velY = (0 - Math.cos(Math.PI * (angle2 + angleOffset) / 180)) * speed
            enemyProjectile = sprites.create(assets.image`EnemyBullet `, SpriteKind.EnemyProjectile)
            enemyProjectile.setPosition(oPosX, oPosY)
            enemyProjectile.setVelocity(velX, velY)
            enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
            angle2 += numBullets * 10
        }
    } else if (typeBullet == 1) {
        //  Laser Shoot
        angle = (calcAngle(enemyOne.x - enemyOne.width / 2, enemyOne.y - enemyOne.height / 2, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) + angleOffset) * 0.017453292519943295
        for (let x = -numBullets; x < numBullets; x++) {
            enemyProjectile = sprites.create(assets.image`LaserPixel`, SpriteKind.EnemyProjectile)
            enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
            if (!(angle <= 1.8 && angle >= 0.8 || angle <= -1.8 && angle >= -0.8)) {
                enemyProjectile.setPosition(posX2 + x * enemyProjectile.width, posY2)
            } else {
                enemyProjectile.setPosition(posX2, posY2 + x * enemyProjectile.height)
            }
            
            velX = Math.sin(angle) * speed
            velY = Math.cos(angle) * speed
            enemyProjectile.setVelocity(velX, velY)
        }
    } else if (typeBullet == 2) {
        // Flak Shot Will explode when near a player of a cirle shot.
        enemyProjectile = sprites.create(assets.image`EnemyFlak`, SpriteKind.EnemyProjFlak)
        enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
        enemyProjectile.setPosition(posX2, posY2)
        angle = (calcAngle(enemyOne.x - enemyOne.width / 2, enemyOne.y - enemyOne.height / 2, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) + angleOffset) * 0.017453292519943295
        velX = Math.sin(angle) * speed
        velY = Math.cos(angle) * speed
        enemyProjectile.setVelocity(velX, velY)
    }
    
}

function updateEnemyGroup() {
    let waypointPos: number[];
    let waypointDist: number;
    let enemyProjectile: Sprite;
    let angle: number;
    let velX: number;
    let velY: number;
    let tPosX: number;
    let tPosY: number;
    let distToPlayer: number;
    for (let enemy of enemyList) {
        console.log(enemy)
        waypointPos = [sprites.readDataNumber(enemy, "waypointX"), sprites.readDataNumber(enemy, "waypointY")]
        waypointDist = calcDist(enemy.x, enemy.y, waypointPos[0], waypointPos[1])
        if (Math.percentChance(0.00001)) {
            enemyProjectile = sprites.create(assets.image`EnemyFlak`, SpriteKind.EnemyProjFlak)
            enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
            enemyProjectile.setPosition(enemy.x, enemy.y)
            angle = calcAngle(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) * 0.017453292519943295
            angle += randint(-0.5, 0.5)
            velX = Math.sin(angle) * 200
            velY = Math.cos(angle) * 200
            enemyProjectile.setVelocity(velX, velY)
        }
        
        if (waypointDist <= 1) {
            if (sprites.readDataBoolean(enemy, "anim")) {
                sprites.setDataBoolean(enemy, "anim", false)
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
            if (distToPlayer >= 35) {
                sprites.setDataNumber(enemy, "waypointX", tPosX)
                sprites.setDataNumber(enemy, "waypointY", tPosY)
            }
            
        } else {
            if (waypointPos[0] < enemy.x) {
                enemy.x -= 1
            } else if (waypointPos[0] > enemy.x) {
                enemy.x += 1
            }
            
            if (waypointPos[1] < enemy.y) {
                enemy.y -= 1
            } else if (waypointPos[1] > enemy.y) {
                enemy.y += 1
            }
            
        }
        
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
    sprites.setDataNumber(tempEnemy, "health", 30)
    // Spawn animation
    sprites.setDataBoolean(tempEnemy, "anim", true)
    // Push to list
    enemyList.push(tempEnemy)
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
// Update 2
spawnEnemy()
spawnEnemy()
enemyStage = 3
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
