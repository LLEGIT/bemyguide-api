import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { TripStep } from './trip_step.schema';

export type TripDayDocument = HydratedDocument<TripDay>;

@Schema()
export class TripDay {
  @ApiProperty()
  @Prop()
  title: string;

  @ApiProperty()
  @Prop({ required: true })
  day: Date;

  @ApiProperty({ type: [TripStep] })
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TripStep' }],
  })
  steps: TripStep[];
}

export const TripDaySchema = SchemaFactory.createForClass(TripDay);
