/**
 * @file seek_help.js
 * @brief 给给您的视频点赞的用户回赞
 */

// let uiOps = require(files.path("../common/ui_operations.js"));
// let utils = require(files.path("../common/utils.js"));

let uiOps = require("../common/ui_operations.js");
let utils = require("../common/utils.js");

/**
 * 检查是否准备完毕, 是否打开点赞列表
 * 
 * @returns {boolean} 如果准备完毕返回 true, 否则返回 false
 */
function isReady() {
    return hasOpenedLikeList();
}

/**
 * 开始给粉丝点赞并在必要时发送评论
 * 
 * @param {string[]} commentLibrary - 包含多个评论内容的字符串数组, 用于随机选择评论
 * @param {number} minFansForComment - 指定当粉丝数小于该值时, 才发送评论传入 0 则表示始终不发送评论
 * @returns {void}
 */
function start(commentLibrary, minFansForComment) {
    console.log("开始回赞");

    let processedUsers = new utils.LimitedQueue(10);

    while (true) {
        // 找出所有点赞的人
        let likedUserList = id("subtitle").find(); // 通过用户名下面的文字（为您点赞/为您投币）找, 这个不会误找到其他
        console.log("当前找到 %d 个用户给您的视频点赞", likedUserList.length);
        for (let i = 0; i < likedUserList.length; i++) {
            let btnCurUser = likedUserList[i].parent();
            if (btnCurUser === null) {
                continue;
            }

            let textCurUser = btnCurUser.child(1);
            if (textCurUser === null) {
                continue;
            }

            let curUserName = textCurUser.text();

            if (processedUsers.has(curUserName)) {
                console.log("用户 %s 已处理过, 跳过", curUserName);
                continue;
            }
            processedUsers.add(curUserName);

            console.log("正在进入 %s 的主页", curUserName);
            btnCurUser.click();

            if (!uiOps.waitForUserHomePage()) { // 等待进入用户主页
                console.log("进入粉丝 %s 的主页失败", curUserName);
                sleep(random(800, 1300));
                backToLikeListFromUserHomePage();
                sleep(random(800, 1300));
                continue;
            }

            sleep(random(800, 1300));
            if (!uiOps.clickFirstVideoInUserHome()) {
                console.log("粉丝 %s 的没有投稿过视频", curUserName);
                sleep(random(800, 1300));
                backToLikeListFromUserHomePage();
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
            backToLikeListFromVideoPlayer();

            sleep(random(500, 1000)); // 等待一段时间
        }
        if (!scrollUserInLikeList()) {
            console.log("回赞完成");
            break;
        }
        sleep(random(500, 1000)); // 等待一段时间
    }
}

/**
 * 停止回赞
 * 
 * @param {void} 
 * @returns {void} 
 */
function stop() {
    console.log("停止回赞");
}

/**
 * 检查是否打开点赞列表
 * 
 * @param {void} 
 * @returns {boolean} 打开返回true, 否则返回false
 */
function hasOpenedLikeList() {
    return id("title").className("android.widget.TextView").text("大家都觉得很棒！").exists();
}

/**
 * 从用户主页返回点赞列表
 * 
 * @param {void} 
 * @returns {boolean} 是否成功点击
 */
function backToLikeListFromUserHomePage() {
    back();
    id("title").className("android.widget.TextView").text("大家都觉得很棒！").waitFor(); // 等待返回点赞列表
}

/**
 * 从视频播放页面返回点赞列表
 * 
 * @param {void} 
 * @returns {boolean} 是否成功点击
 */
function backToLikeListFromVideoPlayer() {
    back();
    id("tab_title").className("android.widget.TextView").text("主页").waitFor(); // 等待从视频页面返回主页
    back();
    id("title").className("android.widget.TextView").text("大家都觉得很棒！").waitFor(); // 等待返回点赞列表
}

/**
 * 点赞列表翻页
 * 
 * @param {void} 
 * @returns {boolean} 滑倒底返回false
 */
function scrollUserInLikeList() {
    return id("list").findOne().scrollForward();
}

module.exports = {
    isReady,
    start,
    stop
};
