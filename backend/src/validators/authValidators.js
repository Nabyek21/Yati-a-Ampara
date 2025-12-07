import Joi from 'joi';

export const registerSchema = Joi.object({
  dni: Joi.string().length(8).alphanum().required().messages({
    'string.length': 'El DNI debe tener exactamente 8 caracteres',
    'string.alphanum': 'El DNI solo puede contener números',
    'any.required': 'El DNI es obligatorio'
  }),
  nombres: Joi.string().max(100).required().messages({
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es obligatorio'
  }),
  apellidos: Joi.string().max(100).required().messages({
    'string.max': 'El apellido no puede exceder 100 caracteres',
    'any.required': 'El apellido es obligatorio'
  }),
  correo: Joi.string().email().required().messages({
    'string.email': 'El correo debe ser un email válido',
    'any.required': 'El correo es obligatorio'
  }),
  celular: Joi.string().pattern(/^[0-9]{9}$/).optional().messages({
    'string.pattern.base': 'El celular debe tener 9 dígitos'
  }),
  contrasena: Joi.string().min(8).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'any.required': 'La contraseña es obligatoria'
  })
});

export const loginSchema = Joi.object({
  correo: Joi.string().email().required().messages({
    'string.email': 'El correo debe ser un email válido',
    'any.required': 'El correo es obligatorio'
  }),
  contrasena: Joi.string().min(8).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'any.required': 'La contraseña es obligatoria'
  })
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validación fallida',
        errors: messages
      });
    }

    req.validatedBody = value;
    next();
  };
};
