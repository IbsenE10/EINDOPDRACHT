import * as ex from 'excalibur'
import { Resources } from './resources.js'
import { overlaps } from './overlaps.js'

export class Barrier extends ex.Actor {
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