// users/dto/update-user.dto.ts
import { IsEmail, IsOptional, IsString, IsBoolean, IsUrl, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  sms?: boolean;
}

class PrivacySettingsDto {
  @IsOptional()
  @IsString()
  profileVisibility?: 'public' | 'private' | 'friends';

  @IsOptional()
  @IsString()
  lastSeen?: 'everyone' | 'friends' | 'nobody';
}

class SettingsDto {
  @IsOptional()
  @IsString()
  theme?: 'light' | 'dark';

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications?: NotificationSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacy?: PrivacySettingsDto;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must include country code (e.g. +123456789)' })
  phone?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
  settings?: SettingsDto;
}
