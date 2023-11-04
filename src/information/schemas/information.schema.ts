import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument, now } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type InformationDocument = HydratedDocument<Information>;

export enum InformationType {
  ADVICE = 'advice',
  COMMENT = 'comment',
}

@Schema()
export class Information {
  @Prop({ required: true })
  rawText: string;

  @Prop({ enum: InformationType, required: true })
  type: string;

  @Prop({ required: true, default: true })
  validated: boolean;

  @ApiProperty({ type: User })
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  user: User;

  @ApiProperty()
  @Prop({ default: now() })
  createdAt: Date;

  @ApiProperty()
  @Prop({ default: now() })
  updatedAt: Date;
}

export const InformationSchema = SchemaFactory.createForClass(Information);
