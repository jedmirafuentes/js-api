import mongo from '../config/db.js';

const apiAccessSchema = new mongo.schema({
    clientName: {
        type: String,
        required: [true, "Client name is required."]
    },
    // methods: {

    // }
    apiAccessToken: {
        type: mongo.schema.Types.ObjectId,
        default: null
    },
    applicationSecret: {
        type: String,
        default: ""
    },
    applicationId: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["Admin", "User"],
        required: [true, "Role is required."]
    },
    apiEndpoints: [ String ],
    libraries: [ mongo.schema.Types.ObjectId ], // library name and version
    author: {
        type: String,
        required: [true, "Author is required."]
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const apiAccessModel = mongo.mongoose.model("permissions", apiAccessSchema);

export default apiAccessModel;