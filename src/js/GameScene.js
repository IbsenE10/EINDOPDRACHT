import * as ex from 'excalibur'

import { Resources } from './resources.js'
import { Player } from './Player.js'
import { ObstacleManager } from './ObstacleManager.js'

const SCROLL_SPEED = 300

export class GameScene extends ex.Scene {
    #player
    #obstacleManager
    #elapsed = 0
    #active = true

    #healthLabel
    #coinLabel
    #livesLabel

    onInitialize(engine) {
        this.#setupBackground(engine)
        this.#setupPlatforms()

        this.#player = new Player((finalCoins) => {
            this.#onPlayerDie(finalCoins)
        })

        this.add(this.#player)

        this.#obstacleManager = new ObstacleManager(this, SCROLL_SPEED, this.#player)

        this.#setupUI()
    }

    onActivate() {
        this.#elapsed = 0
        this.#active = true

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

        this.#healthLabel.text = `Health: ${this.#player.health}/100`
        this.#coinLabel.text = `Coins: ${this.#player.coins}`
        this.#livesLabel.text = `Lives: ${this.#player.lives}`
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

        this.add(this.#healthLabel)
        this.add(this.#coinLabel)
        this.add(this.#livesLabel)
    }

    #setupBackground(engine) {
        const background = new ex.Actor({
            pos: ex.vec(engine.drawWidth / 2, engine.drawHeight / 2),
            z: -1000,
        })

        const sprite = Resources.Background.toSprite()

        sprite.destSize = {
            width: engine.drawWidth,
            height: engine.drawHeight,
        }

        background.graphics.use(sprite)
        this.add(background)
    }

    #setupPlatforms() {
        for (let i = 0; i < 2; i++) {
            const platform = new ex.Actor({
                pos: ex.vec(640 + 1280 * i, 635),
                width: 1280,
                height: 130,
                z: 100,
                collisionType: ex.CollisionType.PreventCollision,
            })

            const sprite = Resources.Platform.toSprite()
            platform.graphics.use(sprite)

            platform.on('preupdate', (event) => {
                platform.pos.x -= SCROLL_SPEED * (event.delta / 1000)

                if (platform.pos.x < -640) {
                    platform.pos.x += 2560
                }
            })

            this.add(platform)
        }
    }

    #onPlayerDie(finalCoins) {
        this.#active = false

        const oldHighScore = Number(localStorage.getItem('cyberRunHighScore')) || 0

        if (finalCoins > oldHighScore) {
            localStorage.setItem('cyberRunHighScore', finalCoins)
        }

        localStorage.setItem('cyberRunLastScore', finalCoins)

        this.engine.goToScene('gameover')
    }
}