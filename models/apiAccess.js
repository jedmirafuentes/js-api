import mongo from '../config/db.js';

const apiAccessSchema = new mongo.schema({
    clientName: {
        type: String,
        required: [true, "Client name is required."]
    },
    applicationSecret: {
        type: String,
        default: ""
    },
    apiAccessToken: {
        type: mongo.schema.Types.ObjectId,
        default: null
    },
    libraries: [ mongo.schema.Types.ObjectId ], // library name and version
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