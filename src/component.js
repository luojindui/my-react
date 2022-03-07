import { compareTwoVDOM, findDOM } from "./react-dom";
import { isFunction } from "./utils";

export class Component {

    static isReactComponent = true;

    constructor(props) {
        this.props = props;
        this.state = {};
        this.updater = new Updater(this);
    }

    setState(partialState, callback) {
        console.log('setState');
        this.updater.addState(partialState, callback);
    }

    // 强制更新
    forceUpdate() {
        // 老的vdom
        const oldRenderVDOM = this.oldRenderVDOM;
        // 获取真实dom
        const oldDOM = findDOM(oldRenderVDOM);
        // render获取新的vdom
        const newRenderVDOM = this.render();
        // 对比新老vdom的差异并更新
        compareTwoVDOM(oldDOM.parentNode, oldRenderVDOM, newRenderVDOM);
        this.oldRenderVDOM = newRenderVDOM;

        if (this.componentWillUpdate) {
            this.componentWillUpdate();
        }

        if (this.componentDidUpdate) {
            this.componentDidUpdate();
        }
    }
}

export let updateQueue = {
    isBatchingUpdate: false, // 是否批量更新
    updaters: new Set(), // 存放 updater 实例
    add(update) {
        updateQueue.updaters.add(update);
    },
    clear() {
        updateQueue.updaters.clear();
    },
    batchUpdate() {
        for (const updater of updateQueue.updaters) {
            updater.updateComponent();
        }
        updateQueue.isBatchingUpdate = false;
        updateQueue.clear();
    },
};
/**
 * 更新器 用于更新state
 * 在React能管理到的方法内更新是异步的, 管理不到的地方是同步的 如setTimeout.
 */
class Updater {
    constructor(classInstance) {
        // 类组件的实例
        this.classInstance = classInstance;
        // 等待更新队列
        this.pendingStates = []; // 可能一次性有多次更新
        // state 回调
        this.callbacks = [];
        this.nextProps = null;
    }

    addState(partialState, callback) {
        this.pendingStates.push(partialState);
        if (isFunction(callback)) {
            this.callbacks.push(callback);
        }
        this.emitUpdate(); // 尝试更新
    }

    emitUpdate(nextProps) {
        this.nextProps = nextProps;
        // 如果有新属性或需要同步更新
        if (nextProps || !updateQueue.isBatchingUpdate) {
            this.updateComponent();
        } else {
            // 异步更新
            updateQueue.add(this);
        }
    }

    getState() {
        const { classInstance, pendingStates } = this;
        let { state } = classInstance; // 当前state
        if (pendingStates.length) {
            pendingStates.forEach((nextState) => {
                if (isFunction(nextState)) {
                    // 函数
                    state = { ...state, ...nextState(state) };
                } else {
                    // 对象
                    state = { ...state, ...nextState };
                }
            })
        }
        pendingStates.length = 0;
        return state;
    }

    updateComponent() {
        const { classInstance, pendingStates, callbacks, nextProps } = this;
        if (nextProps || pendingStates.length > 0) {
            shouldUpdate(classInstance, nextProps, this.getState());
        }
        if (callbacks.length) {
            callbacks.forEach((callback) => callback());
            callbacks.length = 0;
        }
    }
}

// 判断是否需要更新
function shouldUpdate(classInstance, nextProps, nextState) {
    // 不管是否更新, props和state都会改变
    classInstance.props = nextProps;
    classInstance.state = nextState;
    if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
        // 不更新
        return false;
    }
    classInstance.forceUpdate();
}
