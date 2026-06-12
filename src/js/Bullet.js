import * as ex from 'excalibur'
import { Resources } from './resources.js'

export class Bullet extends ex.Actor {
    #hit = false

    constructor(x, y, speed, player) {
        super({
            pos:    ex.vec(x, y),
            width:  10,
            height: 10,
            collisionType: ex.CollisionType.PreventCollision,
            z: 40
        })
        this.speed  = speed
        this.player = player
    }

    onInitialize() {
        const sprite = Resources.Bullet.toSprite()
        sprite.scale          = ex.vec(0.15, 0.15)
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
        const aLeft   = this.pos.x - this.width  / 2
        const aRight  = this.pos.x + this.width  / 2
        const aTop    = this.pos.y - this.height / 2
        const aBottom = this.pos.y + this.height / 2
        const bLeft   = player.pos.x - player.width  / 2
        const bRight  = player.pos.x + player.width  / 2
        const bTop    = player.pos.y - player.height / 2
        const bBottom = player.pos.y + player.height / 2
        if (aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop) {
            this.#hit = true
            player.takeDamage(10)
            this.kill()
        }
    }
}