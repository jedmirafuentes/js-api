import mongo from '../config/db.js';

const psgcVersionSchema = new mongo.schema({
    fileName: {
        type: String,
        require: [true, "File name cannot be empty."]
    },
    version: {
        type: String,
        unique: true,
        require: [true, "Version is required."]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const psgcVersionModel = mongo.mongoose.model("psgcVersions", psgcVersionSchema);

export default psgcVersionModel;