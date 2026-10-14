const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const issues = error.issues || error.errors;
    if (issues && Array.isArray(issues)) {
      return res.status(400).json({
        success: false,
        message: "Input validation failed.",
        errors: issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return res.status(400).json({
      success: false,
      message: "Invalid request payload format.",
    });
  }
};

module.exports = validate;
