'use strict';

class Panel {
	constructor({width=400, height=400, title="", can_close = true} = {}) {
		var left = document.documentElement.clientWidth / 2 - width / 2;
		var top = document.documentElement.clientHeight / 2 - height / 2;
		this.container_obj = document.createElement('div');
		Object.assign(this.container_obj.style, {width:width+"px", height:height+"px", left:left+"px", top:top+"px"});
		this.container_obj.classList.add('uiframe-container');
		this.panel_obj = document.createElement('div');
		this.panel_obj.classList.add('uiframe');
		this.panel_obj.tabIndex = -1;
		this.header_obj = document.createElement('div');
		this.header_obj.classList.add('uiframe-header');
		this.title_node = document.createTextNode(title);
		this.header_obj.appendChild(this.title_node);
		this.content_obj = document.createElement('div');
		this.content_obj.classList.add('uiframe-content');
		this.panel_obj.appendChild(this.header_obj);
		this.panel_obj.appendChild(this.content_obj);
		this.container_obj.appendChild(this.panel_obj);
		document.getElementById('uiframes-container').appendChild(this.container_obj);

		this.header_obj.addEventListener("mousedown", this._start_drag.bind(this));
		this.container_obj.addEventListener("mousedown", this._start_resize.bind(this));
		this.container_obj.addEventListener("mousemove", this._container_mousemove.bind(this));
		this.container_obj.addEventListener("mouseout", this._container_mouseout.bind(this));

		this.can_close = can_close;

		if(can_close) {
			this.close_button = document.createElement('div');
			this.close_button.classList.add('uiframe-close-button');
			this.header_obj.appendChild(this.close_button);

			this.close_button.addEventListener("click", () => {
				this.close();
			});
			this.close_button.addEventListener("mousedown", (e) => {
				e.preventDefault();
			});
		}
	}

	_start_drag(e) {
		if(e.defaultPrevented)
			return;
		if(e.target != this.header_obj) {
			return;
		}
		var pad = (this.container_obj.offsetWidth - this.panel_obj.offsetWidth)/2;
		e.preventDefault();
		this.panel_obj.focus();
		var lastclientx = e.clientX;
		var lastclienty = e.clientY;
		var mousemove = (e) => {
			var dx = e.clientX - lastclientx;
			var dy = e.clientY - lastclienty;
			lastclientx = e.clientX;
			lastclienty = e.clientY;
			var {left:oldleft, top:oldtop} = this.container_obj.getBoundingClientRect();
			this.container_obj.style.left = Math.min(document.documentElement.clientWidth-160-pad, Math.max(-pad,oldleft + dx)) + "px";
			this.container_obj.style.top = Math.min(document.documentElement.clientHeight-35-pad, Math.max(-pad,oldtop + dy)) + "px";
		};
		var mouseup = () => {
			document.removeEventListener("mousemove", mousemove);
			document.removeEventListener("mouseup", mouseup);
		};
		document.addEventListener("mousemove", mousemove);
		document.addEventListener("mouseup", mouseup);
	}

	_resize_meta(e) { // figure out which edge the mouse cursor is on and return an object with the appropriate flags
		var pad = (this.container_obj.offsetWidth - this.panel_obj.offsetWidth)/2;
		var width = this.panel_obj.offsetWidth;
		var height = this.panel_obj.offsetHeight;
		var out = {drag_right: false, drag_left: false, drag_up: false, drag_down: false, cursor: "default"};
		if(e.target == this.container_obj) {
			if(e.offsetX < pad)
				out.drag_left = true;
			if(e.offsetY < pad)
				out.drag_up = true;
			if(e.offsetX > (width + pad))
				out.drag_right = true;
			if(e.offsetY > (height + pad))
				out.drag_down = true;
			if((out.drag_left && out.drag_down) || (out.drag_up && out.drag_right)) {
				out.cursor = "nesw-resize";
			} else if((out.drag_left && out.drag_up) || (out.drag_down && out.drag_right)) {
				out.cursor = "nwse-resize";
			} else if(out.drag_left || out.drag_right) {
				out.cursor = "ew-resize";
			} else if(out.drag_up || out.drag_down) {
				out.cursor = "ns-resize";
			}
		}
		out.can_resize = out.drag_right || out.drag_left || out.drag_up || out.drag_down;
		return out;
	}

	_start_resize(e) {
		// bring the panel to the front
		if(this.container_obj != document.getElementById('uiframes-container').lastChild)
			document.getElementById('uiframes-container').appendChild(this.container_obj);

		// figure out which edges we're resizing
		var resize_meta = this._resize_meta(e);
		if(!resize_meta.can_resize) // oof we're not resizing
			return;
		// figure out how much space is around the edges
		var pad = (this.container_obj.offsetWidth - this.panel_obj.offsetWidth)/2;
		e.preventDefault();
		this.panel_obj.focus();
		var lastclientx = e.clientX;
		var lastclienty = e.clientY;
		// now start dragging
		var mousemove = (e) => {
			var dx = e.clientX - lastclientx;
			var dy = e.clientY - lastclienty;
			lastclientx = e.clientX;
			lastclienty = e.clientY; // figure out how much we moved
			var {left:oldleft, top:oldtop} = this.container_obj.getBoundingClientRect();
			if(resize_meta.drag_left) { // and now resize ourselves
				this.container_obj.style.left = Math.min(document.documentElement.clientWidth-160-pad,Math.max(-pad,oldleft + dx)) + "px";
				this.container_obj.style.width = Math.max(160,this.panel_obj.clientWidth - dx) + "px";
			} else if(resize_meta.drag_right) {
				this.container_obj.style.width = Math.max(160,this.panel_obj.clientWidth + dx) + "px";
			}
			if(resize_meta.drag_up) {
				this.container_obj.style.top = Math.min(document.documentElement.clientHeight-35-pad,Math.max(-pad,oldtop + dy)) + "px";
				this.container_obj.style.height = Math.max(35,this.panel_obj.clientHeight - dy) + "px";
			} else if(resize_meta.drag_down) {
				this.container_obj.style.height = Math.max(35,this.panel_obj.clientHeight + dy) + "px";
			}
		};
		var mouseup = () => {
			document.removeEventListener("mousemove", mousemove);
			document.removeEventListener("mouseup", mouseup);
		};
		document.addEventListener("mousemove", mousemove);
		document.addEventListener("mouseup", mouseup);
	}

	_container_mousemove(e) {
		var resize_meta = this._resize_meta(e);
		this.container_obj.style.cursor = resize_meta.cursor;
	}
	_container_mouseout() {
		this.container_obj.style.cursor = "default";
	}

	get title() {
		return this.title_node.textContent;
	}

	set title(val) {
		this.title_node.textContent = val;
	}

	close() {
		document.getElementById('uiframes-container').removeChild(this.container_obj); // remove ourselves!
		if(this.close_promise_resolve)
			this.close_promise_resolve();
	}

	wait_until_close() {
		if(this.close_promise)
			return this.close_promise;
		return this.close_promise = new Promise(resolve => {
			this.close_promise_resolve = resolve;
		});
	}

	// convenience functions
	$(sel) {
		return this.content_obj.querySelector(sel);
	}
	$$(sel) {
		return this.content_obj.querySelectorAll(sel);
	}
}

module.exports = Panel;
