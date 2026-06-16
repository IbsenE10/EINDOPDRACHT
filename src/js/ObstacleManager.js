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

    #scrollSpeed = 300

    constructor(scene, scrollSpeed = 300, player) {
        this.#scene = scene
        this.#scrollSpeed = scrollSpeed
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

    #spawnBullet() {
        if (this.#bullets.length >= BULLET_CAP) return

        const y = BULLET_HEIGHTS[Math.floor(Math.random() * BULLET_HEIGHTS.length)]
        const speed = 400 + Math.random() * 200
        const bullet = new Bullet(SPAWN_X, y, speed, this.#player)

        this.#bullets.push(bullet)
        this.#scene.add(bullet)
    }

    #spawnBarrier() {
        const barrier = new Barrier(SPAWN_X, GROUND_Y, this.#scrollSpeed)

        this.#barriers.push(barrier)
        this.#scene.add(barrier)
    }

    #spawnCoin() {
        const heights = [470, 370, 290]
        const y = heights[Math.floor(Math.random() * heights.length)]
        const coin = new Coin(SPAWN_X, y, this.#scrollSpeed)

        this.#coins.push(coin)
        this.#scene.add(coin)
    }

    #spawnLifeUp() {
        const lifeUp = new LifeUp(SPAWN_X, 360, this.#scrollSpeed)

        this.#lifeUps.push(lifeUp)
        this.#scene.add(lifeUp)
    }
}