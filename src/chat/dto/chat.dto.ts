import e from "express";
import { Types } from "mongoose";


import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}

export class CreateGroupChatDto {
  @IsMongoId()
  adminId?: string;
    
  @IsNotEmpty()
  users: string[];

  @IsNotEmpty()
  chatName: string;
}

export class UpdateChatDto {
    chatName?: string;
    isGroup?: boolean;
    users?: Types.ObjectId[];
    groupAdmin?: Types.ObjectId[];
}
