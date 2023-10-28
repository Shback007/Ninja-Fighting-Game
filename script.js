const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position : {
        x : 0,
        y : 0
    },
    imagesrc : './img/background.png'
})

const shop = new Sprite({
    position : {
        x : 600,
        y : 128
    },
    imagesrc : './img/shop.png',
    scale : 2.75,
    framesMax : 6,
    framesHold : 15
})


const player = new Fighter({
    position : {
        x : 100,
        y : 0
    },
    velocity : {
        x : 0,
        y : 0
    },
    color :'red',
    imagesrc :'./img/samuraiMack/Idle.png',
    framesMax : 8,
    scale : 2.5,
    offset : {
        x : 215,
        y : 157
    },
    framesHold : 10,
    sprites : {
        idle : {
            imagesrc :'./img/samuraiMack/Idle.png' ,
            framesMax : 8
        },
        run : {
            imagesrc : './img/samuraiMack/Run.png',
            framesMax : 8
        },
        jump : {
            imagesrc :'./img/samuraiMack/Jump.png',
            framesMax : 2
        },
        fall : {
            imagesrc :'./img/samuraiMack/Fall.png',
            framesMax : 2
        },
        attack1 : {
            imagesrc :'./img/samuraiMack/Attack1.png',
            framesMax : 6
        },
        takeHit : {
            imagesrc :'./img/samuraiMack/Take Hit - white silhouette.png',
            framesMax : 4
        },
        death : {
            imagesrc :'./img/samuraiMack/Death.png',
            framesMax : 6
        }
    },
    attackBox : {
        offset : {
            x : 65,
            y : 50
        },
        width : 160,
        height : 50
    }
})

const enemy = new Fighter({
    position : {
        x : 800,
        y : 100
    },
    velocity : {
        x : 0,
        y : 0
    },
    color : 'blue',
    imagesrc :'./img/kenji/Idle.png',
    framesMax : 4,
    scale : 2.5,
    offset : {
        x : 215,
        y : 167
    },
    framesHold : 15,
    sprites : {
        idle : {
            imagesrc :'./img/kenji/Idle.png' ,
            framesMax : 4
        },
        run : {
            imagesrc : './img/kenji/Run.png',
            framesMax : 8
        },
        jump : {
            imagesrc :'./img/kenji/Jump.png',
            framesMax : 2
        },
        fall : {
            imagesrc :'./img/kenji/Fall.png',
            framesMax : 2
        },
        attack1 : {
            imagesrc :'./img/kenji/Attack1.png',
            framesMax : 4
        },
        takeHit : {
            imagesrc : './img/kenji/Take hit.png',
            framesMax : 3
        },
        death : {
            imagesrc :'./img/kenji/Death.png',
            framesMax : 7
        }
    },
    attackBox : {
        offset : {
            x : -170,
            y : 50
        },
        width : 170,
        height : 50
    }
})

const keys = {
    a : {
        pressed : false
    },
    d : {
        pressed : false
    },
    w : {
        pressed : false
    },
    ArrowRight : {
        pressed : false
    },
    ArrowLeft : {
        pressed : false
    }
}

const game = {
    started: false
  }

function animate(){
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    if (!game.started) 
        return
    player.update()
    enemy.update()

    //player movement
    player.velocity.x = 0
    
    if (keys.a.pressed && player.lastKey ==='a'){
        player.velocity.x = -5
        player.switchSprite('run')
    }
    else if (keys.d.pressed && player.lastKey ==='d'){
        player.velocity.x = 5
        player.switchSprite('run')
    }
    else{
        player.switchSprite('idle')
    }
   
    //jumping
    if (player.velocity.y < 0)
        player.switchSprite('jump')

    else if (player.velocity.y > 0)
        player.switchSprite('fall')

    //enemy movement
    enemy.velocity.x = 0
    if (keys.ArrowLeft.pressed && enemy.lastKey ==='ArrowLeft'){
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    }
    else if (keys.ArrowRight.pressed && enemy.lastKey ==='ArrowRight'){
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    }
    else {
        enemy.switchSprite('idle')
    }

     //jumping
     if (enemy.velocity.y < 0)
        enemy.switchSprite('jump')

    else if (enemy.velocity.y > 0)
        enemy.switchSprite('fall')


    //detect for collision
    if(
        rectangularCollision({
            rectangle1 : player,
            rectangle2 : enemy
        }) && 
        player.isAttacking && player.frameCurrent === 4
        ) {
        enemy.takeHit()
        player.isAttacking = false
        gsap.to('#enemyHealth', {
            width : enemy.health + '%'
        })
    }

    // if player misses
    if (player.isAttacking && player.frameCurrent === 4){
        player.isAttacking = false
    }

    //this is where our player gets hit

    if(
        rectangularCollision({
            rectangle1 : enemy,
            rectangle2 : player
        }) && 
        enemy.isAttacking && enemy.frameCurrent === 2
        ) {
            player.takeHit()
        enemy.isAttacking = false
        gsap.to('#playerHealth', {
            width : player.health + '%'
        })
    }

    // if enemy misses
    if (enemy.isAttacking && enemy.frameCurrent === 2){
        enemy.isAttacking = false
    }

    //end game based on health
    if (enemy.health <=0 || player.health <=0){
        determineWinner({ player, enemy, timerId })
    }
}

animate()

document.querySelector('#beginButton').addEventListener('click', () => {
    document.querySelector('#beginButton').style.display = 'none'
    document.querySelector('#tutorial').style.display = 'flex'
  })
  
  document.querySelector('#startButton').addEventListener('click', () => {
    decreaseTimer()
    document.querySelector('#tutorial').style.display = 'none'
    game.started = true
  })
  
window.addEventListener('keydown', (event) =>{
    if(!player.dead){
        switch(event.key){
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break
            case 'w':
                player.velocity.y =-20
                break
            case ' ':
                player.attack()
                break
        }
    }

    if(!enemy.dead ){
        switch(event.key){
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break
            case 'ArrowUp':
                enemy.velocity.y =-20
                break
            case 'ArrowDown':
                enemy.attack()
                break
        }
    }
})

window.addEventListener('keyup', (event) =>{
    switch(event.key){
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
    }
})