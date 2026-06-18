import * as ex from 'excalibur'

import { Resources } from './resources.js'
import { Player } from './Player.js'
import { ObstacleManager } from './ObstacleManager.js'

const BASE_SCROLL_SPEED = 300
const MAX_SCROLL_SPEED  = 650
const SPEED_RAMP_RATE   = 0.012   // px/s gained per ms elapsed

const PLATFORM_WIDTH = 1280
const PLATFORM_OVERLAP = 100

export class GameScene extends ex.Scene {
    #player
    #obstacleManager
    #elapsed = 0
    #active = true

    #healthLabel
    #coinLabel
    #livesLabel
    #speedLabel

    #platforms = []

    onInitialize(engine) {
        this.#setupBackground(engine)
        this.#setupPlatforms()

        this.#player = new Player((finalCoins) => {
            this.#onPlayerDie(finalCoins)
        })

        this.add(this.#player)

        // Pass a live-speed getter so ObstacleManager always reads
        // the current (increasing) scroll speed, not a fixed number
        this.#obstacleManager = new ObstacleManager(
            this,
            () => this.#currentScrollSpeed(),
            this.#player
        )

        this.#setupUI()
    }

    onActivate() {
        this.#elapsed = 0
        this.#active = true
    
        if (Resources.BGMusic) {
            Resources.BGMusic.loop = true
            Resources.BGMusic.volume = 0.06
            Resources.BGMusic.play()
        }
    
        if (this.#obstacleManager) {
            this.#obstacleManager.clearAll()
        }
    
        if (this.#player) {
            this.#player.resetStats()
        }
    }

    onDeactivate() {
        this.#active = false

        if (this.#obstacleManager) {
            this.#obstacleManager.clearAll()
        }
    }

    onPreUpdate(engine, delta) {
        if (!this.#active || this.#player.isDead) return

        this.#elapsed += delta
        this.#obstacleManager.update(delta, this.#elapsed)

        const speed = this.#currentScrollSpeed()
        const segmentSpacing = PLATFORM_WIDTH - PLATFORM_OVERLAP
        const wrapDistance = segmentSpacing * this.#platforms.length

        this.#platforms.forEach(platform => {
            platform.pos.x -= speed * (delta / 1000)
            if (platform.pos.x < -(segmentSpacing / 2)) {
                platform.pos.x += wrapDistance
            }
        })

        this.#healthLabel.text = `Health: ${this.#player.health}/100`
        this.#coinLabel.text = `Coins: ${this.#player.coins}`
        this.#livesLabel.text = `Lives: ${this.#player.lives}`
        this.#speedLabel.text = `Speed: ${Math.round(speed)}`
    }

    // Speed increases gradually with elapsed time, capped at MAX_SCROLL_SPEED.
    // "Hoe langer je in leven blijft, hoe sneller de speler rent."
    #currentScrollSpeed() {
        return Math.min(
            MAX_SCROLL_SPEED,
            BASE_SCROLL_SPEED + this.#elapsed * SPEED_RAMP_RATE
        )
    }

    #setupUI() {
        this.#healthLabel = new ex.Label({
            text: 'Health: 100/100',
            pos: ex.vec(30, 40),
            z: 1000,
            font: new ex.Font({
                size: 28,
                color: ex.Color.White,
            }),
        })

        this.#coinLabel = new ex.Label({
            text: 'Coins: 0',
            pos: ex.vec(30, 75),
            z: 1000,
            font: new ex.Font({
                size: 28,
                color: ex.Color.Yellow,
            }),
        })

        this.#livesLabel = new ex.Label({
            text: 'Lives: 3',
            pos: ex.vec(30, 110),
            z: 1000,
            font: new ex.Font({
                size: 28,
                color: ex.Color.Green,
            }),
        })

        this.#speedLabel = new ex.Label({
            text: 'Speed: 300',
            pos: ex.vec(30, 145),
            z: 1000,
            font: new ex.Font({
                size: 24,
                color: ex.Color.LightGray,
            }),
        })

        this.add(this.#healthLabel)
        this.add(this.#coinLabel)
        this.add(this.#livesLabel)
        this.add(this.#speedLabel)
    }

    #setupBackground(engine) {
        const background = new ex.Actor({
            pos: ex.vec(640, 360),
            z: -1000,
        })

        const sprite = Resources.Background.toSprite()
        // Image is now exactly 1280x720 — no scaling needed
        background.graphics.use(sprite)
        this.add(background)
    }

    #setupPlatforms() {
        this.#platforms = []

        const segmentSpacing = PLATFORM_WIDTH - PLATFORM_OVERLAP

        for (let i = 0; i < 2; i++) {
            const platform = new ex.Actor({
                pos: ex.vec(segmentSpacing * i + PLATFORM_WIDTH / 2, 635),
                width: PLATFORM_WIDTH,
                height: 130,
                z: 100,
                collisionType: ex.CollisionType.PreventCollision,
            })

            const sprite = Resources.Platform.toSprite()
            sprite.scale = ex.vec(1.0, 130 / 204)
            platform.graphics.use(sprite)

            this.add(platform)
            this.#platforms.push(platform)
        }
    }

    #onPlayerDie(finalCoins) {
        this.#active = false

        const oldHighScore = Number(localStorage.getItem('cyberRunHighScore')) || 0

        if (finalCoins > oldHighScore) {
            localStorage.setItem('cyberRunHighScore', finalCoins)
        }

        localStorage.setItem('cyberRunLastScore', finalCoins)

        Resources.BGMusic.stop()
        this.engine.goToScene('gameover')
    }
}