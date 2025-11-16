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
    // Disabled for Vercel serverless deployment
    // Open Interpreter requires local Python installation and persistent processes
    // which are not available in Vercel's serverless environment
    reject(new Error("Open Interpreter is not available in serverless environment. Please use AI API endpoints instead."));
    
    /* Original implementation - only works locally
    const subprocess = spawn(
      "interpreter", // Use system PATH instead of hardcoded Windows path
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

    subprocess.stdin.write(prompt + "\n");
    subprocess.stdin.end();
    */
  });
};

module.exports = runWithOpenInterpreter;

// Don't auto-execute on module load - only export the function
/* 
runWithOpenInterpreter()
  .then((reply) => {
    console.log("✅ Interpreter Output:\n", reply);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
  });
*/

