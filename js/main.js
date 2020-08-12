let tmp = [
    {num: 12, type: 1,},
    {num: 13, type: 2,},
    {num: 12, type: 2,},
    {num: 10, type: 2,},
    {num: 1, type: 3,},
    {num: 7, type: 1,},
    {num: 10, type: 0,},
    {num: 4, type: 1,},
    {num: 3, type: 3,},
    {num: 6, type: 0,},
    {num: 3, type: 1,},
    {num: 6, type: 3,},
    {num: 8, type: 2,},
    {num: 3, type: 0,},
    {num: 5, type: 0,},
    {num: 5, type: 1,},
    {num: 11, type: 3,},
    {num: 4, type: 2,},
    {num: 10, type: 1,},
    {num: 2, type: 0,},
    {num: 11, type: 2,},
    {num: 11, type: 1,},
    {num: 8, type: 0,},
    {num: 13, type: 1,},
    {num: 1, type: 1,},
    {num: 1, type: 2,},
    {num: 7, type: 2,},
    {num: 13, type: 0,},
    {num: 3, type: 2,},
    {num: 2, type: 1,},
    {num: 1, type: 0,},
    {num: 6, type: 1,},
    {num: 6, type: 2,},
    {num: 9, type: 2,},
    {num: 4, type: 0,},
    {num: 10, type: 3,},
    {num: 5, type: 3,},
    {num: 8, type: 3,},
    {num: 7, type: 0,},
    {num: 2, type: 2,},
    {num: 12, type: 3,},
    {num: 5, type: 2,},
    {num: 2, type: 3,},
    {num: 11, type: 0,},
    {num: 7, type: 3,},
    {num: 12, type: 0,},
    {num: 9, type: 3,},
    {num: 13, type: 3,},
    {num: 8, type: 1,},
    {num: 4, type: 3,},
    {num: 9, type: 1,},
    {num: 9, type: 0,},
]

class GameObject {
    static new(...args) {
        let i = new this(...args)
        // i.main = this.main
        return i
    }

    init() {
    }

    update() {
    }

    debug() {
    }

    destory() {

    }
}

class Game extends GameObject {
    constructor() {
        super()
        this.fps = 30
        this.scene = null
        this.pause = false
        this.runWithScene(Scene)
    }

    static instance(...args) {
        this.i = this.i || new this(...args)
        return this.i
    }

    runloop() {
        if (!this.pause) {
            this.update()
        }
        setTimeout(() => {
            this.runloop()
        }, 1000 / this.fps)
    }

    runWithScene(scene, callback) {
        this.scene = scene.new(this, callback)
        // 开始运行程序
        setTimeout(() => {
            this.runloop()
        }, 1000 / this.fps)
    }

    replaceScene(scene, callback) {
        this.pause = true
        this.scene.destory()
        let s = scene.new(this, callback)
        this.scene = s
        this.pause = false
    }

    update() {
        this.scene.update()
    }
}

class Card extends GameObject {
    static Spade = 0 // 黑桃
    static Heart = 1 // 红心
    static Club = 2 // 梅花
    static Diamond = 3 // 方块

    constructor(game, num, type, hide = true) {
        super()
        this.game = game
        this.num = num
        this.type = type
        this.hide = hide
        this.id = null
    }

    getType() {
        const d = ['bs', 'rh', 'bc', 'rd']
        return d[this.type]
    }

    anime(callback) {
        let ce = Card.element(this)
        this.game.animationNum++
        ce.classList.add('anime')
        callback(ce)
        setTimeout(() => {
            ce.classList.remove('anime')
            this.game.animationNum--
        }, 300)
    }

    static element(card) {
        return e(`[data-id="${card.id}"]`)
    }
}

class Area extends GameObject {
    constructor(game, element) {
        super()
        this.game = game
        this.stack = []
        this.element = e(element)
        this.id = element
        this.topInterval = 0
        this.leftInterval = 0
    }

    copy(card) {
        this.stack = [...card]
    }

    out(card) {
        let ce = Card.element(card)
        let m = e('#id-main')
        let parent = ce.parentElement
        let top = ce.offsetTop
        let left = ce.offsetLeft
        ce.parentElement.removeChild(ce)
        ce.style.top = parent.offsetTop + top + 'px'
        ce.style.left = parent.offsetLeft + left + 'px'
        // ce.classList.add('anime')
        m.appendChild(ce)
        return card
    }

    first() {
        return this.stack[0]
    }

    last() {
        return this.stack[this.stack.length - 1]
    }

    pop(card = null) {
        if (card === null) {
            card = this.stack.pop()
        } else {
            let index = this.stack.indexOf(card)
            this.stack.splice(index, 1)
        }
        this.out(card)
        return card
    }

    shift() {
        let card = this.stack.shift()
        this.out(card)
        return card
    }

    move(card, top = null, left = null) {
        top = top || this.element.offsetTop + this.stack.length * this.topInterval
        left = left || this.element.offsetLeft + this.stack.length * this.leftInterval
        card.anime(ce => {
            ce.style.zIndex = '100'
            ce.style.top = top + 'px'
            ce.style.left = left + 'px'
        })
    }

    push(card, top = null, left = null) {
        let len = this.stack.length
        top = top || len * this.topInterval
        left = left || len * this.leftInterval
        this.stack.push(card)
        timeOut(() => {
            let ce = Card.element(card)
            ce.remove()
            ce.style.top = top + 'px'
            ce.style.left = left + 'px'
            ce.style.zIndex = String(len)
            this.element.appendChild(ce)
        })
    }

    checkMove(ce) {
        let id = ce.parentElement.id
        return this.id === '#' + id
    }

    recover(card, top = null, left = null) {
        let index = this.stack.indexOf(card)
        top = top === null ? index * this.topInterval : top
        left = left === null ? index * this.leftInterval : left
        // let ce = Card.element(card)
        // ce.classList.add('anime')
        card.anime(ce => {
            ce.style.top = top + 'px'
            ce.style.left = left + 'px'
            timeOut(() => ce.style.zIndex = String(this.stack.length))
        })
    }

    checkCrash(ce) {
        let {x: aX, y: aY} = getElementXY(this.element)
        let {x: bX, y: bY} = getElementXY(ce)
        let {offsetHeight: aHeight, offsetWidth: aWidth} = this.element
        let {offsetHeight: bHeight, offsetWidth: bWidth} = ce
        if (this.stack.length > 1) {
            aHeight += (this.stack.length - 1) * this.topInterval
            aWidth += (this.stack.length - 1) * this.leftInterval
        }
        return checkCrash(aX, aY, aWidth, aHeight, bX, bY, bWidth, bHeight)
    }

}

class ShowArea extends Area {
    constructor(game) {
        super(game, '#id-show')
        this.showNum = 6
        this.topInterval = 0
        this.leftInterval = 20
    }

    move(card) {
        let top = this.element.offsetTop
        let left = this.element.offsetLeft
        if (this.stack.length > this.showNum) {
            left += this.showNum * 20
        } else {
            left += this.stack.length * 20
        }
        super.move(card, top, left)
    }

    push(card) {
        let top = 0
        let left = 0
        if (this.stack.length >= this.showNum) {
            left += (this.showNum) * 20
        } else {
            left += this.stack.length * 20
        }
        super.push(card, top, left)

        setTimeout(() => {
            if (this.stack.length > this.showNum) {
                let i = this.stack.length - this.showNum
                this.stack.forEach((card, index) => {
                    card.anime(ce => {
                        if (index >= i) {
                            ce.style.left = (index - i) * 20 + 'px'
                        } else {
                            ce.style.left = ''
                        }
                    })
                })
            }
        }, 400)
    }

    checkMove(ce) {
        let card = this.game.getCardFromElement(ce)
        return super.checkMove(ce) && Object.is(this.last(), card)
    }

    recover(card) {
        let top = 0
        let left = 0
        if (this.stack.length > this.showNum) {
            let tmp = [...this.stack].reverse()
            let index = tmp.indexOf(card)
            if (index < this.showNum) {
                index = this.showNum - index - 1
            } else {
                index = 0
            }
            left += index * 20
        } else {
            left += (this.stack.length - 1) * 20
        }
        super.recover(card, top, left);
    }

    update() {
        super.update()
    }
}

class RandomArea extends Area {
    constructor(game) {
        super(game, '#id-random')
        this.topInterval = 0
        this.leftInterval = 0
        this.register()
    }

    show() {
        let card = this.pop()
        card.hide = false
        this.game.showArea.move(card)
        this.game.showArea.push(card)
    }

    back() {
        let l = this.game.showArea.stack.length
        for (let i = 0; i < l; i++) {
            let card = this.game.showArea.pop()
            card.hide = true
            this.move(card)
            this.push(card)
        }
    }

    register() {
        this.ClickCallBack = event => {
            let l = this.game.showArea.stack.length
            if (this.stack.length !== 0) {
                this.show()
            } else if (l !== 0) {
                this.back()
            }
        }
        this.element.addEventListener('click', this.ClickCallBack)
    }

    update() {
        super.update()
        if (this.game.showArea.stack.length === 0 && this.stack.length !== 0) {
            this.show()
        }
    }

    checkMove(ce) {
        return false
    }
}

class FinishedArea extends Area {
    constructor(game, type) {
        super(game, '#id-finished' + (type + 1))
        this.type = type
        this.topInterval = 0
        this.leftInterval = 0
    }

    checkMatch(card) {
        let nextNum = this.stack.length + 1
        return card.num === nextNum && card.type === this.type
    }

    checkMove(ce) {
        return super.checkMove(ce)
    }

    update() {
        super.update()
        for (let area of [...this.game.stackArea, this.game.showArea]) {
            let card = area.last()
            if (card && card.hide === false && this.checkMatch(card)) {
                area.pop()
                this.move(card)
                this.push(card)
            }
        }
    }
}

class StackArea extends Area {
    constructor(game, index) {
        super(game, `#id-empty${index + 1}`)
        this.index = index
        this.topInterval = 30
        this.leftInterval = 0
    }

    checkMove(ce) {
        let card = this.game.getCardFromElement(ce)
        // return super.checkMove(ce) && Object.is(this.last(), card) && !card.hide
        return super.checkMove(ce) && !card.hide
    }

    checkMatch(card) {
        const o = {
            0: [1, 3],
            1: [0, 2],
            2: [1, 3],
            3: [0, 2],
        }
        let lastCard = this.last()
        let nextNum = lastCard === undefined ? 13 : lastCard.num - 1
        let type = lastCard === undefined ? [0, 1, 2, 3] : o[lastCard.type]
        return card.num === nextNum && type.includes(card.type)
    }

    getList(firstCe) {
        let card = this.game.getCardFromElement(firstCe)
        let index = this.stack.indexOf(card)
        let cardList = this.stack.slice(index)
        let ceList = cardList.map(card => Card.element(card))
        return [cardList, ceList]
    }

    update() {
        super.update()
        let card = this.stack[this.stack.length - 1]
        if (card && card.hide) {
            card.hide = false
        }
    }
}

class Scene
    extends GameObject {
    constructor(game, callback = null) {
        super()
        this.game = game
        this.score = 0
        this.cards = null
        this.animationNum = 0
        this.task = []
        this.randomArea = RandomArea.new(this)
        this.showArea = ShowArea.new(this)
        this.stackArea = range(0, 7).map(i => StackArea.new(this, i))
        this.finishedArea = range(0, 4).map(i => FinishedArea.new(this, i))

        callback && callback(this)
        this.initCard()
        this.initstackCard()
        this.initCss()
        this.register()
    }

    initCard() {
        this.cards = []
        for (let i = 0; i < 4; i++) {
            for (let j = 1; j <= 13; j++) {
                this.cards.push(Card.new(this, j, i))
            }
        }
        this.cards = shuffle(this.cards)
        // for (let t of tmp) {
        //     let {num, type} = t
        //     this.cards.push(Card.new(this, num, type))
        // }
        this.randomArea.copy(this.cards)
        log('initCard', this.cards)
        let randomArea = e('#id-random')
        this.cards.forEach((card, index) => {
            card.id = index
            randomArea.insertAdjacentHTML('beforeend',
                `<div class="card hide" data-id="${index}"></div>`)
        })
    }

    initstackCard() {
        for (let i = 0; i < 7; i++) {
            let stack = this.stackArea[i]
            for (let j = 0; j <= i; j++) {
                let card = this.randomArea.pop()
                card.hide = j !== i
                stack.move(card)
                stack.push(card)
            }
        }
        log('initstackCard', this.stackArea)
    }

    initCss() {
        const type = ['bs', 'rh', 'bc', 'rd']
        let head = e('head')
        let html = ''
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 13; j++) {
                html += `
                    .${type[i]}-${j + 1} {
                        background-position: ${-105 * j}px ${-148 * i}px;
                    }
                `
            }
        }
        html = `<style>${html}</style>`
        head.insertAdjacentHTML('beforeend', html)
    }

    getCardFromElement(element) {
        let id = parseInt(element.dataset.id)
        return this.cards[id]
    }

    getArea(ce) {
        for (let area of [this.showArea, ...this.stackArea, ...this.finishedArea]) {
            if (area.checkMove(ce)) {
                return area
            }
        }
        return null
    }

    register() {
        let [ce, card] = [[], []]
        let area, matchArea, x, y
        let [top, left] = [[], []]
        let moving = false
        let match = false
        e('#id-main').addEventListener('mousedown', event => {
            if (event.target.classList.contains('card')) {
                area = this.getArea(event.target)
                if (this.stackArea.includes(area)) {
                    [card, ce] = area.getList(event.target)
                } else {
                    card.push(this.getCardFromElement(event.target))
                    ce.push(event.target)
                }
                if (area) {
                    ce.forEach(e => {
                        e.style.zIndex = '100'
                        top.push(e.offsetTop)
                        left.push(e.offsetLeft)
                    })
                    x = event.clientX
                    y = event.clientY
                    moving = true
                    log('mousedown', {event, ce, card, x, y, top, left, area}, this.animationNum)
                }
            }
        })
        e('#id-main').addEventListener('mousemove', event => {
            if (moving) {
                ce.forEach((e, index) => {
                    e.style.top = top[index] + (event.clientY - y) + 'px'
                    e.style.left = left[index] + (event.clientX - x) + 'px'
                })
                this.stackArea.forEach(a => {
                    if (a.checkCrash(ce[0]) && a.checkMatch(card[0])) {
                        matchArea = a
                        match = true
                    }
                })
            }
        })
        e('#id-main').addEventListener('mouseup', event => {
            if (match) {
                card.forEach(c => {
                    area.pop(c)
                    matchArea.move(c)
                    matchArea.push(c)
                })
            } else if (moving) {
                card.forEach(c => area.recover(c))
            }
            moving = false
            match = false;
            [card, ce, top, left] = [[], [], [], []]
        })
    }

    update() {
        super.update()
        for (let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i]
            let ce = Card.element(card)
            if (card.hide === false) {
                ce.classList.remove('hide')
                ce.classList.add(`${card.getType()}-${card.num}`)
            } else {
                ce.classList.add('hide')
                ce.classList.remove(`${card.getType()}-${card.num}`)
            }
        }
        if (this.animationNum === 0) {
            this.randomArea.update()
        }
        if (this.animationNum === 0) {
            this.stackArea.forEach(area => area.update())
        }
        if (this.animationNum === 0) {
            this.finishedArea.forEach(area => area.update())
        }
        if (this.animationNum === 0) {
            this.showArea.update()
        }
    }

    destory() {
        super.destory();
        // let element = e('#id-grid')
        // element.removeEventListener('click', this.clickCallBack)
        // element.removeEventListener('dblclick', this.dClickCallBack)
        // element.removeEventListener('transitionend', this.deleteCallBack)
    }
}

class GameOver extends GameObject {
    constructor(game) {
        super();
        this.game = game
        this.element = e('#id-message')
        this.register()
    }

    register() {
        let html = `
            <p>Game Over!</p>
            <div id="id-restart">Try again!</div>
        `
        this.element.classList.add('message-show')
        this.element.innerHTML = html
        this.bindEvent = event => {
            let target = event.target
            if (target.id === 'id-restart') {
                this.game.replaceScene(NextStage)
            }
        }
        this.element.addEventListener('click', this.bindEvent)

    }

    destory() {
        super.destory();
        log('game over')
        e('#id-info-stage').innerHTML = "0"
        e('#id-info-score').innerHTML = "0"
        e('#id-info-target').innerHTML = "500"
        this.element.innerHTML = ''
        this.element.classList.remove('message-show')
        this.element.removeEventListener('click', this.bindEvent)
    }
}

class NextStage extends GameObject {
    constructor(game) {
        super();
        this.game = game
        this.stageElement = e('#id-info-stage')
        this.scoreElement = e('#id-info-score')
        this.targetElement = e('#id-info-target')
        this.element = e('#id-message')
        this.init()
        this.register()
    }

    init() {
        super.init()
        this.stage = parseInt(this.stageElement.innerText) + 1
        this.stageElement.innerText = String(this.stage)
        this.scoreElement.innerText = '0'
        this.target = parseInt(this.targetElement.innerText) + 500
        this.targetElement.innerText = String(this.target)
    }

    register() {
        let html = `
            <p>Stage ${this.stage}</p>
            <p>Target ${this.target}</p>
        `
        this.element.classList.add('message-show')
        this.element.innerHTML = html
        this.bindEvent = event => {
            let target = event.target
            if (target.classList.contains('message-show')) {
                this.game.replaceScene(Scene, scene => {
                    scene.target = this.target
                })
            }
        }
        this.element.addEventListener('animationend', this.bindEvent)
    }

    destory() {
        super.destory()
        this.element.innerHTML = ''
        this.element.classList.remove('message-show')
        this.element.removeEventListener('animationend', this.bindEvent)
    }
}
