import mongo from '../../config/db.js';

const regionSchema = new mongo.schema({
    region: {
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

    return mongo.mongoose.model(collectionName, regionSchema, collectionName);
};