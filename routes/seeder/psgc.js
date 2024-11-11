import express from 'express';
import * as psgcController from '../../controllers/seeder/psgc.js';

const route = express.Router();

route.post('/create', psgcController.seed);

route.get('/get', psgcController.retrieve);

route.delete('/drop', psgcController.drop);

export default route;