import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, now } from 'mongoose';

export type TripStepDocument = HydratedDocument<TripStep>;

@Schema()
export class TripStep {
  @ApiProperty()
  @Prop({ required: true })
  title: string;

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty()
  @Prop()
  location: string;

  @ApiProperty()
  @Prop({ required: true })
  datetime: Date;
}

export const TripStepSchema = SchemaFactory.createForClass(TripStep);
