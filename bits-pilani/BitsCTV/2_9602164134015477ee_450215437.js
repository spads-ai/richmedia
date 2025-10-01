////////////////////////////////////
 console.log("Event Start");

 var MOVIE_AMM = 1;
 var MOVIE_FORMAT = "jpg";
 var MOVIE_FOLDER = "posters";
 var MOVIE_IDS = ["S9O8DcLGRXY"];

 var CALENDAR_LINK =
 "https://calendar.google.com/calendar/u/0/r/eventedit?text=Event!+%E2%9A%A1+Fury+of+the+Gods&dates=20230316T200000/20230316T210000&details&location=World&trp=false&sprop&sprop=name";

 // V A R S
 // m a i n
 var _document;
 var _window;
 var iframe;
 window.__eFlAdEl = document.getElementById("ad_24");
 // e l e m e n t s
 var o = {};
 o.video = document.getElementById("video_24");
 o.container = document.getElementById("ad_24");
 o.small = document.getElementById("small_24");
 o.canvas = document.getElementById("canvas_24");
 o.player = document.getElementById("player_24");
 o.svg = document.getElementById("svg_24");
 o.ico_pause = document.getElementById("ico_pause_24");
 o.ico_play = document.getElementById("ico_play_24");
 o.ico_sound = document.getElementById("ico_sound_24");
 o.masked = document.getElementById("masked_24");
 if (!o.masked) {
 o.masked = document.getElementById("masked");
 }
 o.audio_24 = document.getElementById("audio_24");
 o.gameCtaArea = document.getElementById("gameCtaArea_24");
 o.endImg = document.getElementById("end_img");

 // l o c a l
 var ddef = {
 bolt_wiggle: -1,
 bolt_list: [],
 stage: 0,
 pauseSeq: false,
 mushActive: false,
 grid: {},
 block: {
 active: {
 b1: true,
 b2: false,
 b3: true,
 },
 },
 boltActive: false,
 jumpActive: true,
 ctaActive: true,
 dragEnabled: true,
 ad_scale: 0,
 taps: 0,
 ver: true,
 adClosed: false,
 uniq_id: 24,
 fs: false,
 loopActive: false,
 ftClick: true,
 adEnd: false,
 globalScale: 0.135,
 tls: [],
 movies: {
 cur: -1,
 list: [],
 ft: true,
 },
 ctx: o.canvas.getContext("2d"),
 canvas: {
 el: null,
 // ctx: o.canvas.getContext('2d'),
 },
 drag: {
 active: true,
 x: 0,
 y: 0,
 dx: 0,
 dy: 0,
 px: 20,
 py: 20,
 },
 screen: {
 w: 0,
 h: 0,
 x: 0,
 y: 0,
 },
 scale: 100,
 contS: 1,
 w: 150,
 h: 155,
 ctx: null,
 list: [],
 boltPos: {
 dx: 0,
 dy: 0,
 },
 };

 // console.log(ddef.canvas)

 var ad_s = 1;
 // ddef.circles.list = new Array(ddef.circles.amm)

 function initIFrame() {
 setCss();
 goOut();
 prepScrollControl();

 setTimeout(function () {
 init();
 }, 100);
 }

 function onResize() {
 getGlobalS();

 ddef.screen.w = _window.innerWidth;
 ddef.screen.h = _window.innerHeight;

 // var c = ddef.canvas.el;
 // c.width = ddef.screen.w;
 // c.height = ddef.screen.h;
 // c.style.width = ddef.screen.w;
 // c.style.height = ddef.screen.h;

 if (_window.innerHeight > _window.innerWidth) {
 ddef.ver = true;
 } else {
 ddef.ver = false;
 }
 adjustScales();
 }

 function getGlobalS() {
 var maz = ddef.screen.w < ddef.screen.h ? ddef.screen.w : ddef.screen.h;
 ad_s = (ddef.globalScale * maz) / ddef.scale;
 if (ad_s > 1) ad_s = 1;
 // console.log("ad_s", ad_s)

 if (
 /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
 navigator.userAgent
 )
 ) {
 // some code..
 } else {
 ad_s = ad_s * 0.5;
 }
 }

 // SCROLL DISABLE //
 var $window = null,
 previousScrollTop = 0,
 scrollLock = false;

 function prepScrollControl() {
 $window = $(_window);

 $window.scroll(function (event) {
 if (scrollLock) {
 $window.scrollTop(previousScrollTop);
 }
 });
 }

 function disableScroll() {
 scrollLock = true;
 previousScrollTop = $window.scrollTop();
 }

 function enableScroll() {
 scrollLock = false;
 }

 function isEmpty(obj) {
 return Object.keys(obj).length === 0;
 }
 // eND

 // OUT //
 function setUniqId() {
 var divs = document.getElementsByTagName("div");

 for (var i = 0; i < divs.length; i++) {
 var d = divs[i];
 var id = d.id;

 var n = id.search(ddef.uniq_id);
 if (n < 0) {
 var new_id = id + "_" + ddef.uniq_id;
 d.setAttribute("id", new_id);
 }
 }
 }

 function setObjects() {
 var divs = document.getElementsByTagName("div");
 var nums = "_24";
 for (var i = 0; i < divs.length; i++) {
 var d = divs[i];
 var id = d.id;
 var short_id = id.replace(nums, "");
 o[short_id] = d;
 }
 }

 function goOut() {
 // console.log("goOut")
 // var doc = _document || null, el = document.getElementById('small_24');
 var doc = _document || null,
 el = o.container;
 if (!doc || !el) return;

 _document.body.appendChild(el);

 if ("__eIntersectionObserver" in window) {
 window.__eIntersectionObserver.observe(el);
 }
 }

 function setCss() {
 var cssLink = document.createElement("link");
 cssLink.href = assets_url + "style.css";
 cssLink.rel = "stylesheet";
 cssLink.type = "text/css";
 _window.document.head.appendChild(cssLink);
 }

 (function () {
 setUniqId();
 setObjects();

 try {
 var curWindow = window;
 var myInterval = setInterval(function () {
 if (curWindow.frameElement == null) {
 _document = curWindow.document;

 _window = curWindow;
 clearInterval(myInterval);
 initIFrame();
 } else {
 iframe = curWindow.frameElement;
 }
 curWindow = curWindow.parent;
 }, 10);
 } catch (error) {
 console.error(error);
 }
 })();

 // Eskimi Def

 var _dsptr = function (e) {
 //var track = new Image();
 //track.src = __eventUrl + e;
 };
 function ctaFunction() {
 _window.open(__clickUrl);
 startEvent("Click_CTA");
 startedFunction();
 }
 function startEvent(event_name) {
 _dsptr(event_name);
 }
 var isStarted = true;
 function startedFunction() {
 if (isStarted) {
 isStarted = false;
 startEvent("Main");
 }
 }
 var assets_url = "images/";

 // f

 window.requestAnimFrame = (function () {
 return (
 window.requestAnimationFrame ||
 window.webkitRequestAnimationFrame ||
 window.mozRequestAnimationFrame ||
 window.oRequestAnimationFrame ||
 window.msRequestAnimationFrame ||
 function (/* function */ callback, /* DOMElement */ element) {
 window.setTimeout(callback, 1000 / 60);
 }
 );
 })();
 console.log("Event End");