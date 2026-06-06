import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { CustomRequest } from '../middleware/auth';

/**
 * Validates admin credentials and returns a secure JWT token.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
      res.status(400).json({ success: false, message: 'Please provide all login credentials.' });
      return;
    }

    // Support logging in via username or email
    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail.trim() },
        { email: usernameOrEmail.trim().toLowerCase() }
      ]
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
      return;
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET || 'supersecret_noticeboard_key_123!';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn: '1d' } // Token expires in 24 hours
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
};

/**
 * Returns the currently authenticated user profile details.
 */
export const getMe = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('getMe profile error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
};

/**
 * Seeds a default admin user if the User collection is currently empty.
 * This is runs automatically at server startup.
 */
export const seedDefaultAdmin = async (): Promise<void> => {
  try {
    // 1. Seed default admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('No administrator found in database. Seeding default admin...');
      
      const defaultUsername = 'admin';
      const defaultEmail = 'admin@noticeboard.edu';
      const defaultPassword = 'admin123';
      
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);
      
      const defaultAdmin = new User({
        username: defaultUsername,
        email: defaultEmail,
        passwordHash,
        role: 'admin'
      });
      
      await defaultAdmin.save();
      console.log('----------------------------------------------------');
      console.log('Default Admin Account Created Successfully:');
      console.log(`Username: ${defaultUsername}`);
      console.log(`Email:    ${defaultEmail}`);
      console.log(`Password: ${defaultPassword}`);
      console.log('----------------------------------------------------');
    }

    // 2. Seed default student
    const studentCount = await User.countDocuments({ role: 'student' });
    if (studentCount === 0) {
      console.log('No student found in database. Seeding default student...');
      
      const defaultStudentUsername = 'student';
      const defaultStudentEmail = 'student@noticeboard.edu';
      const defaultStudentPassword = 'student123';
      
      const salt = await bcrypt.genSalt(10);
      const studentPasswordHash = await bcrypt.hash(defaultStudentPassword, salt);
      
      const defaultStudent = new User({
        username: defaultStudentUsername,
        email: defaultStudentEmail,
        passwordHash: studentPasswordHash,
        role: 'student'
      });
      
      await defaultStudent.save();
      console.log('----------------------------------------------------');
      console.log('Default Student Account Created Successfully:');
      console.log(`Username: ${defaultStudentUsername}`);
      console.log(`Email:    ${defaultStudentEmail}`);
      console.log(`Password: ${defaultStudentPassword}`);
      console.log('----------------------------------------------------');
    }
  } catch (error) {
    console.error('Error seeding default administrator:', error);
  }
};
