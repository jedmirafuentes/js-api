import mongo from '../config/db.js';

const apiAccessSchema = new mongo.schema({
    clientName: {
        type: String,
        unique: true,
        required: [true, "Client name is required."]
    },
    clientSecret: {
        type: String,
        unique: true,
        required: [true, "Client secret is required."]
    },
    accessToken: {
        type: String,
        default: ""
    },
    expiration: {
        type: Number,
        default: 0
    },
    library: {
        type: mongo.schema.Types.ObjectId,
        required: [true, "Library is required."],
    },
    author: {
        type: String,
        required: [true, "Author is required."]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const apiAccessModel = mongo.mongoose.model("apiAccess", apiAccessSchema);

export default apiAccessModel;