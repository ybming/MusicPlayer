//IE浏览器提示
(function() {
    function isIE() {
        return /*@cc_on!@*/false || !!document.documentMode; // condition for IE < 9
    }

    if (isIE()) {
        var YIE = document.createElement('div');
        YIE.id = 'isIE';
        var YIEText = document.createElement('p');
        YIEText.textContent = '本站不支持 IE 浏览器访问，请使用其他浏览器访问';
        YIE.appendChild(YIEText);
        document.body.appendChild(YIE);
        YIE.style.display = "block";
    }
})();

//默认背景图
function updateResources() {
    var baseImageUrl = './images/bg/';
    //随机图片
    var imageNumbers = [];
    for (var i = 0; i <= 6; i++) {
        imageNumbers.push(i.toString());
    }

    var bodyElement = document.body;;
    var hour = new Date().getHours();
    var hourKey = 'bgImageIndex_' + hour;
 
    var oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    var dateKey = 'customBgImage_' + oneWeekLater.toDateString();
    var customBgImage = localStorage.getItem(dateKey);

    if (customBgImage) {
        bodyElement.style.background = 'url(' + customBgImage + ') no-repeat center / cover';
    } else {
        var fixedRandomIndex = localStorage.getItem(hourKey);

        if (fixedRandomIndex === null) {
            fixedRandomIndex = Math.floor(Math.random() * imageNumbers.length);
	    // 指定图片
            //fixedRandomIndex = 4;
            localStorage.setItem(hourKey, fixedRandomIndex);
        }

        var bgImage = baseImageUrl + imageNumbers[fixedRandomIndex] + '.svg';
        //var bgImage = baseImageUrl + fixedRandomIndex + '.webp';
        bodyElement.style.background = 'url(' + bgImage + ') no-repeat center / cover';
    }
};
updateResources();


//每小时定时更换
function scheduleUpdateResources() {
    var now = new Date();
    var delay = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

    setTimeout(function() {
        updateResources();
        setInterval(updateResources, 60 * 60 * 1000);
    }, delay);
}
scheduleUpdateResources();

