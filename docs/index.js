/**
 * あにあにパニック
 * 
 * Copyright (C) 2019
 * 素材: 因幡はねるさまより #ねる素材 から一部加工して利用
 * ソースコード: Madereed Software Projects
 */
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    useTicker: true,
    parent: content,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// ゲームインスタンス
var game = new Phaser.Game(config);

/* キャラクタ画像 */
let imgsHaneru;
let imgsIchika;
let imgsRan;
let imgsHinako;

let imgsTamaki;
let imgsPolice;

let imgHummer;

/* 内部変数 */
let tick = 0; // 内部ティック

let score = 0; // スコア値
let scoreText;

const LIMIT = 30; // ゲームタイム
let time = 0;
let timeText;
let timerEvent;

let sndPing;

function preload() {
    this.load.image('neru', './assets/neru.png');
    this.load.image('ichi', './assets/ichi.png');
    this.load.image('ran', './assets/ran.png');
    this.load.image('hina', './assets/hina.png');
    this.load.image('police', './assets/police.png');
    this.load.image('tama', './assets/tama.png');

    this.load.image('bg', './assets/bg.png');
    this.load.image('hummer', './assets/hummer.png');

    this.load.image('cha', './assets/nerucha.png');

    this.load.audio('ping', './assets/ping.mp3');
}

/**
 * 指定されたマップ名の画像を読み込み、基準値に配置しておく
 * 
 * @param group 生成用インスタンス
 * @param mapName 読みだしたイメージのマップ名
 * 
 * @return 4穴用のイメージ配列を返す
 */
function getImage(group, mapName) {
    imgs = [];
    for (i = 0; i < 4; i++) {
        img = group.create(0, 0, mapName);

        img.setDisplaySize(200, 200);
        img.setOrigin(0, 0);
        img.setVisible(false);

        /* 初期配置 */
        img.setX(i * 170);
        img.setY(250);

        img.setInteractive();

        /* 画像に対するマウスイベント */
        img.on('pointerdown', function (pointer) {
            imgHummer.setX(pointer.x);
            imgHummer.setY(pointer.y);
            imgHummer.setVisible(true);
        });
        img.on('pointerup', function () {
            imgHummer.setVisible(false);
        });
        img.on('pointerout', function () {
            imgHummer.setVisible(false);
        })
        imgs.push(img);
    }
    return imgs;
}

function create() {
    sndPing = this.sound.add('ping');

    blocks = this.add.group();

    /* 画像が穴から出るアニメーション動作を設定する */
    funcAddTweens = (img) => {
        return this.tweens.add({
            targets: img,
            yoyo: true,
            y: 500,
            pause: true,
            onComplete: function () {
                img.setVisible(false);
            },
            repeat: 0,
        });
    };

    /* キャラ画像初期設定（はねる) */
    imgsHaneru = {
        imgs: getImage(blocks, 'neru'),
        tweens: []
    };
    imgsHaneru.imgs.forEach(function (img) {
        img.on('pointerup', function () {
            console.log("ねるちゃんです");

            score += 1;
        });

        imgsHaneru.tweens.push(funcAddTweens(img));
    });

    /* キャラ画像初期設定(いちか) */
    imgsIchika = {
        imgs: getImage(blocks, 'ichi'),
        tweens: []
    };
    imgsIchika.imgs.forEach(function (img) {
        img.on('pointerup', function () {
            console.log("ちゃおん！");

            score += 3;
        });
        imgsIchika.tweens.push(funcAddTweens(img));
    });

    /* キャラ画像初期設定(らん) */
    imgsRan = {
        imgs: getImage(blocks, 'ran'),
        tweens: []
    };
    imgsRan.imgs.forEach(function (img) {
        img.on('pointerup', function () {
            console.log("くまくまぁ");

            score += 1;
        });
        imgsRan.tweens.push(funcAddTweens(img));
    });

    /* キャラ画像初期設定(ひなこ) */
    imgsHinako = {
        imgs: getImage(blocks, 'hina'),
        tweens: []
    };
    imgsHinako.imgs.forEach(function (img) {
        img.on('pointerup', function () {
            console.log("おつひな～");

            score += 5;
        });
        imgsHinako.tweens.push(funcAddTweens(img));
    });

    /* キャラ画像初期設定（たまき) */
    imgsTamaki = {
        imgs: getImage(blocks, 'tama'),
        tweens: []
    };
    imgsTamaki.imgs.forEach(function (img) {
        img.on('pointerup', function () {
            console.log("わんたま～");

            score += 10;
        });
        imgsTamaki.tweens.push(funcAddTweens(img));
    });

    /* キャラ画像初期設定（ぽりすめん） */
    imgsPolice = {
        imgs: getImage(blocks, 'police'),
        tweens: []
    };
    imgsPolice.imgs.forEach(function (img) {
        img.on('pointerup', function () {
            console.log("警察だ！逮捕する！");

            score = 0;
        });
        imgsPolice.tweens.push(funcAddTweens(img));
    });

    this.input.topOnly = true;

    /* あにあにボックスの画像を表示 */
    imgBg = blocks.create(0, 0, 'bg');
    imgBg.setOrigin(0, 0);
    imgBg.setInteractive();

    /* クリックしたときのハンマー画像 */
    imgHummer = blocks.create(0, 0, 'hummer');
    imgHummer.setScale(0.5, 0.5);
    imgHummer.setVisible(false);

    /* とくてん */
    scoreText = this.add.text(250, 250, '0', {
        fontSize: '60px',
        fill: '#000000'
    });
    scoreText.setAngle(350);

    /* ゲームの残り時間 */
    timeText = this.add.text(0, 0, LIMIT - time, {

    });

    // ゲームタイマー
    timerEvent = this.time.addEvent({ delay: 1000, loop: true, callback: function () { time += 1; }, paused: true });

    /* ゲーム開始ボタン？画像設定(ねる茶) */
    startImg = blocks.create(0, 0, 'cha').setScale(0.5, 0.5).setX(400).setY(700).setInteractive();
    startText = this.add.text(400, 700, 'すたーと？', {
        fontSize: '60px',
        fill: 'red'
    }).setInteractive();
    startImg.on('pointerup', () => gameStart());
    startText.on('pointerup', () => gameStart());
}

/**
 * ゲーム開始関数
 */
function gameStart() {
    /* 初期化処理 */
    time = 0;
    tick = 0;
    score = 0;

    /* 開始ボタン、テキストを消す */
    timerEvent.paused = false;
    startImg.setVisible(false);
    startText.setVisible(false);
}

/**
 * 選択されたキャラクターを穴？から出す
 * 
 * @param chara キャラクタインスタンス
 * @param hole 穴番号
 */
function action(chara, hole) {
    if (chara.imgs[hole].visible == false) {
        chara.imgs[hole].setVisible(true);
        chara.tweens[hole].restart();
    }
}

function update() {
    tick += 1;

    timeText.setText(LIMIT - time);
    scoreText.setText(score);

    if (timerEvent.paused == false) {
        if (time < LIMIT) {
            if (tick % 20 == 0) {
                rare = Phaser.Math.Between(0, 100);

                hole = Phaser.Math.Between(0, 3);
                chara = Phaser.Math.Between(0, 10);

                switch (rare) { // レア？キャラ出没
                    case 0:
                        action(imgsTamaki, hole);
                        break;

                    case 1:
                        action(imgsPolice, hole);
                        break;

                    default: // 通常キャラクター出没
                        switch (chara) {
                            case 0: // neru
                                action(imgsHaneru, hole);
                                break;

                            case 1: // ichika
                                action(imgsIchika, hole);
                                break;

                            case 2: // ran
                                action(imgsRan, hole);
                                break;

                            case 3: // hinako
                                action(imgsHinako, hole);
                                break;

                            default:
                                break;

                        }
                        break;
                }
            }
        }
        else {
            /* 動作している全画像を非表示にする */
            imgsHaneru.imgs.forEach((img) => img.setVisible(false));
            imgsIchika.imgs.forEach((img) => img.setVisible(false));
            imgsHinako.imgs.forEach((img) => img.setVisible(false));
            imgsRan.imgs.forEach((img) => img.setVisible(false));
            imgsTamaki.imgs.forEach((img) => img.setVisible(false));
            imgsPolice.imgs.forEach((img) => img.setVisible(false));

            /* ゲームタイマーを停止 */
            timerEvent.paused = true;

            /* もう一回遊べるドン！ */
            startImg.setVisible(true);
            startText.setVisible(true);
            startText.setText("もういっかい？");
        }
    }

}
