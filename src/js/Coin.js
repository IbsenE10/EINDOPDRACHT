import * as ex from 'excalibur'
import { Resources } from './resources.js'
import { overlaps } from './overlaps.js'

export class Coin extends ex.Actor {
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