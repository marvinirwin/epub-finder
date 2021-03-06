export class RevisionUpdater<T, RevisionT extends Partial<T>> {
    constructor(
        private getCurrentVersion: (newRevision: RevisionT) => Promise<T>,
        private isAllowedFn: (currentVersion: T) => Promise<boolean>,
        private mergeVersions: (currentVersion: T, newRevision: RevisionT) => T,
        private persistNewVersion: (newVersion: T) => Promise<T>
    ) {
    }
    public async SubmitRevision(
        newRevision: RevisionT
    ): Promise<T> {
        const currentVersion = await this.getCurrentVersion(newRevision);
        if (!currentVersion) {
            throw new Error("Cannot find current version");
        }
        if (!await (this.isAllowedFn(currentVersion))) {
            throw new Error("Not authorized to submit revision")
        }

        return await this.persistNewVersion(await this.mergeVersions(currentVersion, newRevision))
    }
}