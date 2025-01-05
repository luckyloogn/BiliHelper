/**
 * @file utils.js
 * @brief 包含一些实用工具函数, 包括时间格式化和有限大小队列的实现
 */

/**
 * 将给定的秒数转换为 hh:mm:ss 格式的字符串
 * @param {number} seconds - 需要转换的时间（秒数）
 * @returns {string} 格式化后的时间字符串, 格式为 "hh:mm:ss"
 */
function formatTime(seconds) {
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;

    // 添加前导零, 使其始终显示为两位数
    hrs = String(hrs).padStart(2, '0');
    mins = String(mins).padStart(2, '0');
    secs = String(secs).padStart(2, '0');

    return `${hrs}:${mins}:${secs}`;
}

/**
 * 保存某项设置到本地
 * 
 * @param {string} key - 设置项的键值, 用于标识该设置
 * @param {any} value - 需要保存的值
 */
function saveSetting(key, value) {
    let settingStorages = storages.create("Settings");
    settingStorages.put(key, value);
}

/**
 * 获取指定设置项的值
 * 
 * @param {string} key - 设置项的键值, 用于获取对应的设置值
 * @param {any} defaultValue - 默认值
 * @returns {any} - 返回保存的设置值, 如果设置项不存在, 则返回 defaultValue
 */
function getSetting(key, defaultValue) {
    let settingStorages = storages.create("Settings");
    return settingStorages.get(key, defaultValue);
}

/**
 * 构造函数：LimitedQueue
 * 一个具有有限大小的队列队列使用 `Set` 来跟踪已添加的元素, 确保没有重复的元素
 * 当队列达到最大容量时, 最早加入的元素将被移除
 * 
 * @param {number} maxSize - 队列的最大容量
 */
function LimitedQueue(maxSize) {
    this.queue = [];   // 用于存储队列元素的数组, 遵循先进先出的规则
    this.set = new Set();   // 使用 Set 来跟踪队列中的唯一元素, 确保没有重复
    this.maxSize = maxSize; // 队列的最大容量
}

/**
 * 向队列中添加一个新元素
 * 如果该元素已经存在于队列中, 则不执行任何操作
 * 如果队列已满, 则删除队列中最旧的元素
 * 
 * @param {any} item - 要添加到队列中的元素
 */
LimitedQueue.prototype.add = function (item) {
    // 如果元素已经存在于队列中, 则直接返回, 不做任何处理
    if (this.set.has(item)) {
        return;
    }

    // 如果队列已达到最大容量, 移除最旧的元素
    if (this.queue.length >= this.maxSize) {
        let oldestVideo = this.queue.shift();  // 移除队列中的第一个元素
        this.set.delete(oldestVideo);  // 从 Set 中删除该元素
    }

    // 将新元素添加到队列的末尾, 并在 Set 中记录该元素
    this.queue.push(item);
    this.set.add(item);
};

/**
 * 检查队列中是否存在指定的元素
 * 
 * @param {any} item - 要检查的元素
 * @returns {boolean} - 如果元素在队列中返回 true, 否则返回 false
 */
LimitedQueue.prototype.has = function (item) {
    return this.set.has(item);  // 检查 Set 中是否存在该元素
};

/**
 * 查询当前队列中的元素个数
 * 
 * @returns {number} - 队列中的元素个数
 */
LimitedQueue.prototype.size = function () {
    return this.queue.length;  // 返回队列数组的长度
};

/**
 * 弹出队列中最后一个加入的元素
 * 
 * @returns {any} - 被弹出的元素如果队列为空则返回 undefined
 */
LimitedQueue.prototype.popLast = function () {
    if (this.queue.length === 0) {
        return undefined;  // 队列为空时返回 undefined
    }

    const lastItem = this.queue.pop();  // 弹出数组中的最后一个元素
    this.set.delete(lastItem);  // 从 Set 中删除该元素
    return lastItem;  // 返回被弹出的元素
};

/**
 * 检查队列是否为空
 * 
 * @returns {boolean} - 如果队列为空返回 true, 否则返回 false
 */
LimitedQueue.prototype.isEmpty = function () {
    return this.queue.length === 0;  // 如果队列长度为0, 返回 true
};

module.exports = {
    formatTime,
    saveSetting,
    getSetting,
    LimitedQueue
};
