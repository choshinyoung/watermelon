(() => {
    var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Composite = Matter.Composite

    var parent = document.getElementById('game')
    var canvas = document.getElementById('canvas')
    var playAgainButton = document.getElementById('playAgainButton')
    var floor = document.getElementById('floor')

    var ctx = canvas.getContext('2d')

    var engine = Engine.create()

    var render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: 480,
            height: 720,
            wireframes: false,
        }
    })

    var times = []
    var fps = 100

    var mousePos
    var isClicking = false
    var isMouseOver = false
    var newSize = 1

    var isGameOver = false
    var score = 0

    var isLineEnable = false

    var background = Bodies.rectangle(240, 360, 480, 720, { isStatic: true, render: { fillStyle: '#fe9'} })
    background.collisionFilter = {
        'group': 0,
        'category': 1,
        'mask': -2,
    }
    var ground = Bodies.rectangle(400, 1220, 810, 1000, { isStatic: true, render: { fillStyle: 'transparent'} })
    var wallLeft = Bodies.rectangle(-50, 500, 100, 1000, { isStatic: true, render: { fillStyle: 'transparent'} })
    var wallRight = Bodies.rectangle(530, 500, 100, 1000, { isStatic: true, render: { fillStyle: 'transparent'} })
    World.add(engine.world, [wallLeft, wallRight, ground, background])

    Engine.run(engine)
    Render.run(render)

    resize()

    refreshLoop()

    init()

    window.addEventListener('resize', resize)

    addEventListener('mousedown', () => {
        if (isGameOver) return

        isClicking = isMouseOver
    })
    addEventListener('touchstart', e => {
        if (isGameOver) return

        isClicking = true
        mousePos = e.touches[0].clientX / parent.style.zoom
    })

    addEventListener('mouseup', () => {
        if (isGameOver) return

        isClicking = false
    })
    addEventListener('touchend', () => {
        if (isGameOver) return

        isClicking = false

        if (isGameOver) return

        if (ball != null) {
            ball.collisionFilter = {
                'group': 0,
                'category': 1,
                'mask': -1,
            }
            Body.setVelocity(ball, {x: 0, y: 100 / fps * 5.5})
            ball = null

            newSize = Math.ceil(Math.random() * 3)

            setTimeout(() => createNewBall(newSize), 1000)
        }
    })

    addEventListener('mousemove', e => {
        if (isGameOver) return

        var rect = canvas.getBoundingClientRect()
        mousePos = (e.clientX / parent.style.zoom - rect.left)
    })
    addEventListener('touchmove', e => {
        if (isGameOver) return

        var rect = canvas.getBoundingClientRect()
        mousePos = e.touches[0].clientX / parent.style.zoom - rect.left
    })

    addEventListener('click', () => {
        if (isGameOver || !isMouseOver) return

        if (ball != null) {
            ball.collisionFilter = {
                'group': 0,
                'category': 1,
                'mask': -1,
            }
            Body.setVelocity(ball, {x: 0, y: 100 / fps * 5.5})
            ball = null

            newSize = Math.ceil(Math.random() * 3)

            setTimeout(() => createNewBall(newSize), 1000)
        }
    })

    canvas.addEventListener('mouseover', () => {
        isMouseOver = true
    })

    canvas.addEventListener('mouseout', () => {
        isMouseOver = false
    })

    Events.on(engine, 'beforeUpdate', () => {
        if (isGameOver) return

        if (ball != null) {
            var gravity = engine.world.gravity
            Body.applyForce(ball, ball.position, {
                x: -gravity.x * gravity.scale * ball.mass,
                y: -gravity.y * gravity.scale * ball.mass
            })
            
            if (isClicking && mousePos != undefined) {
                ball.position.x = mousePos
            
                if (mousePos > 455)
                    ball.position.x = 455
                else if (mousePos < 25)
                    ball.position.x = 25
            }

            ball.position.y = 50
        }

        isLineEnable = false
        var bodies = Composite.allBodies(engine.world)
        for (var i = 4; i < bodies.length; i++) {
            body = bodies[i]

            if (body.position.y < 100) {
                if (body != ball && Math.abs(body.velocity.x) < .2 && Math.abs(body.velocity.y) < .2) {
                        gameOver()
                    }
            }
            else if (body.position.y < 150) {
                if (body != ball && Math.abs(body.velocity.x) < .5 && Math.abs(body.velocity.y) < .5) {
                    isLineEnable = true
                }
            }
        }
    })

    Events.on(engine, 'collisionStart', e => {
        if (isGameOver) return

        e.pairs.forEach((collision) => {
            bodies = [collision.bodyA, collision.bodyB]

            if (bodies[0].size == undefined || bodies[1].size == undefined) return

            if (bodies[0].size == bodies[1].size) {
                allBodies = Composite.allBodies(engine.world)
                if (allBodies.includes(bodies[0]) && allBodies.includes(bodies[1])) {
                    World.remove(engine.world, bodies[0])
                    World.remove(engine.world, bodies[1])

                    World.add(engine.world, newBall((bodies[0].position.x + bodies[1].position.x) / 2, (bodies[0].position.y + bodies[1].position.y) / 2, bodies[0].size == 11 ? 11 : bodies[0].size + 1))

                    score += bodies[0].size
                }
            }
        })
    })

    Events.on(render, 'afterRender', () => {
        if (isGameOver) {
            ctx.fillStyle = '#ffffff55'
            ctx.rect(0, 0, 480, 720)
            ctx.fill()

            writeText("Game Over", 'center', 240, 280, 50)
            writeText("Score: " + score, 'center', 240, 320, 30)
        }
        else {
            writeText(score, 'start', 25, 60, 40)

            if (isLineEnable) {
                ctx.strokeStyle = '#f55'
                ctx.beginPath()
                ctx.moveTo(0, 100)
                ctx.lineTo(480, 100)
                ctx.stroke()
            }
        }
    })

    function writeText(text, textAlign, x, y, size) {
        ctx.font = `${size}px NanumSquare`
        ctx.textAlign = textAlign
        ctx.lineWidth = size / 8

        ctx.strokeStyle = '#000'
        ctx.strokeText(text, x, y)

        ctx.fillStyle = '#fff'
        ctx.fillText(text, x, y)
    }

    function resize() {
        canvas.height = 720
        canvas.width = 480

        if (isMobile()) {
            parent.style.zoom = window.innerWidth / 480
            parent.style.top = '0px'

            floor.style.height = `${(window.innerHeight - canvas.height * parent.style.zoom) / parent.style.zoom}px`
        }
        else {
            parent.style.zoom = window.innerHeight / 720 / 1.4
            parent.style.top = `${canvas.height * parent.style.zoom / 15}px`

            floor.style.height = '50px'
        }

        Render.setPixelRatio(render, parent.style.zoom * 2)
    }

    function refreshLoop() {
        window.requestAnimationFrame(() => {
            const now = performance.now()
            while (times.length > 0 && times[0] <= now - 1000) {
                times.shift()
            }
            times.push(now)
            fps = times.length
            refreshLoop()
        })
    }

    function isMobile() {
        return window.innerHeight / window.innerWidth >= 1.49
    }

    function init() {
        isGameOver = false
        ball = null
        engine.timing.timeScale = 1
        score = 0

        playAgainButton.style.display = 'none'

        while (engine.world.bodies.length > 4) {
            engine.world.bodies.pop()
        }
        
        createNewBall(1)
    }

    function gameOver() {
        isGameOver = true
        engine.timing.timeScale = 0

        playAgainButton.style.display = ''

        if (ball != null)
            World.remove(engine.world, ball)
    }

    function createNewBall(size) {
        ball = newBall(render.options.width / 2, 50, size)
        ball.collisionFilter = {
            'group': -1,
            'category': 2,
            'mask': 0,
        }

        World.add(engine.world, ball)
    }

    function newBall(x, y, size) {
        c = Bodies.circle(x, y, size * 10, {
            render: {
                sprite: {
                    texture: `img/${size}.png`,
                    xScale: size / 12.75,
                    yScale: size / 12.75
                }
            }
        })
        c.size = size
        c.restitution = .3
        c.friction = .1
        return c
    }
})()