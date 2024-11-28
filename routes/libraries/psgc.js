import express from 'express';
import * as librariesController from '../../controllers/libraries/psgc.js';
import * as middleware from '../../middleware/auth.js';

const route = express.Router();

route.get('/regions', middleware.protectByToken, librariesController.fetchRegions);

route.get('/provinces', middleware.protectByToken, librariesController.fetchProvinces);

route.get('/munCities', middleware.protectByToken, librariesController.fetchMunCities);

route.get('/barangays', middleware.protectByToken, librariesController.fetchBarangays);

export default route;