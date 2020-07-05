/*
把内容元素装入到一个指定大小（最小是50 * 50）的窗体或视口内
可选参数contentX和contentY指定内容相对于窗体的初始偏移量，如果指定，它们必须 <= 0
这个窗体有mousewheel事件处理程序
它允许用户平移元素或缩放窗体
 */
function enclose(content, framewidth, frameheight, contentX, contentY) {
    // 这些参数不仅仅是初始值
    // 它们保存当前状态，能被mousewheel处理程序使用和修改
    framewidth = Math.max(framewidth, 50);
    frameheight = Math.max(frameheight, 50);
    contentX = Math.min(contentX, 0) || 0;
    contentY = Math.min(contentY, 0) || 0;

    // 创建frame元素，且设置CSS类名和样式
    var frame = document.createElement("div");
    frame.className = "enclosure";
    frame.style.width = framewidth + "px";
    frame.style.height = frameheight + "px";
    frame.style.overflow = "hidden";
    frame.style.boxSizing = "border-box";
    frame.style.webkitBoxSizing = "border-box";
    frame.style.MozBoxSizing = "border-box";

    // 把frame放入文档中，并把内容移入frame中
    content.parentNode.insertBefore(frame, content);
    frame.appendChild(content);

    // 确定元素相对于frame的位置
    content.style.position = "relative";
    content.style.left = contentX + "px";
    content.style.top = contentY + "px";

    // 我们需要针对下面一些特定的浏览器怪癖进行处理
    var isMacWebkit = (navigator.userAgent.indexOf("Macintosh") !== -1 &&
                        navigator.userAgent.indexOf("WebKit") !== -1);
    var isFirefox = (navigator.userAgent.indexOf("Gecko") !== -1);

    // 注册mousewheel事件处理程序
    frame.onwheel = wheelHandler;   // 未来浏览器
    frame.onmousewheel = wheelHandler;  // 大多数当前浏览器
    if (isFirefox) {
        frame.addEventListener("DOMMouseScroll", wheelHandler, false);
    }
    
    function wheelHandler(event) {
        var e = event || window.event;

        // 查找wheel事件对象，mousewheel事件对象、DOMMouseScroll事件对象的属性
        // 从事件对象中提取旋转量
        // 绽放delta以便一次鼠标滚轮“单击”相对于屏幕的缩放增量是30像素
        // 如果未来浏览器在同一事件上同时触发wheel和mousewheel，这里最终会重复计算，
        // 所以，希望取消wheel事件将阻止mousewheel事件的产生
        var deltaX = e.deltaX * -30 ||      // wheel事件
                    e.wheelDeltaX / 4 ||    // mousewheel
                    0;                       // 属性未定义
        var deltaY = e.deltaY * -30 ||                  // wheel事件
                    e.wheelDeltaY / 4 ||                // Webkit中的mousewheel事件
                    (e.wheelDeltaY == undefined &&     // 如果没有2D属性
                        e.wheelDelta / 4) ||            // 那么就用1D的滚轮属性
                    e.detail * -1 ||                   // Firefox的DOMMouseScroll事件
                    0;                                  // 属性未定义

        // 在大多数浏览器中，每次鼠标滚轮单击对应的delta是120
        // 但是，在Mac中，鼠标滚轮似乎对速度更敏感，
        // 其delta值通常要大120倍，使用Apple鼠标至少如此
        // 使用浏览器测试解决这个问题
        if (isMacWebkit) {
            deltaX /= 30;
            deltaY /= 30;
        }

        // 如果在Firefox中得到mousewheel或wheel事件，那么就不需要DOMMouseScroll事件
        if (isFirefox && e.type !== "DOMMouseScroll") {
            frame.removeEventListener("DOMMouseScroll", wheelHandler, false);
        }

        // 获取内容元素的当前尺寸
        var contentbox = content.getBoundingClientRect();
        var contentwidth = contentbox.right - contentbox.left;
        var contentheight = contentbox.bottom - contentbox.top;
        
        if (e.altKey) { // 如果按下Alt键，就可以调整frame大小
            if (deltaX) {
                framewidth -= deltaX;   // 新宽度，但不能比内容大
                framewidth = Math.min(framewidth, contentwidth);
                framewidth = Math.max(framewidth, 50);  // 且也不能比50小
                frame.style.width = framewidth + "px";  // 在frame上设置它
            }
            if (deltaY) {
                frameheight -= deltaY;
                frameheight = Math.min(frameheight, contentheight);
                frameheight = Math.max(frameheight - deltaY, 50);
                frame.style.height = frameheight + "px";
            }
        } else {    // 如果没有按下Alt键，就可以平移frame的内容
            if (deltaX) {
                // 不能再滚动了
                var minoffset = Math.min(framewidth - contentwidth, 0);
                // 把deltaX添加到contentX中，但不能小于minoffset
                contentX = Math.max(contentX + deltaX, minoffset);
                contentX = Math.min(contentX, 0);
                content.style.left = contentX + "px";   // 设置新的偏移量
            }
            if (deltaY) {
                var minoffset = Math.min(frameheight - contentheight, 0);
                // 把deltaY添加到contentY，但不能小于minoffset
                contentY = Math.max(contentY + deltaY, minoffset);
                contentY = Math.min(contentY, 0);
                content.style.top = contentY + "px";
            }
        }

        // 不让这个事件冒泡，阻止任何默认操作
        // 这会阻止浏览器使用mousewheel事件滚动文档
        // 希望对于相同的鼠标滚动
        // 调用wheel事件上的preventDefault()也能阻止mousewheel事件的产生
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        e.cancelBubble = true;  // IE事件
        e.returnValue = false;  // IE事件
        return false;
    }
}