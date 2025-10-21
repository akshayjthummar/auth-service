/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable no-console */

// Import the child_process module
const { exec } = require("child_process");

// Function to run the migration command
function runMigration() {
    // Execute the npm run migration command
    // Use the arguments without quotes and rely on the shell's default splitting
    exec(
        "NODE_ENV=migration npm run migration:run ",
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing migration: ${error.message}`);
                // Print the full stderr for debugging
                console.error(`Full command stderr: ${stderr}`);
                return;
            }

            if (stderr) {
                console.error(`Error output: ${stderr}`);
                return;
            }

            // Log the output of the command
            console.log(`Migration output: ${stdout}`);
        },
    );
}

// Run the migration function
runMigration();
