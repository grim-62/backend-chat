import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { Message } from './message.schema';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true, index: true, trim: true })
  chatName: string;

  @Prop({ required: true, default: false })
  isGroup: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], required: true, index: true })
  users: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: Message.name, default: null })
  lastMessage?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
  groupAdmin: Types.ObjectId[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Index optimizations
ChatSchema.index({ users: 1, isGroup: 1 });
ChatSchema.index({ chatName: 1, isGroup: 1 });
