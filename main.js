/**
 * @file main.js
 * @brief 脚本主入口, 负责管理悬浮窗界面、处理用户输入和执行不同的功能模块
 *        该脚本主要用于自动化社交平台上的点赞、评论等互动操作
 */

/** 导入模块 ----------------------------------------------------- */
importClass(android.view.View);
importClass(android.view.animation.RotateAnimation);
importClass(android.view.animation.Animation);
importClass(android.view.animation.LinearInterpolator);

// let utils = require(files.path("./common/utils.js"));
let utils = require("./common/utils.js");

let appRespondLikes = require("./app/respond_likes.js");
let appSeekHelp = require("./app/seek_help.js");
let appLikeFansVideo = require("./app/like_fans_video.js");

let project = require('./project.json');

/** 全局变量 ----------------------------------------------------- */
let scriptMainThread = null;

// 默认值
let defaultCommentsRespondLikes = ["来了", "up加油, 回[doge]", "[打call], 回[doge]",
    "[星星眼], 回[doge]", "一起成长, 回", "支持, 早日火, 回", "期待新作品, 回[doge]",
    "加油加油, 回[doge]", "支持一下up, 回[doge]", "这就来评论支持up, 回[doge]", "做得好好, 回[doge]",
    "好用心的视频, 回[doge]", "爱看, UP加油, 回[doge]", "热乎的, 回[doge]"];
let defaultCommentsSeekHelp = ["互赞互助[doge]", "来了, 互[doge]", "up加油, 互[doge]", "[打call], 互[doge]",
    "[星星眼], 互[doge]", "互赞互助[doge], 一起成长", "支持, 早日火, 互[doge]", "期待新作品[doge], 互[doge]",
    "加油加油, 互[doge]", "支持一下up, 互[doge]", "这就来评论支持up, 互[doge]", "做得好好, 互[doge]",
    "好用心的视频, 互[doge]", "爱看, UP加油, 互[doge]", "热乎的, 互[doge]"];
let defaultCommentsLikeFansVideo = ["来了", "up加油", "[打call]", "支持, 早日火", "期待新作品",
    "加油加油", "支持一下up", "做得好好", "好用心的视频", "爱看, UP加油", "热乎的"];
let defaultMinFansForComment = 200;
let defaultScriptRunTime = 60 * 60;

let commentsRespondLikes = utils.getSetting("commentsRespondLikes", defaultCommentsRespondLikes);
let commentsSeekHelp = utils.getSetting("commentsSeekHelp", defaultCommentsSeekHelp);
let commentsLikeFansVideo = utils.getSetting("commentsLikeFansVideo", defaultCommentsLikeFansVideo);

let commentsInUse = commentsRespondLikes;

// 指定当粉丝数小于该值时, 才发送评论. 如果给粉丝很多的大up发了“互赞互助”就尴尬了
let minFansForComment = utils.getSetting("minFansForComment", defaultMinFansForComment);
let scriptRunTime = utils.getSetting("scriptRunTime", defaultScriptRunTime); // 运行时间(秒)
let scriptRemainingRunTime = scriptRunTime; // 剩余运行时间(秒)

let curApp = appRespondLikes; // 当前选择的应用

/** 悬浮窗UI ----------------------------------------------------- */
let window = floaty.window(
    <horizontal>
        <card id="fab" w="32" h="32" margin="4 4 2 4" gravity="center"
            cardCornerRadius="8" cardElevation="2"
            foreground="?attr/selectableItemBackgroundBorderless" >
            <img id="fabImgLogo" padding="4" src="file://assets/icons/ic_fab.png" />
            <img id="fabImgRunning" padding="12" src="@drawable/ic_code_black_48dp" tint="#9e9e9e" />
        </card>
        <card id="containerFloatyWindow" margin="2 4 4 4" gravity="center" visibility="gone"
            cardCornerRadius="8" cardElevation="2" cardBackgroundColor="#03A9F5"
            foreground="?attr/selectableItemBackgroundBorderless" >
            <horizontal id="floatyWindow" bg="#ffffff" padding="4">
                <vertical w="auto" gravity="center">
                    <checkbox id="checkboxAutoService" text="无障碍服务" />
                    <spinner id="spAppSelection" entries="自动回赞|找人互助|给粉丝赞" w="auto" textSize="14sp" />

                    <button id="btnStartStop" text="开始运行" w="*" style="Widget.AppCompat.Button.Colored" backgroundTint="#03a9f5" />
                    <button id="btnSettings" text="打开设置" w="*" style="Widget.AppCompat.Button.Colored" backgroundTint="#03a9f5" />
                    <button id="btnResetSettings" text="恢复默认设置" w="*" style="Widget.AppCompat.Button.Colored" backgroundTint="#03a9f5" visibility="gone" />
                    <button id="btnExit" text="退出脚本" w="*" style="Widget.AppCompat.Button.Colored" backgroundTint="#03a9f5" />

                    <View h="1" bg="#9e9e9e" />
                    <text id="textRunStatus" text="等待运行" gravity="center" marginTop="6" />
                    <text id="textRemainingRunTime" visibility="gone" text="00:00:00" gravity="center" />
                </vertical>

                <ScrollView id="containerSettings" visibility="gone" marginLeft="6" h="*">
                    <vertical>
                        <card w="*" h="*" margin="2" cardCornerRadius="2dp" cardElevation="1dp" gravity="center_vertical">
                            <vertical margin="4" h="auto">
                                <text text="脚本运行时间(秒)" textColor="#222222" marginTop="4" textSize="12sp" />
                                <input id="inputScriptRunTime" inputType="number" marginLeft="-4" textColor="#9e9e9e" textSize="12sp" />
                            </vertical>
                        </card>
                        <card w="*" h="*" margin="2" cardCornerRadius="2dp" cardElevation="1dp" gravity="center_vertical">
                            <vertical margin="4" h="auto">
                                <text text="小于此粉丝数发评论(为0不评论)" textColor="#222222" marginTop="4" textSize="12sp" />
                                <input id="inputMinFansForComment" inputType="number" marginLeft="-4" textColor="#9e9e9e" textSize="12sp" />
                            </vertical>
                        </card>
                        <card w="*" h="*" margin="2" cardCornerRadius="2dp" cardElevation="1dp" gravity="center_vertical">
                            <vertical margin="4" h="auto">
                                <text text="评论库(用'；'分隔, 为空不评论)" textColor="#222222" marginTop="4" textSize="12sp" />
                                <input id="inputCommentLibrary" line="3" marginLeft="-4" textColor="#9e9e9e" textSize="12sp" />
                            </vertical>
                        </card>
                        <card id="btnUserGuide" w="*" h="*" margin="2" cardCornerRadius="2dp" cardElevation="1dp" gravity="center_vertical"
                            foreground="?attr/selectableItemBackgroundBorderless">
                            <vertical margin="4" h="auto">
                                <text text="脚本使用指南" textColor="#222222" marginTop="4" textSize="12sp" />
                            </vertical>
                        </card>
                        <card id="btnAbout" w="*" h="*" margin="2" cardCornerRadius="2dp" cardElevation="1dp" gravity="center_vertical"
                            foreground="?attr/selectableItemBackgroundBorderless">
                            <vertical margin="4" h="auto">
                                <text text="关于脚本" textColor="#222222" marginTop="4" textSize="12sp" />
                                <text text="作者: luckyloogn" textColor="#9e9e9e" textSize="12sp" marginTop="4" />
                                <text text="{{'版本: ' + project.versionName}}" textColor="#9e9e9e" textSize="12sp" marginBottom="4" />
                            </vertical>
                        </card>
                    </vertical>
                </ScrollView>
            </horizontal>
        </card>
    </horizontal>
);

/** 旋转动画 ----------------------------------------------------- */
// 从 0 度旋转到 360 度, 围绕中心点旋转
let rotateAnimation = new RotateAnimation(0, 360, Animation.RELATIVE_TO_SELF, 0.5, Animation.RELATIVE_TO_SELF, 0.5);
rotateAnimation.setDuration(1000);  // 设置动画时间, 单位为毫秒 1秒内旋转一圈
rotateAnimation.setRepeatCount(Animation.INFINITE); // 无限循环旋转
rotateAnimation.setFillAfter(true); // 动画结束后保持最后状态
rotateAnimation.setInterpolator(new LinearInterpolator()); // 设置线性插值器, 使旋转速度匀速

/** 悬浮窗UI控件事件 --------------------------------------------- */
// 单击 悬浮 按钮
window.fab.on("click", () => {
    if (window.containerFloatyWindow.getVisibility() === View.GONE) {
        window.containerFloatyWindow.setVisibility(View.VISIBLE);
    } else {
        window.containerFloatyWindow.setVisibility(View.GONE);
    }
});

// 拖动 悬浮 按钮
let x, y;  // 记录按键被按下时的触摸坐标
let winX, winY; // 记录按键被按下时的悬浮窗位置
window.fab.setOnTouchListener(function (view, event) {
    switch (event.getAction()) {
        case event.ACTION_DOWN:
            x = event.getRawX();
            y = event.getRawY();
            winX = window.getX();
            winY = window.getY();
            return false;
        case event.ACTION_MOVE:
            //移动手指时调整悬浮窗位置
            window.setPosition(winX + (event.getRawX() - x), winY + (event.getRawY() - y));
            return false; // 返回 true 时, 点击双击事件不生效, 故返回false
        case event.ACTION_UP:
            // 手指弹起时如果偏移很小则判断没有移动
            // if (Math.abs(event.getRawY() - y) < 5 && Math.abs(event.getRawX() - x) < 5) {
            // }
            return false;
    }
    return true;
});

// 单击 无障碍服务 复选框
window.checkboxAutoService.on('check', (checked) => {
    if (checked && auto.service === null) {
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
    }
    if (!checked && auto.service !== null) {
        stopScriptThread();
        auto.service.disableSelf();
    }
});

// 单击 app选择 下拉菜单
window.spAppSelection.setOnItemSelectedListener({
    onItemSelected: (parent, view, position, id) => {
        let selectedItem = parent.getSelectedItem();
        console.log("当前选择：[%d] %s", position, selectedItem);

        window.btnResetSettings.setText("恢复默认设置");

        if (selectedItem === "自动回赞") {
            curApp = appRespondLikes;
            commentsInUse = commentsRespondLikes;
        } else if (selectedItem === "找人互助") {
            curApp = appSeekHelp;
            commentsInUse = commentsSeekHelp;
        } else if (selectedItem === "给粉丝赞") {
            curApp = appLikeFansVideo;
            commentsInUse = commentsLikeFansVideo;
        }
        window.inputCommentLibrary.setText(commentsInUse.join("；"));
    },
    onNothingSelected: (parent) => {
        console.log("没有选中任何选项");
    }
});

// 单击 开始/停止运行 按钮
window.btnStartStop.on('click', () => {
    if (auto.service === null) {
        console.log("未打开“无障碍”服务");
        toast("未打开“无障碍”服务");
        return;
    }

    if (window.btnStartStop.getText() === '开始运行') {
        toast("开始运行脚本");
        scriptMainThread = threads.start(startScriptThread);
    } else {
        stopScriptThread();
    }
});

// 单击 打开/确认设置 按钮
window.btnSettings.on("click", () => {
    if (window.containerSettings.getVisibility() === View.GONE) {
        window.containerSettings.setVisibility(View.VISIBLE);
        window.btnSettings.setText('确认设置');
        window.btnResetSettings.setVisibility(View.VISIBLE);
    } else {
        window.containerSettings.setVisibility(View.GONE);
        window.btnSettings.setText('打开设置');
        window.btnResetSettings.setVisibility(View.GONE);
        window.btnResetSettings.setText("恢复默认设置");

        scriptRunTime = parseInt(window.inputScriptRunTime.text(), 10);
        scriptRemainingRunTime = scriptRunTime
        minFansForComment = parseInt(window.inputMinFansForComment.text(), 10);

        utils.saveSetting("scriptRunTime", scriptRunTime);
        utils.saveSetting("minFansForComment", minFansForComment);

        if (curApp === appRespondLikes) {
            commentsRespondLikes = window.inputCommentLibrary.text().split("；");
            commentsInUse = commentsRespondLikes;
            utils.saveSetting("commentsRespondLikes", commentsRespondLikes);
        } else if (curApp === appSeekHelp) {
            commentsSeekHelp = window.inputCommentLibrary.text().split("；");
            commentsInUse = commentsSeekHelp;
            utils.saveSetting("commentsSeekHelp", commentsSeekHelp);
        } else if (curApp === appLikeFansVideo) {
            commentsLikeFansVideo = window.inputCommentLibrary.text().split("；");
            commentsInUse = commentsLikeFansVideo;
            utils.saveSetting("commentsLikeFansVideo", commentsLikeFansVideo);
        }
    }

    window.disableFocus();
});

// 单击 打开/确认设置 按钮
window.btnExit.on("click", () => {
    stopScriptThread();
    exit();
});

// 长按 展开的悬浮窗
toast("长按悬浮窗调整其样式", "long");
window.containerFloatyWindow.on("long_click", () => {
    window.setAdjustEnabled(!window.isAdjustEnabled());
});

// 点击 运行时间 输入框
window.inputScriptRunTime.on("key", (keyCode, event) => {
    if (event.getAction() === event.ACTION_DOWN && keyCode === keys.back) {
        window.disableFocus();
        event.consumed = true;
    }
});
window.inputScriptRunTime.on("touch_down", () => {
    window.requestFocus();
    window.inputScriptRunTime.requestFocus();
});

// 点击 小于此粉丝数发评论 输入框
window.inputMinFansForComment.on("key", function (keyCode, event) {
    if (event.getAction() === event.ACTION_DOWN && keyCode === keys.back) {
        window.disableFocus();
        event.consumed = true;
    }
});
window.inputMinFansForComment.on("touch_down", () => {
    window.requestFocus();
    window.inputMinFansForComment.requestFocus();
});

// 点击 评论框 输入框
window.inputCommentLibrary.on("key", function (keyCode, event) {
    if (event.getAction() === event.ACTION_DOWN && keyCode === keys.back) {
        window.disableFocus();
        event.consumed = true;
    }
});
window.inputCommentLibrary.on("touch_down", () => {
    window.requestFocus();
    window.inputCommentLibrary.requestFocus();
});

// 点击 恢复默认设置 按钮
window.btnResetSettings.on('click', () => {
    if (window.btnResetSettings.getText() === "恢复默认设置") {
        window.btnResetSettings.setText("撤销");

        // 先保存当前值, 用于撤销
        scriptRunTime = parseInt(window.inputScriptRunTime.text(), 10);
        minFansForComment = parseInt(window.inputMinFansForComment.text(), 10);
        if (curApp === appRespondLikes) {
            commentsRespondLikes = window.inputCommentLibrary.text().split("；");
        } else if (curApp === appSeekHelp) {
            commentsSeekHelp = window.inputCommentLibrary.text().split("；");
        } else if (curApp === appLikeFansVideo) {
            commentsLikeFansVideo = window.inputCommentLibrary.text().split("；");
        }

        // 恢复默认值
        window.inputScriptRunTime.setText("" + defaultScriptRunTime);
        window.inputMinFansForComment.setText("" + defaultMinFansForComment);
        if (curApp === appRespondLikes) {
            window.inputCommentLibrary.setText(defaultCommentsRespondLikes.join("；"));
        } else if (curApp === appSeekHelp) {
            window.inputCommentLibrary.setText(defaultCommentsSeekHelp.join("；"));
        } else if (curApp === appLikeFansVideo) {
            window.inputCommentLibrary.setText(defaultCommentsLikeFansVideo.join("；"));
        }
    } else {
        window.btnResetSettings.setText("恢复默认设置");

        window.inputScriptRunTime.setText("" + scriptRunTime);
        window.inputMinFansForComment.setText("" + minFansForComment);
        if (curApp === appRespondLikes) {
            window.inputCommentLibrary.setText(commentsRespondLikes.join("；"));
        } else if (curApp === appSeekHelp) {
            window.inputCommentLibrary.setText(commentsSeekHelp.join("；"));
        } else if (curApp === appLikeFansVideo) {
            window.inputCommentLibrary.setText(commentsLikeFansVideo.join("；"));
        }
    }
});

// 点击 脚本使用指南 按钮
window.btnUserGuide.on('click', () => {
    app.openUrl("https://github.com/luckyloogn/BiliHelper?tab=readme-ov-file#使用说明");
});

// 点击 关于脚本 按钮
window.btnAbout.on('click', () => {
    app.openUrl("https://github.com/luckyloogn/BiliHelper");
});

/** UI初始化/设置 ------------------------------------------------ */
window.exitOnClose(); // 当关闭窗口时, 自动退出程序

// 设置启动时的一些ui样式
ui.run(() => {
    window.inputScriptRunTime.setText("" + scriptRunTime);
    window.inputMinFansForComment.setText("" + minFansForComment);
    window.inputCommentLibrary.setText(commentsInUse.join("；"));
    window.checkboxAutoService.checked = auto.service !== null;
});

// 要保持悬浮窗不被关闭, 必须有setInterval(), 这里设置1000ms周期性刷新ui或剩余运行时间
setInterval(() => {
    if (scriptMainThread && scriptMainThread.isAlive()) {
        scriptRemainingRunTime--;
        if (scriptRemainingRunTime === 0) {
            scriptRemainingRunTime = 0;

            console.log("到达设定时间");
            toast("到达设定时间");

            stopScriptThread();

            ui.run(() => {
                window.textRunStatus.setText('到达设定时间');
            });
        }
    }
    ui.run(() => {
        window.checkboxAutoService.checked = auto.service !== null;
        window.textRemainingRunTime.setText(utils.formatTime(scriptRemainingRunTime));
    });
}, 1000); // 1000 ms周期任务


/** 函数 -------------------------------------------------------- */
/**
 * 开始脚本线程
 * 
 * @param {void} 
 * @returns {void} 
 */
function startScriptThread() {
    let notReadyMsg = "";
    let runningMsg = "";
    let finishedRunningMsg = "";

    if (curApp === appRespondLikes) {
        notReadyMsg = "未打开点赞列表";
        runningMsg = "正在回赞";
        finishedRunningMsg = "回赞完毕";
    } else if (curApp === appSeekHelp) {
        notReadyMsg = "未打开激励页面";
        runningMsg = "正在找人互助";
        finishedRunningMsg = "到达视频列表底部";
    } else if (curApp === appLikeFansVideo) {
        notReadyMsg = "未打粉丝列表";
        runningMsg = "正在给粉丝点赞";
        finishedRunningMsg = "点赞完毕";
    }

    // 判断是否打开创作激励页面
    if (curApp.isReady()) {
        ui.run(() => {
            window.fabImgRunning.startAnimation(rotateAnimation);

            window.spAppSelection.setEnabled(false); // 运行期间不允许更改功能

            window.btnStartStop.setText('停止运行');
            window.btnStartStop.attr("backgroundTint", "#d50000");

            window.btnSettings.setEnabled(false); // 运行期间不允许设置
            window.btnSettings.attr("backgroundTint", "#f4f6f5");
            window.containerSettings.setVisibility(View.GONE);

            window.textRunStatus.setText(runningMsg);

            window.textRemainingRunTime.setVisibility(View.VISIBLE);

            window.containerFloatyWindow.setVisibility(View.GONE);
        });

        scriptRemainingRunTime = scriptRunTime;

        console.log(runningMsg);
        toast(runningMsg);

        // 运行app
        curApp.start(commentsInUse, minFansForComment);

        console.log(finishedRunningMsg);
        toast(finishedRunningMsg);

        ui.run(() => {
            window.fabImgRunning.clearAnimation();

            window.spAppSelection.setEnabled(true);

            window.btnStartStop.setText('开始运行');
            window.btnStartStop.attr("backgroundTint", "#03a9f5");

            window.btnSettings.setEnabled(true);
            window.btnSettings.attr("backgroundTint", "#03a9f5");

            window.textRunStatus.setText(finishedRunningMsg);

            window.textRemainingRunTime.setVisibility(View.GONE);
        });
    } else {
        console.log(notReadyMsg);
        toast(notReadyMsg);

        ui.run(() => {
            window.textRunStatus.setText(notReadyMsg);
        });
    }
}

/**
 * 停止脚本线程
 * 
 * @param {void} 
 * @returns {boolean} 线程存在返回true, 否则返回false
 */
function stopScriptThread() {
    ui.run(() => {
        window.fabImgRunning.clearAnimation();

        window.spAppSelection.setEnabled(true);

        window.btnStartStop.setText('开始运行');
        window.btnStartStop.attr("backgroundTint", "#03a9f5");

        window.btnSettings.setEnabled(true);
        window.btnSettings.attr("backgroundTint", "#03a9f5");

        window.textRunStatus.setText('等待运行');

        window.textRemainingRunTime.setVisibility(View.GONE);
    });

    // 停止app
    curApp.stop();

    if (scriptMainThread && scriptMainThread.isAlive()) {
        toast("停止运行脚本");
        console.log("停止运行脚本");

        scriptMainThread.interrupt(); // 停止线程执行
    }
}
