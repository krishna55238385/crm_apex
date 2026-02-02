import { Request, Response, NextFunction } from 'express';
import { FEATURES, FeatureName } from '../config/features';

/**
 * Middleware to restrict access based on Feature Flags.
 * Returns 403 Forbidden if the feature is disabled.
 * 
 * Usage: router.post('/ai-score', requireFeature('AI_SCORING'), controller.score);
 */
export const requireFeature = (feature: FeatureName) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!FEATURES[feature]) {
            return res.status(403).json({
                status: 'error',
                message: `Feature '${feature}' is currently disabled.`
            });
        }
        next();
    };
};
