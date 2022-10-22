 const canvas = document.getElementById("#canvas")
 const ctx = canvas.getContext('2d');
 const DEGREE = Math.PI / 180
 const sprite = new Image();
 const flapSound = new Audio();
 flapSound.src = "audio/sfx_flap.wav"
 const dieSound = new Audio();
 dieSound.src = "audio/sfx_die.wav"
 const hitSound = new Audio();
 hitSound.src = "audio/sfx_hit.wav"
 const pointSound = new Audio();
 pointSound.src = "audio/sfx_point.wav"
 const swooshSound = new Audio();
 swooshSound.src = "audio/sfx_swooshing.wav"
 sprite.src = "img/sprite.png";


 sprite.onload = function() {
     let frames = 0
     const startBtn = {
         x: canvas.width / 2 - 83,
         y: 310,
         w: 83,
         h: 29
     }
     const gameState = {
         current: 0,
         getReady: 0,
         game: 1,
         over: 2
     }
     canvas.addEventListener("click", function(event) {
         switch (gameState.current) {
             case gameState.getReady:

                 gameState.current = gameState.game
                 break;
             case gameState.game:

                 bird.flap()
                 break;
             case gameState.over:

                 let rect = canvas.getBoundingClientRect();
                 let clickX = event.clientX - rect.left;
                 let clickY = event.clientY - rect.top;
                 if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {

                     pipe.reset();
                     bird.reset();
                     score.reset();
                     gameState.current = gameState.getReady
                 }

                 break;
         }
     })
     const score = {
         bestScore: parseInt(localStorage.getItem("bestScore")) || 0,
         currentScore: 0,
         draw: function() {
             if (gameState.current == gameState.game) {
                 ctx.font = "50px Arial";
                 ctx.fillStyle = "white";
                 ctx.fillText(this.currentScore, canvas.width / 2 - 10, 60);
                 ctx.strokeText(this.currentScore, canvas.width / 2 - 10, 60);
             } else if (gameState.current == gameState.over) {
                 ctx.font = "25px Teko";
                 ctx.fillText(this.currentScore, 225, 230);
                 ctx.strokeText(this.currentScore, 225, 230);
                 ctx.fillText(this.bestScore, 225, 280);
                 ctx.strokeText(this.bestScore, 225, 280);
             }

         },
         update: function() {
             if (this.currentScore > this.bestScore) {
                 this.bestScore = this.currentScore
                 localStorage.setItem("bestScore", this.bestScore)
             }
         },
         reset: function() {
             this.currentScore = 0
         }

     }
     const bg = {
         sX: 0,
         sY: 0,
         w: 275,
         h: 226,
         x: 0,
         y: canvas.height - 226,
         draw: function() {
             ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
             ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
         }
     };
     const pipe = {
         top: {
             sX: 553,
             sY: 0
         },
         bottom: {
             sX: 502,
             sY: 0
         },
         w: 53,
         h: 400,
         gap: 85,
         maxYpos: -150,
         dx: 2,
         position: [],
         draw: function() {
             this.position.forEach((element) => {
                 let bY = element.y + this.h + this.gap
                 ctx.drawImage(sprite, this.top.sX, this.bottom.sY, this.w, this.h, element.x, element.y, this.w, this.h)
                 ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, element.x, bY, this.w, this.h)
             })
         },
         update: function() {
             if (gameState.current != gameState.game) return;
             if (frames % 200 == 0) {
                 this.position.push({
                     x: canvas.width,
                     y: (Math.random() + 1) * this.maxYpos
                 })

             }

             this.position.forEach((element, index) => {
                 let bY = element.y + this.h + this.gap
                 if (element.x + this.w + 20 < 0) {
                     this.position.splice(index, 1)
                     pointSound.play()
                     score.currentScore += 1
                 }
                 if (bird.x + 15 > element.x && bird.x < element.x + this.w && bird.y + 15 > element.y && bird.y < element.y + this.h) {
                     gameState.current = gameState.over
                     hitSound.play()
                     dieSound.play()
                 }
                 if (bird.x + 15 > element.x && bird.x < element.x + this.w && bird.y + 15 > bY && bird.y < bY + this.h) {
                     gameState.current = gameState.over
                     dieSound.play()
                     hitSound.play()
                 }
                 element.x += -this.dx
             })
         },

         reset: function() {
             this.position = []
         }
     }
     const fg = {
         sX: 276,
         sY: 0,
         w: 224,
         h: 112,
         x: 0,
         dx: 2,
         y: canvas.height - 112,
         draw: function() {
             ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
             ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
         },
         update: function() {
             if (gameState.current == gameState.game) {
                 this.x = (this.x - this.dx) % (this.w / 2)
             }
         }

     }
     const bird = {
         animation: [
             { sX: 276, sY: 112 },
             { sX: 276, sY: 139 },
             { sX: 276, sY: 164 },
             { sX: 276, sY: 139 }
         ],
         x: 50,
         y: 150,
         w: 34,
         h: 26,
         rotation: 0,
         frame: 0,
         speed: 0,
         gravity: 0.25,
         jump: 4.6,
         draw: function() {
             let bird = this.animation[this.frame]
             ctx.save()
             ctx.translate(this.x, this.y)
             ctx.rotate(this.rotation)
             ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h)
             ctx.restore()
         },
         flap: function() {
             this.speed = -this.jump
             flapSound.play()
         },
         update: function() {
             this.period = gameState.current == gameState.getReady ? 10 : 5
             this.frame += frames % this.period == 0 ? 1 : 0
             this.frame = this.frame % this.animation.length
             if (gameState.current == gameState.getReady) {
                 this.y = canvas.height / 2 - 26
                 this.rotation = 0 * DEGREE
             } else {
                 this.speed += this.gravity
                 this.y += this.speed
                 if (this.y + this.h > canvas.height - fg.h) {
                     this.y = canvas.height - fg.h - this.h / 2
                     if (gameState.current == gameState.game) {
                         gameState.current = gameState.over
                     }
                 }
                 if (this.speed > this.jump) {
                     this.rotation = 90 * DEGREE
                     this.frame = 1
                 } else {
                     this.rotation = -20 * DEGREE
                 }
             }
         },
         reset: function() {
             this.speed = 0
             this.rotation = 0

         }
     }
     const getReady = {
         sX: 0,
         sY: 228,
         w: 173,
         h: 152,
         x: canvas.width / 2 - 82,
         y: canvas.height / 2 - 82,
         draw: function() {
             if (gameState.current == gameState.getReady) {
                 ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
             }
         }
     }
     const gameOver = {
         sX: 175,
         sY: 228,
         w: 225,
         h: 202,
         x: 50,
         y: canvas.height / 2 - 101,
         draw: function() {
             if (gameState.current == gameState.over) {
                 ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
             }

         }
     }

     function draw() {
         ctx.clearRect(0, 0, innerWidth, innerHeight)
         bg.draw()
         fg.draw()
         bird.draw()
         getReady.draw()
         pipe.draw()
         gameOver.draw()
         score.draw()

     };

     function update() {
         bird.update()
         fg.update()
         pipe.update()
         score.update()
     };

     function animate() {
         draw();
         update();
         frames++;
         requestAnimationFrame(animate);
     }
     animate()

 }