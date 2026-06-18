import * as ex from 'excalibur'
import { Resources } from './resources.js'
import { overlaps } from './overlaps.js'

export class Barrier extends ex.Actor {
    #hit = false
    #scaleFactor = 1

    constructor(x, y, speed, sizeScale = 1) {
        const width  = 90 * sizeScale
        const height = 70 * sizeScale

        super({
            pos:    ex.vec(x, y),
            width,
            height,
            collisionType: ex.CollisionType.PreventCollision,
            z: 40
        })
        this.speed = speed
        this.#scaleFactor = sizeScale
    }

    onInitialize() {
        const sprite = Resources.Barrier.toSprite()
        sprite.scale = ex.vec(0.20 * this.#scaleFactor, 0.20 * this.#scaleFactor)
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