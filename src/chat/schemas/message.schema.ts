import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { Chat } from './chat.schema';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  sender: string;

  @Prop({ required: true, default: false })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true, index: true })
  chat: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
