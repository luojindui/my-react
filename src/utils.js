import { REACT_TEXT } from "./constants";


export function wrapToVDOM(element) {
    return typeof element === 'string' || typeof element === 'number' ? {
        type: REACT_TEXT, props: { content: element }
    } : element
}

export function isFunction(obj) {
    return typeof obj === 'function';
}

export function flatten(arr) {
    let res = []
    arr.forEach(a => Array.isArray(a) ? res.push(...flatten(a)) : res.push(a))
    return res
}