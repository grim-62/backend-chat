import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Otp extends Document {
  @Prop({ required: true, index: true })
  recipient: string; // email or phone

  @Prop({ required: true })
  hashedCode: string;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;

  @Prop({ default: 0 })
  attempts: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
export const OtpSchema = SchemaFactory.createForClass(Otp);

// TTL to auto-delete after expiresAt
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
