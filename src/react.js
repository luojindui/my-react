import { REACT_ELEMENT, REACT_FORWARD_REF_TYPE } from './constants';
import { flatten, wrapToVDOM } from './utils';
import { Component } from './component';

/**
 * 生成ReactElement的工厂方法
 * @param {*} type dom元素类型
 * @param {*} config 配置对象
 * @param  {...any} children 子元素
 * @returns vdom
 */
function createElement(type, config = {}, children) {
    let key, ref;
    if (config) {
        key = config.key;
        ref = config.ref;
        delete config.__source;
        delete config.__self;
        delete config.ref;
        delete config.key;
    }
    let props = { ...config };
    if (arguments.length > 3) {
        props.children = flatten(Array.prototype.slice.call(arguments, 2)).map(wrapToVDOM)
    } else {
        // 把文字节点包装成vdom
        props.children = wrapToVDOM(children);
    }
    return {
        $$typeof: REACT_ELEMENT,
        type,
        key,
        ref,
        props,
    }
}

function createRef() {
    return { current: null };
}

function forwardRef(render) {
    return {
        $$typeof: REACT_FORWARD_REF_TYPE,
        render,
    }
}

let Children = {
    map(children, mapFn) {
        return flatten(children).map(mapFn);
    }
}

const React = {
    createElement,
    Component,
    createRef,
    forwardRef,
    Children,
}

export default React;