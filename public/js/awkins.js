//弹出提示
tippy('.lb', {
    content: '库卡博客',
    theme: 'lb',
});
tippy('.li', {
    content: '播放器说明',
    theme: 'li',
});
tippy('.lw', {
    content: '背景设置',
    theme: 'lw',
});
tippy('#lyric-active', {
    content: '歌词隐显',
    theme: 'ld',
    placement: 'left',
});
tippy('#lyric-full', {
    content: '歌词全屏',
    theme: 'ld',
    placement: 'left',
});
tippy('.tran', {
    content: '翻译隐显',
    theme: 'ld',
    placement: 'left',
});
tippy('#music-info', {
    content: '歌曲信息',
    theme: 'ld',
    placement: 'left',
});

//插入默认歌单
function insertCustomDivAfterdef() {
    var sheetItems = document.querySelectorAll('.sheet-item');
    if (sheetItems.length > 0) {
        var newDiv = document.createElement('div');
        newDiv.className = 'sheet-item sheet-itemdef custom-sheet-item';
        newDiv.innerHTML = '默认推荐歌单&nbsp;<i class="fa fa-caret-down "></i></span>';
        var targetSheetItem = sheetItems[0];
        var parentElement = targetSheetItem.parentNode;
        parentElement.insertBefore(newDiv, targetSheetItem)
    }
};


//插入同步的歌单
function insertCustomDivAfteruser() {
    var sheetItems = document.querySelectorAll('.sheet-item');
    if (sheetItems.length > 0) {
        var existingCustomDiv = document.querySelector('.custom-sheet-item-user');
        if (existingCustomDiv) {
            existingCustomDiv.remove()
        };
        var newDiv = document.createElement('div');
        newDiv.className = 'sheet-item custom-sheet-item-user';
        var barHtml;
        if (playerReaddata('uid')) {
            barHtml = '<span class="btn login-btn login-refresh"><i class="fa fa-refresh"></i>刷新</span><span class="btn login-btn login-out"><i class="fa fa-sign-out"></i>取消</span><span class="username">' + rem.uname + '</span> '
        } else {
            barHtml = '<span class="btn login-btn login-in"><i class="fa fa-user "></i>同步歌单</span>'
        };
        newDiv.innerHTML = '您的网易云歌单&nbsp;<span style="font-size:0.7rem"></span><i class="fa fa-caret-down "></i>&nbsp;<span id="sheet-bar"><div class="clear-fix"></div><div id="user-login" class="sheet-title-bar">' + barHtml + '</div></span>';
        //要根据歌单数量调整插入最后一个div后面的位置
        var targetSheetItem = sheetItems[8];
        var parentElement = targetSheetItem.parentNode;
        parentElement.insertBefore(newDiv, targetSheetItem.nextSibling)
    }
};

//info按钮 + 点击屏幕关闭（无遮罩）
function showLightbox() {
    var wrapper = document.getElementById('light');
    wrapper.style.display = 'flex';

    setTimeout(function() {
        document.addEventListener('click', closeInfoOnShadeClick);
    }, 0);
}

function closeInfoOnShadeClick(e) {
    var inner = document.querySelector('#light .white_content');
    if (!inner.contains(e.target)) {
        hideLightbox();
    }
}

function hideLightbox() {
    document.getElementById('light').style.display = 'none';
    document.removeEventListener('click', closeInfoOnShadeClick);
}

//底部彩色粒子
(function ($) {
    $.fn.circleMagic = function (options) {

        var width, height, canvas, ctx, animateHeader = true;
        var circles = [];

        var settings = $.extend({
            color: 'rgba(255,255,255,.5)',
            radius: 10,
            density: 0.3,
            clearOffset: 0.1
        }, options);

        //  Main

        var container = this['0'];
        initContainer();
        addListeners();

        function initContainer() {
            width = container.offsetWidth;
            height = container.offsetHeight;

            //  create canvas element

            initCanvas();
            canvas = document.getElementById('homeTopCanvas');
            canvas.width = width;
            canvas.height = height;
            canvas.style.position = 'absolute';
            canvas.style.pointerEvents = 'none';
            canvas.style.left = '0';
            canvas.style.bottom = '0';
            canvas.style.zIndex = '1';
            ctx = canvas.getContext('2d');

            //  create circles
            for (var x = 0; x < width * settings.density; x++) {
                var c = new Circle();
                circles.push(c);
            }
            animate();
        }

        //Init canvas element
        function initCanvas() {
            var canvasElement = document.createElement('canvas');
            canvasElement.id = 'homeTopCanvas';
            container.appendChild(canvasElement);
            canvasElement.parentElement.style.overflow = 'hidden';

        }

        // Event handling
        function addListeners() {
            window.addEventListener('scroll', scrollCheck, false);
            window.addEventListener('resize', resize, false);
        }

        function scrollCheck() {
            if (document.body.scrollTop > height) {
                animateHeader = false;
            }
            else {
                animateHeader = true;
            }
        }

        function resize() {
            width = container.clientWidth;
            height = container.clientHeight;
            container.height = height + 'px';
            canvas.width = width;
            canvas.height = height;
        }

        function animate() {
            if (animateHeader) {
                ctx.clearRect(0, 0, width, height);
                for (var i in circles) {
                    circles[i].draw();
                }
            }
            requestAnimationFrame(animate);
        }

        function randomColor() {
            var r = Math.floor(Math.random() * 255);
            var g = Math.floor(Math.random() * 255);
            var b = Math.floor(Math.random() * 255);
            var alpha = Math.random().toPrecision(2);
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
        }

        //  Canvas manipulation

        function Circle() {
            var that = this;

            // constructor
            (function () {
                that.pos = {};
                init();
            })();

            function init() {
                that.pos.x = Math.random() * width;
                that.pos.y = height + Math.random() * 100;
                that.alpha = 0.1 + Math.random() * settings.clearOffset;
                that.scale = 0.1 + Math.random() * 0.3;
                that.speed = Math.random();
                if (settings.color === 'random') {
                    that.color = randomColor();
                }
                else {
                    that.color = settings.color;
                }
            }

            this.draw = function () {
                if (that.alpha <= 0) {
                    init();
                }
                that.pos.y -= that.speed;
                that.alpha -= 0.0005;
                ctx.beginPath();
                ctx.arc(that.pos.x, that.pos.y, that.scale * settings.radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = that.color;
                ctx.fill();
                ctx.closePath();
            };
        }
    }
})(jQuery);

$(document).ready(function() {
    $('body').circleMagic({
        color: 'random', // 随机颜色
        radius: 10,      // 圆圈的半径
        density: 0.2,    // 圆圈的密度
        clearOffset: 0.1 // 透明度变化速度
    });
});

// ========== 背景壁纸配置（在这里加你自己的背景） ==========
// 往 images/bg/ 丢图片后，把文件名（含后缀）加到这个数组里即可
var wallpaperList = [
    '0.svg', '1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg',
    'Z.jpg', 'bg1.jpg', 'bg2.jpg'
];

// 设置背景图
function setupWallpaperSelector() {
    var baseImageUrl = './images/bg/';
    var wallpaperContainer = document.getElementById('wallpaperContainer');
    var openWallpaperBtn = document.getElementById('openWallpaperBtn');
    var closeWallpaperBtn = document.getElementById('closeWallpaperBtn');
    var cancelBtn = document.getElementById('cancelBtn');
    var fitBtn = document.getElementById('fitBtn');
    var liziBtn = document.getElementById('liziBtn');
    var partDiv = document.getElementById('particles-js');

    var setimgDiv = document.getElementById('setimg');
    var setimgwDiv = document.querySelector('.setimgw');
    var imgElement = setimgDiv.querySelector('img');
    var wallpapersDiv = document.createElement('div');
    wallpapersDiv.classList.add('wallpapers');
    var currentWallpaperItem = null;

    // 获取一周后的日期作为key
    var oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    var dateKey = 'customBgImage_' + oneWeekLater.toDateString();
    var customBgImage = localStorage.getItem(dateKey);


    fitBtn.addEventListener('click', function() {
        // 获取当前元素的样式
        var currentFilter = setimgwDiv.style.backdropFilter;
        if (currentFilter.includes('blur(10px)')) {
            setimgwDiv.style.backdropFilter = 'unset';
            fitBtn.style.background = 'rgb(255,255,255,0.2)';
        } else {
            setimgwDiv.style.backdropFilter = 'blur(10px)';
            fitBtn.style.background = '#ff6733';
        }
    });

    let isCanvasCreated = false;

	liziBtn.addEventListener('click', function() {
	    if (!isCanvasCreated) {
	        createParticleCanvas();
	    } else {
	        destroyParticleCanvas();
	    }
	});

    function createParticleCanvas() {
        const particleCanvas = document.getElementById('particles-js');
        particleCanvas.style.opacity = '1';
        liziBtn.style.background = '#ff6733';
        isCanvasCreated = true;
        particlesJS.load('particles-js', './js/particlesjs-config.json');
    }
    function destroyParticleCanvas() {
        const particleCanvas = document.getElementById('particles-js');
        particleCanvas.style.opacity = '0';
        liziBtn.style.background = 'rgb(255,255,255,0.2)';
        isCanvasCreated = false;
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
        }
    };


    wallpaperList.forEach(function(filename) {
        var wallpaperItem = document.createElement('div');
        wallpaperItem.classList.add('wallpaper-item');
        var fullUrl = baseImageUrl + filename;
        var bgimg = document.createElement('img');
        bgimg.src = fullUrl;

        bgimg.addEventListener('click', function() {
            if (currentWallpaperItem) {
                currentWallpaperItem.classList.remove('disabled');
            }

            imgElement.src = fullUrl;
            imgElement.classList.add('setimgs');

            wallpaperItem.classList.add('disabled');
            currentWallpaperItem = wallpaperItem;

            localStorage.setItem(dateKey, fullUrl);

            // 同步更新 body 背景（让切换立即可见）
            document.body.style.background = 'url(' + fullUrl + ') no-repeat center / cover';
        });

        wallpaperItem.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        if (customBgImage && customBgImage === fullUrl) {
            wallpaperItem.classList.add('disabled');
            currentWallpaperItem = wallpaperItem;
            imgElement.src = fullUrl;
            imgElement.classList.add('setimgs');
        };

        wallpaperItem.appendChild(bgimg);
        wallpapersDiv.appendChild(wallpaperItem);
    });

    wallpaperContainer.appendChild(wallpapersDiv);

    // 点到 panel 外部（整个页面）才关闭
    function closeOnOutsideClick(e) {
        if (!wallpaperContainer.contains(e.target)) {
            wallpaperContainer.style.display = 'none';
            document.removeEventListener('click', closeOnOutsideClick);
        }
    }

    openWallpaperBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        wallpaperContainer.style.display = 'block';
        // 延迟一帧再绑定，避免这次 click 立即触发关闭
        setTimeout(function() {
            document.addEventListener('click', closeOnOutsideClick);
        }, 0);
    });

    closeWallpaperBtn.addEventListener('click', function() {
        wallpaperContainer.style.display = 'none';
        document.removeEventListener('click', closeOnOutsideClick);
    });

    cancelBtn.addEventListener('click', function() {
        imgElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDQ2MCwgMjAyMC8wNS8xMi0xNjowNDoxNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY2NkYxRUI0NUE2QzExRUY4QjE4ODRCNENCRDNCRkUzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjY2NkYxRUI1NUE2QzExRUY4QjE4ODRCNENCRDNCRkUzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjY2RjFFQjI1QTZDMTFFRjhCMTg4NEI0Q0JEM0JGRTMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjY2RjFFQjM1QTZDMTFFRjhCMTg4NEI0Q0JEM0JGRTMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5jrHa9AAAAEElEQVR42mL4//8/A0CAAQAI/AL+26JNFgAAAABJRU5ErkJggg==';
        imgElement.classList.remove('setimgs');
        if (currentWallpaperItem) {
            currentWallpaperItem.classList.remove('disabled');
            currentWallpaperItem = null;
        }

        localStorage.removeItem(dateKey);
        updateResources();
    });
};


document.addEventListener('DOMContentLoaded', function() {
    setupWallpaperSelector();
});
