import '../css/style.css'

import * as ex from 'excalibur'
import { ResourceLoader } from './resources.js'
import { GameScene } from './GameScene.js'

const game = new ex.Engine({
    width: 1280,
    height: 720,
    displayMode: ex.DisplayMode.FitScreen,
    
})

game.start(ResourceLoader).then(() => {
    console.log('✅ All assets loaded!')
    game.addScene('game', new GameScene())
    game.goToScene('game')
}).catch((err) => {
    console.error('❌ Asset load failed:', err)
})