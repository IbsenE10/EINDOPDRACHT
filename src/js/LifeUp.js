import * as ex from 'excalibur'
import { Resources } from './resources.js'
import { overlaps } from './overlaps.js'

export class LifeUp extends ex.Actor {
    #collected = false

    constructor(x, y, speed) {
        super({
            pos: ex.vec(x, y),
            width: 55,
            height: 55,
            collisionType: ex.CollisionType.PreventCollision,
            z: 35
        })

        this.speed = speed
    }

    onInitialize() {
        const sprite = Resources.Coin.toSprite()
        sprite.scale = ex.vec(0.22, 0.22)
        this.graphics.use(sprite)
    }

    onPreUpdate(engine, delta) {
        this.pos.x -= this.speed * (delta / 1000)

        if (this.pos.x < -100) {
            this.kill()
        }
    }

    checkHit(player) {
        if (this.#collected || this.isKilled()) return

        if (overlaps(this, player)) {
            this.#collected = true
            player.addLife()
            this.kill()
        }
    }
}