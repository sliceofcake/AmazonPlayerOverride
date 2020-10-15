(function(){
	var p = {
		
		// !!! Eventually fold into HIDIVEPlayerOverride, which is by far the best of the trio.
		
		//----------------------------------------
		// PROGRAMMER CONFIGURATION VARIABLES
		mouseShowDelay            : 500     , // (milliseconds)
		posDlt                    :   1     , // (seconds)
		opedDlt                   :  85     , // (seconds)
		volDlt                    :   0.04  , // (range:[0,1])
		fontSize                  :   0.0527, // 1-based percent of video height to use for subtitle font size (range:[0,1])
		subtitleRaise             :   0.045 , // 1-based percent of video height to use for space between subtitles and video bottom (range:[0,1])
		//----------------------------------------
		
		// the actual height of the displayed video, excluding any black gaps
		hVideo : 0,
		// height of the potential black gap at the bottom of the screen
		bottomGap : 0,
		
		// video element
		elv : null,
		// visibility state of clutter
		vis : true,
		// visibility state of subtitles
		visSubtitle : true,
		// whether to temporarily show the mouse around the time of mouse movement even if it's hidden
		mouseShowF : false,
		//
		mouseShowDelayHandle : null,
		//
		tmrCdeM : undefined,
		mousemove : undefined,
		keydown : undefined,
		keyup : undefined,
		
		// generate style text
		gst : function(){
			return ""
			+"@import url('https://fonts.googleapis.com/css?family=Open+Sans:700');"
			+".atvwebplayersdk-captions-text {"
				+"box-sizing:border-box !important;"
				+"display:block !important;"
				+"position:fixed !important;"
				+"bottom:"+(this.bottomGap + (this.hVideo * this.subtitleRaise))+"px !important;"
				+"left:0px !important;"
				+"width:100% !important;"
				+"text-align:center;"
				+"padding:0px 10% !important;"
				+"font-family:'Open Sans',sans-serif !important;"
				+"line-height:1.2em !important;"
				+"letter-spacing:-0.025em !important;"
				+"font-size:"+(this.hVideo * this.fontSize)+"px;"
				+"font-weight:700 !important;"
				+"color:white !important;"
				+"background-color:transparent !important;"
				+"text-stroke:0em black !important;"
				+"-webkit-text-stroke:0em black !important;"
				+"text-shadow:0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black,0px 0px 0.2em black !important;}"
			+(this.vis
				? ""
				: ""
					+".f1nfs001,"
					+".fddsvlq.f8hspre.f1icw8u,"
					+".atvwebplayersdk-bottompanel-container,"
					+".atvwebplayersdk-nextupcard-wrapper,"
					+".fofauj8.f8hspre {display:none !important;}")
			+(this.visSubtitle ? "" : ".atvwebplayersdk-captions-text {display:none !important;}")
			+((this.vis || this.mouseShowF) ? "" : "* {cursor:none !important;}");},
		// assert style
		ast : function(){
			this.qd(this.doc,"#amazon-player-override-style").textContent = this.gst();},
		// event-block
		evb : function(ev){ev.stopPropagation();ev.preventDefault();},
		// key enum
		kye : {_:32,l:37,r:39,u:38,d:40,h:72,f:70,s:83,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57},
		// query selector downward
		qd  : function(elP,s){return elP.querySelector(s);},
		// query selector downward all
		qda : function(elP,s){return elP.querySelectorAll(s);},
		
		//
		hedFxn : function(){
			
			// If this is a re-run, do some cleanup first.
			if (window.amazonPlayerOverride !== undefined){
				clearTimeout(window.amazonPlayerOverride.tmrCdeM);
				window.amazonPlayerOverride.doc.removeEventListener("mousemove",window.amazonPlayerOverride.mousemove);
				window.amazonPlayerOverride.doc.removeEventListener("keydown",window.amazonPlayerOverride.keydown,true);
				window.amazonPlayerOverride.doc.removeEventListener("keyup",window.amazonPlayerOverride.keyup,true);
				;}
			
			this.doc = document;
			
			// assert style
			if (this.doc.head.querySelector("#amazon-player-override-style") === null){
				var el = this.doc.createElement("style");
				el.id = "amazon-player-override-style";
				this.doc.head.appendChild(el);}
			this.ast();
			
			this.interval = (function(p){return function(){
				
				// Scan for video element.
				var elv = p.qd(p.doc,"video[src^='blob:']");
				if (elv !== null && p.elv !== elv){
					p.elv = elv;}
				
				// Scan for resize.
				if (p.elv !== null){
					if (p.h !== p.elv.clientHeight){p.h = p.elv.clientHeight;
						var wMultN = p.elv.clientWidth  / p.elv.videoWidth ;
						var hMultN = p.elv.clientHeight / p.elv.videoHeight;
						p.hVideo = p.elv.videoHeight * Math.min(wMultN,hMultN);
						p.bottomGap = (p.elv.clientHeight - p.hVideo) / 2;
						p.ast();}}
				
				;};})(this);
			this.interval();
			this.tmrCdeM = setInterval(this.interval,100);
			
			// mousemove will temporarily show mouse if it's hidden
			this.mousemove = (function(p){return function(ev){
				p.mouseShowF = true;
				p.ast();
				clearTimeout(p.mouseShowDelayHandle);
				p.mouseShowDelayHandle = setTimeout((function(p){return function(){p.mouseShowF = false;p.ast();};})(p),p.mouseShowDelay);};})(this);
			this.doc.addEventListener("mousemove",this.mousemove);
			
			// shortcuts
			// [!] it was too difficult to try fighting with Amazon's click handlers, since we aren't properly equipped to locate/combat them
			this.keydown = (function(p){return function(ev){
				switch (ev.keyCode){default:;
					break;case p.kye["l"] : p.evb(ev);p.elv.currentTime  -= p.posDlt  ;
					break;case p.kye["r"] : p.evb(ev);p.elv.currentTime  += p.posDlt  ;
					break;case p.kye["s"] : p.evb(ev);p.elv.currentTime  += p.opedDlt ;
					break;case p.kye["u"] : p.evb(ev);if (p.elv.volume >= 1 - p.volDlt){p.elv.volume = 1;}else{p.elv.volume += p.volDlt;}
					break;case p.kye["d"] : p.evb(ev);if (p.elv.volume <= 0 + p.volDlt){p.elv.volume = 0;}else{p.elv.volume -= p.volDlt;}
					break;case p.kye["0"] : p.evb(ev);p.elv.playbackRate  =  1.0;
					break;case p.kye["1"] : p.evb(ev);p.elv.playbackRate  =  1.1;
					break;case p.kye["2"] : p.evb(ev);p.elv.playbackRate  =  1.2;
					break;case p.kye["3"] : p.evb(ev);p.elv.playbackRate  =  1.3;
					break;case p.kye["4"] : p.evb(ev);p.elv.playbackRate  =  1.4;
					break;case p.kye["5"] : p.evb(ev);p.elv.playbackRate  =  1.5;
					break;case p.kye["6"] : p.evb(ev);p.elv.playbackRate  =  1.6;
					break;case p.kye["7"] : p.evb(ev);p.elv.playbackRate  =  1.7;
					break;case p.kye["8"] : p.evb(ev);p.elv.playbackRate  =  1.8;
					break;case p.kye["9"] : p.evb(ev);p.elv.playbackRate  =  1.9;}};})(this);
			this.doc.addEventListener("keydown",this.keydown,true);
			
			this.keyup = (function(p){return function(ev){
				if (ev.shiftKey){
					switch (ev.keyCode){default:;
						break;case p.kye.h : p.evb(ev);p.visSubtitle = !p.visSubtitle;p.ast();}}
				else{
					switch (ev.keyCode){default:;
						break;case p.kye.h : p.evb(ev);p.vis = !p.vis;p.ast();}}};})(this);
			this.doc.addEventListener("keyup",this.keyup,true);
			
			;},
	};
	
	// Run main function.
	p.hedFxn();
	
	// Register this object in case this script is called again.
	window.amazonPlayerOverride = p;
})();