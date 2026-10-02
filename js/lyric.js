/**************************************************
 * MKOnlinePlayer v2.31
 * 歌词解析及滚动模块
 * 编写：mengkun(http://mkblog.cn)
 * 时间：2017-9-13
 *************************************************/
 
var lyricArea = $("#lyric");    // 歌词显示容器

// 在歌词区显示提示语（如歌词加载中、无歌词等）
function lyricTip(str) {
    lyricArea.html("<li class='lyric-tip'>"+str+"</li>");     // 显示内容
}

// 歌曲加载完后的回调函数
// 参数：歌词源文件

//原
//function lyricCallback(str, id) {

//新 带翻译
function lyricCallback(lyricStr, tlyricStr, id) {
    if(id !== musicList[rem.playlist].item[rem.playid].id) return;  // 返回的歌词不是当前这首歌的，跳过

    //原
    //rem.lyric = parseLyric(str);    // 解析获取到的歌词

    //新 带翻译
    rem.lyric = parseLyric(lyricStr);    // 解析获取到的原文歌词
    rem.tlyric = parseLyric(tlyricStr);  // 解析获取到的翻译歌词

    if(rem.lyric === '') {
        lyricTip('暂时没有歌词');
        return false;
    }
    if (rem.tlyric != '' ){
        $('.tran').css("opacity","1");
    } else {
	$('.tran').css("opacity","0");
    };
    lyricArea.html('');     // 清空歌词区域的内容
    lyricArea.scrollTop(0);    // 滚动到顶部
    
    rem.lastLyric = -1;
    
    // 显示全部歌词
    var i = 0;
    //原
    /*for(var k in rem.lyric){
        var txt = rem.lyric[k];
        if(!txt) txt = "&nbsp;";
        var li = $("<li data-no='"+i+"' class='lrc-item'>"+txt+"</li>");
        lyricArea.append(li);
        i++;
    }*/

    //新 带翻译
    for (var k in rem.lyric) {
        var txt = rem.lyric[k] || "&nbsp;";
        var ttxt = rem.tlyric[k] || "";  // 如果翻译歌词为空，则不显示
        var li = $("<li data-no='"+i+"' class='lrc-item'>" + txt + (ttxt ? "<br><span class='tlyric'>" + ttxt + "</span>" : "") + "</li>");
        lyricArea.append(li);
        i++;
    }
    if (!showTlyric) {
	     $('.tlyric').addClass('hidden');
    }
}

// 强制刷新当前时间点的歌词
// 参数：当前播放时间（单位：秒）
function refreshLyric(time) {
    if(rem.lyric === '') return false;
    
    time = parseInt(time);  // 时间取整
    var i = 0;
    for(var k in rem.lyric){
        if(k >= time) break;
        i = k;      // 记录上一句的
    }
    
    scrollLyric(i);
}

// 滚动歌词到指定句
// 参数：当前播放时间（单位：秒）
//function scrollLyric(time) {
function scrollLyric(time,forceCenter) {
    if(rem.lyric === '') return false;
    
    time = parseInt(time);  // 时间取整
    
    if(rem.lyric === undefined || rem.lyric[time] === undefined) return false;  // 当前时间点没有歌词
    
    if(rem.lastLyric == time && !forceCenter) return true;  // 歌词没发生改变
    
    var i = 0;  // 获取当前歌词是在第几行
    for(var k in rem.lyric){
        if(k == time) break;
        i ++;
    }
    rem.lastLyric = time;  // 记录方便下次使用
    $(".lplaying").removeClass("lplaying");     // 移除其余句子的正在播放样式
    $(".lrc-item[data-no='" + i + "']").addClass("lplaying");    // 加上正在播放样式

    //新 解决翻译歌词定位不正确 - 获取每一行的实际高度并累加
    var scroll = 0;
    for (var j = 0; j < i; j++) {
	//无margin情况
    //scroll += lyricArea.children().eq(j).height();

	//有margin情况
        scroll += lyricArea.children().eq(j).outerHeight(true);
    }
    scroll -= ($(".lyric").height() / 2);

    //原
    //var scroll = (lyricArea.children().height() * i) - ($(".lyric").height() / 2); 
	//新
    lyricArea.stop().animate({scrollTop: scroll}, 1000);  // 平滑滚动到当前歌词位置(更改这个数值可以改变歌词滚动速度，单位：毫秒)
    
}

// 解析歌词
// 这一函数来自 https://github.com/TivonJJ/html5-music-player
// 参数：原始歌词文件
function parseLyric(lrc) {
    if(lrc === '') return '';
    var lyrics = lrc.split("\n");
    var lrcObj = {};
    for(var i=0;i<lyrics.length;i++){
        var lyric = decodeURIComponent(lyrics[i]);
        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
        var timeRegExpArr = lyric.match(timeReg);
        if(!timeRegExpArr)continue;
        var clause = lyric.replace(timeReg,'');
        for(var k = 0,h = timeRegExpArr.length;k < h;k++) {
            var t = timeRegExpArr[k];
            var min = Number(String(t.match(/\[\d*/i)).slice(1)),
                sec = Number(String(t.match(/\:\d*/i)).slice(1));
            var time = min * 60 + sec;
            lrcObj[time] = clause;
        }
    }
    return lrcObj;
}


var showTlyric = true;  // 控制翻译歌词显示状态，默认显示

function toggleTlyric() {
    var tlyricElements = document.querySelectorAll('.tlyric');
    if (tlyricElements.length === 0) return;
    showTlyric = !showTlyric;  // 切换状态
    var Lbutton = $('.fa-language'); 
    var tranBar = document.querySelector('.tran');
    var langBar = document.querySelector('.fa-language');

    if (showTlyric) {
        $('.tlyric').removeClass('hidden');  // 显示翻译歌词
        Lbutton.removeClass('fa-gb');
	    tranBar.style.background = 'rgba(255,255,255,0.2)'
    } else {
        $('.tlyric').addClass('hidden');  // 隐藏翻译歌词
	    Lbutton.addClass('fa-gb');
		tranBar.style.background = 'rgba(255,255,255,0)'
    };

    // 立即刷新歌词滚动位置
    if (rem.lastLyric !== undefined) {
        scrollLyric(rem.lastLyric, true);
    }
};

/*歌词隐藏按钮*/
document.getElementById('lyric-active').addEventListener('click', function() {
    var lrcItems = document.querySelectorAll('.lrc-item');
    if (lrcItems.length === 0) return;
    for (var i = 0; i < lrcItems.length; i++) {
        if (lrcItems[i].classList.contains('lrc-itemop')) {
            lrcItems[i].classList.remove('lrc-itemop');
        } else {
            lrcItems[i].classList.add('lrc-itemop');
        };
    };

    if (this.classList.contains('lyactie')) {
        this.classList.remove('lyactie');
    } else {
        this.classList.add('lyactie');
    };
});

/*歌词全屏按钮*/
document.getElementById('lyric-full').addEventListener('click', function() {
    var playerDiv = document.getElementById('player');
    var btnBar = document.querySelector('.btn-bar');
    var dataArea = document.querySelector('.data-area');
    var lyricF = document.getElementById('lyric-full');
    var setis = document.querySelector('.lyblur');

    if (playerDiv.classList.contains('full-player')) {
        playerDiv.classList.remove('full-player');
        btnBar.classList.remove('hidden');
        dataArea.classList.remove('hidden');
	    lyricF.style.background = 'unset';
	    setis.style.backdropFilter = 'unset';

    } else {
        playerDiv.classList.add('full-player');
        btnBar.classList.add('hidden');
        dataArea.classList.add('hidden');
	    lyricF.style.background = 'rgba(255,255,255,0.2)';
	    setis.style.backdropFilter = 'blur(50px)';
    };
});
