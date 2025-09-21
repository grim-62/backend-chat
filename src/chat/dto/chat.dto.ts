import e from "express";
import { Types } from "mongoose";


import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}

export class CreateGroupChatDto {
  @IsMongoId()
  @IsOptional()
  adminId?: string;
    
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 users are required to create a group chat' })
  @IsMongoId({each:true})
  users: string[];

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateChatDto {
    chatName?: string;
    isGroup?: boolean;
    users?: Types.ObjectId[];
    groupAdmin?: Types.ObjectId[];
}
