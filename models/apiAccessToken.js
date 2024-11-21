import mongo from '../config/db.js';

const apiAccessTokenSchema = new mongo.schema({
    clientName: {
        type: String,
        default: ""
    },
    accessToken: {
        type: String,
        default: ""
    },
    expiration: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const apiAccessTokenModel = mongo.mongoose.model("apiAccessTokens", apiAccessTokenSchema);

export default apiAccessTokenModel;