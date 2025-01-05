/**
 * @file like_fans_video.js
 * @brief 给粉丝点赞
 */

// let uiOps = require(files.path("../common/ui_operations.js"));
// let utils = require(files.path("../common/utils.js"));

let uiOps = require("../common/ui_operations.js");
let utils = require("../common/utils.js");

let threadScrollToBottom = null;

/**
 * 检查是否准备完毕, 是否在粉丝页面
 * 
 * @returns {boolean} 如果准备完毕返回 true, 否则返回 false
 */
function isReady() {
    return hasInFansPage();
}

/**
 * 开始给粉丝点赞并在必要时发送评论
 * 
 * @param {string[]} commentLibrary - 包含多个评论内容的字符串数组, 用于随机选择评论
 * @param {number} minFansForComment - 指定当粉丝数小于该值时, 才发送评论传入 0 则表示始终不发送评论
 * @returns {void}
 */
function start(commentLibrary, minFansForComment) {
    console.log("开始给粉丝点赞");

    let processedFans = new utils.LimitedQueue(200);

    // 先翻到粉丝列表底部, 加载所有粉丝的View
    threadScrollToBottom = threads.start(scrollToFansListBottom);
    threadScrollToBottom.join(); //等待该线程完成

    sleep(random(800, 1300));

    let rightBtnList = className("android.widget.Button").find(); // 找右边的“已互粉/回关”按钮
    rightBtnList = rightBtnList.reverse(); // 因为先翻到底部, 所以从底部开始, 翻转列表
    console.log("当前找到 %d 个粉丝", rightBtnList.length);

    for (let i = 0; i < rightBtnList.length; i++) {
        if (i > 0 && i % 8 === 0) {
            console.log("往上翻");
            scrollFansList();
            sleep(random(800, 1300));
        }

        // 通过右边的“已互粉/回关”按钮找到能够点击的容器
        let btnCurUser = rightBtnList[i].parent();
        if (btnCurUser === null) {
            continue;
        }

        btnCurUser = btnCurUser.parent();
        if (btnCurUser === null) {
            continue;
        }

        btnCurUser = btnCurUser.parent();
        if (btnCurUser === null) {
            continue;
        }

        btnCurUser = btnCurUser.child(2);
        if (btnCurUser === null) {
            continue;
        }

        btnCurUser = btnCurUser.child(0);
        if (btnCurUser === null) {
            continue;
        }

        let textCurUserName = btnCurUser.child(0);
        if (textCurUserName === null) {
            continue;
        }

        let curUserName = textCurUserName.text();

        // 检查是否已经处理过该视频
        if (processedFans.has(curUserName)) {
            console.log("粉丝 %s 已处理过, 跳过", curUserName);
            continue;
        }
        // 将视频加入到处理队列
        processedFans.add(curUserName);

        console.log("正在进入粉丝 %s 的主页", curUserName);
        btnCurUser.click();

        if (!uiOps.waitForUserHomePage()) { // 等待进入用户主页
            console.log("进入粉丝 %s 的主页失败", curUserName);
            sleep(random(800, 1300));
            backToFanPageFromUserHomePage();
            sleep(random(800, 1300));
            continue;
        }

        sleep(random(800, 1300));
        if (!uiOps.clickFirstVideoInUserHome()) {
            console.log("粉丝 %s 的没有投稿过视频", curUserName);
            sleep(random(800, 1300));
            backToFanPageFromUserHomePage();
            sleep(random(800, 1300));
            continue;
        }

        sleep(random(800, 1300));
        if (uiOps.clickLikeBtnInVideoPlayer()) {  // 第一次点赞 才触发评论
            // 不要大up给发“互赞评论”, 避免尴尬
            if (uiOps.getFansNumInVideoPlayer() < minFansForComment) {
                sleep(random(800, 1300));
                uiOps.switchToCommentTabInVideoPlayer();

                sleep(random(800, 1300));
                uiOps.sendCommentInVideoPlayer(commentLibrary);
            } else {
                console.log("此up粉丝超过阈值, 跳过")
            }
        }

        sleep(random(1000, 1500));
        backToFansPageFromVideoPlayer();

        sleep(random(800, 1300)); // 等待一段时间
    }
}

/**
 * 结束给粉丝点赞
 * 
 * @returns {void}
 */
function stop() {
    if (threadScrollToBottom && threadScrollToBottom.isAlive()) {
        threadScrollToBottom.interrupt();
    }
    console.log("结束给粉丝点赞");
}

/**
 * 检查是否在“我的好友-粉丝”页面
 * 
 * @param {void} 
 * @returns {boolean} 是返回true, 否则返回false
 */
function hasInFansPage() {
    return id("tv_toolbar_title").text("我的好友").exists(); // 检测顶部“我的好友”是否存在
}

/**
 * “我的好友-粉丝”页面翻到列表底部, 加载所有粉丝view
 * 
 * @param {void} 
 * @returns {void} 
 */
function scrollToFansListBottom() {
    console.log("开始查找粉丝列表底部")
    // 不是List控件, 不能使用scrollForward()
    while (true) {
        let width = device.width;   // 获取屏幕宽度
        let height = device.height; // 获取屏幕高度
        let x1 = width / 2 + random(50, 150);              // 滑动的起始坐标的x值
        let y1 = height * 0.8 + random(10, 50);            // 滑动的起始坐标的y值
        let x2 = width / 2 + random(50, 150);              // 滑动的结束坐标的x值
        let y2 = height * 0.3 + random(10, 50);            // 滑动的结束坐标的y值
        let duration = 500 + random(50, 100);              // 滑动时长, 单位毫秒

        swipe(x1, y1, x2, y2, duration);                   // 从屏幕底部向上滑动

        if (className("android.widget.TextView").text("不能再往下滑了~").exists()) {
            swipe(x1, y1, x2, y2, duration);
            console.log("已翻到粉丝列表底部")
            break;
        }
    }
}

/**
 * 从用户主页返回“我的好友-粉丝”列表
 * 
 * @param {void} 
 * @returns {boolean} 是否成功点击
 */
function backToFanPageFromUserHomePage() {
    back()
    id("tv_toolbar_title").text("我的好友").waitFor();
}

/**
 * 从视频播放页面返回“我的好友-粉丝”页面
 * 
 * @param {void} 
 * @returns {boolean} 是否成功点击
 */
function backToFansPageFromVideoPlayer() {
    back();
    id("space_live_avatar_view").waitFor(); // 检查主页头像
    back();
    id("tv_toolbar_title").text("我的好友").waitFor(); // 等待顶部“我的好友”出现
}

/**
 * “我的好友-粉丝”页面列表向上翻页
 * 
 * @param {void} 
 * @returns {boolean} 滑到顶部返回false
 */
function scrollFansList() {
    let view = className("android.view.View").scrollable(true).findOne(random(800, 1300));
    if (view === null) {
        return false;
    }
    return view.scrollBackward();
}

module.exports = {
    isReady,
    start,
    stop
};
