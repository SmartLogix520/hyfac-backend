// src/utils/apiResponse.js

/**
 * Format de réponse standardisé pour l'API
 */
export class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    static error(res, message = 'Error', statusCode = 500, errors = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    }

    static created(res, data, message = 'Resource created') {
        return this.success(res, data, message, 201);
    }

    static noContent(res, message = 'No content') {
        return res.status(204).json({
            success: true,
            message,
            timestamp: new Date().toISOString()
        });
    }

    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }

    static badRequest(res, message = 'Bad request', errors = null) {
        return this.error(res, message, 400, errors);
    }
}