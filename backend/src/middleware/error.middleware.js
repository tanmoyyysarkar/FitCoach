export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    success: false,
    statusCode: status,
    message: err.message || "Internal server error",
  });
};