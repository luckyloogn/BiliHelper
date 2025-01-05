/**
 * @file seek_help.js
 * @brief 找人互助在激励计划页面找视频点赞并发送互助评论
 */

// let uiOps = require(files.path("../common/ui_operations.js"));
// let utils = require(files.path("../common/utils.js"));

let uiOps = require("../common/ui_operations.js");
let utils = require("../common/utils.js");

/**
 * 检查是否准备完毕, 是否在创作激励计划页面
 * 
 * @returns {boolean} 如果准备完毕返回 true, 否则返回 false
 */
function isReady() {
    return hasInIncentivePlanPage();
}

/**
 * 开始给粉丝点赞并在必要时发送评论
 * 
 * @param {string[]} commentLibrary - 包含多个评论内容的字符串数组, 用于随机选择评论
 * @param {number} minFansForComment - 指定当粉丝数小于该值时, 才发送评论传入 0 则表示始终不发送评论
 * @returns {void}
 */
function start(commentLibrary, minFansForComment) {
    if (switchToNewestTab()) {
        console.log("切换到“最新”页面");
    } else {
        console.log("已在“最新”页面");
    }
    sleep(random(800, 1300)); // 等待一段时间
    console.log("开始找人互助");

    let processedVideos = new utils.LimitedQueue(10);

    while (true) {
        let videoNameList = id("dy_video_title").find();
        console.log("当前找到 %d 个视频", videoNameList.length);

        for (let i = 0; i < videoNameList.length; i++) {
            let curVideoName = videoNameList[i].text();

            let curVideoNameParent = videoNameList[i].parent()
            if (curVideoNameParent === null) {
                console.log("找不到 %s 的父控件", curVideoName);
                continue;
            }
            let btnCurVideo = curVideoNameParent.parent();
            if (btnCurVideo === null) {
                console.log("找不到 %s 的父控件的父控件", curVideoName);
                continue;
            }

            if (processedVideos.has(curVideoName)) {
                console.log("视频 %s 已处理过, 跳过", curVideoName);
                continue;
            }
            processedVideos.add(curVideoName);

            console.log("正在进入视频 %s", curVideoName);
            btnCurVideo.click();

            sleep(random(800, 1300));  // 等待一段时间

            if (text("视频不见了哦").exists()) {
                console.log("视频 %s 已被删除", curVideoName);
                backToIncentivePlanPageFromVideoPlayer();
                sleep(random(800, 1300));
                continue;
            }

            if (uiOps.clickLikeBtnInVideoPlayer()) {
                // 第一次点赞 才触发评论
                sleep(random(800, 1300));

                // 不要大up发“互赞评论”, 避免尴尬
                if (uiOps.getFansNumInVideoPlayer() < minFansForComment) {
                    uiOps.switchToCommentTabInVideoPlayer();
                    sleep(random(800, 1300));

                    uiOps.sendCommentInVideoPlayer(commentLibrary);
                    sleep(random(1000, 1500));
                } else {
                    console.log("此up粉丝超过阈值, 跳过")
                }
            } else {
                sleep(random(800, 1300));
            }

            backToIncentivePlanPageFromVideoPlayer();
            sleep(random(800, 1300));  // 等待一段时间
        }

        if (!scrollVideoListInIncentivePlanPage()) {
            console.log("到达视频列表底部");
            break;
        }
        sleep(random(800, 1300));  // 等待一段时间
    }
}

/**
 * 停止找人互助
 * 
 * @param {void} 
 * @returns {void} 
 */
function stop() {
    console.log("停止找人互助");
}

/**
 * 检查是否在创作激励计划页面
 * 
 * @param {void} 
 * @returns {boolean} 是返回true, 否则返回false
 */
function hasInIncentivePlanPage() {
    return id("floatBtn").exists(); // 检测激励页面右下角“参加话题”按钮是否存在
}

/**
 * 在创作激励计划页面切换到最新Tab
 * 
 * @param {void} 
 * @returns {boolean} 是返回true, 否则返回false
 */
function switchToNewestTab() {
    let btn = text("最新").findOne().parent();
    if (btn.clickable()) {
        btn.click();
        return true
    }
    return false
}

/**
 * 从视频播放页面返回激励计划页面
 * 
 * @param {void} 
 * @returns {boolean} 是否成功点击
 */
function backToIncentivePlanPageFromVideoPlayer() {
    back();
    id("floatBtn").waitFor();  // 等待激励页面右下角“参加话题”按钮
}

/**
 * 激励计划页面视频列表翻页
 * 
 * @param {void} 
 * @returns {boolean} 滑倒底返回false
 */
function scrollVideoListInIncentivePlanPage() {
    return id("dy_list").findOne().scrollForward();
}

module.exports = {
    isReady,
    start,
    stop
};
