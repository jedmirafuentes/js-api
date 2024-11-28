import express from 'express';
import * as authenticationController from '../../controllers/auth/authentication.js';
import * as middleware from '../../middleware/auth.js';

const route = express.Router();

route.post('/login', authenticationController.login);
route.post('/create', middleware.basicAuthOnly, authenticationController.create);
route.post('/apiAccess/create', middleware.bearerTokenAuthOrBasicAuth, authenticationController.apiAccessCreate);
route.post('/apiAccess/token/create', middleware.bearerTokenAuthOrBasicAuth, authenticationController.apiAccessTokenCreate);

export default route;