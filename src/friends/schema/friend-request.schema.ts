import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';

export type FriendRequestDocument = FriendRequest & Document;

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class FriendRequest {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  receiver: Types.ObjectId;

  @Prop({
    type: String,
    enum: FriendRequestStatus,
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;
}

export const FriendRequestSchema =
  SchemaFactory.createForClass(FriendRequest);

// prevent duplicates
FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
