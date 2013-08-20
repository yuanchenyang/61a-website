function pathFilename(path) {
    var match = /\/([^\/]+)$/.exec(path);
    if (match) {
	return match[1];
    }
}

function getRandomInt(min, max) {
    // via https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Math/random#Examples
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(items) {
    return items[getRandomInt(0, items.length-1)];
}


TerminalShell.commands['sudo'] = function(terminal) {
    var cmd_args = Array.prototype.slice.call(arguments);
    cmd_args.shift(); // terminal
    if (cmd_args.join(' ') == 'make me a sandwich') {
	terminal.print('Okay.');
    } else {
	var cmd_name = cmd_args.shift();
	cmd_args.unshift(terminal);
	cmd_args.push('sudo');
	if (TerminalShell.commands.hasOwnProperty(cmd_name)) {
	    this.sudo = true;
	    this.commands[cmd_name].apply(this, cmd_args);
	    delete this.sudo;
	} else if (!cmd_name) {
	    terminal.print('sudo what?');
	} else {
	    terminal.print('sudo: '+cmd_name+': command not found');
	}
    }
};

TerminalShell.filters.push(function (terminal, cmd) {
    if (/!!/.test(cmd)) {
	var newCommand = cmd.replace('!!', this.lastCommand);
	terminal.print(newCommand);
	return newCommand;
    } else {
	return cmd;
    }
});

TerminalShell.commands['shutdown'] = TerminalShell.commands['poweroff'] = function(terminal) {
    if (this.sudo) {
	terminal.print('Broadcast message from guest@61a');
	terminal.print();
	terminal.print('The system is going down for maintenance NOW!');
	return $('#screen').fadeOut();
    } else {
	terminal.print('Must be root.');
    }
};

TerminalShell.commands['logout'] =
    TerminalShell.commands['exit'] =
    TerminalShell.commands['quit'] = function(terminal) {
	terminal.print('Bye.');
	$('#prompt, #cursor').hide();
	terminal.promptActive = false;
    };

TerminalShell.commands['restart'] = TerminalShell.commands['reboot'] = function(terminal) {
    if (this.sudo) {
	TerminalShell.commands['poweroff'](terminal).queue(function(next) {
	    window.location.reload();
	});
    } else {
	terminal.print('Must be root.');
    }
};

function linkFile(url) {
    return {type:'dir', enter:function() {
	window.location = url;
    }};
}

Filesystem = {
    'welcome.txt': {type:'file', read:function(terminal) {
	terminal.print($('<h4>').text('Welcome to the unixkcd console.'));
	terminal.print('To navigate the comics, enter "next", "prev", "first", "last", "display", or "random".');
	terminal.print('Use "ls", "cat", and "cd" to navigate the filesystem.');
    }},
    'license.txt': {type:'file', read:function(terminal) {
	terminal.print($('<p>').html('Client-side logic for Wordpress CLI theme :: <a href="http://thrind.xamai.ca/">R. McFarland, 2006, 2007, 2008</a>'));
	terminal.print($('<p>').html('jQuery rewrite and overhaul :: <a href="http://www.chromakode.com/">Chromakode, 2010</a>'));
	terminal.print();
	$.each([
	    'This program is free software; you can redistribute it and/or',
	    'modify it under the terms of the GNU General Public License',
	    'as published by the Free Software Foundation; either version 2',
	    'of the License, or (at your option) any later version.',
	    '',
	    'This program is distributed in the hope that it will be useful,',
	    'but WITHOUT ANY WARRANTY; without even the implied warranty of',
	    'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the',
	    'GNU General Public License for more details.',
	    '',
	    'You should have received a copy of the GNU General Public License',
	    'along with this program; if not, write to the Free Software',
	    'Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.'
	], function(num, line) {
	    terminal.print(line);
	});
    }}
};
Filesystem['blog'] = Filesystem['blag'] = linkFile('http://blag.xkcd.com');
Filesystem['forums'] = Filesystem['fora'] = linkFile('http://forums.xkcd.com/');
Filesystem['store'] = linkFile('http://store.xkcd.com/');
Filesystem['about'] = linkFile('http://xkcd.com/about/');
TerminalShell.pwd = Filesystem;

TerminalShell.commands['cd'] = function(terminal, path) {
    if (path in this.pwd) {
	if (this.pwd[path].type == 'dir') {
	    this.pwd[path].enter(terminal);
	} else if (this.pwd[path].type == 'file') {
	    terminal.print('cd: '+path+': Not a directory');
	}
    } else {
	terminal.print('cd: '+path+': No such file or directory');
    }
};

TerminalShell.commands['dir'] =
    TerminalShell.commands['ls'] = function(terminal, path) {
	var name_list = $('<ul>');
	$.each(this.pwd, function(name, obj) {
	    if (obj.type == 'dir') {
		name += '/';
	    }
	    name_list.append($('<li>').text(name));
	});
	terminal.print(name_list);
    };

TerminalShell.commands['cat'] = function(terminal, path) {
    if (path in this.pwd) {
	if (this.pwd[path].type == 'file') {
	    this.pwd[path].read(terminal);
	} else if (this.pwd[path].type == 'dir') {
	    terminal.print('cat: '+path+': Is a directory');
	}
    } else {
	terminal.print('You\'re a kitty!');
    }
};

TerminalShell.commands['rm'] = function(terminal, flags, path) {
    if (flags && flags[0] != '-') {
	path = flags;
    }
    if (!path) {
	terminal.print('rm: missing operand');
    } else if (path in this.pwd) {
	if (this.pwd[path].type == 'file') {
	    delete this.pwd[path];
	} else if (this.pwd[path].type == 'dir') {
	    if (/r/.test(flags)) {
		delete this.pwd[path];
	    } else {
		terminal.print('rm: cannot remove '+path+': Is a directory');
	    }
	}
    } else if (flags == '-rf' && path == '/') {
	if (this.sudo) {
	    TerminalShell.commands = {};
	} else {
	    terminal.print('rm: cannot remove /: Permission denied');
	}
    }
};

TerminalShell.commands['wget'] = TerminalShell.commands['curl'] = function(terminal, dest) {
    if (dest) {
	terminal.setWorking(true);
	var browser = $('<div>')
		.addClass('browser')
		.append($('<iframe>')
			.attr('src', dest).width("100%").height(600)
			.one('load', function() {
			    terminal.setWorking(false);
			}));
	terminal.print(browser);
	return browser;
    } else {
	terminal.print("Please specify a URL.");
    }
};

TerminalShell.commands['unixkcd'] = function(terminal, nick) {
    TerminalShell.commands['curl'](terminal, "http://www.xkcd.com/unixkcd/");
};

TerminalShell.commands['apt-get'] = function(terminal, subcmd) {
    if (!this.sudo && (subcmd in {'update':true, 'upgrade':true, 'dist-upgrade':true})) {
	terminal.print('E: Unable to lock the administration directory, are you root?');
    } else {
	if (subcmd == 'update') {
	    terminal.print('Reading package lists... Done');
	} else if (subcmd == 'upgrade') {
	    if (($.browser.name == 'msie') || ($.browser.name == 'firefox' && $.browser.versionX < 3)) {
		terminal.print($('<p>').append($('<a>').attr('href', 'http://abetterbrowser.org/').text('To complete installation, click here.')));
	    } else {
		terminal.print('This looks pretty good to me.');
	    }
	} else if (subcmd == 'dist-upgrade') {
	    var longNames = {'win':'Windows', 'mac':'OS X', 'linux':'Linux'};
	    var name = $.os.name;
	    if (name in longNames) {
		name = longNames[name];
	    } else {
		name = 'something fancy';
	    }
	    terminal.print('You are already running '+name+'.');
	} else if (subcmd == 'moo') {
	    terminal.print('        (__)');
	    terminal.print('        (oo)');
	    terminal.print('  /------\\/ ');
	    terminal.print(' / |    ||  ');
	    terminal.print('*  /\\---/\\  ');
	    terminal.print('   ~~   ~~  ');
	    terminal.print('...."Have you mooed today?"...');
	} else if (!subcmd) {
	    terminal.print('This APT has Super Cow Powers.');
	} else {
	    terminal.print('E: Invalid operation '+subcmd);
	}
    }
};

function oneLiner(terminal, msg, msgmap) {
    if (msgmap.hasOwnProperty(msg)) {
	terminal.print(msgmap[msg]);
	return true;
    } else {
	return false;
    }
}

TerminalShell.commands['man'] = function(terminal, what) {
    pages = {
	'last': 'Man, last night was AWESOME.',
	'help': 'Man, help me out here.',
	'next': 'Request confirmed; you will be reincarnated as a man next.',
	'cat':  'You are now riding a half-man half-cat.'
    };
    if (!oneLiner(terminal, what, pages)) {
	terminal.print('Oh, I\'m sure you can figure it out.');
    }
};

TerminalShell.commands['locate'] = function(terminal, what) {
    keywords = {
	'ninja': 'Ninja can not be found!',
	'keys': 'Have you checked your coat pocket?',
	'joke': 'Joke found on user.',
	'problem': 'Problem exists between keyboard and chair.',
	'raptor': 'BEHIND YOU!!!'
    };
    if (!oneLiner(terminal, what, keywords)) {
	terminal.print('Locate what?');
    }
};

TerminalShell.commands['sleep'] = function(terminal, duration) {
    duration = Number(duration);
    if (!duration) {
	duration = 5;
    }
    terminal.setWorking(true);
    terminal.print("You take a nap.");
    $('#screen').fadeOut(1000);
    window.setTimeout(function() {
	terminal.setWorking(false);
	$('#screen').fadeIn();
	terminal.print("You awake refreshed.");
    }, 1000*duration);
};

// No peeking!
TerminalShell.commands['help'] = TerminalShell.commands['halp'] = function(terminal) {
    terminal.print('That would be cheating!');
};

TerminalShell.fallback = function(terminal, cmd) {
    oneliners = {
	'make me a sandwich': 'What? Make it yourself.',
	'make love': 'I put on my robe and wizard hat.',
	'i read the source code': '<3',
	'pwd': 'You are in a maze of twisty passages, all alike.',
	'lpr': 'PC LOAD LETTER',
	'hello joshua': 'How about a nice game of Global Thermonuclear War?',
	'xyzzy': 'Nothing happens.',
	'date': 'March 32nd',
	'hello': 'Why hello there!',
	'who': 'Doctor Who?',
	'xkcd': 'Yes?',
	'su': 'God mode activated. Remember, with great power comes great ... aw, screw it, go have fun.',
	'fuck': 'I have a headache.',
	'whoami': 'You are Richard Stallman.',
	'nano': 'Seriously? Why don\'t you just use Notepad.exe? Or MS Paint?',
	'top': 'It\'s up there --^',
	'moo':'moo',
	'ping': 'There is another submarine three miles ahead, bearing 225, forty fathoms down.',
	'find': 'What do you want to find? Kitten would be nice.',
	'hello':'Hello.','more':'Oh, yes! More! More!',
	'your gay': 'Keep your hands off it!',
	'hi':'Hi.','echo': 'Echo ... echo ... echo ...',
	'bash': 'You bash your head against the wall. It\'s not very effective.','ssh': 'ssh, this is a library.',
	'uname': 'Illudium Q-36 Explosive Space Modulator',
	'finger': 'Mmmmmm...',
	'kill': 'Terminator deployed to 1984.',
	'use the force luke': 'I believe you mean source.',
	'use the source luke': 'I\'m not luke, you\'re luke!',
	'serenity': 'You can\'t take the sky from me.',
	'enable time travel': 'TARDIS error: Time Lord missing.',
	'ed': 'You are not a diety.'
    };
    oneliners['emacs'] = 'You should really use vim.';
    oneliners['vi'] = oneliners['vim'] = 'You should really use emacs.';

    cmd = cmd.toLowerCase();
    if (!oneLiner(terminal, cmd, oneliners)) {
	if (cmd == 'find kitten') {
	    terminal.print($('<iframe width="800" height="600" src="http://www.robotfindskitten.net/rfk.swf"></iframe>'));
	} else {
	    $.get("/unixkcd/missing", {cmd: cmd});
	    return false;
	}
    }
    return true;
};

$(document).ready(function() {
    Terminal.promptActive = true;
    $('#screen').bind('cli-load', function(e) {

    });
});
