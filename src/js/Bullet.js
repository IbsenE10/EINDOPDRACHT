import * as ex from 'excalibur'
import { Resources } from './resources.js'
import { overlaps } from './overlaps.js'

export class Bullet extends ex.Actor {
    #hit = false
    #scaleFactor = 1

    constructor(x, y, speed, player, sizeScale = 1) {
        const width  = 10 * sizeScale
        const height = 10 * sizeScale

        super({
            pos:    ex.vec(x, y),
            width,
            height,
            collisionType: ex.CollisionType.PreventCollision,
            z: 40
        })
        this.speed  = speed
        this.player = player
        this.#scaleFactor = sizeScale
    }

    onInitialize() {
        const sprite = Resources.Bullet.toSprite()
        sprite.scale          = ex.vec(0.15 * this.#scaleFactor, 0.15 * this.#scaleFactor)
        sprite.flipHorizontal = true
        this.graphics.use(sprite)
    }

    onPreUpdate(engine, delta) {
        this.pos.x -= this.speed * (delta / 1000)
        if (this.pos.x < -100) this.kill()
    }

    // Called by ObstacleManager each frame
    checkHit(player) {
        if (this.#hit || this.isKilled()) return
        if (overlaps(this, player)) {
            this.#hit = true
            player.takeDamage(10)
            this.kill()
        }
    }
}