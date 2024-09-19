// The module 'vscode' contains the VS Code extensibility API


// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const {Readable} = require("stream")

//const util = require("util")
//const exec = util.promisify(require("child_process").exec);
const childProcess = require("child_process");

/**
 * @param {string} command A shell command to execute
 * @return {Promise<string>} A promise that resolve to the output of the shell command, or an error
 * @example const output = await execute("ls -alh");
 */
function execute(command) {
	/**
	 * @param {Function} resolve A function that resolves the promise
	 * @param {Function} reject A function that fails the promise
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
	 */
	return new Promise(function (resolve, reject) {
		/**
		 * @param {Error} error An error triggered during the execution of the childProcess.exec command
		 * @param {string|Buffer} standardOutput The result of the shell command execution
		 * @param {string|Buffer} standardError The error resulting of the shell command execution
		 * @see https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
		 */
		childProcess.exec(command, function (error, standardOutput, standardError) {
			if (error) {
				reject(error);

				return;
			}

			if (standardError) {
				reject(standardError);

				return;
			}

			resolve(standardOutput);
		});
	});
}

/**
 * 
 * @param {String} command
 * @param {String} username
 * @param {String} password
 * @returns {Promise}
 */
function execute_with_neocities(command, username, password) {
	return new Promise(function (resolve, reject) {
		const cmdArr = command.split(" ");
		let cp = childProcess.spawn('neocities', cmdArr, {shell: true, stdio: 'pipe' });

                cp.stdout.on("data", (data) => {
                        console.log(data.toString());
                });

                cp.stderr.on("data", (data) => {
                        console.error(data.toString());
                });

                cp.on("close", () => {
                        resolve("idc");
                });

                const readable = Readable.from([username + "\n", password + "\n"]);
                readable.pipe(cp.stdin);


        });
}



/**
 * 
 * @param {String} command
 * @param {import('vscode').ExtensionContext} context
 */
async function neocities_command(command, context) {
	const secrets = context.secrets
	let bool = await test_neocities();
	console.log(bool);
	if (!bool) {
		console.error("neocities is not installed");
		bool = await test_ruby();
		console.log(bool);
		if (!bool) {
			vscode.window.showErrorMessage("Ruby cannot be used. install Ruby via [this link](https://www.ruby-lang.org/en/downloads/) and try again")
			return;
		}
		try {
			console.log("Installing Neocities")
			vscode.window.showInformationMessage("Installing Neocities-CLI via gem...")
			let neocities_install = await execute("gem install neocities");
			console.log(neocities_install);
		} catch (error) {
			console.error(error.toString());
			vscode.window.showErrorMessage("neocities failed to install");
			return;
		}
		bool = await test_neocities();
		console.log(bool);
		if (!bool) {
			vscode.window.showErrorMessage("neocities failed to install");
			return;
		}
		vscode.window.showInformationMessage("neocities-CLI installed ^^")
	}
	console.log("neocities works");

	if(command == "") {
		vscode.window.showInformationMessage("neocities is installed :3");
		console.log("command finished");
		return;
	}
	/*
	checking if login data exists
	*/
	let username = context.secrets.get("username");
	let password = context.secrets.get("password");
	if (!username || !password) {
		vscode.window.showInformationMessage("no login information stored. Input your login info here:")
		let new_username = await vscode.window.showInputBox({placeHolder: "username", prompt: "input your neocities username (not email!)"});
		let new_passw = await vscode.window.showInputBox({placeHolder: "password", prompt: "input your neocities password"});
	}

	switch (command) {
		case "push":
			await push(secrets);
			break;
		case "push-purge":
			await push(secrets, true);
			break;
		case "pull":
			await pull(secrets);
			break;
		case "login":
			await login(secrets);
			break;
		case "logout":
			await logout(secrets);
			break;
		default:
			break;
	}
	console.log("command finished");
}

async function test_neocities() {
	console.log("testing if neocities is installed")
	try {
		const neocities = await execute("neocities version");
		console.log(neocities);
	} catch (error) {
		console.error(error.toString());
		return false;
	}
	return true;
}

async function test_ruby() {
	console.log("testing if ruby is installed")
	try {
		const ruby = await execute("gem -v");
		console.log(ruby);
	} catch (error) {
		console.error(error.toString());
		return false;
	}
	return true;
}

//neocities cli reads directly from keyboard, not stdin >w<
// it uses ruby tty:prompt, to which i have not found a way to pass input to yet
// can't use child process for login then, or idk how

/**
 * 
 * @param {import('vscode').SecretStorage} secrets
 */
async function check_login(secrets, login = false) {
	let username = secrets.get("username");
	let password = secrets.get("password");
	if (!username || !password || !login) {
		let new_username = await vscode.window.showInputBox({placeHolder: "username", prompt: "input your neocities username (not email!)"});
		let new_passw = await vscode.window.showInputBox({placeHolder: "password", prompt: "input your neocities password"});
		secrets.store("username", new_username);
		secrets.store("password", new_passw);
	}
}

//gotta use the terminal here then. Not as integrated as i'd liked, but hey

async function push(secrets, prune = false) {
	let terminal = get_terminal();
	let cmd = "neocities push .";
	if (prune) {cmd = "neocities push --prune .";}
	terminal.sendText(cmd, true);
}

async function pull(secrets) {
	let terminal = get_terminal();
	terminal.sendText("neocities pull .", true);
}

async function login(secrets) {
	/*
	console.log("using login");
	try {
		let val = await execute("neocities info \n fantasydragon14 \n");
		console.log(val);
	} catch (error) {
		console.error(error.toString());
	}
		*/
	test();
}

async function logout(secrets) {
	let terminal = get_terminal();
	terminal.sendText("neocities logout -y", true);
}

//gonna try using the terminal directly
function test() {
	let terminal = get_terminal()
	terminal.show();
	terminal.sendText("neocities info", true);
	
}

function get_terminal() {
	console.log("getting neocities terminal");
	console.log(vscode.window.terminals.toString());
	let terminal = vscode.window.terminals.find(t => t.name === "neocities")
	if (terminal === undefined) {terminal = vscode.window.createTerminal("neocities")}
	terminal.show();
	return terminal;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "neocities-cli-integration" is now active!');


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	

	context.subscriptions.push(vscode.commands.registerCommand('neocities-cli-integration.test_for_neocities', () => {
		/*
		const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		terminal.sendText("echo 'Sent text immediately after creating'");
		terminal.dispose()
		*/

		//neocities_command("", context);
		test();

	}));
	context.subscriptions.push(vscode.commands.registerCommand('neocities-cli-integration.push', () => {
		/*
		const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		terminal.sendText("echo 'Sent text immediately after creating'");
		terminal.dispose()
		*/

		neocities_command("push", context);

	}));
	context.subscriptions.push(vscode.commands.registerCommand('neocities-cli-integration.push_prune', () => {
		/*
		const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		terminal.sendText("echo 'Sent text immediately after creating'");
		terminal.dispose()
		*/

		neocities_command("push-purge", context);

	}));
	context.subscriptions.push(vscode.commands.registerCommand('neocities-cli-integration.pull', () => {
		/*
		const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		terminal.sendText("echo 'Sent text immediately after creating'");
		terminal.dispose()
		*/

		neocities_command("pull", context);

	}));
	context.subscriptions.push(vscode.commands.registerCommand('neocities-cli-integration.login', () => {
		/*
		const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		terminal.sendText("echo 'Sent text immediately after creating'");
		terminal.dispose()
		*/

		neocities_command("login", context);

	}));
	context.subscriptions.push(vscode.commands.registerCommand('neocities-cli-integration.logout', () => {
		/*
		const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		terminal.sendText("echo 'Sent text immediately after creating'");
		terminal.dispose()
		*/

		neocities_command("logout", context);

	}));

}

// This method is called when your extension is deactivated
function deactivate() {
	console.log("neocities-cli-integration deactivating");
}

module.exports = {
	activate,
	deactivate
}
