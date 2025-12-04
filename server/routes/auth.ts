import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User, Scan } from '../db/models';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const AVATARS_DIR = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AVATARS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

function formatUserResponse(user: any) {
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    avatar: user.avatar,
    company: user.company,
    jobTitle: user.jobTitle,
    totalScans: user.totalScans,
    carbonSaved: user.carbonSaved,
    preferences: user.preferences,
    appearance: user.appearance,
    privacy: user.privacy,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus
  };
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, company, jobTitle, guestToken } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      company,
      jobTitle,
      provider: 'local'
    });

    if (guestToken) {
      await Scan.updateMany(
        { guestToken, userId: null },
        { $set: { userId: user._id }, $unset: { guestToken: 1 } }
      );
      
      const guestScans = await Scan.countDocuments({ userId: user._id });
      if (guestScans > 0) {
        const scans = await Scan.find({ userId: user._id });
        const totalCarbon = scans.reduce((sum, s) => sum + (s.materialProperties?.embodiedCarbon || 0) * 0.1, 0);
        await User.findByIdAndUpdate(user._id, {
          $set: { totalScans: guestScans, carbonSaved: totalCarbon }
        });
      }
    }

    const token = generateToken(user._id.toString());

    res.status(201).json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, guestToken } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (guestToken) {
      const guestScans = await Scan.find({ guestToken, userId: null });
      if (guestScans.length > 0) {
        await Scan.updateMany(
          { guestToken, userId: null },
          { $set: { userId: user._id }, $unset: { guestToken: 1 } }
        );
        
        const totalCarbon = guestScans.reduce((sum, s) => sum + (s.materialProperties?.embodiedCarbon || 0) * 0.1, 0);
        await User.findByIdAndUpdate(user._id, {
          $inc: { totalScans: guestScans.length, carbonSaved: totalCarbon }
        });
      }
    }

    const token = generateToken(user._id.toString());

    res.json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/google', async (req: Request, res: Response) => {
  try {
    const { googleId, email, firstName, lastName, avatar, guestToken } = req.body;

    if (!googleId || !email) {
      res.status(400).json({ error: 'Google ID and email are required' });
      return;
    }

    let user = await User.findOne({ 
      $or: [{ googleId }, { email: email.toLowerCase() }] 
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      user = await User.create({
        email: email.toLowerCase(),
        firstName: firstName || 'User',
        lastName: lastName || '',
        googleId,
        avatar,
        provider: 'google'
      });
    }

    if (guestToken) {
      const guestScans = await Scan.find({ guestToken, userId: null });
      if (guestScans.length > 0) {
        await Scan.updateMany(
          { guestToken, userId: null },
          { $set: { userId: user._id }, $unset: { guestToken: 1 } }
        );
        
        const totalCarbon = guestScans.reduce((sum, s) => sum + (s.materialProperties?.embodiedCarbon || 0) * 0.1, 0);
        await User.findByIdAndUpdate(user._id, {
          $inc: { totalScans: guestScans.length, carbonSaved: totalCarbon }
        });
      }
    }

    const token = generateToken(user._id.toString());

    res.json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    res.json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, bio, company, jobTitle, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, bio, company, jobTitle, avatar },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: avatarPath },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ avatar: avatarPath, user: formatUserResponse(user) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

router.put('/preferences', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { emailAlerts, marketingEmails, pushNotifications, measurementSystem, currency } = req.body;
    
    const updateFields: any = {};
    if (emailAlerts !== undefined) updateFields['preferences.emailAlerts'] = emailAlerts;
    if (marketingEmails !== undefined) updateFields['preferences.marketingEmails'] = marketingEmails;
    if (pushNotifications !== undefined) updateFields['preferences.pushNotifications'] = pushNotifications;
    if (measurementSystem !== undefined) updateFields['preferences.measurementSystem'] = measurementSystem;
    if (currency !== undefined) updateFields['preferences.currency'] = currency;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

router.put('/appearance', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { darkMode, compactView, reduceMotion } = req.body;
    
    const updateFields: any = {};
    if (darkMode !== undefined) updateFields['appearance.darkMode'] = darkMode;
    if (compactView !== undefined) updateFields['appearance.compactView'] = compactView;
    if (reduceMotion !== undefined) updateFields['appearance.reduceMotion'] = reduceMotion;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appearance' });
  }
});

router.put('/privacy', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { publicProfile, showActivity, allowDataCollection } = req.body;
    
    const updateFields: any = {};
    if (publicProfile !== undefined) updateFields['privacy.publicProfile'] = publicProfile;
    if (showActivity !== undefined) updateFields['privacy.showActivity'] = showActivity;
    if (allowDataCollection !== undefined) updateFields['privacy.allowDataCollection'] = allowDataCollection;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(formatUserResponse(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

router.put('/password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user || !user.password) {
      res.status(404).json({ error: 'User not found or uses social login' });
      return;
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.userId, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;
