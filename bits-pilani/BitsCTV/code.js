function init() {
  events();

  getGlobalS();
  // initDrag()
  initAnim();

  adjustScales();

  // console.log(ad_s)

  ddef.loopActive = true;

  loop();

  dur = o.video.duration;
  playerLoop();

  openFS();

  o.video.addEventListener("ended", (event) => {
    onPlayerStateChange("ended");
  });

  //prepCanvas();
}

// BOLTS
var size,
  c,
  ctx,
  center,
  minSegmentHeight,
  groundHeight,
  color,
  roughness,
  maxDifference;
var bolt_width = 22;
var render_bolt = false;

var bolt_timing = [
  [1.6, 1.9],
  [2.6, 3.1],
  [5.5, 6],
  [5.5, 9],
  [7, 9],
];
var bolt_exploded = false;

var prob = { val: 1 };

function prepCanvas() {
  c = o.canvas;
  ctx = ddef.ctx;

  ctx = o.canvas.getContext("2d");

  // console.log(o.canvas)
  // console.log(ctx)

  center = { x: ddef.screen.w / 2, y: ddef.screen.h / 2 };
  minSegmentHeight = 10;
  groundHeight = ddef.screen.w - 20;
  color = "hsl(180, 80%, 80%)";
  roughness = 2;
  maxDifference = ddef.screen.w / 5;

  ctx.globalCompositeOperation = "lighter";

  ctx.strokeStyle = color;
  ctx.shadowColor = color;

  render();
}

function render() {
  ctx.clearRect(0, 0, ddef.screen.w, ddef.screen.h);

  var pwr = 0;
  // bolt_timing
  var ct = o.video.currentTime;
  for (var i = 0; i < bolt_timing.length; i++) {
    var add_pwr = 0;
    var t1 = bolt_timing[i][0];
    var t2 = bolt_timing[i][1];
    if (ct > t1 && ct < t2) {
      var cur_t = ct - t1;
      var dur = t2 - t1;
      var proc = cur_t / dur;
      if (proc > 0.5) proc = 1 - proc;
      add_pwr = proc * 2;
    }
    pwr += add_pwr;
  }

  // console.log(pwr);

  bolt_pwr = pwr;

  if (bolt_pwr > 0) {
    render_bolt = true;
  } else {
    render_bolt = false;
  }

  if (bolt_exploded) {
    bolt_pwr = 0.5;
  }

  var rn = Math.random();
  if (render_bolt && prob.val > rn) {
    doBolt();

    if (bolt_pwr > 0.65) {
      doBolt();
    }

    if (bolt_pwr > 0.8) {
      doBolt();
    }

    if (bolt_pwr > 0.87) {
      doBolt();
    }

    if (bolt_pwr > 0.95) {
      doBolt();
    }
  }

  requestAnimFrame(render);
}

function doBolt() {
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowBlur = 15;
  var lightning = createLightning();
  ctx.beginPath();

  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.fillStyle = color;

  for (var i = 0; i < lightning.length; i++) {
    ctx.lineTo(lightning[i].x, lightning[i].y);
    ctx.lineWidth = (1 + Math.random() * bolt_width) * bolt_pwr;
  }
  ctx.stroke();
  ctx.stroke();
}

function createLightning() {
  var segmentHeight;
  var lightning = [];
  lightning.push({
    x: center.x + (0.5 - Math.random()) * ddef.screen.w * 0.2,
    y: center.y + (0.5 - Math.random()) * ddef.screen.h * 0.2,
  });
  // lightning.push({x: Math.random() * (ddef.screen.w - 100) + 50, y: groundHeight + (Math.random() - 0.9) * 50});

  var sideVer = Math.random() > 0.5 ? -1 : 1;
  var sideHor = Math.random() > 0.5 ? -1 : 1;
  var type = Math.random() > 0.5 ? "hor" : "ver";

  // lightning.push({x: ddef.screen.w/2 + sideHor * ddef.screen.w/2, y: ddef.screen.h/2 + sideHor * ddef.screen.h/2});

  if (type == "hor") {
    lightning.push({
      x: ddef.screen.w / 2 + (sideHor * ddef.screen.w) / 2,
      y: Math.random() * ddef.screen.h,
    });

    segmentHeight = ddef.screen.w - 20 - center.x;
  } else {
    lightning.push({
      y: ddef.screen.h / 2 + (sideHor * ddef.screen.h) / 2,
      x: Math.random() * ddef.screen.w,
    });

    segmentHeight = ddef.screen.w - 20 - center.y;
  }

  var currDiff = maxDifference;
  while (segmentHeight > minSegmentHeight) {
    var newSegments = [];
    for (var i = 0; i < lightning.length - 1; i++) {
      var start = lightning[i];
      var end = lightning[i + 1];
      var midX, midY;
      var newX, newY;

      if (type == "hor") {
        midY = (start.y + end.y) / 2;
        newY = midY + (Math.random() * 2 - 1) * currDiff;
        newX = (start.x + end.x) / 2;
      } else {
        midX = (start.x + end.x) / 2;
        newX = midX + (Math.random() * 2 - 1) * currDiff;
        newY = (start.y + end.y) / 2;
      }

      newSegments.push(start, { x: newX, y: newY });
    }

    newSegments.push(lightning.pop());
    lightning = newSegments;

    currDiff /= roughness;
    segmentHeight /= 2;
  }
  return lightning;
}

// BOLTS END

var bolt_fps = 25;
var bolt_cur = 0;
var bolt_tot = 13;
var bolt_last = 0;
var bolt_ended = false;
var bolt_s = 0;
var bolt_pwr = 0;

function explodeBolt() {
  // $("#canvas_24").appendTo(o.canvas_on_top);

  // console.log('explodeBolt')
  bolt_ended = true;
  bolt_exploded = true;

  gsap.to(prob, 0.5, { val: 0.2 });

  var bolt_el = hor_mode ? o.bolt_hor : o.bolt_ver;
  gsap.to(bolt_el, 0.7, {
    scale: 12,
    ease: "power1.in",
    onComplete: function () {
      gsap.set(o.screen, { autoAlpha: 0 });
      gsap.set(o.stuff, { autoAlpha: 0 });
    },
  });
  gsap.to(bolt_el, 0.3, { delay: 0.4, opacity: 0 });
  setTimeout(function () {
    gsap.to([o.logo, o.date, o.ctaFinal, o.videoFrame], 0.15, {
      autoAlpha: 0,
      onComplete: function () {
        gsap.to([o.logo, o.date, o.ctaFinal], { display: "none" });
      },
    });
    // console.log([o.logo, o.date, o.ctaFinal]);

    gsap.set(o.end_img, { display: "block", opacity: 1, scale: 1 });
    gsap.from(o.end_img, 0.7, { scale: 0, ease: "power2.out" });

    // gsap.to(o.cta2, 0.5, {scale: 1.08, ease: 'power1.inOut', yoyo: true, repeat: -1, transformOrigin: '70% 83%'})

    // fall bolts
    // var amm = 40;
    // for(var i=0; i<amm; i++){
    // addBolt(i)
    // }

    // setTimeout(function(){
    // 	bolt_ended = false;
    // 	var parent = o.falling_bolts;
    // 	parent.innerHTML = '';
    // 	// var bolt_el = hor_mode ? o.bolt_hor : o.bolt_ver;
    // 	// gsap.set(bolt_el, {scale: 0.08*bolt_s, opacity: 1})
    // }, 5000)
  }, 100);

  // setTimeout(function(){
  // 	playing = false;
  // 	o.video.currentTime = 0;
  // 	o.video.pause();
  // }, 500)
}

function addBolt(num) {
  var parent = o.falling_bolts;

  var newDiv = document.createElement("div");
  newDiv.style.position = "absolute";
  newDiv.style.width = "356px";
  newDiv.style.height = "648px";
  var rn = 1 + Math.floor(14 * Math.random());
  var url = assets_url + "bolt/" + "bolt_" + rn + ".png";
  n;
  var x = Math.random() * ddef.screen.w;
  // gsap.set(newDiv, {x: ddef.screen.w/2, y: ddef.screen.h/2, scale: ad_s * 0.4 + 0.3 * Math.random(), transformOrigin: '0% 0%'});

  gsap.set(newDiv, {
    opacity: 0,
    x: ddef.screen.w * Math.random(),
    y: ddef.screen.h / 2 - 1.5 * ddef.screen.h * Math.random(),
    scale: ad_s * 0.4 + 0.3 * Math.random(),
    transformOrigin: "0% 0%",
  });
  // gsap.to(newDiv, 0.25+0.5 * Math.random(), {x: ddef.screen.w * Math.random(), y: 0.3 * ddef.screen.h * Math.random(), ease: 'power3.out', onComplete: function(){
  ewDiv.style.backgroundImage = "url(" + url + ")";

  gsap.to(newDiv, 0.2 + 0.2 * Math.random(), { delay: 0.2, opacity: 1 });
  gsap.to(newDiv, 2 + 3 * Math.random(), {
    delay: 0.4,
    y: ddef.screen.h * 1.3,
    ease: "none",
  });

  // }})

  var dist = 100 * (0.5 - Math.random());
  var dur = Math.abs(dist) * 0.07;
  if (dur < 0.4) dur = 0.4;
  var tl = gsap.to(newDiv, dur, {
    x: "+=" + dist,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });

  setTimeout(function () {
    clearTimeout(tl);
  }, 5000);

  parent.appendChild(newDiv);
}

////////////////// LOOP ////////////////////
function loop() {
  requestAnimFrame(loop);
  if (ddef.loopActive) {
    // if(vid_playing || bolt_ended){
    // 	if(bolt_cur >= bolt_tot) bolt_cur = 0;
    // 	var add = hor_mode ? '' : '_ver';
    // 	var cur_el = o['b'+(bolt_cur+1)+add]
    // 	var last_el = o['b'+(bolt_last+1)+add]
    // 	gsap.set(last_el, {opacity: 0})
    // 	gsap.set(cur_el, {opacity: 1})
    // 	bolt_last = bolt_cur;
    // 	bolt_cur++;
    // } else {
    // 	var add = hor_mode ? '' : '_ver';
    // 	var last_el = o['b'+(bolt_last+1)+add]
    // 	gsap.set(last_el, {opacity: 0})
    // }
  }
}

var ft_sound = false;
var playing = false;
function togglePlayPause() {
  // console.log('togglePlayPause')
  startedFunction();

  if (!ft_sound) {
    ft_sound = true;
    gsap.set(o.ico_sound, { display: "none" });
    o.video.muted = false;
    startEvent("unmute");
  } else {
    ctaFunction();
  }

  // check video status
  var ct = o.video.currentTime;
  if (ct == 0) playing = false;

  playing = !playing;

  ddef.boltActive = playing ? true : false;

  // var el = playing ? o.ico_play : o.ico_pause;
  // gsap.set(el, {scale: 20, opacity: 0})
  // gsap.to(el, 0.2, {scale: 10, opacity: 1, ease: 'power1.out'})
  // gsap.to(el, 0.2, {delay: 0.2, opacity: 0, scale: 5, ease: 'power1.in'})

  if (!playing) {
    // o.video.pause();
    // onPlayerStateChange('pause')
  } else {
    // player.seekTo(0)
    // o.video.play();
    // onPlayerStateChange('play')
  }
}

function playVideo(num) {
  // console.log('playVideo', num)
  // show player
  ddef.movies.cur = parseInt(num);
  gsap.set(o.videoFrame, { display: "block" });

  // play video
  // var id = MOVIE_IDS[num];
  // if(ddef.movies.ft){
  // 	ddef.movies.ft = false;
  // 	prep(id);
  // } else {
  // 	player.loadVideoById(id, 0)
  // }
}

function closeMovie() {
  startEvent("closeMovie");
  // gsap.set(o.videoFrame, {display: 'none'})
  o.video.pause();
  // console.log('ppppaaaauuuussseeee')
}

function initAnim() {
  gsap.set([o.bolt_hor, o.bolt_ver], { display: "none" });

  // var bolt_el = hor_mode ? o.bolt_hor : o.bolt_ver;
  // var bolt_el2 = hor_mode ? o.bolt_anim_hor : o.bolt_anim_ver;
  // if(hor_mode){
  // 	gsap.set(bolt_el, {scale: 0.08*bolt_s, x: 50, y: 50, opacity: 1})
  // } else {
  // 	gsap.set(bolt_el, {scale: 0.08*bolt_s, x: 0, y: 0, opacity: 1})
  // }
  // gsap.set(bolt_el2, {scale: 2})

  gsap.set(o.cta2, { scale: 0.9, transformOrigin: "90% 90%" });

  // gsap.from(o.shade, 0.5, {delay: 0.2, opacity: 0})
  // gsap.set(o.cta1, {scale: 1})
  // gsap.set(o.shade, {scaleX: 0.55, scaleY: 0.8})
  // gsap.set(o.small, {display: 'block'})

  var fps = 25;
  var cur = 0;
  var tot = 13;
  var last = 0;
  // setInterval( function(){
  // 	if(!ddef.pauseSeq){
  // 		if(cur >= tot) cur = 0;
  // 		var cur_el = o['b'+(cur+1)]
  // 		var last_el = o['b'+(last+1)]
  // 		gsap.set(last_el, {opacity: 0})
  // 		gsap.set(cur_el, {opacity: 1})

  // 		last = cur;
  // 		cur++;
  // 	}
  // }, 1000/fps)

  // intro
  var s1 = screen.width > 500 ? 13 : 8;
  var s2 = screen.width > 500 ? 9 : 5;
  gsap.set(o.ico_sound, { opacity: 1, scale: s1 });
  gsap.from(o.ico_sound, 0.35, {
    delay: 0.5,
    scale: 0,
    transformOrigin: "50% 50%",
    onComplete: function () {
      ddef.ico_sound = gsap.to(o.ico_sound, 0.4, {
        scale: s2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  });
}

function wiggle(el, prop) {
  var max_rad = 40;
  var min_rad = 15;
  var max_dur = 0.4;

  var curVal = gsap.getProperty(el, prop);
  var dist = min_rad + Math.random() * (max_rad - min_rad);
  var val = dist - max_rad / 2;
  var deltaVal = Math.abs(val - curVal);
  var dur = ((2 * deltaVal) / max_rad) * max_dur;

  if (prop == "x") {
    gsap.to(el, dur, {
      x: val,
      ease: "power1.inOut",
      onComplete: function () {
        wiggle(el, prop);
      },
    });
  } else if (prop == "y") {
    gsap.to(el, dur, {
      y: val,
      ease: "power1.inOut",
      onComplete: function () {
        wiggle(el, prop);
      },
    });
  }
}

function openFS() {
  o.masked.style.opacity = 1;
  // ddef.pauseSeq = true;
  startEvent("OpenFullscreen");
  // gsap.set(o.cta1, {display: 'none'})

  playing = true;
  // o.audio_24.play();

  gsap.set(o.close_ad_btn, { display: "block" });
  o.container.style.display = "block";
  // console.log('ddef.screen.y', ddef.screen.h)
  // gsap.fromTo(o.container, 0.8, {y: ddef.screen.h}, {y: 0, ease: 'power2.out'})

  // -webkit-mask-size: 50vmin;
  // mask-size: 50vmin;

  // MASK ANIM MASK ANIM MASK ANIM
  var el = o.masked;
  var count = { val: 0, logoVal: 0 };

  gsap.set(o.logo, { opacity: 0 });
  gsap.set(o.bg_shade, { opacity: 0 });

  gsap.to(count, 0.3, {
    val: 0.015,
    ease: "back.out",
    onUpdate: function () {
      var val = count.val;
      var res = val * 800 + "vmax";

      el.style.webkitMaskSize = res;
      el.style.maskSize = res;
    },
    onComplete: function () {
      gsap.to(count, 0.85, {
        val: 1,
        logoVal: 1,
        ease: "power2.in",
        onUpdate: function () {
          var val = count.val;
          var res = val * 800 + "vmax";

          gsap.set(o.logo, { opacity: count.logoVal });
          gsap.set(o.bg_shade, { opacity: count.logoVal * 0.3 });

          el.style.webkitMaskSize = res;
          el.style.maskSize = res;
        },
        onComplete: function () {
          // console.log(o.video)
          var count2 = { val: 0 };
          var blurInter = setInterval(function () {
            o.video.play();
            count2.val += 0.65;
            var num = count2.val;
            var val = "blur(" + num + "px)";
            o.masked.style.filter = val;
            if (count2.val > 5) {
              clearInterval(blurInter);
            }
          }, 50);
        },
      });
    },
  });

  var x = ddef.screen.w / 2 + (0.1 * ddef.movies.sw) / 2;
  var dur = 0.8;
  var ease = "power1.inOut";

  var tl = gsap.timeline({});

  // tl.set([o.screenOnTop], {display: 'block', onComplete: function(){
  // adjustScales()
  setTimeout(adjustScales, 50);
  // }
  // })

  setTimeout(function () {
    playVideo(0);
    adjustScales();
  }, 500);

  gsap.set(o.screen, { opacity: 0 });
  gsap.set(o.date, { opacity: 0 });
  gsap.set(o.ctaFinal, { opacity: 0 });

  setTimeout(function () {
    gsap.set([o.stuff, o.bottom], { opacity: 1 });
    // gsap.from(o.logo, 0.65, {delay: 0.1, scale: 0, ease: 'power1.out'})
    gsap.fromTo(
      o.screen,
      0.65,
      { opacity: 0 },
      { delay: 0.6, opacity: 1, ease: "power1.out" }
    );
    gsap.fromTo(
      o.date,
      0.5,
      { opacity: 0, y: 50 },
      { delay: 0.8, y: 0, opacity: 1, ease: "power2.out" }
    );
    gsap.fromTo(
      o.ctaFinal,
      0.5,
      { opacity: 0, y: 50 },
      { delay: 0.9, y: 0, opacity: 1, ease: "power2.out" }
    );

    // gsap.from(o.mario_big, 0.65, {delay: 0.2, x: -150, opacity: 0, ease: 'power2.out'})
    // gsap.from(o.child, 0.65, {delay: 0.3, x: 150, opacity: 0, ease: 'power2.out'})
    // gsap.from(o.princess, 0.65, {delay: 0.4, x: 150, opacity: 0, ease: 'power2.out'})
  }, 10);
}

///////////////// OPEN CLOSE ////////////////

function closeAd() {
  o.cta1.removeEventListener("click", openFS);
  gsap.set(o.close_small_btn, { display: "none" });
  var dur = 0.4;

  gsap.to(o.shade, 0.5, { delay: 0.0, opacity: 0 });
  gsap.to(o.cta1, 0.3, { opacity: 0 });
  ddef.pauseSeq = true;
}

function closePop() {
  ddef.pauseSeq = false;
  startEvent("closePop");

  gsap.to(o.end_img, 0.3, { delay: 0.1, opacity: 0 });

  closeMovie();

  // resetGame();

  gsap.set(o.close_ad_btn, { display: "none" });

  // MASK ANIM MASK ANIM MASK ANIM
  var el = o.masked;
  var count = { val: 1 };
  gsap.to(count, 0.6, {
    val: 0,
    ease: "power1.inOut",
    onUpdate: function () {
      var val = count.val;
      var res = val * 800 + "vmax";

      gsap.set(o.bg_shade, { opacity: val * 0.3 });

      el.style.webkitMaskSize = res;
      el.style.maskSize = res;
    },
    onComplete: function () {
      gsap.set(o.container, { display: "none" });

      gsap.set(o.cta1, { display: "block" });
      gsap.set(o.logo, { delay: 0.0, opacity: 1 });
      gsap.set(o.screen, { delay: 0.0, opacity: 1 });
      gsap.set(o.info, { delay: 0.0, opacity: 1 });
    },
  });

  gsap.to(o.logo, 0.4, { delay: 0.0, opacity: 0 });
  gsap.to(o.screen, 0.4, { delay: 0.0, opacity: 0 });
  gsap.to(o.info, 0.4, { delay: 0.0, opacity: 0 });

  // gsap.to(o.container, 0.45, {y: ddef.screen.h, ease: 'power2.in', onComplete: function(){
  // 	o.container.style.display = "none";
  // }})

  // gsap.to(o.screenOnTop, 0.6, {opacity: 0, delay: 0.2})

  // var x = ddef.screen.w/2 + 0.1*ddef.movies.sw/2;
  // var dur = 0.73;
  // gsap.to(o.c1, dur, {delay: 0.1, x: x, ease: 'power1.inOut'})
  // gsap.to(o.c2, dur, {delay: 0.1, x: -x, ease: 'power1.inOut', onComplete: function(){
  // 	// gsap.set([o.screen, o.wall], {display: 'none'})
  //   gsap.to(o.c1, dur, {x: -ddef.screen.w/2, ease: 'power1.in'})
  //   gsap.to(o.c2, dur, {x: ddef.screen.w/2, ease: 'power1.in', onComplete: function(){
  //     o.container.style.display = "none";
  //   }})

  // }})
  // gsap.to(o.wrapper, dur, {delay: 0.1, scale: 1.8, transformOrigin: '50% 0%', ease: 'power1.inOut'})
}

////////////////// EVENTS ///////////////////

function events() {
  // o.close_btn.addEventListener("click", closeMovie);

  _window.addEventListener("resize", onResize);
  onResize();
  o.close_ad_btn.addEventListener("click", closePop);
  // o.close_small_btn.addEventListener("click", closeAd);
  o.screen.addEventListener("click", togglePlayPause);

  // o.cta1.addEventListener("click", openFS);
  // o.gameCtaArea.addEventListener("click", openFS);

  setTimeout(function () {
    o.container.addEventListener("click", (e) => {
      if (
        e.target.id === "cta2_area_24" ||
        e.target.id === "videoFrame_24" ||
        e.target.id === "close_ad_btn_24"
      ) {
      } else {
        ctaFunction();
      }
      //   ctaFunction();
    });
    // o.logo.addEventListener("click", ctaFunction);
    // o.ctaFinal.addEventListener("click", ctaFunction);
    // o.endImg.addEventListener("click", ctaFunction);
    o.cta2_area.addEventListener("click", ctaFunction);
  }, 500);
}

function addToCalendar() {
  window.open(CALENDAR_LINK);
  startEvent("Click_Calender");
  //   console.log("addToCalendar");
}

var hor_mode = false;

function adjustScales() {
  // console.log(o.video.width)
  o.white_shade.style.width = o.video.width + "px";
  o.white_shade.style.height = o.video.height + "px";

  o.canvas.width = ddef.screen.w;
  o.canvas.height = ddef.screen.h;

  var s = 1.3;
  ddef.ad_scale = ad_s * s;
  // console.log(ad_s)

  ddef.small_s = ad_s * 0.85;
  // gsap.set(o.small, {scale: ddef.small_s, transformOrigin: '100% 100%'})

  // ddef.screen.w
  // ddef.ver
  var w = 960;
  var h = 540;

  var s = ad_s > 0.7 ? 0.7 : ad_s;
  gsap.set(o.close_ad_btn, { scale: s });

  var rect = o.screen.getBoundingClientRect();

  var playerRect = o.playerCont.getBoundingClientRect();
  // console.log('playerRect', playerRect)
  var min =
    playerRect.width > playerRect.height ? playerRect.height : playerRect.width;
  bolt_s = min * 0.005;
  // console.log('bolt_s', bolt_s)

  var screenRat = rect.width / rect.height;
  var vidRat = w / h;

  var x, y, s;

  if (screenRat > vidRat) {
    // console.log('HOR') // pagal h
    s = rect.height / h;
    x = (rect.width - w * s) / 2;
    y = 0;
  } else {
    // console.log('VER') // pagal w
    s = rect.width / w;
    x = 0;
    y = (rect.height - h * s) / 2;
  }

  hor_mode = ddef.screen.w > ddef.screen.h ? true : false;

  // console.log('hor_mode', hor_mode)
  // gsap.set(hor_mode ? o.bolt_hor : o.bolt_ver, {display: 'block'})
  // gsap.set(!hor_mode ? o.bolt_hor : o.bolt_ver, {display: 'none'})

  if (!hor_mode) {
    // var x= -356/2;
    // var y = -648/2;

    gsap.set(o.bolt_ver, { y: ddef.screen.h * 0.35 });
  }

  //ss
  // gsap.set(o.playerCont, { x: x, y: y, scale: s, transformOrigin: "0% 0%" });

  o.info.style.width = s * w + "px";

  var s = ad_s > 0.7 ? ad_s : 0.7;
  gsap.set([o.logo], { scale: s, transformOrigin: "50% 50%" });
  gsap.set([o.mask], { scale: s, transformOrigin: "50% 50%" });
  // gsap.set([o.date], {scale: s, transformOrigin: '100% 50%'})
  // gsap.set([o.ctaFinal], {scale: s, transformOrigin: '0% 50%'})
  // console.log(s);

  if (!ddef.ver) {
    // horizontal

    // SCREEN

    var el = o.screen;
    var w = 960;
    var h = 540;
    var orig = "0% 0%";
    var sh = 0.45;

    var dh_px = sh * ddef.screen.h;
    var s = dh_px / h;
    var sw = w * s;

    var x = ddef.screen.w / 2 - (w * s) / 2;
    var y = ddef.screen.h * 0.085;

    // playerCont_24
    // gsap.set(el, {scale: s, transformOrigin: "50% 50%"})

    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
  } else {
    // vertical

    // 	// SCREEN

    var el = o.screen;
    var w = 960;
    var h = 540;
    var orig = "0% 0%";
    var sh = 0.45;

    var s = (ddef.screen.w / w) * 0.9;
    var x = 0.05 * ddef.screen.w;
    var y0 = ddef.screen.h * 0.085;
    var hh = ddef.screen.h * 0.45;
    var ch = s * h;
    var y = y0 + (hh - ch) / 2;
    var sw = w * 0.9;
    ddef.movies.sw = sw;

    // gsap.set(el, {scale: s, transformOrigin: "50% 50%"})
    // gsap.set(el, {x: x, y: y, scale: s, transformOrigin: orig})
    // gsap.set(el, {scale: 0})
  }
}

//////////////////////////////////////////////////

/////////////////////// D R A G /////////////////////////////

/// DRAG ///

function initDrag() {
  var dragAmm = 0;
  var dex = 0;
  var dey = 0;
  var cx = 0;
  var cy = 0;
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  // dragElement( o.container );
  dragElement(o.gameCtaArea);

  function dragElement(elmnt) {
    elmnt.onmousedown = dMouseDown;
    // var el = o.container;
    var el = elmnt;
    el.ontouchstart = dTouchDown;

    function dMouseDown(e) {
      e = e || _window.event;
      e.preventDefault();
      // gsap.to(o.sc_wrapper, 0.2, {scale: 1.1, ease: Power1.easeOut})

      pos3 = e.clientX;
      pos4 = e.clientY;

      dragMouseDown(e);
    }
    function dTouchDown(e) {
      e = e || _window.event;
      e.preventDefault();

      // gsap.to(o.sc_wrapper, 0.2, {scale: 1.1, ease: Power1.easeOut})

      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;

      dragMouseDown(e);
    }

    function dragMouseDown(e) {
      dragAmm = 0;
      _document.onmouseup = closeDragElement;
      _document.ontouchend = closeDragElement;
      _document.onmousemove = mouseDrag;
      _document.ontouchmove = touchDrag;
    }

    function mouseDrag(e) {
      e = e || _window.event;
      // e.preventDefault();
      elementDrag(e, true);
    }

    function touchDrag(e) {
      e.stopImmediatePropagation();

      elementDrag(e, false);
    }

    var sPos = { x: 0, y: 0 };
    var cPos = { x: 0, y: 0 };

    function elementDrag(e, isMouse) {
      dragAmm++;
      var clientX = isMouse ? e.clientX : e.touches[0].clientX;
      var clientY = isMouse ? e.clientY : e.touches[0].clientY;

      pos1 = pos3 - clientX;
      pos2 = pos4 - clientY;
      pos3 = clientX;
      pos4 = clientY;

      cPos.x += sPos.x - pos1;
      cPos.y += sPos.y - pos2;

      var x = cPos.x;
      var y = cPos.y;

      ddef.drag.x = x;
      ddef.drag.y = y;

      // console.log(x, y)

      // o.container.style.marginRight = -x + "px";
      // o.container.style.marginBottom = -y + "px";
      o.small.style.right = -x + "px";
      o.small.style.bottom = -y + "px";
    }

    function closeDragElement(e) {
      if (dragAmm <= 2 && click == 0) {
        // console.log("CTA")

        // ddef.box.cur++;

        // if(ddef.box.cur == 1){
        // 	// hideBTN();
        // 	// showNEXT( true );
        // } if(ddef.box.cur == bgs.length-1){
        // 	// showNEXT( false );
        // 	// showCTA();
        // } else if (ddef.box.cur < bgs.length-1){
        // 	gsap.to(o.next, 0.05, {delay: 0.0, opacity: 0, onComplete: function(){
        // 		gsap.to(o.next, 0.15, {delay: 0.85, opacity: 1});
        // 	}})
        // }

        // if(ddef.box.cur >=  bgs.length) {
        openFS();
        // } else {
        // gsap.to(o.cursor, 0.05, {opacity: 0});
        // gsap.to(o.cursor, 0.5, {delay: 1, opacity: 1});
        // explodeAd();
        // startEvent("click");
        // }

        click = 1;
        setTimeout(function () {
          click = 0;
        }, 1000);
      } else {
        if (click == 0) {
          startEvent("drag");
        }
      }

      // gsap.to(o.sc_wrapper, 0.25, {scale: 1, ease: Power1.easeOut})
      _document.onmouseup = null;
      _document.onmousemove = null;
      _document.ontouchend = null;
      _document.ontouchmove = null;
    }

    var click = 0;
  }
}
