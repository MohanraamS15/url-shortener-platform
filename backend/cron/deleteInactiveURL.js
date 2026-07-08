const cron = require('node-cron');
const Url = require('../models/urlSchema');

cron.schedule('0 0 * * *', async () => {
    try {
        console.log('[CRON] Running cleanup of inactive URLs...');

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const result = await Url.deleteMany({
            lastAccessedAt: { $lt: oneWeekAgo }
        });

        console.log(`[CRON] Deleted ${result.deletedCount} inactive URLs.`);
    } catch (err) {
        console.log('[CRON] Error during cleanup:', err);
    }
});
