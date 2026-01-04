/**
 * Validation middleware factory
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {string} target - 'body', 'query', or 'params'
 */
const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        try {
            const data = req[target];
            const parsed = schema.parse(data);
            req[target] = parsed;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = validate;
