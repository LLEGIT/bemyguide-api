import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { DestinationImages } from './destination_images.schema';
import { DestinationInformations } from './destination_informations.schema';
import { DestinationActivity } from './destination_activity.schema';

export type DestinationDocument = HydratedDocument<Destination>;

@Schema()
export class Destination {
  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    type: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
    },
  })
  @Prop({
    type: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
    },
    required: true,
  })
  coordinates: {
    lat: number;
    long: number;
  };

  @ApiProperty({ type: [DestinationImages] })
  @Prop({
    type: [{ type: Object, ref: 'DestinationImages' }],
    required: false,
  })
  images: DestinationImages[];

  @ApiProperty()
  @Prop({ required: true })
  currency: string;

  @ApiProperty({ type: DestinationInformations })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DestinationInformations.name,
  })
  informations: mongoose.Schema.Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Object, ref: 'DestinationActivity' })
  activities: DestinationActivity[];
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);
