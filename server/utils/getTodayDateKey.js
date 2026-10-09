// Daily resets (login bonus, free care actions) key off this.
//
// Must not use UTC: UTC midnight falls at 5pm Pacific, so an evening session
// would start a new day while the next morning still counted as the old one.
// App-wide for now; this belongs on the classroom once schools span timezones.
const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Los_Angeles";

// en-CA formats as YYYY-MM-DD, matching the keys already stored.
const getTodayDateKey = (date = new Date()) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(date);

module.exports = getTodayDateKey;
