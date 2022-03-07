import { REACT_FORWARD_REF_TYPE, REACT_TEXT } from "./constants";
import { addEvent } from "./event";

function render(vdom, container) {
    console.log(vdom)
    mount(vdom, container);
}

function mount(vdom, container) {
    const newDOM = createDOM(vdom);
    container.appendChild(newDOM);
}

/**
 * vdom => 真实dom
 * @param {*} vdom 
 */
function createDOM(vdom) {
    const { type, props, ref } = vdom;
    let dom; // 真实dom
    if (type && type.$$typeof === REACT_FORWARD_REF_TYPE) {
        // 函数组件ref
        return mountForwardComponent(vdom);
    } else if (type === REACT_TEXT) {
        dom = document.createTextNode(props.content);
    } else if (typeof type === 'function') {
        if (type.isReactComponent) {
            return mountClassConponent(vdom);
        } else {
            return mountFunctionConponent(vdom);
        }
    } else {
        dom = document.createElement(type);
    }
    if (props) {
        updateProps(dom, null, props);
        const { children } = props;
        if (typeof children === 'object' && children.type) {
            mount(children, dom);
        } else if (Array.isArray(children)) {
            reconcileChildren(children, dom);
        }
    }
    vdom.dom = dom;
    if (ref) {
        ref.current = dom;
    }
    return dom
}

export function findDOM(vdom) {
    if (!vdom) { return null; }
    if (vdom.dom) {
        // vdom上有dom属性说明是原生dom节点
        return vdom.dom;
    } else {
        // 没有dom属性就是类件或者函数组件
        const oldRenderVDOM = vdom.oldRenderVDOM;
        return findDOM(oldRenderVDOM);
    }
}

/**
 * 进行dom diff
 * @param {*} parentDOM 
 * @param {*} oldRenderVDOM 
 * @param {*} newRenderVDOM 
 */
export function compareTwoVDOM(parentDOM, oldVDOM, newVDOM) {
    const oldDOM = findDOM(oldVDOM);
    const newDOM = createDOM(newVDOM);
    parentDOM.replaceChild(newDOM, oldDOM);
}

/**
 * 获取函数式组件的真实dom
 * @param {*} vdom 
 */
function mountFunctionConponent(vdom) {
    const { type, props } = vdom;
    // 函数式组件type是一个方法, 返回一个vdom
    const renderVDOM = type(props);
    vdom.oldRenderVDOM = renderVDOM;
    return createDOM(renderVDOM);
}

/**
 * 获取类组件的真实dom
 * @param {*} children 
 * @param {*} parentDOM 
 */
function mountClassConponent(vdom) {
    const { type, props, ref } = vdom;
    // 函数式组件type是一个方法, 返回一个vdom
    const classInstance = new type(props);
    if (ref) {
        ref.current = classInstance;
    }
    const renderVDOM = classInstance.render();
    vdom.oldRenderVDOM = classInstance.oldRenderVDOM = renderVDOM;
    return createDOM(renderVDOM);
}

function mountForwardComponent(vdom) {
    // vdom = { type: ForwardedTextInput, props: {}, ref: this.ref }
    // ForwardedTextInput = { render, $$typeof }
    const { type, props, ref } = vdom;
    const renderVDOM = type.render(props, ref);
    vdom.oldRenderVDOM = renderVDOM;
    return createDOM(renderVDOM);
}

/**
 * 渲染子元素
 * @param {*} children 
 * @param {*} parentDOM 
 */
function reconcileChildren(children, parentDOM) {
    children.forEach((child, index) => {
        mount(child, parentDOM);
    })
}

/**
 * 更新真实dom属性
 */
function updateProps(dom, oldProps = {}, newProps = {}) {
    for (const key in newProps) {
        if (key === 'children') {
            continue;
        } else if (key === 'style') {
            const styles = newProps[key];
            for (const attr in styles) {
                dom.style[attr] = styles[attr];
            }
        } else if (/^on[A-Z].*/.test(key)) {
            addEvent(dom, key.toLowerCase(), newProps[key]);
        } else {
            dom[key] = newProps[key];
        }
    }
    // 新属性上没有, 老属性上有, 说明需要删除这个属性
    for (const key in oldProps) {
        if (!Object.hasOwnProperty.call(newProps, key)) {
            dom[key] = null;
        }
    }
}

const ReactDOM = {
    render
};

export default ReactDOM;