import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';
import './config/db.js';
import { upload, errorHandler } from './config/fileUpload.js';
import psgcRoute from './routes/seeder/psgc.js';
import psgcLibraries from './routes/libraries/psgc.js';
// import environment from './config/environment.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
// app.use(passport.session());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));

app.use(upload.single('file'), errorHandler);

app.use('/api/psgc', psgcRoute);

app.use('/api/psgc/lib', psgcLibraries);

export default app;
