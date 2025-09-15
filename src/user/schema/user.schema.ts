import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AccountSettings, AccountSettingsSchema, UserSettings, UserSettingsSchema } from './user-settings.schema';

@Schema({ timestamps: true })
export class User extends Document {

    @Prop({ required: true, index: true })
    username:string;

    @Prop({ required: true, index: true })
    email:string;

    @Prop({ type: String, default: 'https://images.unsplash.com/photo-1756745679685-cb39adaf511b?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }) 
    profileImage: string;

    @Prop({ index: false })
    isVarified:boolean;

    @Prop({ default: false })
    isActive?: boolean;

    @Prop({ type:UserSettingsSchema ,default:{},select:false })
    settings!: UserSettings;  
    
    // declare timestamps for TS safety
    createdAt?: Date;
    updatedAt?: Date;  
}
export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
