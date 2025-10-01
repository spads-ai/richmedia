
// CREATE PLAYER
  var player;
  var q1 = false;
  var q2 = false;
  var q3 = false;
  var dur = 0;


  // EVENTS

  function onPlayerStateChange(event) {
    if(event == 'play'){
      startEvent("play")
    } else if (event == 'pause'){
      startEvent("pause")
    } else if (event == 'ended'){
      startEvent("ended")
      if(!bolt_ended) explodeBolt();
    }
  }

  var last_t = -1;
  var vid_playing = false;
  var vid_ft = false;

  function playerLoop(){
    requestAnimFrame(playerLoop);

    var time = o.video.currentTime;

    vid_playing = last_t == time ?  false : true;
    last_t = time;

    var proc = 0.25 * time / dur;
    if(vid_playing){
      ddef.bolt_wiggle = Math.sin(time * 8) * 0.1;
      var s = ( 0 + (0.08 + proc) * (1 + ddef.bolt_wiggle)) * bolt_s;
      var el = hor_mode ? o.bolt_hor : o.bolt_ver;
      gsap.set(el, {scale: s})

      if(!vid_ft && time!=0){
        vid_ft = true;
        startEvent('playFirstTime')
      }
    }

    // console.log( time, dur )
    if(!q1 && time > dur*1/4){
      q1 = true;
      startEvent("25proc")
    }
    if(!q2 && time > dur*2/4){
      q2 = true;
      startEvent("50proc")
    }
    if(!q3 && time > dur*3/4){
      q3 = true;
      startEvent("75proc")


    }

    if(time > dur*3/4){
      var dt = dur*3/4;
      var val = (time-dt) / (dur-dt); // 0 -> 1
      gsap.set(o.white_shade, {opacity: val * Math.random()})
      // console.log(val)
    }

    // if(!ft_sound && vid_playing && time!=0){
    //   ft_sound = true;
    //   gsap.set(o.ico_sound, {display: 'none'})
    // }
    if(!ft_sound && vid_playing && time!=0 && !o.video.muted){
      ft_sound = true;
      gsap.set(o.ico_sound, {display: 'none'})
    }

  }

