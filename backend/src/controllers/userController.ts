// Controlador de usuarios
import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { logger } from '../utils/logger'; // Asegúrate de tener un logger configurado

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error al obtener usuarios:', error); // Registrar el error
    res.status(500).json({ error: 'Error interno al obtener usuarios' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    const newUser = await prisma.user.create({
      data: { email, name },
    });
    res.status(201).json(newUser);
  } catch (error) {
    logger.error('Error al crear usuario:', error); // Registrar el error
    res.status(500).json({ error: 'Error interno al crear usuario' });
  }
};
