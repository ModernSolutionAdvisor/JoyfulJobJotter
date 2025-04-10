// copy-manifest.js
import fs from 'fs-extra'; // npm install fs-extra -D

console.log("Copying manifest and static assets...");

try {
    // Copy manifest.json
    fs.copySync('manifest.json', 'build/manifest.json');
    console.log("Copied manifest.json");

    // Copy static assets (like icons) if they are not already handled by SvelteKit's static dir
    // Check if your icons are in the `static` folder SvelteKit uses.
    // If so, adapter-static might already copy them. If not, copy them manually.
    if (fs.existsSync('static/icons')) { // Assuming icons are in /static/icons
         fs.copySync('static/icons', 'build/icons');
         console.log("Copied icons folder.");
    } else if (fs.existsSync('icons')) { // Or if they are in root /icons
         fs.copySync('icons', 'build/icons');
         console.log("Copied icons folder.");
    }

    // Add any other files/folders that need to be manually copied

    console.log("Copying complete.");
} catch (err) {
    console.error('Error copying files:', err);
    process.exit(1); // Exit with error code
}