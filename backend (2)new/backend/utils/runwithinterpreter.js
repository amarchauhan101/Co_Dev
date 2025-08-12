// // const { spawn } = require("child_process");

// // const runWithOpenInterpreter = (prompt) => {
// //   return new Promise((resolve, reject) => {
// //     const subprocess = spawn("interpreter", ["--profile", "local"], {
// //       stdio: ["pipe", "pipe", "pipe"],
// //     });

// //     let result = "";
// //     let errorOutput = "";

// //     subprocess.stdout.on("data", (data) => {
// //       result += data.toString();
// //     });

// //     subprocess.stderr.on("data", (data) => {
// //       errorOutput += data.toString();
// //       console.error("Interpreter stderr:", errorOutput);
// //     });

// //     subprocess.on("close", (code) => {
// //       if (code === 0) {
// //         resolve(result.trim());
// //       } else {
// //         reject(new Error(`Interpreter exited with code ${code}. Stderr: ${errorOutput}`));
// //       }
// //     });

// //     subprocess.stdin.write(prompt + "\n");
// //     subprocess.stdin.end();
// //   });
// // };

// // module.exports = runWithOpenInterpreter;




const { spawn } = require("child_process");

const runWithOpenInterpreter = (prompt) => {
  return new Promise((resolve, reject) => {
    const subprocess = spawn(
      "C:\\Users\\Amar Chauhan\\AppData\\Local\\Programs\\Python\\Python310\\Scripts\\interpreter.exe",
      ["--profile", "local"],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    let result = "";
    let errorOutput = "";

    subprocess.stdout.on("data", (data) => {
      result += data.toString();
    });

    subprocess.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error("stderr:", errorOutput);
    });

    subprocess.on("close", (code) => {
      if (code === 0) {
        resolve(result.trim());
      } else {
        reject(new Error(`Interpreter exited with code ${code}. Error: ${errorOutput}`));
      }
    });

    // Example prompt to test
    subprocess.stdin.write("Write a Python program that prints 'Hello World'\n");
    subprocess.stdin.end();
  });
};

runWithOpenInterpreter()
  .then((reply) => {
    console.log("✅ Interpreter Output:\n", reply);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
  });

