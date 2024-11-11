// import { asyncHandler } from "./async.js";
// import { ErrorResponse } from "./errorResponse.js";
// import { isPasswordMatch, sendResponse, role } from "./helperClass.js"; 
// import users from "../_data/api-user.js"
import UserAccount from "../models/user-account.js";

// export const userAuth = asyncHandler(async (req, res, next) => {
//     if (
//         !req.headers.authorization ||
//         req.headers.authorization.indexOf("Basic ") === -1
//     ) {
//         sendResponse(res, 401, false, null, "Invalid Authorization Credentials");
//     }
//     // verify auth credentials
//     const base64Credentials = req.headers.authorization.split(" ")[1];
//     const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
//     const [email, password] = credentials.split(":");
//     const userType = req.headers["x-user-type"];
//     let _user;

//     if (userType === role.ADMIN) {
//         _user = await UserAccount.findOne({
//             email,
//             // isActive: true,
//         });
//         // }
//     } else {
//         _user = await UserAccount.findOne({
//             email,
//             // isActive: true,
//         });
//     }

//     if (!_user) {
//         sendResponse(res, 401, false, null, "Invalid Authorization Credentials");
//     } else {
//         let passwordCheck = await isPasswordMatch(password, _user.password);
    
//         if (passwordCheck) {
//             req.user = _user;
//             next();
//         } else {
//             sendResponse(res, 401, false, null, "Invalid Authorization Credentials");
//         }
//     }
// });

export const basicAuth = asyncHandler(async (req, res, next) => {
  // check for basic auth header
    if (
        !req.headers.authorization ||
        req.headers.authorization.indexOf("Basic ") === -1
    ) {
        return sendResponse(res, 401, false, null, "Invalid Authorization Credentials");
    }
    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
    const [email, password] = credentials.split(":");

    await UserAccount.findOne({ email })
        .then(result => {
            if (result) {
                let passwordCheck = isPasswordMatch(password, result.password);

                if (passwordCheck) next();
                else return sendResponse(res, 401, false, null, "Invalid Authorization Credentials");
            } else {
                return sendResponse(res, 401, false, null, "Invalid Authorization Credentials");
            }
        }).catch(err => {
            console.log(err);
            return sendResponse(res, 401, false, null, "Invalid Authorization Credentials");
        });
});

export const protectByKey = asyncHandler(async (req, res, next) => {
    const apiKey = req.headers["x-dict-pbd"];

    if (!apiKey)
        return next(new ErrorResponse("Not authorized to access this route.22", 401));
  
    if (apiKey !== process.env.API_KEY)
        return next(new ErrorResponse("Not authorized to access this route.33", 401));
  
    try {
        next();
    } catch (error) {
        return next(new ErrorResponse("Not authorized to access this route.44", 401));
    }
  });