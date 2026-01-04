/**
 * Standard API response helper
 */
const response = {
    success: (res, data, message = 'Success', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    },

    created: (res, data, message = 'Created successfully') => {
        return res.status(201).json({
            success: true,
            message,
            data
        });
    },

    error: (res, message = 'Error', statusCode = 400) => {
        return res.status(statusCode).json({
            success: false,
            message
        });
    },

    paginated: (res, data, pagination, message = 'Success') => {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination
        });
    }
};

module.exports = response;
