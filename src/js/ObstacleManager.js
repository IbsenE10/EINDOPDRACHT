import * as ex from 'excalibur'
import { Resources } from './resources.js'
import { Bullet }    from './Bullet.js'

const BULLET_CAP     = 5
const SPAWN_X        = 1380
const GROUND_Y       = 535    // matches Player GROUND_Y
const BULLET_HEIGHTS = [480, 380, 280]

// Simple AABB overlap — works in all Excalibur versions
function overlaps(a, b) {
    const aLeft   = a.pos.x - a.width  / 2
    const aRight  = a.pos.x + a.width  / 2
    const aTop    = a.pos.y - a.height / 2
    const aBottom = a.pos.y + a.height / 2

    const bLeft   = b.pos.x - b.width  / 2
    const bRight  = b.pos.x + b.width  / 2
    const bTop    = b.pos.y - b.height / 2
    const bBottom = b.pos.y + b.height / 2

    return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop
}

// ── Barrier ────────────────────────────────────────────────────────────────
class Barrier extends ex.Actor {
    #hit = false

    constructor(x, y, speed) {
        super({
            pos:    ex.vec(x, y),
            width:  90,
            height: 70,
            collisionType: ex.CollisionType.PreventCollision,
            z: 40
        })
        this.speed = speed
    }

    onInitialize() {
        const sprite = Resources.Barrier.toSprite()
        sprite.scale = ex.vec(0.20, 0.20)
        this.graphics.use(sprite)
    }

    onPreUpdate(engine, delta) {
        this.pos.x -= this.speed * (delta / 1000)
        if (this.pos.x < -200) this.kill()
    }

    checkHit(player) {
        if (this.#hit || this.isKilled()) return
        if (overlaps(this, player)) {
            this.#hit = true
            player.takeDamage(100)
            this.kill()
        }
    }
}

// ── Coin ───────────────────────────────────────────────────────────────────
class Coin extends ex.Actor {
    #collected = false

    constructor(x, y, speed) {
        super({
            pos:    ex.vec(x, y),
            width:  50,
            height: 50,
            collisionType: ex.CollisionType.PreventCollision,
            z: 35
        })
        this.speed = speed
    }

    onInitialize() {
        const sprite = Resources.Coin.toSprite()
        sprite.scale = ex.vec(0.15, 0.15)
        this.graphics.use(sprite)
    }

    onPreUpdate(engine, delta) {
        this.pos.x -= this.speed * (delta / 1000)
        if (this.pos.x < -100) this.kill()
    }

 checkHit(player) {
    if (this.#collected || this.isKilled()) return

    if (overlaps(this, player)) {
        this.#collected = true

        Resources.CoinSound.volume = 0.4
        Resources.CoinSound.play()

        player.collectCoin()
        this.kill()
    }
}
}

// ── ObstacleManager ────────────────────────────────────────────────────────
export class ObstacleManager {
    #scene
    #player
    #bullets  = []
    #barriers = []
    #coins    = []

    #bulletTimer  = 0
    #barrierTimer = 0
    #coinTimer    = 0

    #bulletInterval  = 2500
    #barrierInterval = 6000
    #coinInterval    = 1800

    #scrollSpeed = 300

    constructor(scene, scrollSpeed = 300, player) {
        this.#scene       = scene
        this.#scrollSpeed = scrollSpeed
        this.#player      = player
    }

    update(delta, elapsed) {
        this.#cleanDead()
        this.#tickTimers(delta, elapsed)
        this.#checkCollisions()
    }

    clearAll() {
        ;[...this.#bullets, ...this.#barriers, ...this.#coins].forEach(a => {
            if (!a.isKilled()) a.kill()
        })
        this.#bullets  = []
        this.#barriers = []
        this.#coins    = []
    }

    #cleanDead() {
        this.#bullets  = this.#bullets.filter(b  => !b.isKilled())
        this.#barriers = this.#barriers.filter(b => !b.isKilled())
        this.#coins    = this.#coins.filter(c    => !c.isKilled())
    }

    // Manual overlap checks — reliable regardless of CollisionType
    #checkCollisions() {
        if (this.#player.isDead) return
        this.#bullets.forEach(b  => b.checkHit(this.#player))
        this.#barriers.forEach(b => b.checkHit(this.#player))
        this.#coins.forEach(c    => c.checkHit(this.#player))
    }

    #tickTimers(delta, elapsed) {
        this.#bulletTimer  += delta
        this.#barrierTimer += delta
        this.#coinTimer    += delta

        const bulletRate  = Math.max(900,  this.#bulletInterval  - elapsed * 0.04)
        const barrierRate = Math.max(3500, this.#barrierInterval - elapsed * 0.06)

        if (this.#bulletTimer >= bulletRate) {
            this.#bulletTimer = 0
            this.#spawnBullet()
        }
        if (this.#barrierTimer >= barrierRate) {
            this.#barrierTimer = 0
            this.#spawnBarrier()
        }
        if (this.#coinTimer >= this.#coinInterval) {
            this.#coinTimer = 0
            this.#spawnCoin()
        }
    }

    #spawnBullet() {
        if (this.#bullets.length >= BULLET_CAP) return
        const y     = BULLET_HEIGHTS[Math.floor(Math.random() * BULLET_HEIGHTS.length)]
        const speed = 400 + Math.random() * 200
        const bullet = new Bullet(SPAWN_X, y, speed, this.#player)
        this.#bullets.push(bullet)
        this.#scene.add(bullet)
    }

    #spawnBarrier() {
        const barrier = new Barrier(SPAWN_X, GROUND_Y , this.#scrollSpeed)
        this.#barriers.push(barrier)
        this.#scene.add(barrier)
    }

    #spawnCoin() {
        const heights = [470, 370, 290]
        const y       = heights[Math.floor(Math.random() * heights.length)]
        const coin    = new Coin(SPAWN_X, y, this.#scrollSpeed)
        this.#coins.push(coin)
        this.#scene.add(coin)
    }
}