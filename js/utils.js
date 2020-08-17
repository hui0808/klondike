const e = sel => document.querySelector(sel)

const es = sel => document.querySelectorAll(sel)

const log = console.log.bind(console)

const bindAll = function(sel, eventName, callback) {
    let e = es(sel)
    for (let input of e) {
        input.addEventListener(eventName, function(event) {
            callback(event)
        })
    }
}

const bindEventDelegate = function(sel, eventName, responseClass, callback) {
    let element = e(sel)
    let retFunc = event => {
        let self = event.target
        if (self.classList.contains(responseClass)) {
            callback(event)
        }
    }
    element.addEventListener(eventName, retFunc)
    return retFunc
}

const ensure = function(condition, message) {
    // 在条件不成立的时候, 输出 message
    if (!condition) {
        log('*** 测试失败', message)
    } else {
        log('*** 测试成功')
    }
}

const isArray = function(o) {
    // 判断对象是否为数组
    return Array.isArray(o)
}

const isSubset = function(a, b) {
    // 检查是否 a 中的每个元素都在 b 中出现
    for (let i = 0; i < a.length; i++) {
        if (!b.includes(a[i])) {
            return false
        }
    }
    return true
}

const arrayEquals = function(a, b) {
    // 递归版数组判断，可以判断任意维度的数组是否相等
    if (a.length !== b.length) {
        return false
    }
    for (let i = 0; i < a.length; i++) {
        if (isArray(a[i]) && isArray(b[i])) {
            if (!arrayEquals(a[i], b[i])) {
                return false
            }
        } else if (!Object.is(a[i], b[i])) {
            return false
        }
    }
    return true
}

const checkCrash = function(aX, aY, aWidth, aHeight, bX, bY, bWidth, bHeight) {
    if ((aX + aWidth) < bX || (bX + bWidth) < aX || (aY + aHeight) < bY || (bY + bHeight) < aY) {
        return false
    }
    return true
}

const ranint = function(n, m) {
    let r = Math.floor(Math.random() * (m - n) + n);
    return r;
}

const range = function(start, end, step = 1) {
    let r = []
    for (let i = start; i < end; i += step) {
        r.push(i)
    }
    return r
}

const zeros = function(x, y) {
    let r = []
    for (let i = 0; i < x; i++) {
        let tmp = []
        for (let j = 0; j < y; j++) {
            tmp.push(0)
        }
        r.push(tmp)
    }
    return r
}

const shuffle = function(array) {
    let m = array.length
    let arr = [...array]
    while (m) {
        let n = Math.floor(Math.random() * m--);
        [arr[m], arr[n]] = [arr[n], arr[m]]
    }
    return arr
}
