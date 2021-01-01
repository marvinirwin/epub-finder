import {
    Entity,
    Column,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    AfterLoad,
    BeforeUpdate,
    BeforeInsert,
    OneToMany, Repository, ManyToOne, JoinTable
} from "typeorm";

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {UsageEvent} from "./usage-event.entity";
import {JsonValueTransformer} from "../util/JsonValueTransformer";
import {Usage} from "./usage.entity";
import {session} from "./session.entity";
import {DocumentView} from "./document-view.entity";

@Entity()
export class User {
    // If a user has no tokens or emails, it's an ip user
    public static IpUserCriteria = {
        email: null,
        tokens: ''
    };
    @PrimaryGeneratedColumn()
    id: number | undefined;
    @Column({unique: true, default: null})
    email: string | null; // { type: String, unique: true },
    @Column()
    password: string = '';
    @Column({default: null})
    password_reset_token: string | null;
    @Column({default: null})
    password_reset_expires: Date | null = new Date(); // I have no idea if this will break anything
    @Column({default: null})
    email_verification_token: string = '';
    @Column({default: false})
    email_verified: boolean = false;
    @Column()
    google: string = '';
    @Column()
    profile_name: string = '';
    @Column()
    profile_gender: string = '';
    @Column()
    profile_location: string = '';
    @Column()
    profile_website: string = '';
    @Column()
    profile_picture: string = '';

    @Column({default: null})
    reserved_for_provider: string | null;

    private _loadedPassword: string;

    @OneToMany(() => DocumentView, (document: DocumentView) => document.creator_id)
    documents: Promise<DocumentView[]>;

    @AfterLoad()
    private storeInitialPassword(): void {
        this._loadedPassword = this.password;
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async encryptPassword(): Promise<void> {
        if (this._loadedPassword !== this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    public gravatar(size) {
        if (!size) {
            size = 200;
        }
        if (!this.email) {
            return `https://gravatar.com/avatar/?s=${size}&d=retro`;
        }
        const md5 = crypto.createHash("md5").update(this.email).digest("hex");
        return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
    }

    public static comparePassword(currentPassword: string, attemptingPassword: string) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(attemptingPassword, currentPassword, (err, res) => {
                if (err) reject(err);
                if (res) resolve(true);
                resolve(false);
            })
        });
    }

    public async usageStat(r: Repository<Usage>): Promise<Usage> {
        return r.findOne({user_id: this.id})
    }

}

