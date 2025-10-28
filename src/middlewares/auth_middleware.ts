import { Request, Response, NextFunction } from "express";
import { AUTH_TOKEN } from "../config/contants";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: "Token de autorização não fornecido" });
    return;
  }

  // Extract token from "Bearer TOKEN" or just "TOKEN"
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.substring(7) 
    : authHeader;

  if (token !== AUTH_TOKEN) {
    res.status(401).json({ error: "Token de autorização inválido" });
    return;
  }

  next();
};
