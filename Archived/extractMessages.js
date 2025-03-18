const fs = require('fs');

async function extractMessages(filePath) {
    try {
        if (!filePath || !fs.existsSync(filePath)) {
            console.error('No log file found:', filePath);
            return [];
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        const lines = data.split('\n');

        // Skip the first message and extract only from the second one onward
        const messages = lines
            .slice(1) // Removes the first message
            .map(line => {
                const parts = line.split(': ');
                return parts.length > 1 ? parts.slice(1).join(': ') : null;
            })
            .filter(msg => msg !== null && msg.trim() !== ""); // Remove empty messages

        return messages;
    } catch (err) {
        console.error('Error reading log file:', err);
        return [];
    }
}

module.exports = extractMessages;




