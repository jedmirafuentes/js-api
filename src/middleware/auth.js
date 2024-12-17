import userModel from "../models/user.js";
import { encryptPassword } from "../helpers/cryptHelper.js";
import { verifyAuthToken } from "../helpers/tokenHelper.js";
import apiAccessModel from "../models/apiAccess.js";
import psgcVersionModel from "../models/psgcVersion.js";

function basicAuth (req) {
    return new Promise( async (resolve, reject) => {
        if (!req.headers.authorization ||req.headers.authorization.indexOf("Basic ") === -1) 
            reject("Invalid Authorization Credentials");

        try {
            const base64Credentials = req.headers.authorization.split(" ")[1];
            const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
            const [email, password] = credentials.split(":");
            let user = await userModel.findOne({ email });
            let passwordCheck = encryptPassword(password, user._id) === user.password;

            if (user && passwordCheck) {
                resolve(user);
            } else {
                reject("Invalid Authorization Credentials");
            }
        } catch (error) {
            reject("Invalid Authorization Credentials");
        }
    });
};

function bearerTokenAuth (req) {
    return new Promise( async (resolve, reject) => {
        if (!req.headers.authorization || req.headers.authorization.indexOf("Bearer ") === -1) 
            reject("Invalid Authorization Credentials");

        try {
            const data = verifyAuthToken(req.headers.authorization.split(" ")[1]); // token
            const user = await userModel.findById(data._id);

            if (user) resolve(user);
            else reject("Invalid Authorization Credentials");
        } catch (error) {
            reject("Invalid Authorization Credentials");
        }
    });
};

function withHeaders (partnerToken, partnerSecret) {
    return new Promise( async (resolve, reject) => {
        let apiAccessToken = await apiAccessTokenModel.findOne({ accessToken: partnerToken });
        let apiAccess = await apiAccessModel.findOne({ clientSecret: partnerSecret });

        if (apiAccessToken && apiAccess) {
            let library = await psgcVersionModel.findOne({ version: apiAccess.version, isActive: true });

            if (!library) return res.status(401).json({ success: false, msg: "Invalid library version." });
            resolve(library.version);
        } else {
            reject("Invalid Authorization Credentials");
        }
    });
};

export const bearerTokenAuthOrBasicAuth = async (req, res, next) => {
    try {
        Promise.any([bearerTokenAuth(req), basicAuth(req)]).then((data) => {
            let fullname = data.firstname + ' ' + data.lastname;

            req.sessionData = { _id: data._id, fullname };
            next();
        }).catch(() => {
            return res.status(401).json({ success: false, msg: "Invalid Authorization Credentials" });
        })
    } catch (error) {
        return res.status(401).json({ success: false, msg: "Something went wrong" });
    }
};

export const bearerTokenAuthOnly = async (req, res, next) => {
    try {
        bearerTokenAuth(req).then((data) => {
            let fullname = data.firstname + ' ' + data.lastname;
            
            req.sessionData = { _id: data._id, fullname };
            next();
        }).catch((error) => {
            return res.status(401).json({ success: false, msg: error });
        })
    } catch (error) {
        return res.status(401).json({ success: false, msg: "Something went wrong" });
    }
};

export const basicAuthOnly = async (req, res, next) => {
    try {
        basicAuth(req).then((data) => {
            let fullname = data.firstname + ' ' + data.lastname;

            req.sessionData = { _id: data._id, fullname };
            next();
        }).catch((error) => {
            return res.status(401).json({ success: false, msg: error });
        })
    } catch (error) {
        return res.status(401).json({ success: false, msg: "Something went wrong" });
    }
};

export const protectByToken = async (req, res, next) => {
    const partnerToken = req.headers["x-partner-token"];

    if (!partnerToken)
        return res.status(401).json({ success: false, msg: "Invalid headers." });
    try {
        let apiAccessToken = await apiAccessModel.findOne({ accessToken: partnerToken });
        let isCorrectToken = verifyAuthToken(partnerToken);

        if (!apiAccessToken || !isCorrectToken)
            return res.status(401).json({ success: false, msg: "Incorrect API Access Token." });
        else {
            if (apiAccessToken.expiration < Date.now()) 
                return res.status(401).json({ success: false, msg: "API Access Token expired." });
            
            let library = await psgcVersionModel.findById(apiAccessToken.library);

            if (!library || !library.isActive) return res.status(401).json({ success: false, msg: "Invalid library version." });
            req.library = library.version;
            next();
        }
    } catch (error) {
        console.log(error)
        return res.status(401).json({ success: false, msg: "Not Authorized to access this resource." });
    }
};

export const protectedByAdminCredsOnly = async (req, res, next) => {
    try {
        bearerTokenAuth(req).then((data) => {
            if (data.role !== "Admin")
                return res.status(401).json({ success: false, msg: "Not authorized to access this resource." });
            req.sessionData = data;
            next();
        }).catch(() => {
            return res.status(401).json({ success: false, msg: "Invalid Authorization Credentials" });
        })
    } catch (error) {
        return res.status(401).json({ success: false, msg: "Something went wrong" });
    }
};  

// export const basicAuth = async (req, res, next) => {
//   // check for basic auth header
//     if (!req.headers.authorization ||req.headers.authorization.indexOf("Basic ") === -1) 
//         return res.status(401).json({ success: false, msg: "Invalid Authorization Credentials" });
//     // verify auth credentials
//     try {
//         const base64Credentials = req.headers.authorization.split(" ")[1];
//         const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
//         const [email, password] = credentials.split(":");
//         let passwordCheck = encryptPassword(password, result._id) === result.password;
//         let user = await UserAccount.findOne({ email });

//         if (user && passwordCheck) {
//             req.sessionData = user;
//             next();
//         } else {
//             return res.status(401).json({ success: false, msg: "Invalid Authorization Credentials" });
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(401).json({ success: false, msg: "Invalid Authorization Credentials" });
//     }
// };

// export const bearerTokenAuth = async (req, res, next) => {
//     if (!req.headers.authorization || req.headers.authorization.indexOf("Bearer ") === -1) 
//         return res.status(401).json({ success: false, msg: "Invalid Authorization Credentials" });

//     try {
//         const data = verifyAuthToken(req.headers.authorization.split(" ")[1]);
//         // const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
//         // const [email, password] = credentials.split(":");
//         // const userType = req.headers["x-user-type"];
//         const user = await userModel.findById(data.id);

//         if (user) {
//             req.sessionData = user;
//             next();
//         } else {
//             return res.status(401).json({ success: false, msg: "Invalid Authorization Credentials" });
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(401).json({ success: false, msg: "Invalid Authorization Credentials" });
//     }
// };