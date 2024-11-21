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
    lastname: {
        type: String,
        default: ""
    },
    role: { // auth for managing this service -user -admin
        type: String,
        required: [true, "Role is required."]
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