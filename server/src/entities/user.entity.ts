import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    AfterLoad,
    BeforeUpdate,
    BeforeInsert,
    OneToMany,
    ManyToOne,
    JoinTable, Generated,
} from "typeorm";

import bcrypt from "bcrypt";
import { DocumentView } from "./document-view.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number | undefined
    @Column({ unique: true, default: null })
    email: string | null
    @Column({default: null})
    password: string | null;
    @Column({ default: null })
    reserved_for_provider: string | null
    @Column({ default: null })
    is_anonymous: boolean | null
    @Column({ default: null })
    keycloak: string | null
    @Column()
    @Generated("uuid")
    uuid: string;
    @OneToMany(
        () => DocumentView,
        (document: DocumentView) => document.creator_id,
    )
    documents: Promise<DocumentView[]>

    private _loadedPassword: string

    @AfterLoad()
    private storeInitialPassword(): void {
        this._loadedPassword = this.password as string;
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async encryptPassword(): Promise<void> {
        if (this._loadedPassword !== this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    public static comparePassword(
        currentPassword: string,
        attemptingPassword: string,
    ) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(attemptingPassword, currentPassword, (err, res) => {
                if (err) reject(err);
                if (res) resolve(true);
                resolve(false);
            });
        });
    }
}
