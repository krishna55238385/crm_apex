import { Server, Socket } from 'socket.io';
import http from 'http';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import logger from '../utils/logger';

let io: Server;
const localSocketUserMap = new Map<string, string>(); // Local socketId -> userId mapping

export const initSocket = async (server: http.Server) => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    let redisConnected = false;
    try {
        await Promise.all([pubClient.connect(), subClient.connect()]);
        logger.info('Redis connected for Socket.io Adapter');
        redisConnected = true;
    } catch (err) {
        logger.error('Redis connection failed for Socket.IO - falling back to memory adapter', err);
    }

    io = new Server(server, {
        cors: {
            origin: "http://localhost:9002",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    if (redisConnected) {
        io.adapter(createAdapter(pubClient, subClient));
    }

    io.on('connection', (socket: Socket) => {
        // console.log(`New client connected: ${socket.id}`);

        // User Login Event
        socket.on('join', async (userId: string) => {
            if (userId) {
                localSocketUserMap.set(socket.id, userId);
                if (redisConnected) {
                    await pubClient.sAdd('online_users', userId);
                }
                // console.log(`User ${userId} came online`);
                broadcastOnlineUsers(redisConnected ? pubClient : null);
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            const userId = localSocketUserMap.get(socket.id);
            if (userId) {
                localSocketUserMap.delete(socket.id);

                if (redisConnected) {
                    await pubClient.sRem('online_users', userId);
                }
                // console.log(`User ${userId} went offline`);
                broadcastOnlineUsers(redisConnected ? pubClient : null);
            }
        });
    });
};

const broadcastOnlineUsers = async (redisClient: any) => {
    try {
        let users: string[] = [];
        if (redisClient) {
            users = await redisClient.sMembers('online_users');
        } else {
            // Memory fallback: usage from local map values
            users = Array.from(new Set(localSocketUserMap.values()));
        }
        io.emit('online_users', users);
    } catch (err) {
        logger.error('Failed to broadcast online users', err);
    }
};

export const getOnlineUsers = async () => {
    // This function must now be async as it fetches from Redis
    if (!io) return [];
    // We need a redis client here. In a real service, we'd export the client or singleton.
    // For now, let's assuming we can't easily get it without refactoring.
    // TEMPORARY: Return empty or fix architecture to export client.
    return [];
};
