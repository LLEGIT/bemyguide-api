import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Destination } from 'src/destination/schemas/destination.schema';
import { User } from 'src/user/schemas/user.schema';
import { TripPlanning } from './trip_planning.schema';

export type TripDocument = HydratedDocument<Trip>;

@Schema()
export class Trip {
  @ApiProperty({ type: [User] })
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    required: true,
  })
  users: User[];

  @ApiProperty({ type: Destination })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Destination.name,
    required: true,
  })
  destination: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: TripPlanning })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: TripPlanning.name,
  })
  planning: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String] })
  invitedUsers: string[];
}

export const TripSchema = SchemaFactory.createForClass(Trip);

export interface UpdateTripUsersModel {
  _id: string;
  users: UserIdAndEmail[];
  inviteFrom: string;
}

interface UserIdAndEmail {
  _id?: string;
  email: string;
}

export interface InvitationModel {
  userId: ObjectId;
  accepted: boolean;
}
