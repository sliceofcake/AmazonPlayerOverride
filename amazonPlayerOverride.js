(function(){
	var p = {
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
			+(this.vis ? "" : ".amazon-player-override-hidden {display:none !important;}")
			+(this.visSubtitle ? "" : ".amazon-player-override-hidden-2 {display:none !important;}")
			+((this.vis || this.mouseShowF) ? "" : "* {cursor:none !important;}");},
		// assert style
		ast : function(){
			// tag the clutter
			var elL = this.qda(this.doc,".webPlayer>.overlaysContainer>:not(.controlsOverlay)"); // >.controlsOverlayTop>.persistentPanel
			for (var elLI = 0,elLC = elL.length; elLI < elLC; elLI++){var el = elL[elLI];
				el.classList.add("amazon-player-override-hidden");}
			
			var elL = this.qda(this.doc,".webPlayer>.overlaysContainer>.controlsOverlay>:not(.controlsOverlayTop)"); // >.persistentPanel
			for (var elLI = 0,elLC = elL.length; elLI < elLC; elLI++){var el = elL[elLI];
				el.classList.add("amazon-player-override-hidden");}
			
			var elL = this.qda(this.doc,".webPlayer>.overlaysContainer>.controlsOverlay>.controlsOverlayTop>:not(.persistentPanel)");
			for (var elLI = 0,elLC = elL.length; elLI < elLC; elLI++){var el = elL[elLI];
				el.classList.add("amazon-player-override-hidden");}
			
			var el = this.qd(this.doc,".webPlayer>.overlaysContainer>.controlsOverlay>.controlsOverlayTop>.persistentPanel");
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
		p.mouseShowDelayHandle = setTimeout((function(p){return function(){p.mouseShowF = false;p.ast();};})(p),500);};})(p));
	
	// shortcuts
	// [!] it was too difficult to try fighting with Amazon's click handlers, since we aren't properly equipped to locate/combat them
	p.doc.addEventListener("keydown",(function(p){return function(ev){
		switch (ev.keyCode){default:;
			break;case p.kye.l    : p.evb(ev);p.elv.currentTime  -=  1  ;
			break;case p.kye.r    : p.evb(ev);p.elv.currentTime  +=  1  ;
			break;case p.kye.s    : p.evb(ev);p.elv.currentTime  += 85  ;
			break;case p.kye.u    : p.evb(ev);if (p.elv.volume >= 0.96){p.elv.volume = 1;}else{p.elv.volume += 0.04;}
			break;case p.kye.d    : p.evb(ev);if (p.elv.volume <= 0.04){p.elv.volume = 0;}else{p.elv.volume -= 0.04;}
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