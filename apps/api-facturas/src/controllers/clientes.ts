import { prisma } from "@facturacion/database";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { validarNIF } from "../utils/fiscal";

export const getClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nombre: "asc" },
    });
    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

export const getCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: { facturas: true },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({ error: "Error al obtener cliente" });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const { nif, nombre, direccion, email, telefono } = req.body;

    if (!validarNIF(nif)) {
      return res.status(400).json({ error: "NIF inválido" });
    }

    const cliente = await prisma.cliente.create({
      data: {
        id: uuidv4(),
        nif,
        nombre,
        direccion,
        email,
        telefono,
      },
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nif, nombre, direccion, email, telefono } = req.body;

    if (nif && !validarNIF(nif)) {
      return res.status(400).json({ error: "NIF inválido" });
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: { nif, nombre, direccion, email, telefono },
    });

    res.json(cliente);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.cliente.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};
