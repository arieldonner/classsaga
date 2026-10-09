const MAX_LOG_ENTRIES = 50;

// Appends an entry to the pet's activity log, keeping only the newest entries.
// Mutates the document in memory; the caller's pet.save() persists it.
const logActivity = (pet, text, type = "neutral") => {
    if (!pet || !text) return;

    pet.activityLog.push({ text, type, at: new Date() });

    if (pet.activityLog.length > MAX_LOG_ENTRIES) {
        pet.activityLog = pet.activityLog.slice(-MAX_LOG_ENTRIES);
    }
};

module.exports = logActivity;
