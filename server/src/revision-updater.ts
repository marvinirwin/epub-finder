import {QueryDeepPartialEntity} from "typeorm/query-builder/QueryPartialEntity";

export class RevisionUpdater<T, RevisionT extends Partial<T>> {
    constructor(
        private getCurrentVersion: (newRevision: RevisionT) => Promise<T | undefined> | T,
        private isAllowedFn: (currentVersion: T) => Promise<boolean> | boolean,
        private mergeVersions: (currentVersion: T, newRevision: RevisionT) => T,
        private persistNewVersion: (newVersion: Partial<T>) => Promise<T> | T,
        private createNewVersion: (newRevision: RevisionT) => Promise<Partial<T>> | Partial<T>
    ) {
    }
    public async SubmitRevision(
        newRevision: RevisionT
    ): Promise<T> {
        const currentVersion = await this.getCurrentVersion(newRevision);
        if (!currentVersion) {
            const newVersion = await this.createNewVersion(newRevision);
            return this.persistNewVersion(newVersion);
        }
        if (!await (this.isAllowedFn(currentVersion))) {
            throw new Error("Not authorized to submit revision")
        }

        return this.persistNewVersion(await this.mergeVersions(currentVersion, newRevision));
    }
}