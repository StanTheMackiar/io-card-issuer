import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CustomerCardRequestDto {
  @IsString()
  @IsIn(['DNI'])
  documentType: 'DNI';

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @Type(() => Number)
  @IsInt()
  @Min(18)
  age: number;

  @IsEmail()
  email: string;
}

export class ProductCardRequestDto {
  @IsString()
  @IsIn(['VISA'])
  type: 'VISA';

  @IsString()
  @IsIn(['PEN', 'USD'])
  currency: 'PEN' | 'USD';
}

export class CreateCardRequestDto {
  @ValidateNested()
  @Type(() => CustomerCardRequestDto)
  customer: CustomerCardRequestDto;

  @ValidateNested()
  @Type(() => ProductCardRequestDto)
  product: ProductCardRequestDto;

  @IsBoolean()
  @Transform(({ value }): boolean => value === true || value === 'true')
  forceError: boolean;
}
