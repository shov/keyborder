class Input {
  static _currentOrd = undefined

  static get ord() {
    return Input._currentOrd
  }

  static _currentKey = undefined

  static get key() {
    return Input._currentKey
  }

  static set(data) {
    Input._currentKey = String(data)
    Input._currentOrd = Input._currentKey.charCodeAt(0)
  }


}

class Printer {

  static COLOR_PREFIX = {
    FG_RED: '\x1b[31m',
    FG_GREEN: '\x1b[32m',
    FG_YELLOW: '\x1b[33m',
    FG_WHITE: '\u001b[37m',

    BG_WHITE: '\u001b[47m',

    BLINK: '\x1b[5m',
    REVERSE: '\x1b[7m',
    RESET: '\x1b[0m',
  }
  static SYMBOL = {F: '█', B: ' '}


  static w(text) {
    process.stdout.write(text)
  }

  static r(len = 1) {
    process.stdout.write(new Array(len).fill('\r').join(''))
  }

  static nl() {
    process.stdout.write('\n')
  }

  static dl() {
    process.stdout.write('\x1B[A')
  }

  static fl(len, B) {
    process.stdout.write(new Array(len).fill(B).join(''))
  }

  static fastFill(w, h, bg = Printer.COLOR_PREFIX.BG_WHITE, b = Printer.SYMBOL.B) {
    for (let r = 0; r < h; r++) {
      Printer.nl()
      Printer.w(bg)
      Printer.fl(w, b)
    }
  }

  static clear(w, h) {
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        Printer.r()
      }
      Printer.dl()
    }
  }
}

class UI {

}

// function printOnWhiteLine(len, text) {
//   const prefix = COLOR_PREFIX.REVERSE
//   const postfix = COLOR_PREFIX.RESET
//   const line = new Array(len + 2).fill(B)
//
//   const textLength = text.length
//   line.splice(1, 1 + textLength + 1 + 2, prefix, ...text.split(''), postfix, B, B)
//   write(line.join(''))
// }
//
// function printInFrame(len, text) {
//   const line = new Array(len).fill(' ')
//   line[0] = B
//   line[line.length - 1] = B
//
//   const textLength = text.length
//   line.splice(Math.floor(len / 2) - Math.floor(textLength / 2), textLength, ...text.split(''))
//   write(line.join(''))
// }

class Engine {
  FPS = 25

  _gameLoop
  _screen = {w: 0, h: 0,}

  start() {
    process.stdin.setRawMode(true)
    process.stdin.on('readable', function () {
      let data
      while ((data = this.read()) !== null) {
        Input.set(data)
      }
    })

    const measureScreen = () => {
      this._screen.w = process.stdout.columns
      this._screen.h = process.stdout.rows
    }
    measureScreen()

    // Initially fill screen with empty
    Printer.fastFill(this._screen.w, this._screen.h)

    let timeSnapshot = Date.now()
    this._gameLoop = setInterval(() => {
      const currTime = Date.now()
      const dt = currTime - timeSnapshot
      timeSnapshot = currTime

      measureScreen()

      this.update(dt)

      Printer.clear(this._screen.w, this._screen.h)
      this.render(dt)
    }, 1000 / this.FPS)
  }

  update(dt) {
    // Esc or ^C
    if (Input.ord === 27 || Input.ord === 3) {
      Printer.clear(this._screen.w, this._screen.h)
      process.exit(0)
    }


  }

  render() {
    const {w, h} = this._screen
    Printer.fastFill(w, h)

  }
}

(new Engine()).start()

