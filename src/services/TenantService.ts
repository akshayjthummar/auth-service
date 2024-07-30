import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }
    async getAll() {
        return await this.tenantRepository.find();
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
