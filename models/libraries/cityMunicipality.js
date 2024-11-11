import mongo from '../../config/db.js';

const citySchema = new mongo.schema({
    region: {
        type: String,
        default: ""
    },
    province: {
        type: String,
        default: ""
    },
    cityMunicipality: {
        type: String,
        default: ""
    },
    tenDigitCode: {
        type: String,
        unique: true,
        default: ""
    },
    nineDigitCode: {
        type: String,
        default: ""
    },
});

export default (collectionName) => {
    if (mongo.mongoose.models[collectionName])
        return mongo.mongoose.model(collectionName);

    return mongo.mongoose.model(collectionName, citySchema, collectionName);
};