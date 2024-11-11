import mongo from '../config/db.js';

const userSchema = new mongo.schema({
    email: {
        type: String,
        required: [true, "Email address is required."],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required."]
    },
    firstname: {
        type: String,
        default: ""
    },
    middlename: {
        type: String,
        default: ""
    },
    lastname: {
        type: String,
        default: ""
    },
    permission: { 
        type: mongo.schema.Types.ObjectId,
        required: [true, "Permission is required."]
    },
    role: { // auth for managing this service -user -admin
        type: String,
        required: [true, "Role is required."]
    },
    agency: {
        type: String,
        default: ""
    },
    author: {
        type: String,
        required: [true, "Author is required."]
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

const userModel = mongo.mongoose.model("users", userSchema);

export default userModel;