import multer from "multer";

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