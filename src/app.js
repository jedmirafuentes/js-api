import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';
import './config/db.js';
import './config/pem.js';
import * as config from './config/config.js';
import environment from "./config/environment.js";

import psgcRoute from './routes/seeder/psgc.js';
import psgcLibraries from './routes/libraries/psgc.js';
import auth from './routes/auth/authentication.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(config.sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(config.loggingHandler);
app.use(config.upload.single('file'), config.errorHandler);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/psgc', psgcRoute);
app.use('/api/auth', auth);
app.use('/api/psgc/lib', psgcLibraries);

app.use(config.routeNotFound);

app.listen(environment.port, () => console.log(`Server is running on port ${environment.port}`));
