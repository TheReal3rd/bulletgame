namespace SpriteKind {
    export const EnemyProjectile = SpriteKind.create()
}

// Reusable MiliSecond timer.
// Why? - This is a better and more consistant compared to using a counter / tick delay system.
// This is beacuse its fixed on the speed of the CPU. not the current time. Meaning when the CPU is slowed down the
// counter it slowed down.
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
    
    //  Enemy Bullets
    for (let value of sprites.allOfKind(SpriteKind.EnemyProjectile)) {
        //  Step 1 Check whether the sprite is in view - if not destroy it.
        dist = calcDist(value.x, value.y, scene.screenWidth() / 2, scene.screenHeight() / 2)
        if (dist >= scene.screenWidth()) {
            //  # Off screen remove it.
            sprites.destroy(value)
            continue
        }
        
        //  Step 2 Check whether the sprites a close too each other - if not skip
        dist = calcDist(value.x, value.y, PlayerOne.x, PlayerOne.y)
        if (dist >= 7) {
            continue
        }
        
        //  Step 3 Check for collision
        if (PlayerOne.overlapsWith(value)) {
            value.startEffect(effects.fire, 100)
            sprites.destroy(value)
            info.changeLifeBy(-1)
            screenFlash = true
        }
        
    }
    //  Player Bullets This is the same as the first for loop but for the player attacking the enemy
    for (let value1 of sprites.allOfKind(SpriteKind.Projectile)) {
        dist = calcDist(value1.x, value1.y, scene.screenWidth() / 2, scene.screenHeight() / 2)
        if (dist >= scene.screenWidth()) {
            //  # Off screen remove it.
            sprites.destroy(value1)
            continue
        }
        
        dist = calcDist(value1.x, value1.y, EnemyOne.x, EnemyOne.y)
        if (dist >= 7) {
            continue
        }
        
        if (EnemyOne.overlapsWith(value1)) {
            value1.startEffect(effects.fire, 100)
            sprites.destroy(value1)
            enemyHealth += 0 - 1
        }
        
    }
}

//  Movement Function.
//  
//  This block of code gets executed by the game loop its only job is to check what keys are pressed if a certain key is pressed run.
function movement() {
    
    if (controller.B.isPressed()) {
        moveSpeed = 1
    } else {
        moveSpeed = 2
    }
    
    if (controller.down.isPressed()) {
        PlayerOne.y += moveSpeed
    }
    
    if (controller.up.isPressed()) {
        PlayerOne.y += moveSpeed * -1
    }
    
    if (controller.left.isPressed()) {
        PlayerOne.x += moveSpeed * -1
    }
    
    if (controller.right.isPressed()) {
        PlayerOne.x += moveSpeed
    }
    
}

//  This updates the enemy the stage system is here to add more enemies.
function updateEnemy() {
    let angle: number;
    let tPosX: number;
    let tPosY: number;
    let distToPlayer: number;
    
    if (EnemyStage == 0) {
        if (enemyFireDelay.passed(2000)) {
            //  # if 2000 ms passed the enemy will shoot.
            angle = 60
            if (Math.percentChance(50)) {
                angle = -60
            }
            
            //  1 is the lowest.
            //  30 max
            shootBullets(EnemyOne.x, EnemyOne.y, 15, angle, 1, 4)
            enemyFireDelay.reset()
        } else if (Math.percentChance(2)) {
            //  # 2% chance to generate a new waypoint.
            if (waypoint == null) {
                tPosX = Math.round(Math.random() * 100)
                tPosY = Math.round(Math.random() * 100)
                //  Max check
                tPosX = Math.min(tPosX, scene.screenWidth())
                tPosY = Math.min(tPosY, scene.screenHeight())
                //  #Min check
                tPosX = Math.max(tPosX, 0)
                tPosY = Math.max(tPosY, 0)
                distToPlayer = calcDist(tPosX, tPosY, PlayerOne.x, PlayerOne.y)
                if (distToPlayer >= 60) {
                    waypoint = [tPosX, tPosY]
                }
                
            }
            
        }
        
    } else if (EnemyStage == 1) {
        
    } else {
        game.setGameOverMessage(true, "GAME OVER!")
    }
    
    if (waypoint != null) {
        //  # IF we have a waypoint we move towards it.
        //  X
        if (EnemyOne.x < waypoint[0]) {
            EnemyOne.x += 1
        } else if (EnemyOne.x > waypoint[0]) {
            EnemyOne.x -= 1
        }
        
        //  Y
        if (EnemyOne.y < waypoint[1]) {
            EnemyOne.y += 1
        } else if (EnemyOne.y > waypoint[1]) {
            EnemyOne.y -= 1
        }
        
        if (Math.round(calcDist(EnemyOne.x, EnemyOne.y, waypoint[0], waypoint[1])) <= 1) {
            waypoint = null
        }
        
    }
    
    if (enemyHealth <= 0) {
        EnemyStage = 1
        sprites.destroy(EnemyOne)
    }
    
}

//  Players shooting code.
function shoot() {
    let projectile2: Sprite;
    if (controller.A.isPressed()) {
        if (fireDelay.passed(500)) {
            projectile2 = sprites.createProjectileFromSprite(assets.image`
                PlayerBullet
            `, PlayerOne, 0, -50)
            fireDelay.reset()
        }
        
    }
    
}

//  Distance Caculation.
//  Provide x1 and y1 and it'll calculate the distance to x2 and y2
function calcDist(posX: number, posY: number, posX1: number, posY1: number): number {
    
    xDiff = posX - posX1
    yDiff = posY - posY1
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
}

//  Event listener for when the players health reaches 0 if so reset game.
info.onLifeZero(function on_life_zero() {
    game.reset()
})
/** On start here. */
//  The Maths side can't be done in blocks.
//  This is the pattern shooter for the enemy.
function shootBullets(posX2: number, posY2: number, distance: number, angleOffset: number, typeBullet: number, numBullets: number) {
    let angle2: number;
    let oPosX: number;
    let oPosY: number;
    let velX: number;
    let velY: number;
    
    //  Laser Shoot
    if (typeBullet == 0) {
        //  Circle shoot.
        angle2 = -180
        while (angle2 <= 180) {
            oPosX = posX2 + distance * Math.sin(Math.PI * angle2 / 180)
            oPosY = posY2 + distance * (0 - Math.cos(Math.PI * angle2 / 180))
            velX = Math.sin(Math.PI * (angle2 + angleOffset) / 180) * distance
            velY = (0 - Math.cos(Math.PI * (angle2 + angleOffset) / 180)) * distance
            enemyProjectile = sprites.create(assets.image`EnemyBullet `, SpriteKind.EnemyProjectile)
            enemyProjectile.setVelocity(velX, velY)
            enemyProjectile.setPosition(oPosX, oPosY)
            angle2 += numBullets * 10
        }
    } else if (typeBullet == 1) {
        enemyProjectile = sprites.create(assets.image`LaserPixel`, SpriteKind.EnemyProjectile)
        enemyProjectile.setPosition(posX2, posY2)
    } else {
        
    }
    
}

let enemyProjectile : Sprite = null
let yDiff = 0
let xDiff = 0
let moveSpeed = 0
let screenFlash = false
let EnemyStage = 0
let PlayerOne : Sprite = null
let enemyHealth = 0
let projectile22 = null
let EnemyOne : Sprite = null
let waypoint : number[] = null
let fireDelay = new msDelay()
let enemyFireDelay = new msDelay()
enemyHealth = 30
EnemyOne = sprites.create(assets.image`
    myImage1
`, SpriteKind.Enemy)
EnemyOne.setPosition(80, 15)
PlayerOne = sprites.create(assets.image`
    myImage
`, SpriteKind.Player)
PlayerOne.setPosition(80, 90)
PlayerOne.setStayInScreen(true)
PlayerOne.setScale(0.4, ScaleAnchor.Middle)
EnemyStage = 0
let screenFlashTimer = new msDelay()
let intro = 1
info.setLife(3)
//  Game Loop
//  
//  Block of instructions that must be ran every game tick / frame.
//  
//  Handle all the logic related to Collision, Movement and Controls.
forever(function on_forever() {
    game.stats = true
    movement()
    shoot()
    collision()
    updateEnemy()
})
