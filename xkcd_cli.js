function pathFilename(path) {
	match = /\/([^\/]+)$/.exec(path);
	if (match) {
		return match[1];
	}
}

function getRandomInt(min, max) {
	// via https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Math/random#Examples
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var XKCD = {
	latest: null,
	last: null,
	cache: {},
	
	get: function(num, success, error) {
		if (num == null) {
			path = '/proxy.php?mode=native&url=http://xkcd.com/info.0.json';
		} else if (Number(num)) {
			path = '/proxy.php?mode=native&url=http://xkcd.com/'+num+'/info.0.json';
		} else {
			error(false);
			return false;
		}
		
		if (num in this.cache) {
			this.last = this.cache[num];
			success(this.cache[num]);
		} else {
			return $.ajax({
				url: window.location+path,
				dataType: 'json',
				success: $.proxy(function(data) {
					this.last = this.cache[num] = data;
					success(data);
				}, this),
				error: error});
		}
	}
};


/*TerminalCommandHandler.commands['ls'] = function(terminal, path) {
	if (path) {
		
	} else {
		
	}
};*/

TerminalCommandHandler.commands['display'] = function(terminal, path) {
	function fail() {
		terminal.print($('<p>').addClass('error').text('display: unable to open image "'+path+'": No such file or directory.'));
		terminal.setWorking(false);
	}
		
	terminal.setWorking(true);
	
	if (path) {
		path = String(path);
		num = Number(path.match(/^\d+/));
		filename = pathFilename(path);
	} else {
		num = XKCD.last.num;
	}
	XKCD.get(num, function(data) {
		if (!filename || (filename == pathFilename(data.img))) {
			$('<img>')
				.hide()
				.load(function() {
					terminal.print($('<h3>').text(data.num+": "+data.title));
					terminal.setWorking(false);
					$(this).fadeIn();
					terminal.print($(this));
				})
				.attr({src:data.img, alt:data.title, title:data.alt});
		} else {
			fail();
		}
	}, fail);
};

TerminalCommandHandler.commands['next'] = function(terminal) {
	TerminalCommandHandler.commands['display'](terminal, XKCD.last.num+1);
};

TerminalCommandHandler.commands['previous'] =
TerminalCommandHandler.commands['prev'] = function(terminal) {
	TerminalCommandHandler.commands['display'](terminal, XKCD.last.num-1);
};

TerminalCommandHandler.commands['first'] = function(terminal) {
	TerminalCommandHandler.commands['display'](terminal, 1);
};

TerminalCommandHandler.commands['last'] = function(terminal) {
	TerminalCommandHandler.commands['display'](terminal, XKCD.latest.num);
};

TerminalCommandHandler.commands['random'] = function(terminal) {
	TerminalCommandHandler.commands['display'](terminal, getRandomInt(1, XKCD.latest.num));
};

TerminalCommandHandler.commands['cat'] = function(terminal, path) {
	if (path == 'welcome.txt') {
		terminal.print($('<h4>').text('Welcome to the XKCD console.'));
		terminal.print('To navigate, enter "next", "prev", "first", or "last".');
		terminal.print('Try "help" for more information.');
	} else if (pathFilename(path) == 'alt.txt') {
		terminal.setWorking(true);
		num = Number(path.match(/^\d+/));
		XKCD.get(num, function(data) {
			terminal.print(data.alt);
			terminal.setWorking(false);
		}, function() {
			terminal.print($('<p>').addClass('error').text('cat: "'+path+'": No such file or directory.'));
			terminal.setWorking(false);
		});
	} else {
		terminal.print('You\'re a kitty!');
	}
};

TerminalCommandHandler.commands['reddit'] = function(terminal, num) {
	num = Number(num);
	if (num) {
		url = 'http://xkcd.com/'+num+'/';
	} else {
		var url = window.location;
	}
	terminal.print($('<iframe src="http://www.reddit.com/static/button/button1.html?width=140&url='+encodeURIComponent(url)+'&newwindow=1" height="22" width="140" scrolling="no" frameborder="0"></iframe>'));
};

TerminalCommandHandler.fallback = function(terminal, callback, cmd) {
	if (cmd == 'make me a sandwich') {
		terminal.print('What? Make it yourself.');
	} else if (cmd == 'sudo make me a sandwich') {
		terminal.print('Okay.');
	} else if (cmd == 'i read the source code') {
		terminal.print('<3');
	} else {
		return false;
	}
	return true;
};

$(document).ready(function() {
	Terminal.promptActive = false;
	$('#screen').bind('cli-load', function(e) {
		XKCD.get(null, function(data) {
			XKCD.latest = data;
			Terminal.runCommand('display '+XKCD.latest.num+'/'+pathFilename(XKCD.latest.img));
			$('#screen').one('cli-ready', function(e) {
				Terminal.runCommand('cat welcome.txt');
			});
		});
	});
});