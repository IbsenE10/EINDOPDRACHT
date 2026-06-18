import { Bullet } from './Bullet.js'
import { Coin } from './Coin.js'
import { Barrier } from './Barrier.js'
import { LifeUp } from './LifeUp.js'

const BULLET_CAP = 5
const SPAWN_X = 1380
const GROUND_Y = 535
const BULLET_HEIGHTS = [480, 380, 280]

export class ObstacleManager {
    #scene
    #player

    #bullets = []
    #barriers = []
    #coins = []
    #lifeUps = []

    #bulletTimer = 0
    #barrierTimer = 0
    #coinTimer = 0
    #lifeUpTimer = 0

    #bulletInterval = 2500
    #barrierInterval = 6000
    #coinInterval = 1800
    #lifeUpInterval = 12000

    // Base scroll speed — actual speed is read live from #getSpeed callback
    #getSpeed

    constructor(scene, getSpeed, player) {
        this.#scene = scene
        // Support both: a number (legacy) or a function that returns the live speed
        this.#getSpeed = typeof getSpeed === 'function' ? getSpeed : () => getSpeed
        this.#player = player
    }

    update(delta, elapsed) {
        this.#cleanDead()
        this.#tickTimers(delta, elapsed)
        this.#checkCollisions()
    }

    clearAll() {
        ;[
            ...this.#bullets,
            ...this.#barriers,
            ...this.#coins,
            ...this.#lifeUps
        ].forEach(actor => {
            if (!actor.isKilled()) actor.kill()
        })

        this.#bullets = []
        this.#barriers = []
        this.#coins = []
        this.#lifeUps = []
    }

    #cleanDead() {
        this.#bullets = this.#bullets.filter(b => !b.isKilled())
        this.#barriers = this.#barriers.filter(b => !b.isKilled())
        this.#coins = this.#coins.filter(c => !c.isKilled())
        this.#lifeUps = this.#lifeUps.filter(l => !l.isKilled())
    }

    #checkCollisions() {
        if (this.#player.isDead) return

        this.#bullets.forEach(b => b.checkHit(this.#player))
        this.#barriers.forEach(b => b.checkHit(this.#player))
        this.#coins.forEach(c => c.checkHit(this.#player))
        this.#lifeUps.forEach(l => l.checkHit(this.#player))
    }

    #tickTimers(delta, elapsed) {
        this.#bulletTimer += delta
        this.#barrierTimer += delta
        this.#coinTimer += delta
        this.#lifeUpTimer += delta

        const bulletRate = Math.max(900, this.#bulletInterval - elapsed * 0.04)
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

        if (this.#lifeUpTimer >= this.#lifeUpInterval) {
            this.#lifeUpTimer = 0
            this.#spawnLifeUp()
        }
    }

    // Random size factor between 0.7x and 1.5x — gives obstacles varying afmetingen
    #randomSizeScale() {
        return 0.7 + Math.random() * 0.8
    }

    #spawnBullet() {
        if (this.#bullets.length >= BULLET_CAP) return

        const y = BULLET_HEIGHTS[Math.floor(Math.random() * BULLET_HEIGHTS.length)]
        const speed = this.#getSpeed() + 100 + Math.random() * 200
        const sizeScale = this.#randomSizeScale()
        const bullet = new Bullet(SPAWN_X, y, speed, this.#player, sizeScale)

        this.#bullets.push(bullet)
        this.#scene.add(bullet)
    }

    #spawnBarrier() {
        const sizeScale = this.#randomSizeScale()
        const barrier = new Barrier(SPAWN_X, GROUND_Y, this.#getSpeed(), sizeScale)

        this.#barriers.push(barrier)
        this.#scene.add(barrier)
    }

    #spawnCoin() {
        const heights = [470, 370, 290]
        const y = heights[Math.floor(Math.random() * heights.length)]
        const coin = new Coin(SPAWN_X, y, this.#getSpeed())

        this.#coins.push(coin)
        this.#scene.add(coin)
    }

    #spawnLifeUp() {
        const lifeUp = new LifeUp(SPAWN_X, 360, this.#getSpeed())

        this.#lifeUps.push(lifeUp)
        this.#scene.add(lifeUp)
    }
}