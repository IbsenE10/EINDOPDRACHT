import * as ex from 'excalibur'

export class GameOverScene extends ex.Scene {
    #scoreText

    onInitialize(engine) {
        const title = new ex.Label({
            text: 'GAME OVER',
            pos: ex.vec(640, 230),
            z: 1000,
            font: new ex.Font({
                size: 90,
                color: ex.Color.Red,
                textAlign: ex.TextAlign.Center
            })
        })

        this.#scoreText = new ex.Label({
            text: '',
            pos: ex.vec(640, 330),
            z: 1000,
            font: new ex.Font({
                size: 34,
                color: ex.Color.Yellow,
                textAlign: ex.TextAlign.Center
            })
        })

        const button = new ex.Label({
            text: 'PLAY AGAIN',
            pos: ex.vec(640, 420),
            z: 1000,
            font: new ex.Font({
                size: 42,
                color: ex.Color.White,
                textAlign: ex.TextAlign.Center
            })
        })

        this.add(title)
        this.add(this.#scoreText)
        this.add(button)

        button.on('pointerup', () => {
            engine.goToScene('game')
        })

        this.input.keyboard.on('press', (event) => {
            if (event.key === ex.Keys.Space || event.key === ex.Keys.Enter) {
                engine.goToScene('game')
            }
        })
    }

    onActivate() {
        const lastScore = Number(localStorage.getItem('cyberRunLastScore')) || 0
        const highScore = Number(localStorage.getItem('cyberRunHighScore')) || 0

        this.#scoreText.text = `Coins: ${lastScore}  |  Highscore: ${highScore}`
    }
}