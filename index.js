// Output helpers

const COLOR_PREFIX = {
    FG_RED: '\x1b[31m',
    FG_GREEN: '\x1b[32m',
    FG_YELLOW: '\x1b[33m',
    BLINK: '\x1b[5m',
    REVERSE: '\x1b[7m',
    RESET: '\x1b[0m',
}
const B = '█'

function write(text) {
    process.stdout.write(text)
}

function backspace(num = 1) {
    process.stdout.write(new Array(num).fill('\r').join(''))
}

function newLine() {
    process.stdout.write('\n')
}

function delLine() {
    process.stdout.write('\033[A')
}

function whiteLine(len) {
    process.stdout.write(new Array(len).fill(B).join(''))
}

function printOnWhiteLine(len, text) {
    const prefix = COLOR_PREFIX.REVERSE
    const postfix = COLOR_PREFIX.RESET
    const line = new Array(len + 2).fill(B)

    const textLength = text.length
    line.splice(1, 1 + textLength + 1 + 2, prefix, ...text.split(''), postfix, B, B)
    write(line.join(''))
}

function printInFrame(len, text) {
    const line = new Array(len).fill(' ')
    line[0] = B
    line[line.length - 1] = B

    const textLength = text.length
    line.splice(Math.floor(len / 2) - Math.floor(textLength / 2), textLength, ...text.split(''))
    write(line.join(''))
}


// Game logic

let score = 0
let theLine = ''
let newLetterSpeed = 2000
let readyToAddLetter = true
let maxLineLength = 100
let gameOver = false
let theLinePrefix = COLOR_PREFIX.FG_GREEN
const theLetterPrefix = COLOR_PREFIX.REVERSE


function testKey(key) {
    if (theLine[theLine.length - 1] === key) {
        score += 10
        theLine = theLine.slice(0, -1)
    } else {
        score -= 1
    }
}


function addLetter() {
    let randLetter = String.fromCharCode(Math.round(Math.random() * (122 - 97)) + 97)
        ; ({
            0: () => randLetter = ' ',
            1: () => randLetter = randLetter,
            2: () => randLetter = randLetter.toUpperCase(),
            3: () => randLetter = randLetter,
        })[Math.round(Math.random() * 3)]()
    theLine += randLetter
}



class Engine {
    _screenBack = []
    _gameLoop

    start() {
        process.stdin.setRawMode(true);
        process.stdin.on('readable', function () {
            let data
            while ((data = this.read()) !== null) {
                var key = String(data)
                const ord = key.charCodeAt(0)

                // Esc or ^C
                if (ord === 27 || ord === 3) {
                    process.exit(0)
                }
                testKey(key)
            }
        });



        let timeSnapshot = Date.now()
        this._gameLoop = setInterval(() => {
            const currTime = Date.now()
            const dt = currTime - timeSnapshot
            timeSnapshot = currTime
            this.update(dt)
            this.render(dt)
        }, 1000 / 25)
    }

    update(dt) {
        if (theLine.length > maxLineLength) {
            gameOver = true
            return
        }

        if (readyToAddLetter) {
            readyToAddLetter = false
            setTimeout(() => {
                addLetter()
                readyToAddLetter = true
            }, newLetterSpeed)
        }

        switch (true) {
            case score > 200: {
                newLetterSpeed = 500
                break
            }
            case score > 100: {
                newLetterSpeed = 700
                break
            }
            case score > 50: {
                newLetterSpeed = 1000
                break
            }
            default:
                newLetterSpeed = 2000
        }

        switch (true) {
            case theLine.length > 90: {
                theLinePrefix = COLOR_PREFIX.FG_RED + COLOR_PREFIX.BLINK
                break
            }
            case theLine.length > 70: {
                theLinePrefix = COLOR_PREFIX.FG_RED
                break
            }
            case theLine.length > 50: {
                theLinePrefix = COLOR_PREFIX.FG_YELLOW
                break
            }
            default:
                theLinePrefix = COLOR_PREFIX.FG_GREEN
        }
    }

    render() {
        const screenWidth = process.stdout.columns
        while (this._screenBack.length) {
            const step = this._screenBack.pop()
            step[0](...step[1])
        }

        if (gameOver) {
            clearInterval(this._gameLoop)
            printOnWhiteLine(screenWidth, 'Esc or ^C to exit.')
            printInFrame(screenWidth, `GAME OVER ${score > 0 ? '🥲' : '☠️'}   SCORE: ${score}`)
            whiteLine(screenWidth)
            return
        }

        //Render scores
        this._screenBack.push([backspace, [screenWidth]])
        printOnWhiteLine(screenWidth, 'Type the last appeared letter to remove it! Esc or ^C to exit.')
        this._screenBack.push([delLine, []])
        newLine()

        this._screenBack.push([backspace, [screenWidth]])
        printInFrame(screenWidth, `SCORE: ${score}`)
        this._screenBack.push([delLine, []])
        newLine()

        this._screenBack.push([backspace, [screenWidth]])
        whiteLine(screenWidth)
        this._screenBack.push([delLine, []])
        newLine()


        //Render line
        this._screenBack.push([backspace, [theLine.length + 2]])
        write(theLinePrefix + theLine.slice(0, -1) + theLetterPrefix + theLine.slice(-1) + COLOR_PREFIX.RESET)
    }
}

(new Engine()).start()

