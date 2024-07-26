import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
    },
    firstName: {
        errorMessage: 'FirstName is required',
        notEmpty: true,
    },
    lastName: {
        errorMessage: 'LastName is required',
        notEmpty: true,
    },
    password: {
        errorMessage: 'Password is required',
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password should be at least 8 chars',
        },
    },
});

// export default [body('email').notEmpty().withMessage('Email is required')];
