import { REACT_ELEMENT, REACT_FORWARD_REF_TYPE } from './constants';
import { wrapToVDOM } from './utils';
import { Component } from './component';

/**
 * 生成React的工厂方法
 * @param {*} type dom元素类型
 * @param {*} config 配置对象
 * @param  {...any} children 子元素
 * @returns 
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
        props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVDOM)
    } else {
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

const React = {
    createElement,
    Component,
    createRef,
    forwardRef,
}

export default React;