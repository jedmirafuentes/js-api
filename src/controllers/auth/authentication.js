import userModel from "../../models/user.js";
import { encryptPassword } from "../../helpers/cryptHelper.js";
import apiAccessModel from "../../models/apiAccess.js";
import { createAuthToken } from "../../helpers/tokenHelper.js";
import psgcVersionModel from "../../models/psgcVersion.js";
import mongo from '../../config/db.js';

export const create = async (req, res) => {
    try {
        let user = new userModel({
            email: req.body.email,
            password: req.body.password,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            role: req.body.role,
            author: req.sessionData.fullname
        });
        let newUser = await user.save();
        let password = encryptPassword(newUser.password, newUser._id);

        await userModel.updateOne({ email: newUser.email }, { $set: { password } })
        
        return res.status(201).json({ success: true, msg: "User created successfully" });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, msg: error.message });
    }
};

export const login = async (req, res) => {
    if (!req.body.email || !req.body.password) 
        return res.status(400).json({ success: false, msg: "Email and password are required" });
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        const encryptedPassword = encryptPassword(password, user._id);

        if (!user) throw new Error("User not found");       
        if (user.password !== encryptedPassword) throw new Error("Invalid password");

        const token = createAuthToken(user._id, res);

        res.setHeader("Authorization", `Bearer ${token}`);
        return res.status(200).json({ success: true, msg: "Login successful", data: { token } });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, msg: error.message });
    }
};

export const apiAccessCreate = async (req, res) => {
    try {
        if (!req.body.library) throw new Error("Library is required");
        if (!req.body.clientSecret) throw new Error("Client Secret is required");

        let clientSecret = encryptPassword(req.body.library, req.body.library);
        let library = await psgcVersionModel.findOne({ version: req.body.library });

        if (!library) throw new Error("Library not found.");

        let apiAccess = new apiAccessModel({
            clientSecret,
            clientName: req.body.clientName,
            library: library._id,
            author: req.sessionData.fullname
        });
        
        await apiAccess.save();
        return res.status(201).json({ success: true, msg: "API Access created successfully", data: { clientSecret} });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, msg: error.message });
    }
};

export const apiAccessTokenCreate = async (req, res) => {
    const session = await mongo.mongoose.startSession();

    try {
        session.startTransaction();
        if (!req.body.clientSecret) throw new Error("Client Secret is required");

        let apiAccess = await apiAccessModel.findOne({ clientSecret: req.body.clientSecret });
        let token = createAuthToken(apiAccess.clientSecret);

        if (!apiAccess) throw new Error("API Access not found");
        await apiAccessModel.updateOne({ _id: apiAccess._id }, { $set: { 
            accessToken: token, 
            expiration: Date.now() + 1000 * 60 * 30 
        } });
        await session.commitTransaction();
        return res.status(201).json({ success: true, msg: "API Access Token created successfully", data: { token } });
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        return res.status(400).json({ success: false, msg: error.message });
    }
};
