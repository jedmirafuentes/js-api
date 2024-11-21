import express from 'express';
import * as librariesController from '../../controllers/libraries/psgc.js';

const route = express.Router();

route.get('/regions', librariesController.fetchRegions);

route.get('/provinces', librariesController.fetchProvinces);

route.get('/munCities', librariesController.fetchMunCities);

route.get('/barangays', librariesController.fetchBarangays);

export default route;