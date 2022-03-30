gsap
const canvas = document.
    querySelector("canvas")
const c=canvas.getContext("2d")

canvas.width = innerWidth
canvas.height= innerHeight

const scoreEl = document.querySelector("#scoreEl")
const startGameBtn = document.querySelector("#startGameBtn")
const modelEl = document.querySelector("#modelEl")
const bigScoreEl = document.querySelector("#bigScoreEl")

class Player 
{
    constructor( x, y, radius, color)
    {
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius,
              0, Math.PI*2, false)
        //改變物件顏色
        c.fillStyle=this.color
        c.fill()
    }
}

class Projectile 
{
    constructor(x, y, radius, color, velocity)
    {
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius,
              0, Math.PI*2, false)
        //改變物件顏色
        c.fillStyle=this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x =this.x + this.velocity.x 
        this.y =this.y + this.velocity.y
    }
}

class Enemy
{
    constructor(x, y, radius, color, velocity)
    {
        this.x =x
        this.y =y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius,
              0, Math.PI*2, false)
        //改變物件顏色
        c.fillStyle=this.color
        c.fill()
    }
    
    update(){
        this.draw()
        this.x =this.x + this.velocity.x 
        this.y =this.y + this.velocity.y
    }
}
const friction =0.99
class Particle 
{
    constructor(x, y, radius, color, velocity)
    {
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.alpha = 1    
    }

    draw(){
        c.save()
        c.globalAlpha =this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius,
              0, Math.PI*2, false)
        //改變物件顏色
        c.fillStyle=this.color
        c.fill()
        c.restore()
    }
    
    update(){
        this.draw() 
        this.velocity.x *=friction
        this.velocity.y *=friction
        this.x =this.x + this.velocity.x 
        this.y =this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

//改變物件起始位置座標x,y
const x = canvas.width/2
const y = canvas.height/2

let player =new Player(x, y, 10,"white")
let projectiles = []
let enemies =[]
let particles =[]

function init(){
    player = new Player(x, y, 10,"white")
    projectiles = []
    enemies =[]
    particles =[]
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML =score
}

function spawnEnemies(){
    setInterval(()=>{
        //球體大小
        const radius = Math.random()*(30-4)+6

        let x
        let y

        if(Math.random()<0.5){
            x=Math.random()<0.5 ? 0 - radius : canvas.width+radius
            y=Math.random()<0.5 ? 0 - radius : canvas.height+radius
        }
        else 
        {
            x=Math.random()*canvas.width
            y=Math.random()<0.5 ? 0 - radius : canvas.height+radius
        }
       /* 
        const x= Math.random()<0.5 ? 0 - radius : canvas.width+radius
        const y=Math.random()<0.5 ? 0 - radius : canvas.height+radius
        */
        
        const color = `hsl(${Math.random()*360},50%,50%)`

        const angle = Math.atan2(
            canvas.height/2 -y,
            canvas.width/2 -x)

        const velocity={
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push (new Enemy(x, y, radius, color, velocity))
    },1000)
}

let animationId
let score=0
function animate (){    
    //requestAnimationFrame(animate)
    animationId =requestAnimationFrame(animate)
    //在此的物件會被清除
    //清除物件軌跡 
    //畫面背景顏色
    c.fillStyle="rgba(0,0,0,0.1)"
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw()  
    particles.forEach((particle,index)=>{
        if(particle.alpha <=0){
            particles.splice(index,1)
        }
        else{
            particle.update()
        }
    })  
    projectiles.forEach((projectile) => {
        projectile.update()   
        
        // remove from edges of screen
        if(projectile.x + projectile.radius <0  ||
            projectile.x - projectile.radius >canvas.width ||
            projectile.y + projectile.radius <0 ||
            projectile.y - projectile.radius >canvas.hight
            ){
            setTimeout(()=>{
                projectiles.splice(index,1)
            },0)
        }
    })
    enemies.forEach((enemy,index)=>{
        enemy.update()
        // dist 計算兩個物件的距離 player enemy
        const dist =Math.hypot(player.x-enemy.x,
            player.y-enemy.y)

        // end game
        if(dist-enemy.radius-player.radius<1)
        {
            cancelAnimationFrame(animationId)
            modelEl.style.display="flex"
            bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile,projectileIndex)=>{
            // dist 計算兩個物件的距離 projectile enemy         
            const dist =Math.hypot(projectile.x-enemy.x,
                projectile.y-enemy.y) 
            
            // when projectile touch  enemy    
            if(dist-enemy.radius-projectile.radius<1)
            {   
                // create explosions
                for (let i=0 ; i<8 ;i++){
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random()*2,
                            enemy.color,
                            {
                                x:(Math.random() -0.5)*(Math.random() *6),
                                y:(Math.random() -0.5)*(Math.random() *8)
                            }
                        )
                    )
                }


                //當enemy大小大於{}設定不同事件
                if(enemy.radius-10 >5)
                {
                     // increase our score
                    score += 100
                    scoreEl.innerHTML = score

                    gsap.to(enemy,{
                    radius:enemy.radius-10
                    })                
                    setTimeout(()=>{
                        projectiles.splice(projectileIndex,1)
                    },0)

                }
                else
                {
                    // remove from scene altogether
                    score += 250
                    scoreEl.innerHTML = score
                    setTimeout(()=>{
                        enemies.splice(index,1)
                        projectiles.splice(projectileIndex,1)
                    },0)
                }
                 
            }

        })
    })

}

//偵測滑鼠點擊的次數
//addEventListener("click",()=>{console.log("go")})

addEventListener("click",(event)=>
    {
        //將滑鼠點擊位置修正為圓周角度
        const angle = Math.atan2(
            event.clientY-canvas.height/2,
            event.clientX-canvas.width/2)

        const velocity={
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        console.log(angle)
        projectiles.push(
            new Projectile(canvas.width/2,
                canvas.height/2, 5, "white",velocity/*                {
                    x:1,
                    y:1
                } */
                )
        )
    })
startGameBtn.addEventListener("click",()=>{
    init()
    animate ()
    spawnEnemies()
    modelEl.style.display="none"    
})

// const projectile =new Projectile(
//     canvas.width/2,
//     canvas.height/2,
//     5,
//     "red",
//     {
//         x:1,
//         y:1
//     }
// )

// let i = 0;
// while (i < 3) { // shows 0, then 1, then 2
//   alert( i );
// }