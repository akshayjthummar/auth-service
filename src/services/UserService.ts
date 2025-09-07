import { Brackets, Repository } from "typeorm";
import { User } from "../entity/User";
import { UpdateUserData, UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (user) {
            const error = createHttpError(400, "Email is already exist");
            throw error;
        }
        // Hash Password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
            });
            return user;
        } catch (err) {
            const error = createHttpError(
                500,
                "faild to store data in database",
            );
            throw error;
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            relations: { tenant: true }, // 👈 load tenant
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                password: true,
                tenant: { id: true, name: true }, // 👈 only pick what you need
            },
        });
    }
    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
            },
            relations: {
                tenant: true,
            },
        });
    }

    async getAll(validateQuery: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder("user");
        if (validateQuery.q) {
            const searchTerm = `%${validateQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        '("user"."firstName" || \' \' || "user"."lastName") ILIKE :q',
                        { q: searchTerm },
                    ).orWhere('"user"."email" ILIKE :q', { q: searchTerm });
                }),
            );
        }
        if (validateQuery.role) {
            queryBuilder.andWhere("user.role = :role", {
                role: validateQuery.role,
            });
        }
        const result = await queryBuilder
            .leftJoinAndSelect("user.tenant", "tenant")
            .skip((validateQuery.currentPage - 1) * validateQuery.perPage)
            .take(validateQuery.perPage)
            .orderBy("user.id", "DESC")
            .getManyAndCount();

        return result;
    }

    async update(
        { firstName, lastName, role, tenantId }: UpdateUserData,
        userId: number,
    ) {
        try {
            const user = await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
                tenant: tenantId ? { id: tenantId } : null,
            });
            return user;
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to update the user in the database",
            );
            throw error;
        }
    }
    async delete(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
