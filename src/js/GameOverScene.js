import * as ex from 'excalibur'

export class GameOverScene extends ex.Scene {
    onInitialize(engine) {
        const title = new ex.Label({
            text: 'GAME OVER',
            pos: ex.vec(640, 260),
            z: 1000,
            font: new ex.Font({
                size: 90,
                color: ex.Color.Red,
                textAlign: ex.TextAlign.Center
            })
        })

        const button = new ex.Label({
            text: 'PLAY AGAIN',
            pos: ex.vec(640, 390),
            z: 1000,
            font: new ex.Font({
                size: 42,
                color: ex.Color.White,
                textAlign: ex.TextAlign.Center
            })
        })

        this.add(title)
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
}