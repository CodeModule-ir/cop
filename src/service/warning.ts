import { AppDataSource } from "../config/db";
import redisClient from "../config/redisClient";
import { Warning } from "../entities/Warning";
import { Context } from "grammy";
import { banUser } from "./ban";

export const warnUser = async (
  userId: number,
  username: string,
  ctx: Context
) => {
  const warningRepository = AppDataSource.getRepository(Warning);

  let userWarning = await warningRepository.findOneBy({ user_id: userId });

  if (userWarning) {
    userWarning.warning_count += 1;
    userWarning.last_warned_at = new Date();
  } else {
    userWarning = warningRepository.create({
      user_id: userId,
      username: username,
      warning_count: 1,
    });
  }

  await warningRepository.save(userWarning);

  // Cache the updated warning count in Redis
  await redisClient.set(
    `user:${userId}:warnings`,
    userWarning.warning_count.toString()
  );

  if (userWarning.warning_count >= 3) {
    await banUser(userId, ctx); // Ban the user
    await warningRepository.remove(userWarning); // Remove user warning record
    await redisClient.del(`user:${userId}:warnings`); // Remove warning count from Redis
    return null;
  }

  return userWarning;
};

export const getUserWarnings = async (userId: number) => {
  // Try to get the warning count from Redis
  const warningCount = await redisClient.get(`user:${userId}:warnings`);

  if (warningCount) {
    return parseInt(warningCount, 10);
  }

  // If not found in Redis, get from MySQL and cache it
  const warningRepository = AppDataSource.getRepository(Warning);
  const userWarning = await warningRepository.findOneBy({ user_id: userId });

  if (userWarning) {
    await redisClient.set(
      `user:${userId}:warnings`,
      userWarning.warning_count.toString()
    );
    return userWarning.warning_count;
  }

  return 0;
};
