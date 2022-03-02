import { REACT_TEXT } from "./constants";


export function wrapToVDOM(element) {
    return typeof element === 'string' || typeof element === 'number' ? {
        type: REACT_TEXT, props: { content: element }
    } : element
}

export function isFunction(obj) {
    return typeof obj === 'function';
}