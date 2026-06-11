import '../css/style.css'

import * as ex from 'excalibur'
import { ResourceLoader } from './resources.js'
import { GameScene } from './GameScene.js'

const game = new ex.Engine({
    width: 1280,
    height: 720,
    displayMode: ex.DisplayMode.FitScreen,
    backgroundColor: ex.Color.Black
})

game.start(ResourceLoader).then(() => {
    game.addScene('game', new GameScene())
    game.goToScene('game')
})