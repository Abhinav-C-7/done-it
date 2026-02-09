
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', 'buffer-equal-constant-time', 'index.js');

try {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Patch the line requiring SlowBuffer to fallback to Buffer
        const target = "var SlowBuffer = require('buffer').SlowBuffer;";
        const replacement = "var SlowBuffer = require('buffer').SlowBuffer || Buffer;";

        if (content.includes(target)) {
            content = content.replace(target, replacement);
            fs.writeFileSync(filePath, content);
            console.log('SUCCESS: Patched buffer-equal-constant-time for Node 25 compatibility.');
        } else if (content.includes(replacement)) {
            console.log('INFO: buffer-equal-constant-time is already patched.');
        } else {
            console.warn('WARNING: Could not find target line in buffer-equal-constant-time/index.js to patch.');
        }
    } else {
        // It might be nested in jwa/node_modules if not flattened
        console.warn(`WARNING: File not found at ${filePath}. Check if dependency is installed or nested.`);
    }
} catch (err) {
    console.error('ERROR: Failed to patch buffer-equal-constant-time:', err);
}
