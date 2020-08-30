class GameObject {
    constructor() {
        this.events = []
    }

    static new(...args) {
        return new this(...args)
    }

    init() {
    }

    update() {
    }

    debug() {
    }

    listener(element, type, callback) {
        this.events.push([element, type, callback])
        element.addEventListener(type, callback)
    }

    destory() {
        for (let [element, type, callback] of this.events) {
            element.removeEventListener(type, callback)
        }
    }
}

class Game extends GameObject {
    constructor() {
        super()
        this.fps = 30
        this.scene = null
        this.pause = false
        this.images = images
        this.preload(() => this.runWithScene(Scene))
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
        setTimeout(() => {
            this.runloop()
        }, 1000 / this.fps)
    }

    replaceScene(scene, callback) {
        this.pause = true
        this.scene.destory()
        this.scene = scene.new(this, callback)
        this.pause = false
    }

    update() {
        this.scene.update()
    }

    preload(callback) {
        let loads = 0
        let names = Object.keys(this.images)
        log('images', this.images)
        if (names.length === 0) callback && callback()
        for (let key of names) {
            let path = this.images[key]
            let img = imageFromPath(path)
            img.onload = () => {
                log(img)
                this.images[key] = img
                loads++
                if (loads === names.length) {
                    log('load images', this.images)
                    callback && callback()
                }
            }
        }
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
        return new Promise((resole, reject) => {
            setTimeout(() => {
                ce.classList.remove('anime')
                this.game.animationNum--
                resole(ce)
            }, 300)
        })
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

    move(card, top = null, left = null, index = 0) {
        let n = this.stack.length + index
        top = top || this.element.offsetTop + n * this.topInterval
        left = left || this.element.offsetLeft + n * this.leftInterval
        return card.anime(ce => {
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
        let ce = Card.element(card)
        ce.remove()
        ce.style.top = top + 'px'
        ce.style.left = left + 'px'
        ce.style.zIndex = String(len)
        this.element.appendChild(ce)
    }

    checkMove(ce) {
        let id = ce.parentElement.id
        return this.id === '#' + id
    }

    recover(card, top = null, left = null) {
        let index = this.stack.indexOf(card)
        top = top === null ? index * this.topInterval : top
        left = left === null ? index * this.leftInterval : left
        return card.anime(ce => {
            ce.style.top = top + 'px'
            ce.style.left = left + 'px'
        }).then(ce => {
            ce.style.zIndex = String(this.stack.length)
        })
    }

    checkCrash(ce) {
        let {x: aX, y: aY} = this.element.getBoundingClientRect()
        let {x: bX, y: bY} = ce.getBoundingClientRect()
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
        return super.move(card, top, left)
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
    }

    format() {
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
        return super.recover(card, top, left)
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
        this.game.showArea.move(card).then(() => {
            this.game.showArea.push(card)
        }).then(() => {
            setTimeout(() => {
                this.game.showArea.format()
            }, 100)
        })
    }

    back() {
        let l = this.game.showArea.stack.length
        for (let i = 0; i < l; i++) {
            let card = this.game.showArea.pop()
            card.hide = true
            this.move(card).then(() => {
                this.push(card)
            })
        }
    }

    register() {
        this.listener(this.element, 'click', event => {
            let l = this.game.showArea.stack.length
            if (this.stack.length !== 0) {
                this.show()
            } else if (l !== 0) {
                this.back()
            }
        })
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
                this.move(card).then(() => {
                    this.push(card)
                })
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

class Scene extends GameObject {
    constructor(game, callback = null) {
        super()
        this.game = game
        this.cards = null
        this.animationNum = 0
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
                stack.move(card).then(() => {
                    stack.push(card)
                })
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
        let element = e('#id-main')
        this.listener(element, 'mousedown', event => {
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
        this.listener(element, 'mousemove', event => {
            if (moving) {
                ce.forEach((e, index) => {
                    e.style.top = top[index] + (event.clientY - y) + 'px'
                    e.style.left = left[index] + (event.clientX - x) + 'px'
                })
                for (let a of this.stackArea) {
                    if (a.checkCrash(ce[0]) && a.checkMatch(card[0])) {
                        matchArea = a
                        match = true
                        return
                    }
                }
                match = false
            }
        })
        this.listener(element, 'mouseup', event => {
            if (match) {
                card.forEach((c, i) => {
                    area.pop(c)
                    matchArea.move(c, null, null, i).then(() => {
                        matchArea.push(c)
                    })
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
}
