import bcrypt from 'bcrypt';
import logger from '#config/logger.js';

import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Error hashing password', { cause: error });
  }
};

export const createUser = async ({name, email, password, role='user'}) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) throw new Error('User with this email already exists');
        
    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });
    
    logger.info(`User ${name} created successfully with email ${email} and role ${role}`);
    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);

    if (error.message === 'User with this email already exists') {
      throw error;
    }

    throw new Error('Error creating user', { cause: error });
  }
};