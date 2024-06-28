import { IsArray, IsEmail, IsString, IsStrongPassword } from "class-validator";
import { Product } from "src/products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column('text', {
        unique: true,
    })
    email: string;

    @Column('text')
    password: string;

    @Column('text')
    fullName: string;

    @Column('boolean', {
        default: true,
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user'],
    })
    roles: string[];


    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }

    @OneToMany(
        () => Product,
        (product) => product.user,
    )
    product: Product[];
}
