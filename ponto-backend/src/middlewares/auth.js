const { Request, Response, NextFunction } = require('express');
const jwt = require('jsonwebtoken');
const { Perfil } = require('@prisma/client');

module.exports.JwtPayload = {
  id: '',
  cpf: '',
  nome: '',
  perfil: null,
  tipoJornada: '',
  unidadeId: ''
};

module.exports.AuthenticatedRequest = Request;

module.exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    );
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports.perfilMiddleware = (perfis) => {
  return (req, res, next) => {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!perfis.includes(req.usuario.perfil)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    next();
  };
};