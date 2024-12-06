import multer from "multer";
import environment from "./environment.js";

export const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: (1024 * 1024) * 6 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'), false); 
        }
    }
 });

export const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

export function loggingHandler(req, res, next) {
    console.log(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        console.log(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
    });

    next();
};

export function routeNotFound(req, res) {
    const error = new Error('Not found');
    console.log(error);

    return res.status(404).json({ error: { message: error.message } });
};

export const sessionConfig = { secret: environment.secret, resave: false, saveUninitialized: false };