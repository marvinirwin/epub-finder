export interface DocumentSelectionRowInterface {
    name: string;
    // Reading means it's selected
    reading?: boolean;
    // Open mean its stats are included in the list[
    open?: boolean;

    belongsToCurrentUser?: boolean;
    lastModified: Date;

    id: string
}
