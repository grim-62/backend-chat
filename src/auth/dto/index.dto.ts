import { IsEmail, IsNotEmpty, IsString ,Length } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsEmail({})
  email: string; 

}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 10)
  code: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}