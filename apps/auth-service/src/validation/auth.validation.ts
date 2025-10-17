import Joi from "joi";

// Validation schemas for authentication endpoints
export const authValidation = {
  // Register validation
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "El email debe tener un formato válido",
      "any.required": "El email es obligatorio",
    }),
    password: Joi.string()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.min": "La contraseña debe tener al menos 8 caracteres",
        "string.max": "La contraseña no puede tener más de 100 caracteres",
        "string.pattern.base":
          "La contraseña debe contener al menos una letra minúscula, una mayúscula y un número",
        "any.required": "La contraseña es obligatoria",
      }),
    firstName: Joi.string().min(2).max(50).required().messages({
      "string.min": "El nombre debe tener al menos 2 caracteres",
      "string.max": "El nombre no puede tener más de 50 caracteres",
      "any.required": "El nombre es obligatorio",
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      "string.min": "Los apellidos deben tener al menos 2 caracteres",
      "string.max": "Los apellidos no pueden tener más de 50 caracteres",
      "any.required": "Los apellidos son obligatorios",
    }),
  }),

  // Login validation
  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "El email debe tener un formato válido",
      "any.required": "El email es obligatorio",
    }),
    password: Joi.string().required().messages({
      "any.required": "La contraseña es obligatoria",
    }),
  }),

  // Refresh token validation
  refresh: Joi.object({
    refreshToken: Joi.string().required().messages({
      "any.required": "El refresh token es obligatorio",
    }),
  }),

  // Forgot password validation
  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "El email debe tener un formato válido",
      "any.required": "El email es obligatorio",
    }),
  }),

  // Reset password validation
  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "El token de reset es obligatorio",
    }),
    password: Joi.string()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.min": "La contraseña debe tener al menos 8 caracteres",
        "string.max": "La contraseña no puede tener más de 100 caracteres",
        "string.pattern.base":
          "La contraseña debe contener al menos una letra minúscula, una mayúscula y un número",
        "any.required": "La contraseña es obligatoria",
      }),
  }),

  // Email verification validation
  verifyEmail: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "El token de verificación es obligatorio",
    }),
  }),
};

// Middleware to validate request body
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors,
      });
    }

    next();
  };
};
