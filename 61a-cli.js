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
	terminal.print($('<h4>')
                       .text('[y][Welcome to Chenyang\'s 61a console.]'));
	terminal.print('Use [g][ls], [g][cat], and [g][cd] to navigate the filesystem.');
        terminal.print('Type [g][help] for more detailed instructions.');
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
Filesystem['61a'] = linkFile('http://www-inst.eecs.berkeley.edu/~cs61a/fa13/');
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
        terminal.clear();
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

TerminalShell.commands['help'] =
    TerminalShell.commands['halp'] = function(terminal) {
        terminal.print('[y][Console help:]');
        terminal.print('[g][ls]               List all files and directories');
        terminal.print('[g][cat] <filename>   View the contents of a file');
        terminal.print('[g][cd] <dirname>     Go to a directory');
        terminal.print('[g][rm] <filename>    Removes a file');
        terminal.print('[g][wget] <url>       Loads url');
        terminal.print('');
        terminal.print('[y][Type] [g][commands] [y][for more commands to try]');
        terminal.print('[y][Use] [g][<UP>] [y][and] [g][<DOWN>] [y][to navigate command history]');
        terminal.print('[y][Press] [g][<TAB>] [y][for autocompletion of files and directories]');
    };

var DOCUMENTED_COMMANDS =
        ['apt-get moo', 'bash', 'ed', 'emacs', 'enable time travel', 'find',
         'hello', 'hi', 'kill', 'locate', 'logout', 'lpr', 'man', 'moo', 'nano',
         'ping', 'pwd', 'restart', 'serenity', 'shutdown', 'ssh', 'su', 'sudo',
         'top', 'uname', 'use the force luke', 'vi', 'who', 'whoami'];

TerminalShell.commands['commands'] = function(terminal) {
    terminal.print('[y][Try these commands!]');
    terminal.print('[y][This is not a comprehensive list, discover the rest yourself!]');
    DOCUMENTED_COMMANDS.forEach(function(e){
        terminal.print('[g][' + e + ']');
    });
};

TerminalShell.fallback = function(terminal, cmd) {
    oneliners = {
	'make me a sandwich': 'What? Make it yourself.',
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
	'whoami': 'You are Richard Stallman.',
	'nano': 'Seriously? Why don\'t you just use Notepad.exe? Or MS Paint?',
	'top': 'It\'s up there --^',
	'moo':'moo',
	'ping': 'There is another submarine three miles ahead, bearing 225, forty fathoms down.',
	'find': 'What do you want to find? Kitten would be nice.',
	'hello':'Hello.','more':'Oh, yes! More! More!',
	'hi':'Hi.','echo': 'Echo ... echo ... echo ...',
	'bash': 'You bash your head against the wall. It\'s not very effective.',
        'ssh': 'ssh, this is a library.',
	'uname': 'Illudium Q-36 Explosive Space Modulator',
	'kill': 'Terminator deployed to 1984.',
	'use the force luke': 'I believe you mean source.',
	'use the source luke': 'I\'m not luke, you\'re luke!',
	'serenity': 'You can\'t take the sky from me.',
	'enable time travel': 'TARDIS error: Time Lord missing.',
	'ed': 'You are not a diety.'
    };
    oneliners['emacs'] = 'You\'ve made the right choice!';
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
        Terminal.runCommand('cat welcome.txt');
    });
});
