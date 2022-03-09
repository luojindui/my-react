import { updateQueue } from './component'
import { isFunction } from './utils';

/**
 * react中的事件绑定不是直接绑定在目标dom上的，是绑定在document上，类似事件委托.
 * 为了防止浏览器事件绑定的差异
 * 实现事件复用
 * 为了实现批量更新 setState，两个setState合成一次更新
 * @param {*} dom dom节点
 * @param {*} eventType 事件类型 click
 * @param {*} listener 事件处理函数
 */
export function addEvent(dom, eventType, handler) {
    eventType = eventType.toLowerCase();
    // 存放监听函数
    let store = dom._store || (dom._store = {});
    store[eventType] = handler;
    if (!document[eventType]) {
        // 给document绑定一个事件触发的函数
        document[eventType] = dispatchEvent;
    }
    // document.addEventListener('click', dispatchEvent)
    // 捕获, 冒泡
    // document.addEventListener(eventType.slice(2), dispatchEvent, false);
}

/**
 * document 绑定的事件处理函数
 */
function dispatchEvent(nativeEvent) {
    let { type, target } = nativeEvent;
    const eventType = 'on' + type;
    const syntheticEvent = createSyntheticEvent(nativeEvent);

    // 事件函数内可能会引起多次的组件更新, 所以在事件监听函数执行前进入批量更新模式
    updateQueue.isBatchingUpdate = true;

    // 模仿事件冒泡
    while (target) {
        const { _store: store } = target;
        // 当前节点上缓存的监听函数
        const handler = store && store[eventType];
        if (handler) {
            handler(syntheticEvent);
        }
        // 阻止冒泡
        if (syntheticEvent.isPropgationStopped) {
            break;
        }
        target = target.parentNode;
    }
    // 清理syntheticEvent
    for (const key in syntheticEvent) {
        syntheticEvent[key] = null;
    }

    // 事件函数处理完成后, 更新更新队列内的脏组件.
    updateQueue.isBatchingUpdate = false;
    updateQueue.batchUpdate();
}

function createSyntheticEvent(nativeEvent) {
    let syntheticEvent = {};
    for (const key in nativeEvent) {
        if (nativeEvent.hasOwnProperty(key)) {
            const element = nativeEvent[key];
            if (isFunction(element)) {
                syntheticEvent[key] = element.bind(nativeEvent);
            } else {
                syntheticEvent[key] = element;
            }
        }
    }
    
    syntheticEvent.nativeEvent = nativeEvent;
    syntheticEvent.isPropgationStopped = false;
    syntheticEvent.stopPropogation = stopPropogation;
    syntheticEvent.defaultPrevented = false;
    syntheticEvent.stopPropogation = preventDefault;
    return syntheticEvent;
}

function stopPropogation() {
    const event = this.nativeEvent;
    if (event.stopPropogation) {
        event.stopPropogation();
    } else {
        // IE
        event.cancelBubble = true;
    }
    this.isPropgationStopped = true;
}


function preventDefault() {
    const event = this.nativeEvent;
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        // IE
        event.returnValue = false;
    }
    this.defaultPrevented = true;
}