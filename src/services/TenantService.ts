import { Repository } from "typeorm";
import { ITenant, TenantQueryParams } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }
    async getAll(queryParams: TenantQueryParams) {
        const queryBuilder = this.tenantRepository.createQueryBuilder();
        if (queryParams.q) {
            const searchTerm = `%${queryParams.q}%`;
            queryBuilder.where("CONCAT(name,' ',address) ILike :q", {
                q: searchTerm,
            });
        }
        const result = queryBuilder
            .skip((queryParams.currentPage - 1) * queryParams.perPage)
            .take(queryParams.perPage)
            .orderBy("id", "DESC")
            .getManyAndCount();
        return result;
    }
    async getTenantById(id: number) {
        return await this.tenantRepository.findOne({
            where: {
                id,
            },
        });
    }
    async updateTenantById(id: number, tenantData: ITenant) {
        return await this.tenantRepository.update(id, tenantData);
    }
    async deleteTenantById(id: number) {
        return await this.tenantRepository.delete(id);
    }
}
