require('dotenv').config();
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { logger } from './src/config/logger';
import { dbConnect } from './src/config/db';

const { PORT }  = process.env || 4000;

const app = express();
app.set("view engine", "ejs");
app.use("/public", express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());

app.use('/user', userRoutes);

app.listen(PORT, () => {
  logger.info(`Server running on PORT ${PORT}`);
  dbConnect();
})
