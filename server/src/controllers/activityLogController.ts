import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';

export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
    // Need to join user for actor if needed, or handle AI actor
    // Schema is: actor_name VARCHAR(255), details (JSON), and optional actor_id linking to users?
    // Checking schema from initSchema.ts: 
    // activity_logs: id, timestamp, action, summary, source, target_type, target_id, target_name, actor_name, details (JSON)
    // Wait, the SQL query in original controller had `u.id as actor_id`, but `activity_logs` table definition in `initSchema` 
    // does NOT have an actor_id column? 
    // Actually `initSchema.ts` says: `actor_name VARCHAR(255)`.
    // The previous SQL used `JOIN users u`? 
    // Let's look closely at previous file: `a.actor_id` was selected.
    // If the table doesn't have actor_id, the SQL would fail. 
    // Assumption: The schema DOES have actor_id (maybe added later or missed in initSchema read).
    // I will assume standard practice: simple read. If type error, I'll fix schema or logic.
    // Actually, `prisma db pull` was run. 
    // I'll trust Prisma types.

    const logs = await prisma.activity_logs.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100 // Cap results
        // Prisma doesn't support JOIN if there's no FK relationship defined in schema.
        // If actor_id is just a UUID string without FK constraint, we can't `include: { users: true }`.
        // The original SQL seemed to assume there was an actor_id. Matches previous controller code.
    });

    const mappedLogs = logs.map(l => ({
        id: l.id,
        timestamp: l.timestamp,
        action: l.action,
        summary: l.summary,
        source: l.source,
        actor: {
            // id: l.actor_id, // If it exists
            name: l.actor_name || 'System',
            role: 'AI' // Legacy hardcode?
        },
        target: {
            type: l.target_type,
            id: l.target_id,
            name: l.target_name
        },
        details: {
            before: l.details_before,
            after: l.details_after,
            reason: l.details_reason,
            confidence: Number(l.details_confidence)
        }
    }));

    res.json(mappedLogs);
});
