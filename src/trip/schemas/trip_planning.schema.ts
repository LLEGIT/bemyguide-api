import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument, now } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { TripDay } from './trip_day.schema';

export type TripPlanningDocument = HydratedDocument<TripPlanning>;

@Schema()
export class TripPlanning {
  @ApiProperty({ type: [TripDay] })
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TripDay' }],
  })
  days: TripDay[];

  @ApiProperty()
  @Prop({ default: now() })
  createdAt: Date;

  @ApiProperty()
  @Prop({ default: now() })
  updatedAt: Date;

  @ApiProperty({ type: User })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  updatedBy: mongoose.Schema.Types.ObjectId;
}

export const TripPlanningSchema = SchemaFactory.createForClass(TripPlanning);

export interface AddTripPlanningModel {
  days: TripDay;
  updatedBy: User;
}
