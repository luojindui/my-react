import { MOVE, PLACEMENT, REACT_FORWARD_REF_TYPE, REACT_TEXT } from "./constants";
import { addEvent } from "./event";

function render(vdom, container) {
    console.log(vdom)
    mount(vdom, container);
}

function mount(vdom, container) {
    const newDOM = createDOM(vdom);
    if (newDOM) {
        container.appendChild(newDOM);
        // 执行 did mount
        if (newDOM.componentDidMount) {
            newDOM.componentDidMount();
        }
    }
}

/**
 * vdom => 真实dom
 * @param {*} vdom 
 */
function createDOM(vdom) {
    if (!vdom) {return null}
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
            children.mountIndex = 0
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
        // 类组件要从组件实例获取 oldRenderVDOM
        const oldRenderVDOM = vdom.classInstance ? vdom.classInstance.oldRenderVDOM : vdom.oldRenderVDOM
        return findDOM(oldRenderVDOM);
    }
}

/**
 * 进行dom diff
 * @param {*} parentDOM 
 * @param {*} oldRenderVDOM 
 * @param {*} newRenderVDOM 
 */
export function compareTwoVDOM(parentDOM, oldVDOM, newVDOM, nextDOM) {
    if (!oldVDOM && !newVDOM) {
        // 都为null
        return
    } else if (oldVDOM && !newVDOM) {
        // 新的为null, 需要删除
        unMountVDOM(oldVDOM);
    } else if (!oldVDOM && newVDOM) {
        const newDOM = createDOM(newVDOM);
        if (nextDOM) {
            parentDOM.insertBefore(newDOM, nextDOM);
        } else {
            parentDOM.appendChild(newDOM);
        }
        if (newDOM.componentDidMount) {
            newDOM.componentDidMount()
        }
    } else if (oldVDOM && newVDOM && oldVDOM.type !== newVDOM.type) {
        unMountVDOM(oldVDOM);
        const newDOM = createDOM(newVDOM);
        if (nextDOM) {
            parentDOM.insertBefore(newDOM, nextDOM);
        } else {
            parentDOM.appendChild(newDOM);
        }
        if (newDOM.componentDidMount) {
            newDOM.componentDidMount()
        }
    } else {
        // 可以复用, 走比较逻辑
        updateElement(oldVDOM, newVDOM)
    }
}

/**
 * 比较新老 vdom
 * @param {*} oldVDOM 
 * @param {*} newVDOM 
 */
function updateElement(oldVDOM, newVDOM) {
    if (oldVDOM.type === REACT_TEXT) {
        // 更新文字节点 TODO
        const currentDOM = newVDOM.dom = findDOM(oldVDOM);
        if (newVDOM.props.content !== oldVDOM.props.content) {
            currentDOM.textContent = newVDOM.props.content;
        }
    } else if (typeof oldVDOM.type === 'string') {
        // 原生dom
        const currentDOM = newVDOM.dom = findDOM(oldVDOM);
        updateProps(currentDOM, oldVDOM.props, newVDOM.props);
        updateChildren(currentDOM, oldVDOM.props.children, newVDOM.props.children);
    } else if (typeof oldVDOM.type === 'function') {
        if (oldVDOM.type.isReactComponent) {
            // 类组件  新的 vdom 复用老组件的实例
            updateClassComponent(oldVDOM, newVDOM);
        } else {
            updateFunctionComponent(oldVDOM, newVDOM);
        }
    }
}

/**
 * 更新函数组件
 * @param {*} oldVDOM 
 * @param {*} newVDOM 
 */
function updateFunctionComponent(oldVDOM, newVDOM) {
    const currentDOM = findDOM(oldVDOM);
    if (!currentDOM) {return;}
    const parentDOM = currentDOM.parentNode;
    const { type, props } = newVDOM;
    // 新的vdom
    const newRenderVDOM = type(props);
    // 对比更新 新老的vdom
    compareTwoVDOM(parentDOM, oldVDOM.oldRenderVDOM, newRenderVDOM);
    newVDOM.oldRenderVDOM = newRenderVDOM;
}

/**
 * 更新类组件
 * @param {*} oldVDOM 
 * @param {*} newVDOM 
 */
function updateClassComponent(oldVDOM, newVDOM) {
    const classInstance = newVDOM.classInstance = oldVDOM.classInstance
    if (classInstance.componentWillReceiveProps) {
        classInstance.componentWillReceiveProps(newVDOM.props)
    }
    classInstance.updater.emitUpdate(newVDOM.props)
}

/**
 * 更新 children
 * @param {*} parentDOM  父dom节点
 * @param {*} oldVChildren  老 vdom
 * @param {*} newVChildren  新 vdom
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
    oldVChildren = (Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren]).filter(item => item);
    newVChildren = (Array.isArray(newVChildren) ? newVChildren : [newVChildren]).filter(item => item);
    let keyedOldMap = {};
    let lastPlacedIndex = 0;
    // 创建 old key map => { key: vdom }
    oldVChildren.forEach((oldVChild, index) => {
        keyedOldMap[oldVChild.key || index] = oldVChild;
    })
    // 构建补丁包
    let patch = [], moveChild = [];
    newVChildren.forEach((newVChild, index) => {
        const newKey = newVChild.key || index;
        const oldVChild = keyedOldMap[newKey];
        if (oldVChild) {
            updateElement(oldVChild, newVChild);
            if (oldVChild.mountIndex < lastPlacedIndex) {
                patch.push({
                    type: MOVE,
                    oldVChild,
                    newVChild,
                    mountIndex: index,
                });
                moveChild.push(oldVChild)
            }
            // 已经复用过了， 不能再复用了， delete掉
            delete keyedOldMap[newKey];
            lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex);
        } else {
            patch.push({
                type: PLACEMENT,
                newVChild,
                mountIndex: index,
            });
        }
    })
    // 获取需要移动的老节点
    // 1.先把需要移动和没有复用到的节点全部删除
    Object.values(keyedOldMap).concat(moveChild).forEach((oldVChild) => {
        const currentDOM = findDOM(oldVChild);
        parentDOM.removeChild(currentDOM);
    })
    // 2.再把补丁包应用
    patch.forEach(({ type, oldVChild, newVChild, mountIndex }) => {
        const childNodes = parentDOM.childNodes; // 当前层级内的节点
        let currentDOM;
        if (type === PLACEMENT) {
            // 插入
            currentDOM = createDOM(newVChild);

        } else if (type === MOVE) {
            currentDOM = findDOM(oldVChild);
        }
        let childNode = childNodes[mountIndex];
        if (childNode) {
            parentDOM.insertBefore(currentDOM, childNode);
        } else {
            parentDOM.appendChild(currentDOM);
        }
    })
}

/**
 * 删除dom
 * @param {*} vdom 
 */
function unMountVDOM(vdom) {
    const { /* type,  */props, ref } = vdom;
    const currentDOM = findDOM(vdom);
    if (vdom.classInstance && vdom.classInstance.componentWillUnmount) {
        // 组件卸载
        vdom.classInstance.componentWillUnmount();
    }
    if (ref) {
        ref.current = null;
    }
    // 递归删除子节点
    if (props.children) {
        let children = Array.isArray(props.children) ? props.children : [props.children];
        children.forEach(child => unMountVDOM(child))
    }
    if (currentDOM) {
        currentDOM.parentNode.removeChild(currentDOM);
    }
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
    vdom.classInstance = classInstance;
    if (ref) {
        ref.current = classInstance;
    }
    if (classInstance.componentWillMount) {
        classInstance.componentWillMount()
    }
    const renderVDOM = classInstance.render();
    vdom.oldRenderVDOM = classInstance.oldRenderVDOM = renderVDOM;
    const dom = createDOM(renderVDOM);
    if (classInstance.componentDidMount) {
        dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
    }
    return dom;
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
        child.mountIndex = index;
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