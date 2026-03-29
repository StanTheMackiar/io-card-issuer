import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CustomerCardRequestDto {
  @IsDefined()
  @IsString()
  @IsIn(['DNI'])
  documentType: 'DNI';

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentNumber: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  age: number;

  @IsDefined()
  @IsEmail()
  email: string;
}

export class ProductCardRequestDto {
  @IsDefined()
  @IsString()
  @IsIn(['VISA'])
  type: 'VISA';

  @IsDefined()
  @IsString()
  @IsIn(['PEN', 'USD'])
  currency: 'PEN' | 'USD';
}

export class CreateCardRequestDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CustomerCardRequestDto)
  customer: CustomerCardRequestDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => ProductCardRequestDto)
  product: ProductCardRequestDto;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }): boolean =>
    value === undefined ? false : value === true || value === 'true',
  )
  forceError = false;
}
