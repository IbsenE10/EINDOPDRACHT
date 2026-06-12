import * as ex from 'excalibur'
import { Resources } from './resources.js'

export const PlayerState = {
    IDLE:       'idle',
    RUN:        'run',
    JUMP_START: 'jump_start',
    JUMP_UP:    'jump_up',
    JUMP_PEAK:  'jump_peak',
    SLIDE:      'slide',
    HURT:       'hurt',
    DIE:        'die',
}

const GROUND_Y = 535
const GRAVITY  = 2800

export class Player extends ex.Actor {
    #health = 100
    #coins  = 0
    #currentState = PlayerState.IDLE
    #animations   = {}
    #onDieCallback = null
    #slideTimer = 0
    #hurtTimer  = 0
    #isImmune   = false
    #gravityVel = 0
    #facingLeft = false
    #isMovingHorizontally = false

    isSliding = false
    isJumping = false
    isDead    = false

    static JUMP_VELOCITY    = -900
    static SLIDE_DURATION   = 600
    static HURT_IMMUNITY_MS = 800

    get health() { return this.#health }
    get coins()  { return this.#coins  }
    set health(v) { this.#health = Math.max(0, v) }

    constructor(onDie) {
        super({
            pos:  ex.vec(200, GROUND_Y),
            width:  70,
            height: 100,
            collisionType: ex.CollisionType.PreventCollision,
            z: 50,
        })
        this.#onDieCallback = onDie
    }

    onInitialize(engine) {
        this.#buildAnimations()
        this.#forceAnimation(PlayerState.IDLE)
    }

    onPreUpdate(engine, delta) {
        if (this.isDead) return
        const dt = delta / 1000
        this.#handleInput(engine, dt)
        this.#applyGravity(dt)
        this.#tickTimers(delta)
        this.#updateAnimation()
    }

    // ── Public API ───────────────────────────────────────────────────────
    jump() {
        if (this.isDead || this.isJumping || this.isSliding) return
        this.isJumping   = true
        this.#gravityVel = Player.JUMP_VELOCITY
        this.#forceAnimation(PlayerState.JUMP_START)
    }

    slide() {
        if (this.isDead || this.isJumping || this.isSliding) return
        this.isSliding   = true
        this.#slideTimer = Player.SLIDE_DURATION
        this.#forceAnimation(PlayerState.SLIDE)
    }

    takeDamage(amount) {
        if (this.isDead || this.#isImmune) return
        Resources.DamageSound.volume = 0.5
        Resources.DamageSound.play()
        this.health = this.#health - amount
        this.#hurtTimer = Player.HURT_IMMUNITY_MS
        this.#isImmune  = true
        this.#forceAnimation(PlayerState.HURT)
        if (this.#health <= 0) this.die()
    }

    collectCoin() {
        this.#coins += 1
    }

    resetStats() {
        this.#health = 100
        this.#coins  = 0
        this.#isImmune   = false
        this.#hurtTimer  = 0
        this.#slideTimer = 0
        this.#gravityVel = 0
        this.#isMovingHorizontally = false
        this.#forceAnimation(PlayerState.IDLE)
    }

    die() {
        if (this.isDead) return
        this.isDead = true
        this.#gravityVel = 0
        this.#forceAnimation(PlayerState.DIE)
        Resources.Died.volume = 0.2
        Resources.Died.play()
        setTimeout(() => {
            if (this.#onDieCallback) this.#onDieCallback(this.#coins)
        }, 2500)
    }

    // ── Private ──────────────────────────────────────────────────────────
    #applyGravity(dt) {
        this.#gravityVel += GRAVITY * dt
        this.pos.y += this.#gravityVel * dt
        if (this.pos.y >= GROUND_Y) {
            this.pos.y       = GROUND_Y
            this.#gravityVel = 0
            this.isJumping   = false
        }
    }

    #handleInput(engine, dt) {
        const kb    = engine.input.keyboard
        const speed = 300

        if (kb.isHeld(ex.Keys.ArrowLeft) || kb.isHeld(ex.Keys.A)) {
            this.pos.x -= speed * dt
            this.#facingLeft = true
            this.#isMovingHorizontally = true
        } else if (kb.isHeld(ex.Keys.ArrowRight) || kb.isHeld(ex.Keys.D)) {
            this.pos.x += speed * dt
            this.#facingLeft = false
            this.#isMovingHorizontally = true
        } else {
            this.#isMovingHorizontally = false
        }

        const flip = this.#facingLeft
        Object.values(this.#animations).forEach(s => {
            if (s) s.flipHorizontal = flip
        })

        if (this.pos.x < 40)   this.pos.x = 40
        if (this.pos.x > 1240) this.pos.x = 1240

        if (kb.wasPressed(ex.Keys.Space)   ||
            kb.wasPressed(ex.Keys.ArrowUp) ||
            kb.wasPressed(ex.Keys.W)) {
            this.jump()
        }

        if (kb.isHeld(ex.Keys.ArrowDown) || kb.isHeld(ex.Keys.S)) {
            this.slide()
        }
    }

    #tickTimers(delta) {
        if (this.isSliding) {
            this.#slideTimer -= delta
            if (this.#slideTimer <= 0) {
                this.isSliding     = false
                this.#currentState = null
            }
        }
        if (this.#isImmune) {
            this.#hurtTimer -= delta
            if (this.#hurtTimer <= 0) {
                this.#isImmune     = false
                this.#currentState = null
            }
        }
    }

    #updateAnimation() {
        if (this.isDead) return

        if (this.isSliding) {
            this.#playAnimation(PlayerState.SLIDE)
        } else if (this.isJumping) {
            this.#playAnimation(
                this.#gravityVel < -100 ? PlayerState.JUMP_UP : PlayerState.JUMP_PEAK
            )
        } else if (!this.#isImmune) {
            if (this.#isMovingHorizontally) {
                this.#playAnimation(PlayerState.RUN)
            } else {
                this.#playAnimation(PlayerState.IDLE)
            }
        }
    }

    #playAnimation(state) {
        if (this.#currentState === state) return
        this.#currentState = state
        if (this.#animations[state]) this.graphics.use(this.#animations[state])
    }

    #forceAnimation(state) {
        this.#currentState = null
        this.#playAnimation(state)
    }

    #buildAnimations() {
        const s = (src) => {
            const sprite = src.toSprite()
            sprite.scale = ex.vec(0.12, 0.12)
            return sprite
        }

        const sheet = ex.SpriteSheet.fromImageSource({
            image: Resources.Run,
            grid: {
                rows: 1,
                columns: 2,
                spriteWidth: 1536,
                spriteHeight: 1024,
            },
        })
        const runAnim = ex.Animation.fromSpriteSheet(sheet, [0, 1], 150)
        runAnim.scale = ex.vec(0.12, 0.12)

        this.#animations[PlayerState.IDLE]       = s(Resources.Idle)
        this.#animations[PlayerState.RUN]        = runAnim
        this.#animations[PlayerState.SLIDE]      = s(Resources.Slide)
        this.#animations[PlayerState.HURT]       = s(Resources.Hurt)
        this.#animations[PlayerState.DIE]        = s(Resources.Die)
        this.#animations[PlayerState.JUMP_START] = s(Resources.JumpStart)
        this.#animations[PlayerState.JUMP_UP]    = s(Resources.JumpUp)
        this.#animations[PlayerState.JUMP_PEAK]  = s(Resources.JumpPeak)
    }
}