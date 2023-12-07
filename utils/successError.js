const response = (res, code, msg, data = null) => {
    if (code >= 200 && code < 300) {
        return res.status(code).send({
            success: true,
            message: msg,
            data: data
        });
    };
    return res.status(code).send({
        success: false,
        message: msg,
        error: data
    });
}

module.exports = response;