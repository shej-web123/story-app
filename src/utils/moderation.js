// Basic bad words list (Vietnamese & English common terms)
// In a real app, this should be fetched from API or a more comprehensive library
const BAD_WORDS = [
    'dm', 'đm', 'dcm', 'đcm', 'vcl', 'vãi', 'đéo', 'deo',
    'fuck', 'shit', 'bitch', 'asshole',
    'cặc', 'lồn', 'buồi', 'ngu', 'óc chó',
    'chết tiệt', 'chó chết'
];

/**
 * Checks text for bad words and returns cleaned text
 * @param {string} text 
 * @returns {{ hasBadWords: boolean, cleanText: string }}
 */
export const checkContent = (text) => {
    if (!text) return { hasBadWords: false, cleanText: '' };

    let hasBadWords = false;
    let cleanText = text;

    // Simple regex replacement that preserves case
    // Note: This is a basic implementation. For production, consider using libraries like 'bad-words'
    BAD_WORDS.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(cleanText)) {
            hasBadWords = true;
            // Replace with asterisks of same length
            const replacement = '*'.repeat(word.length);
            cleanText = cleanText.replace(regex, replacement);
        }
    });

    return { hasBadWords, cleanText };
};

export const MODERATION_ACTIONS = {
    BAN_USER: 'BAN_USER',
    UNBAN_USER: 'UNBAN_USER',
    DELETE_STORY: 'DELETE_STORY',
    UPDATE_STORY: 'UPDATE_STORY',
    DELETE_COMMENT: 'DELETE_COMMENT',
    RESOLVE_REPORT: 'RESOLVE_REPORT'
};
