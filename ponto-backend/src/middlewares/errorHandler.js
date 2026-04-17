const { Request, Response, NextFunction } = require('express');

module.exports.AppError = Error;

module.exports.errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({ error: message });
};