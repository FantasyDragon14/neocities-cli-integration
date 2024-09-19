const childProcess = require("child_process");
const { Readable, Stream, Writable } = require("stream")


function test(username, password) {
	return new Promise(function (resolve, reject) {

		let stdoutContents = ''
		let stderrContents = ''
		let cp = childProcess.spawn('neocities', ["info"], { shell: true, stdio: 'pipe' });

		cp.stdout.setEncoding("utf8");
		cp.stderr.setEncoding("utf8");
		cp.stdin.setDefaultEncoding("utf8");

		cp.stdout.on('data', (data) => {
			try {
				console.log("[stdout] " + data.toString() + "{}");
				stdoutContents += data.toString();

			} catch (error) {
				console.log("[stdout] " + error.toString());
			}

		})

		cp.stderr.on('data', (data) => {
			reject(data.toString);
			try {
				console.log("[stderr] " + data.toString() + "{}");
				stdoutContents += data.toString();

			} catch (error) {
				console.log("[stderr] " + error.toString());
			}
		});

		cp.on("close", () => {
			if (stderrContents != "") {
				reject(stderrContents)
			} else {
				resolve(stdoutContents);
			}
		});
		console.log("writing username");
		cp.stdin.write(username + "\n");
		console.log("writing password");
		cp.stdin.write(password + "\n");

		cp.stdin.write('print("Hello World")\n');

		cp.stdin.write("c = 3\n");
		cp.stdin.write("a = c + 2\n");
		cp.stdin.write("print(a)\n");
		cp.stdin.write("c -= 1\n");
		cp.stdin.write("c\n");

		/*
		setInterval(function () {
			console.log("writing somethin to stdin");
			cp.stdin.write("something");
		}, 1000);
		*/
	});
}

function test2() {
	return new Promise(function (resolve, reject) {

		let stdoutContents = ''
		let stderrContents = ''
		let cp = childProcess.spawn('python', ["-i"], { shell: true, stdio: 'pipe' });

		cp.stdout.setEncoding("utf8");
		cp.stderr.setEncoding("utf8");
		cp.stdin.setDefaultEncoding("utf8");
		cp.stdout.on('data', (data) => {
			try {
				console.log("[stdout] " + data.toString() + "{}");
				stdoutContents += data.toString();

			} catch (error) {
				console.log("[stdout] " + error.toString());
			}

		})

		cp.stderr.on('data', (data) => {
			reject(data.toString);
			try {
				console.log("[stderr] " + data.toString() + "{}");
				stdoutContents += data.toString();

			} catch (error) {
				console.log("[stderr] " + error.toString());
			}
		});

		cp.on("close", () => {
			if (stderrContents != "") {
				reject(stderrContents)
			} else {
				resolve(stdoutContents);
			}
		});
		cp.stdin.write("1 + 1\n");

		cp.stdin.write('print("Hello World")\n');

		cp.stdin.write("c = 3\n");
		cp.stdin.write("a = c + 2\n");
		cp.stdin.write("print(a)\n");
		cp.stdin.write("c -= 1\n");
		cp.stdin.write("c\n");
		/*
		setInterval(function() {
			console.log("writing somethin to stdin");
			cp.stdin.write("something");
		}, 1000);
		*/
	});
}



async function testing() {
	await test("testusername", "testpassword").then(function (stdout) {
		//promise resolved
		console.log("promise resolved:\n\n" + stdout + "\n---------------------");
	}).catch(function (error) {
		//promise rejected
		console.error("promise rejected:\n\n" + error + "\n---------------------");
	});
	console.log("test complete");
}


test("testusername", "testpassword").catch(function(reason) {
	console.warn("rejected with reason: " + reason);
});
/*
test2().catch(function(reason) {
	console.warn("rejected with reason: " + reason);
});
/*

/*
const {childProcess} = require("child_process");
const {spawn} = require('child_process');

async function main() {
  const filePath = process.argv[2];
  console.log('INPUT: '+filePath);

  const childProcess = spawn('cat', [filePath],
    {stdio: [process.stdin, process.stdout, process.stderr]}); // (A)

  await onExit(childProcess); // (B)

  console.log('### DONE');
}
main();


function onExit(childProcess: ChildProcess): Promise<void> {
	return new Promise((resolve, reject) => {
	  childProcess.once('exit', (code: number, signal: string) => {
	    if (code === 0) {
	      resolve(undefined);
	    } else {
	      reject(new Error('Exit with error code: '+code));
	    }
	  });
	  childProcess.once('error', (err: Error) => {
	    reject(err);
	  });
	});
      }
*/