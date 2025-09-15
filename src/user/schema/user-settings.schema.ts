import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
export class NotificationsSettings {
  @Prop({ type: Boolean, default: true }) email!: boolean;
  @Prop({ type: Boolean, default: false }) sms!: boolean;
  @Prop({ type: Boolean, default: true }) push!: boolean;
  @Prop({ type: Boolean, default: true }) friendRequests!: boolean;
  @Prop({ type: Boolean, default: true }) messages!: boolean;
}

export const NotificationsSettingsSchema =
  SchemaFactory.createForClass(NotificationsSettings);

@Schema({ _id: false })
export class PrivacySettings {
  @Prop({ type: String, enum: ['public', 'friends', 'private'], default: 'public' })
  profileVisibility!: 'public' | 'friends' | 'private';

  @Prop({ type: String, enum: ['everyone', 'friends', 'nobody'], default: 'everyone' })
  lastSeen!: 'everyone' | 'friends' | 'nobody';

  @Prop({ type: Boolean, default: true })
  readReceipts!: boolean;

  @Prop({ type: Boolean, default: true })
  searchVisibility!: boolean;
}
export const PrivacySettingsSchema = SchemaFactory.createForClass(PrivacySettings);

@Schema({ _id: false })
export class SecuritySettings {
  @Prop({ type: Boolean, default: false }) twoFactorAuth!: boolean;
  @Prop({ type: Boolean, default: true }) loginAlerts!: boolean;
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
  blockedUsers!: Types.ObjectId[];
}
export const SecuritySettingsSchema = SchemaFactory.createForClass(SecuritySettings);

@Schema({ _id: false })
export class PreferencesSettings {
  @Prop({ type: String, enum: ['light', 'dark', 'system'], default: 'light' })
  theme!: 'light' | 'dark' | 'system';

  @Prop({ type: String, default: 'en' })
  language!: string;

  @Prop({ type: String, default: 'UTC' })
  timezone!: string;

  @Prop({ type: String, enum: ['all', 'friends', 'safe'], default: 'all' })
  contentFilter!: 'all' | 'friends' | 'safe';
}
export const PreferencesSettingsSchema = SchemaFactory.createForClass(PreferencesSettings);

@Schema({ _id: false })
export class AccountSettings {
  @Prop({ type: Boolean, default: true }) dataSharing!: boolean;
  @Prop({ type: Boolean, default: true }) saveChatHistory!: boolean;
  @Prop({ type: Boolean, default: false }) accountDeactivation!: boolean;
}
export const AccountSettingsSchema = SchemaFactory.createForClass(AccountSettings);

@Schema({ _id: false })
export class UserSettings {
  @Prop({ type: NotificationsSettingsSchema, default: {} })
  notifications!: NotificationsSettings;

  @Prop({ type: PrivacySettingsSchema, default: {} })
  privacy!: PrivacySettings;

  @Prop({ type: SecuritySettingsSchema, default: {} })
  security!: SecuritySettings;

  @Prop({ type: PreferencesSettingsSchema, default: {} })
  preferences!: PreferencesSettings;

  @Prop({ type: AccountSettingsSchema, default: {} })
  account!: AccountSettings;
}
export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
export type UserSettingsType = UserSettings;
