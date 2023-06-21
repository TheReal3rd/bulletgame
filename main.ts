namespace SpriteKind {
    export const EnemyProjectile = SpriteKind.create()
}

// Reusable MiliSecond timer.
// Why? - Tick or counter delays depends on the CPU speed and how busy it is. This fixes issues that it causes.
// Because it doesn't depend on CPU speed.
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

//  On start is a initialization block.
function collision() {
    let dist: number;
    
    // I prefer to create my own destroy system but this fixes a possible memory issue? IDK as i can't see memory usage or any readouts.
    //  Enemy Bullets
    for (let value of sprites.allOfKind(SpriteKind.EnemyProjectile)) {
        //  Step 1 Check whether the sprites a close too each other - if not skip
        dist = Math.round(calcDist(value.x, value.y, playerOne.x, playerOne.y))
        if (dist >= 10) {
            continue
        }
        
        //  Step 2 Check for collision
        if (playerOne.overlapsWith(value)) {
            value.startEffect(effects.fire, 100)
            sprites.destroy(value)
            info.changeLifeBy(-1)
            screenFlash = true
            screenFlashTimer.reset()
        }
        
    }
    //  Player Bullets This is the same as the first for loop but for the player attacking the enemy
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
}

//  PlayerUpdate this will only contain code related to the player.
function updatePlayer() {
    let projectile2: Sprite;
    
    // Slow move switch
    if (controller.B.isPressed()) {
        moveSpeed = 1
    } else {
        // #TODO add a foreward facing shield.
        moveSpeed = 2
    }
    
    // Movement
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
    
    // Shooting
    if (controller.A.isPressed()) {
        if (fireDelay.passed(500)) {
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

//  This updates the enemy the stage system is here to add more enemies.
function updateEnemy() {
    let angle: number;
    let tPosX: number;
    let tPosY: number;
    let distToPlayer: number;
    let setImage: boolean;
    
    info.setScore(enemyHealth)
    if (!intro) {
        if (enemyStage == 0) {
            // Stage 1
            if (enemyFireDelay.passed(2000)) {
                //  # if 2000 ms passed the enemy will shoot.
                angle = 60
                if (Math.percentChance(50)) {
                    angle = -60
                }
                
                //  1 is the lowest.
                //  30 max
                shootBullets(enemyOne.x, enemyOne.y, 15, angle, fireType, 4)
                enemyOne.setImage(assets.image`EnemyShoot`)
                enemyAnimDelay.reset()
                enemyFireDelay.reset()
            } else if (Math.percentChance(2)) {
                //  2% chance to generate a new waypoint.
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
                if (fireType == 0) {
                    fireType = 1
                } else {
                    fireType = 0
                }
                
            } else if (enemyAnimDelay.passed(500)) {
                enemyOne.setImage(enemyNormalImage)
            }
            
        } else if (enemyStage == 1) {
            // Stage 2
            if (enemyFireDelay.passed(1200)) {
                angle = 80
                if (Math.percentChance(50)) {
                    angle = -80
                }
                
                //  1 is the lowest.
                //  30 max
                shootBullets(enemyOne.x, enemyOne.y, 15, angle, fireType, 3)
                enemyOne.setImage(assets.image`EnemyShootAgro`)
                enemyAnimDelay.reset()
                enemyFireDelay.reset()
            } else if (Math.percentChance(4)) {
                //  2% chance to generate a new waypoint.
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
                    if (distToPlayer >= 30) {
                        waypoint = [tPosX, tPosY]
                    }
                    
                }
                
            } else if (Math.percentChance(8)) {
                if (fireType == 0) {
                    fireType = 1
                } else {
                    fireType = 0
                }
                
            } else if (enemyAnimDelay.passed(500)) {
                enemyOne.setImage(enemyNormalImage)
            }
            
        } else {
            info.setScore(score)
            game.setGameOverMessage(true, "GAMEOVER! YOU WIN!")
            game.gameOver(true)
        }
        
    }
    
    if (waypoint != null) {
        //  # IF we have a waypoint we move towards it.
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
        enemyStage += 1
        enemyHealth = 60
        if (!isAgro) {
            isAgro = true
        } else {
            sprites.destroy(enemyOne)
        }
        
    }
    
}

//  Distance Caculation.
//  Provide x1 and y1 and it'll calculate the distance to x2 and y2
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

// Copied from Java Math library due to it not exist in this Math lib
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

// Copied from Java Math library due to it not exist in this Math lib
function toDegrees(rot: number): number {
    return rot * 57.29577951308232
}

//  Event listener for when the players health reaches 0 if so reset game.
info.onLifeZero(function on_life_zero() {
    
    info.setScore(score)
    game.setGameOverMessage(true, "GAME OVER! YOU LOSE!")
    game.gameOver(true)
})
//  The Maths side can't be done in blocks.
//  This is the pattern shooter for the enemy.
function shootBullets(posX2: number, posY2: number, distance: number, angleOffset: number, typeBullet: number, numBullets: number) {
    let angle2: number;
    let oPosX: number;
    let oPosY: number;
    let velX: number;
    let velY: number;
    let enemyProjectile: Sprite;
    let angle: number;
    if (typeBullet == 0) {
        //  Circle shoot.
        angle2 = -180
        while (angle2 <= 180) {
            oPosX = posX2 + distance * Math.sin(Math.PI * angle2 / 180)
            oPosY = posY2 + distance * (0 - Math.cos(Math.PI * angle2 / 180))
            velX = Math.sin(Math.PI * (angle2 + angleOffset) / 180) * distance
            velY = (0 - Math.cos(Math.PI * (angle2 + angleOffset) / 180)) * distance
            enemyProjectile = sprites.create(assets.image`EnemyBullet `, SpriteKind.EnemyProjectile)
            enemyProjectile.setPosition(oPosX, oPosY)
            enemyProjectile.setVelocity(velX, velY)
            enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
            angle2 += numBullets * 10
        }
    } else if (typeBullet == 1) {
        //  Laser Shoot
        angle = calcAngle(enemyOne.x - enemyOne.width / 2, enemyOne.y - enemyOne.height / 2, playerOne.x - playerOne.width / 2, playerOne.y - playerOne.height / 2) * 0.017453292519943295
        for (let x = -6; x < 6; x++) {
            enemyProjectile = sprites.create(assets.image`LaserPixel`, SpriteKind.EnemyProjectile)
            enemyProjectile.setFlag(SpriteFlag.AutoDestroy, true)
            if (!(angle <= 1.8 && angle >= 0.8 || angle <= -1.8 && angle >= -0.8)) {
                enemyProjectile.setPosition(posX2 + x * enemyProjectile.width, posY2)
            } else {
                enemyProjectile.setPosition(posX2, posY2 + x * enemyProjectile.height)
            }
            
            velX = Math.sin(angle) * 50
            velY = Math.cos(angle) * 50
            enemyProjectile.setVelocity(velX, velY)
        }
    } else if (typeBullet == 2) {
        
    }
    
}

// TODO add another shooter type.
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
let isAgro = false
let score = 0
//  Game Loop
// 
//  Block of instructions that must be ran every game tick / frame.
// 
//  Handle all the logic related to Collision, Movement and Controls.
forever(function on_forever() {
    game.stats = true
    collision()
    updatePlayer()
    updateEnemy()
})
