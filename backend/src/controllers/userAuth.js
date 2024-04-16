import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { logger } from "../config/logger.js";
import JWT from "../utils/jwt.js";
import User from "../models/userSchema";
import jwt from "jsonwebtoken";
import {
  userValidationSchema,
  loginValidationSchema,
  resetPasswordValidationSchema,
} from "../validation/authValidation.js";
import { sendUpdateEmail, sendResetEmail } from "../utils/sendMail.js";
import { nanoid } from "nanoid";

// Sign up Logic
const register = async (req, res) => {
  try {
    const { error } = userValidationSchema.validate(req.body);

    if (error) {
      logger.error(
        `Registration validation error: ${error.details[0].message}`
      );
      return res.status(httpStatus.BAD_REQUEST).json({ error: error });
    }

    const { email, username } = req.body;

    const ExistingUser = await User.findOne(
      {
        $or: [{ email }, { username }],
      },
      { email: 1, username: 1 } // To return only the email and username fields
    );

    if (ExistingUser) {
      // doing this because email and username have to be unique
      if (ExistingUser.email === email) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: "Email already registered. Login instead" });
      } else {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ error: `Username already in use` });
      }
    }

    const newUser = new User(req.body);

    await newUser.save();

    return res.status(httpStatus.CREATED).json({ message: 'User has been created!' });
  } catch (error) {
    logger.error(`An error Occured ${error}`);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: `An error occured` });
  }
};

const registerUser = async (req, res) => {
  try {
    const { error } = passwordValidationSchema.validate(req.body);

    if (error) {
      logger.error(
        `Registration validation error: ${error.details[0].message}`
      );
      return res.status(httpStatus.BAD_REQUEST).json({ error: error });
    }
    const { token, password } = req.body;
    const decoded = await JWT.verify(token);

    const { email, userName, firstName, lastName } = decoded;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      password: hashedPassword,
      email,
      userName,
      firstName,
      lastName,
    });
    await newUser.save();

    responseData = {
      email,
      userName,
      firstName,
      lastName,
    };

    return res.status(httpStatus.CREATED).json({
      message: "Registration successful",
      data: responseData,
    });
  } catch (error) {
    logger.error(`An error occured during registration ${error}`);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: `An error occured` });
  }
};

// Sign in(Login) Logic

// Create Token (cookie)
//const maxAge = 3 * 24 * 60 * 60; // Setting the max age to 3 day
//const createToken = (id) => {
//return jwt.sign({ id }, SECRET_MESSAGE, { expiresIn: maxAge });
//};

// Login
const login = async (req, res) => {
  try {
    const { error } = loginValidationSchema.validate(req.body);
    if (error) {
      logger.error(
        `Registration validation error: ${error.details[0].message}`
      );
      return res.status(httpStatus.BAD_REQUEST).json({ error: error });
    }
    const { auth, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: auth }, { userName: auth }],
    });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "email/username or password is incorrect" });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "email/username or password is incorrect" });
    }

    const token = await JWT.sign({ user }, { expiresIn: "10d" });

    const responseData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.firstName,
      email: user.email,
      userName: user.userName,
    };

    return res
      .status(httpStatus.OK)
      .json({ user: responseData, token, message: "Login successful" });
  } catch (error) {
    logger.error(`Error during login ${error}`);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "User login failed. Try again!" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: "User not found!" });

    const otp = nanoid(4);

    user.otp = otp;

    await user.save();

    await sendResetEmail(user, "Password Reset OTP", otp);

    return res.status(httpStatus.OK).json({
      message:
        "OTP Sent. Please check your email for the OTP sent to reset your password",
    });
  } catch (error) {
    logger.error(`An error occured during request for OTP ${error}`);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occured!" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({ otp });

    if (!user)
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "Invalid or expired reset token" });

    const resetToken = await JWT.sign({ user }, { expiresIn: "15m" });

    return res.status(200).json({ resetToken });
  } catch (err) {
    logger.error(`Error occured during password reset ${err}`);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Error resetting password" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { error } = resetPasswordValidationSchema.validate(req.body);

    if (error) {
      logger.error(
        `Reset password validation error ${error.details[0].message}`
      );
      return res.status(httpStatus.BAD_REQUEST).json({ error: error });
    }

    const { password, resetToken } = req.body;

    const decoded = await JWT.verify(resetToken);

    const { email } = decoded.user;

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword, otp: null },
      { new: true }
    );

    if (!updatedUser)
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "Invalid or expired reset token!" });

    await sendUpdateEmail(updatedUser, "Password reset Successful");
    return res.status(httpStatus.OK).json({
      message: "Password reset successful. Login with your new password",
    });
  } catch (err) {
    logger.error(`An error occured during reset password ${err}`);
    if (err instanceof jwt.TokenExpiredError) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: "Invalid or expired reset token " });
    }
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occured" });
  }
};

export {
  register,
  registerUser,
  login,
  forgotPassword,
  resetPassword,
  verifyOtp,
};
