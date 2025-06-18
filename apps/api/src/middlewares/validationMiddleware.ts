import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateInvoice = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    clientName: Joi.string().required(),
    invoiceNumber: Joi.string().required(),
    items: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          price: Joi.number().required(),
        })
      )
      .required(),
    total: Joi.number().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};
