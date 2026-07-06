import logger from '#config/logger.js';
import { signupSchema } from '#validations/auth.validation.js';
import { formatValidationErrors } from '#utils/format.js';
import { createUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';


export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      const formattedErrors = formatValidationErrors(validationResult.error);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: formattedErrors 
      });
    }

    const { name, email, role, password } = validationResult.data;

    // AUTH Service
    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'token', token);



    logger.info(`User ${name} signed up successfully with email ${email} and role ${role}`);
    res.status(201).json({ 
      message: 'User signed up successfully',
      user: { 
        id: user.id, name: user.name, email: user.email, role: user.role
      } 
    });

  } catch (e) {
    logger.error('Signup error:', e);

    if (e.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(e);
  }
};