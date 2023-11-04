import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { now, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema()
export class User {
  @ApiProperty()
  @Prop({ required: false, unique: false, type: Buffer })
  avatar?: Buffer | string;

  @ApiProperty()
  @Prop({ required: true, unique: true, type: String })
  username: string;

  @ApiProperty()
  @Prop({ required: true, type: String })
  firstname: string;

  @ApiProperty()
  @Prop({ required: true, type: String })
  lastname: string;

  @ApiProperty()
  @Prop({ required: true, unique: true, type: String })
  email: string;

  @ApiProperty()
  @Prop({ required: true, unique: true, type: String })
  phone_nb: string;

  @ApiProperty()
  @Prop({ required: true, type: String })
  password: string;

  @ApiProperty()
  @Prop({
    required: true,
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty()
  @Prop({ default: now() })
  createdAt: Date;

  @ApiProperty()
  @Prop({ default: now() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
