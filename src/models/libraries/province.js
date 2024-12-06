import mongo from '../../config/db.js';

const provinceSchema = new mongo.schema({
    region: {
        type: String,
        default: ""
    },
    province: {
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

    return mongo.mongoose.model(collectionName, provinceSchema, collectionName);
};