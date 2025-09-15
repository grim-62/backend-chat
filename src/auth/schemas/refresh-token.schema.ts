import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshToken extends Document {
  // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  refreshToken: string; // opaque, random

  @Prop({ required: true, index: true })
  expiresAt: Date;
}
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
