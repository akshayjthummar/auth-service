import { checkSchema } from "express-validator";

export default checkSchema({
    firstName: {
        errorMessage: "First name is required!",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "Last name is required!",
        notEmpty: true,
        trim: true,
    },
    role: {
        errorMessage: "Role is required!",
        notEmpty: true,
        trim: true,
    },
    tenantId: {
        errorMessage: "TenantId is required!",
        trim: true,
        custom: {
            options: (value: string, { req }) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const role = req.body.role;
                if (role === "admin") {
                    return true;
                } else {
                    return !!value;
                }
            },
        },
    },
});
