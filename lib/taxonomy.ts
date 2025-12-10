export const GOOGLE_TAXONOMY_MAP: Record<string, number> = {
    "Gold Bars": 178, // Bullion
    "Gold": 178,
    "Coins": 6357, // Precious Metal Coins
    "Gold Coins": 6357,
    "Silver": 178,
    "Silver Coins": 6357,
    "Raw Nuggets": 178, // Treated as generic Bullion for simplicity
    "Nuggets": 178,
    "Specimens": 178,
    "Bullion": 178,
    "Numismatics": 6357
};

export const DEFAULT_TAXONOMY_ID = 178;

export const getTaxonomyId = (category: string): number => {
    // Exact match
    if (GOOGLE_TAXONOMY_MAP[category]) return GOOGLE_TAXONOMY_MAP[category];
    
    // Partial match (e.g., "Canadian Gold Coins" -> match "Coins")
    const keys = Object.keys(GOOGLE_TAXONOMY_MAP);
    for (const key of keys) {
        if (category.includes(key)) return GOOGLE_TAXONOMY_MAP[key];
    }

    return DEFAULT_TAXONOMY_ID;
};
