import { ImageSource, Sound, Loader } from 'excalibur'

const Resources = {
    Background: new ImageSource('/images/background_1920x1080.png'),
    Platform: new ImageSource('/images/platform_transparent.png'),

    Idle: new ImageSource('/images/idle.png'),
    Run: new ImageSource('/images/run_sheet.png'),
    JumpStart: new ImageSource('/images/jump_start.png'),
    JumpUp: new ImageSource('/images/jump_up.png'),
    JumpPeak: new ImageSource('/images/jump_peak.png'),
    Slide: new ImageSource('/images/slide.png'),
    Hurt: new ImageSource('/images/hurt.png'),
    Die: new ImageSource('/images/die.png'),

    Coin: new ImageSource('/images/coin.png'),
    Barrier: new ImageSource('/images/barrier.png'),
    Bullet: new ImageSource('/images/bullet.png'),

    CoinSound: new Sound('/sounds/Ding Sound Effect.mp3'),
    DamageSound: new Sound('/sounds/fart.ogg'),
    Died: new Sound('/sounds/insano.ogg'),
    BGMusic: new Sound('/sounds/bgmusic.mp3'),
}

const ResourceLoader = new Loader()

for (let res of Object.values(Resources)) {
    ResourceLoader.addResource(res)
}

export { Resources, ResourceLoader }