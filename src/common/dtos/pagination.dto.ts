import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min, min } from "class-validator";


export class PaginationDto {

    @ApiProperty({
        required: false,
        type: Number,
        description: 'The limit of the query',
        default: 10,
    })
    @IsOptional()
    @IsPositive()
    //transformar a number
    @Type(() => Number) // enableImplicitConversion: true
    limit: number;

    @ApiProperty({
        required: false,
        type: Number,
        description: 'The offset of the query',
        default: 0,
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    @Min(0)
    offset: number;
}