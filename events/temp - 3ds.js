// timeoutLoopManager.js
const FIVE_MIN = 5 * 60 * 1000;
const timeoutLoopMap = new Map(); // memberID → intervalID

module.exports = {
    startLoop(member) {
        if (!member) return "Member not found.";

        if (timeoutLoopMap.has(member.id)) {
            return "Timeout loop is already running for this user.";
        }

        // Apply timeout immediately
        member.timeout(FIVE_MIN, "Refreshing timeout loop")
            .catch(console.error);

        const intervalId = setInterval(() => {
            member.timeout(FIVE_MIN, "Refreshing timeout loop")
                .catch(err => {
                    console.error("Timeout failed:", err);
                    clearInterval(intervalId);
                    timeoutLoopMap.delete(member.id);
                });
        }, FIVE_MIN);

        timeoutLoopMap.set(member.id, intervalId);
        return `Started 5-minute timeout loop for ${member.user.tag}`;
    },

    stopLoop(member) {
        const intervalId = timeoutLoopMap.get(member.id);
        if (!intervalId) {
            return "This user does not have an active timeout loop.";
        }

        clearInterval(intervalId);
        timeoutLoopMap.delete(member.id);
        return `Stopped timeout loop for ${member.user.tag}`;
    }
};

