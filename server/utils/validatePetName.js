const {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} = require("obscenity");

const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

const MAX_LENGTH = 20;
const ALLOWED = /^[A-Za-z0-9 '.-]+$/;

// Returns an error message, or null when the name is acceptable.
const validatePetName = (raw) => {
    const name = String(raw ?? "").trim().replace(/\s+/g, " ");

    if (!name) return "Please enter a name.";
    if (name.length > MAX_LENGTH) return `Names can be up to ${MAX_LENGTH} characters.`;
    if (!ALLOWED.test(name)) return "Names can only use letters, numbers, spaces and basic punctuation.";

    // also check with spacing and punctuation stripped, so "f u c k" and
    // "s.h.i.t" do not slip past the matcher
    const collapsed = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (matcher.hasMatch(name) || matcher.hasMatch(collapsed)) {
        return "Please choose a different name.";
    }

    return null;
};

module.exports = { validatePetName, MAX_LENGTH };
