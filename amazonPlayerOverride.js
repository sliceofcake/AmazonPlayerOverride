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
		// generate style text
		gst : function(){
			return ""
			+"@import url('https://fonts.googleapis.com/css?family=Open+Sans:700');"
			+".amazon-player-override-hidden-2>*>*>* {"
				+"top:0px !important;"
				+"bottom:unset !important;"
				+"width:unset !important;"
				+"height:calc(100% - "+(this.bottomGap + (this.hVideo * this.subtitleRaise))+"px) !important;}"
			+".amazon-player-override-hidden-2>*>*>*>*>* {"
				+"padding:unset !important;}"
			+".amazon-player-override-hidden-2>*>*>*>*>*>* {"
				+"padding:unset !important;"
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
			+(this.vis ? "" : ".amazon-player-override-hidden {display:none !important;}")
			+(this.visSubtitle ? "" : ".amazon-player-override-hidden-2 {display:none !important;}")
			+((this.vis || this.mouseShowF) ? "" : "* {cursor:none !important;}");},
		// assert style
		ast : function(){
			// tag the clutter
			var elL = this.qda(this.doc,".webPlayer>.scalingUiContainer>.scalingUiContainerBottom>.overlaysContainer>:not(.controlsOverlay)"); // >.controlsOverlayTop>.persistentPanel
			for (var elLI = 0,elLC = elL.length; elLI < elLC; elLI++){var el = elL[elLI];
				el.classList.add("amazon-player-override-hidden");}
			
			var elL = this.qda(this.doc,".webPlayer>.scalingUiContainer>.scalingUiContainerBottom>.overlaysContainer>.controlsOverlay>:not(.controlsOverlayTop)"); // >.persistentPanel
			for (var elLI = 0,elLC = elL.length; elLI < elLC; elLI++){var el = elL[elLI];
				el.classList.add("amazon-player-override-hidden");}
			
			var elL = this.qda(this.doc,".webPlayer>.scalingUiContainer>.scalingUiContainerBottom>.overlaysContainer>.controlsOverlay>.controlsOverlayTop>:not(.persistentPanel)");
			for (var elLI = 0,elLC = elL.length; elLI < elLC; elLI++){var el = elL[elLI];
				el.classList.add("amazon-player-override-hidden");}
			
			var el = this.qd(this.doc,".webPlayer>.scalingUiContainer>.scalingUiContainerBottom>.overlaysContainer>.controlsOverlay>.controlsOverlayTop>.persistentPanel");
			if (el !== null){
				el.classList.add("amazon-player-override-hidden-2");}
			
			this.qd(this.doc,"#amazon-player-override-style").textContent = this.gst();},
		//
		rescan : function(){
			var elv = this.qd(document,"video[src^='blob:']");
			if (elv !== null && this.elv !== elv){
				this.elv = elv;}},
		// event-block
		evb : function(ev){ev.stopPropagation();ev.preventDefault();},
		// key enun
		kye : {_:32,l:37,r:39,u:38,d:40,h:72,f:70,s:83,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57},
		// query selector downward
		qd  : function(elP,s){return elP.querySelector(s);},
		// query selector downward all
		qda : function(elP,s){return elP.querySelectorAll(s);},
	};
	p.doc = document;
	p.rescan();setInterval((function(p){return function(){p.rescan();};})(p),1000);
	
	// check for resizes occasionally
	setInterval((function(p){return function(){
		if (p.elv === null){return;} // fail-fast
		if (p.h !== p.elv.clientHeight){p.h = p.elv.clientHeight;
			var wMultN = p.elv.clientWidth  / p.elv.videoWidth ;
			var hMultN = p.elv.clientHeight / p.elv.videoHeight;
			p.hVideo = p.elv.videoHeight * Math.min(wMultN,hMultN);
			p.bottomGap = (p.elv.clientHeight - p.hVideo) / 2;
			p.ast();}};})(p),100);
	
	// assert style
	var el = document.createElement("style");
	el.id = "amazon-player-override-style";
	p.doc.head.appendChild(el);
	p.ast();
	
	// mousemove will temporarily show mouse if it's hidden
	p.doc.addEventListener("mousemove",(function(p){return function(ev){
		p.mouseShowF = true;
		p.ast();
		clearTimeout(p.mouseShowDelayHandle);
		p.mouseShowDelayHandle = setTimeout((function(p){return function(){p.mouseShowF = false;p.ast();};})(p),p.mouseShowDelay);};})(p));
	
	// shortcuts
	// [!] it was too difficult to try fighting with Amazon's click handlers, since we aren't properly equipped to locate/combat them
	p.doc.addEventListener("keydown",(function(p){return function(ev){
		switch (ev.keyCode){default:;
			break;case p.kye.l    : p.evb(ev);p.elv.currentTime  -= p.posDlt  ;
			break;case p.kye.r    : p.evb(ev);p.elv.currentTime  += p.posDlt  ;
			break;case p.kye.s    : p.evb(ev);p.elv.currentTime  += p.opedDlt ;
			break;case p.kye.u    : p.evb(ev);if (p.elv.volume >= 1 - p.volDlt){p.elv.volume = 1;}else{p.elv.volume += p.volDlt;}
			break;case p.kye.d    : p.evb(ev);if (p.elv.volume <= 0 + p.volDlt){p.elv.volume = 0;}else{p.elv.volume -= p.volDlt;}
			break;case p.kye["0"] : p.evb(ev);p.elv.playbackRate  =  1.0;
			break;case p.kye["1"] : p.evb(ev);p.elv.playbackRate  =  1.1;
			break;case p.kye["2"] : p.evb(ev);p.elv.playbackRate  =  1.2;
			break;case p.kye["3"] : p.evb(ev);p.elv.playbackRate  =  1.3;
			break;case p.kye["4"] : p.evb(ev);p.elv.playbackRate  =  1.4;
			break;case p.kye["5"] : p.evb(ev);p.elv.playbackRate  =  1.5;
			break;case p.kye["6"] : p.evb(ev);p.elv.playbackRate  =  1.6;
			break;case p.kye["7"] : p.evb(ev);p.elv.playbackRate  =  1.7;
			break;case p.kye["8"] : p.evb(ev);p.elv.playbackRate  =  1.8;
			break;case p.kye["9"] : p.evb(ev);p.elv.playbackRate  =  1.9;}};})(p),true);
	p.doc.addEventListener("keyup",(function(p){return function(ev){
		if (ev.shiftKey){
			switch (ev.keyCode){default:;
				break;case p.kye.h : p.evb(ev);p.visSubtitle = !p.visSubtitle;p.ast();}}
		else{
			switch (ev.keyCode){default:;
				break;case p.kye.h : p.evb(ev);p.vis = !p.vis;p.ast();}}};})(p),true);
})();