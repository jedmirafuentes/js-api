import express from 'express';
import * as psgcController from '../../controllers/seeder/psgc.js';
import * as middleware from '../../middleware/auth.js';

const route = express.Router();

route.post('/create', middleware.protectedByAdminCredsOnly, psgcController.seed);

route.get('/get', middleware.bearerTokenAuthOrBasicAuth, psgcController.retrieve);

route.delete('/drop', middleware.protectedByAdminCredsOnly, psgcController.drop);

export default route;