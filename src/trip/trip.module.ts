import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { Trip, TripSchema } from './schemas/trip.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { TripDay, TripDaySchema } from './schemas/trip_day.schema';
import { TripStep, TripStepSchema } from './schemas/trip_step.schema';
import {
  TripPlanning,
  TripPlanningSchema,
} from './schemas/trip_planning.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    MongooseModule.forFeature([{ name: TripDay.name, schema: TripDaySchema }]),
    MongooseModule.forFeature([
      { name: TripStep.name, schema: TripStepSchema },
    ]),
    MongooseModule.forFeature([
      { name: TripPlanning.name, schema: TripPlanningSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}
