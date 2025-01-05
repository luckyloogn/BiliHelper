/**
 * @file ui_operations.js
 * @brief 该文件包含一些针对B站的UI控件的公共操作函数 
 *        这些函数用于与B站的界面元素进行交互, 例如点击按钮、滑动列表等
 */

/**
 * 等待一段时间看是否进入用户主页
 * 
 * @param {void} 
 * @returns {boolean} 已进入用户主页返回true, 否则返回false（注销用户会返回false）
 */
function waitForUserHomePage() {
    let icon = id("space_live_avatar_view").findOne(random(800, 1300)); // 检查主页头像
    if (icon === null) {
        return false;
    }
    return true;
}

/**
 * 点击主页第一个视频
 * 
 * @param {void} 
 * @returns {boolean} 成功点击true, 否则返回false（用户没有投稿视频等）
 */
function clickFirstVideoInUserHome() {
    let btn = id("tab_title").className("android.widget.TextView").text("投稿").findOne(random(800, 1300));
    if (btn === null) {
        // 该用户投稿过图文或视频
        console.log("该用户投稿过图文或视频");
        return false;
    }

    // btn.click(); // 默认就是在投稿选项卡, 不需要再次点击
    // console.log("进入投稿页面");

    // let btnFirstVideo = className("android.widget.RelativeLayout").clickable(true).findOne(random(800, 1300))
    let textFirstVideoDuration = id("duration").findOne(random(800, 1300)); // 通过找视频时长定位视频
    if (textFirstVideoDuration === null) {
        console.log("该用户只投稿过图文, 跳过");
        return false;
    }
    let btnFirstVideo = textFirstVideoDuration.parent();
    // console.log("点击第一个视频");
    btnFirstVideo.click();
    id("avatar").waitFor(); // 检测视频播放器也用户头像, 等待进入视频详情页面

    return true;
}

/**
 * 在视频播放页面点击点赞按钮
 * 
 * @param {void} 
 * @returns {boolean} 第一次给当前视频点赞返回true, 否则返回false
 */
function clickLikeBtnInVideoPlayer() {
    let btnLike = id("frame_like").findOne();

    // 根据点赞按钮下面的文字判断是否已经点赞
    let textLikeDesc = btnLike.child(1).child(0); // 点赞按钮下面的文字
    let oldDesc = textLikeDesc.text();

    btnLike.click(); // 点击点赞按钮

    if (oldDesc === "点赞") {
        return true; // 当时视频以前没点过赞, 第一次点, 返回true
    } else {
        sleep(random(800, 1300)); // 等待一段时间, 否则数字还没切换完
        let newTextLikeDesc = btnLike.child(1).child(0); // 点赞按钮下面的文字
        let newDesc = newTextLikeDesc.text();
        if (newDesc === "点赞") {
            // 刚刚是 取消点赞
            btnLike.click(); // 再次点击点赞按钮
            return false; // 点赞后取消再重新点, 返回falsw
        } else {
            let oldLikeCnt = parseInt(oldDesc, 10);
            let newLikeCnt = parseInt(newDesc, 10);
            if (newLikeCnt < oldLikeCnt) {
                // 刚刚是 取消点赞
                btnLike.click(); // 再次点击点赞按钮, 以前点过, 返回false
                return false;
            }
            return true; // 是第一次点赞, 返回true
        }
    }
}

/**
 * 在视频播放器页面提取粉丝数
 * 
 * @param {void} 
 * @returns {Number} 返回粉丝数
 */
function getFansNumInVideoPlayer() {
    let fansText = id("fans").findOne().text();
    let numStr = fansText.replace("粉丝", ""); // 去掉 "粉丝" 字样
    let fansNum = 0;
    // 判断是否包含 "万" 字符
    if (numStr.includes("万")) {
        numStr = numStr.replace("万", ""); // 去掉 "万", 保留前面的数字部分
        let num = parseFloat(numStr); // 转换为浮点数
        fansNum = Math.round(num * 10000); // 乘以 10000 转换为整数
    } else {
        fansNum = parseInt(numStr, 10);
    }

    if (isNaN(fansNum)) {
        fansNum = 0;
    }
    return fansNum;
}

/**
 * 在视频页发送评论, 随机从评论库中选择一条
 * 
 * @param {string[]} commentLibrary - 包含多个评论内容的字符串数组
 * @returns {boolean} 是否成功评论
 */
function sendCommentInVideoPlayer(commentLibrary) {
    if (text("UP主已关闭评论区").exists()) {
        console.log("UP主已关闭评论区");
        return false;
    }

    let idx = random(0, commentLibrary.length - 1);
    let comment = commentLibrary[idx];
    if (commentLibrary.length === 1 && comment === '') {
        console.log("评论库为空");
        return false;
    }
    if (comment === '') {
        console.log("随机选择的评论为空");
        return false;
    }

    // 点击评论输入框
    let inputComment = id("input").findOne(random(800, 1300));
    if (inputComment === null) {
        console.log("未找到评论输入框");
        return false;
    }

    if (inputComment.text() === "关注UP主7天以上的人可发评论") {
        console.log("关注UP主7天以上的人可发评论");
        return false;
    }

    if (inputComment.text() === "仅UP关注的人可发评论") {
        console.log("仅UP关注的人可发评论");
        return false;
    }

    inputComment.click();

    sleep(random(800, 1300));

    // 设置文本
    setText(comment);
    sleep(random(800, 1300));

    // 点击 发布 按钮
    let btnSend = text("发布").findOne(random(800, 1300)).parent();
    if (btnSend === null) {
        console.log("未找到“发布”按钮");
        return false;
    }

    if (!btnSend.click()) {
        console.log("“发布”按钮点击失败");
        return false;
    }
    sleep(random(800, 1300));

    // 检查是否评论过多, 弹出验证码对话框
    if (text("输入验证码").exists()) {
        console.log("评论过多, 触发验证码");
        let btnCancel = id("cancel").findOne(random(800, 1300));
        if (btnCancel === null) {
            console.log("未找到“取消”按钮");
            back();
        } else {
            console.log("点击“取消”按钮");
            btnCancel.click()
        }
        return false;
    }
    return true;
}

/**
 * 在视频播放器页面切换到“评论”选项卡
 * 
 * @param {void} 
 * @returns {boolean} 是否成功
 */
function switchToCommentTabInVideoPlayer() {
    let btnComment = id("container").findOne(random(800, 1300)); // 找“评论”文本
    if (btnComment === null) {
        console.log("未找到“评论”按钮");
        return false;
    }

    btnComment = btnComment.parent();
    if (btnComment === null) {
        console.log("未找到“评论”按钮");
        return false;
    }

    // console.log("找到“评论”按钮")
    if (!btnComment.clickable()) {
        console.log("已在“评论”页面");
        return true;
    }

    return btnComment.click();
}

module.exports = {
    waitForUserHomePage,
    clickFirstVideoInUserHome,
    clickLikeBtnInVideoPlayer,
    getFansNumInVideoPlayer,
    sendCommentInVideoPlayer,
    switchToCommentTabInVideoPlayer,
}
