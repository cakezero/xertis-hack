import mongoose from "mongoose";
import { logger } from "./logger.js";

// General container

const { DB_URI } = process.env;

mongoose.set("strictQuery", false);
const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(DB_URI, {});
    logger.info(
      `\x1b[36m%s\x1b[0m`,
      `DB: MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    logger.error(
      `\x1b[31m%s\x1b[0m`,
      `DB: MongoDB Conn Failure: ${error.message}`
    );
    process.exit(1);
  }
};

export { dbConnect };
