import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Minimum length must be 8"],
    validate: {
      validator(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password must not contain "password"');
        }
      },
    },
  },
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSaltSync(14);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const users = mongoose.model('users', userSchema);

export default users;