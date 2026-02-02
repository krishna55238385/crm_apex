import dotenv from 'dotenv';
dotenv.config();

/**
 * Feature Flags Configuration
 * Control visibility of features across environments.
 * Can be overridden by Environment Variables.
 */
export const FEATURES = {
    // Advanced features (Paid or Beta)
    AI_SCORING: process.env.FEATURE_AI_SCORING === 'true' || false,
    ADVANCED_ANALYTICS: process.env.FEATURE_ADVANCED_ANALYTICS === 'true' || false,

    // Maintenance toggles
    READ_ONLY_MODE: process.env.FEATURE_READ_ONLY_MODE === 'true' || false,

    // Beta functionalities
    BETA_DASHBOARD: process.env.FEATURE_BETA_DASHBOARD === 'true' || true, // Defaulting to true for demo
};

export type FeatureName = keyof typeof FEATURES;
