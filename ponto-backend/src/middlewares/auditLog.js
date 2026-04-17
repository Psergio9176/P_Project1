const { Request, Response, NextFunction } = require('express');
const { Prisma } = require('@prisma/client');
const prisma = require('../config/database');

module.exports.Acao = {
  CREATE_MARCACAO: 'CREATE_MARCACAO',
  CREATE_AJUSTE: 'CREATE_AJUSTE',
  AJUSTE_APROVADO: 'AJUSTE_APROVADO',
  AJUSTE_REJEITADO: 'AJUSTE_REJEITADO',
  ESPELHO_GERADO: 'ESPELHO_GERADO',
  ESPELHO_ASSINADO: 'ESPELHO_ASSINADO',
  USUARIO_CRIADO: 'USUARIO_CRIADO',
  USUARIO_ATUALIZADO: 'USUARIO_ATUALIZADO',
  USUARIO_DESATIVADO: 'USUARIO_DESATIVADO',
  LOGIN: 'LOGIN',
  LOGIN_FALHO: 'LOGIN_FALHO',
  PUSH_SUBSCRIBE: 'PUSH_SUBSCRIBE',
  PUSH_UNSUBSCRIBE: 'PUSH_UNSUBSCRIBE',
};

module.exports.AuthenticatedRequest = Request;

module.exports.criarAuditLog = async (req, acao, entidade, entidadeId, dados) => {
  try {
    await prisma.auditLog.create({
      data: {
        usuarioId: req.usuario?.id || 'sistema',
        acao,
        entidade,
        entidadeId,
        dados: dados,
        ip: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });
  } catch (error) {
    console.error('Erro ao criar audit log:', error);
  }
};

module.exports.auditMiddleware = (acao, entidade) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const paramsId = req.params.id;
        const entidadeId = (Array.isArray(paramsId) ? paramsId[0] : paramsId) || 
          (typeof data === 'object' && data !== null ? data.id : 'unknown');
        
        module.exports.criarAuditLog(req, acao, entidade, entidadeId, data);
      }
      
      return originalJson(data);
    };
    
    next();
  };
};