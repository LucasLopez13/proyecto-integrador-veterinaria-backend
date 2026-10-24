const schemaValidator = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      const summary = errorDetails.map((d) => d.message).join('. ');

      return res.status(400).json({
        message: `Error de validación: ${summary}`,
        errors: errorDetails
      });
    }

    req.body = value;
    next();
  };
};

module.exports = schemaValidator;
