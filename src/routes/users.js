import express from 'express';
import { celebrate } from 'celebrate';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { users } from '../validators/index';
import User from '../models/User';

const router = express.Router();

// Signup route
router.post('/', celebrate({
    body: users.signup
  }),
  (req, res) => {
    let success = false;
    const { JWT_SECRET } = process.env;
    let token;
    const { body } = req
    let user = new User();

    // Assigns all body fields to User model
    for (let i in body) {
      // Check if the field is password in order to hash the string
      if (i === 'password') {
        user.password = bcrypt.hashSync(body.password, 10);
        continue;
      }
      user[i] = body[i];
    }
    const userData = user.save();

    if (userData) {
      success = true;
      token = jwt.sign({ id: userData.id, userType: userData.userType }, JWT_SECRET);
    }

    // Delete password from the returned object
    delete userData.password;

    res.json({ success, data: userData, token });
});

// Users route accessible to admins only
router.get('/', (req, res) => {
  res.json({ user: { } });
});

export default router;
