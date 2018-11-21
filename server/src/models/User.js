
import BaseModel from './BaseModel';

class User extends BaseModel {
  constructor(args) {
    super(args);
    this.arrayName = 'users';
    this.userType = 'user'; // Normal user type by default
    this.hidden = ['password', 'confirmationCode'];
  }

  // Find user by email
  findByEmail(email = '') {
    const users = global[this.arrayName];

    if (!email || users.length === 0) return undefined;

    const user = users.filter(val => val.email === email)[0] || null;

    if (!user) return null;
    this.updateFields(user);
    return this;
  }
}

export default User;
