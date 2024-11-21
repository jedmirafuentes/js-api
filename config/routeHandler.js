export function loggingHandler(req, res, next) {
    console.log(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        console.log(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
    });

    next();
};

export function routeNotFound(req, res) {
    const error = new Error('Not found');
    console.warning(error);

    return res.status(404).json({ error: { message: error.message } });
};