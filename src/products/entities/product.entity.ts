import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example: 1,
        description: 'The unique identifier of the product',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        example: 'Nike Air Max 90',
        description: 'The title of the product',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 100.00,
        description: 'The price of the product',
    })
    @Column('float', {default: 0})
    price: number;

    @ApiProperty({
        example: 'The best shoes ever',
        description: 'The description of the product',
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 'nike-air-max-90',
        description: 'The slug of the product',
        uniqueItems: true,
    })
    @Column('text', {
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'The stock of the product',
    })
    @Column('int', {
        default: 0,
    })
    stock: number;

    @ApiProperty({
        example: ['red', 'blue', 'green'],
        description: 'The colors/sizes of the product',
    })
    @Column('text', {
        array: true,
        nullable: true,
    })
    sizes: string[];

    @ApiProperty({
        example: 'm',
        description: 'The gender of the product'
    })
    @Column('text')
    gender: string;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug
        .toLowerCase()
        .replace(/ /g, '-')
        .replace("'", '');
    }

    
    @ApiProperty({
        example: 'https://www.example.com/image.jpg',
        description: 'The main image of the product',
    })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];


    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
        .toLowerCase()
        .replace(/ /g, '-')
        .replace("'", '');
    }

    
    @ApiProperty({
        example: ['nike', 'shoes', 'airmax90'],
        description: 'The tags of the product',
    })
    @Column('text', {
        array: true,
        default: [],
    })
    tags: string[];


    @ManyToOne(
        () => User,
        (user) => user.product,
        {
            eager: true,
        }
    )
    user: User;

    
}
