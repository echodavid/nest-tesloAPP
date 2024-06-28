import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { BeforeInsert } from 'typeorm';

export class CreateProductDto {

  @ApiProperty({
    example: 'Nike Air Max 90',
    description: 'The title of the product',
    uniqueItems: true
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 100.00,
    description: 'The price of the product',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 'The best sneakers ever',
    description: 'The description of the product',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'nike-air-max-90',
    description: 'The slug of the product',
    uniqueItems: true,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: 10,
    description: 'The stock of the product',
  })
  @IsInt()
  @IsOptional()
  @IsPositive()
  stock?: number;

  @ApiProperty({
    example: ['40', '41', '42'],
    description: 'The sizes of the product',
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    example: 'women',
    description: 'Public of the product'
  })
  @IsString()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    example: ['winter', 'blue', 'women'],
    description: 'The tags of the product',
  })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  tags: string[];

  @ApiProperty({
    example: ['https://image.com/image.jpg'],
    description: 'The images of the product',
  })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  images?: string[];

    
}
