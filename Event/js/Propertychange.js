function forceToUpperCase(element) {
    if (typeof element === "string") {
        element = document.getElementById(element);
    }
    element.oninput = upcase;
    element.onpropertychange = upcaseOnPropertyChange;

    // 简单案例：用于input事件的处理程序
    function upcase(event) {
        this.value = this.value.toUpperCase();
    }
    // 疑难案例：用propertychange事件的处理程序
    function upcaseOnPropertyChange(event) {
        var e = event || window.event;
        // 如果value属性发生改变
        if (e.propertyName === "value") {
            // 移除onpropertychange处理程序，避免循环调用
            this.onpropertychange = null;
            // 把值都变为大写
            this.value = this.value.toUpperCase();
            // 然后恢复原来的propertychange处理程序
            this.onpropertychange = upcaseOnPropertyChange;
        }
    }
}