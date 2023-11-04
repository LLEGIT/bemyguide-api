import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type DestinationImagesDocument = HydratedDocument<DestinationImages>;

@Schema()
export class DestinationImages {
  @ApiProperty()
  @Prop({ required: true })
  url: string;

  @ApiProperty()
  @Prop({ required: true })
  alt: string;
}

export const DestinationImagesSchema =
  SchemaFactory.createForClass(DestinationImages);
