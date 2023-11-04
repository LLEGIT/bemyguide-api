import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
  InvitationModel,
  Trip,
  TripDocument,
  UpdateTripUsersModel,
} from './schemas/trip.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import {
  AddTripPlanningModel,
  TripPlanning,
  TripPlanningDocument,
} from './schemas/trip_planning.schema';
import { TripDay, TripDayDocument } from './schemas/trip_day.schema';
import { TripStep, TripStepDocument } from './schemas/trip_step.schema';
import { resolve } from 'path';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip.name)
    private tripModel: Model<TripDocument>,
    @InjectModel(TripPlanning.name)
    private tripPlanningModel: Model<TripPlanningDocument>,
    @InjectModel(TripDay.name)
    private tripDayModel: Model<TripDayDocument>,
    @InjectModel(TripStep.name)
    private tripStepModel: Model<TripStepDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  async create(trip: Trip): Promise<Trip> {
    if (trip.users[0] === null) {
      throw new Error('User is required');
    }
    const newTrip = new this.tripModel(trip);
    return newTrip.save();
  }

  async readAll(): Promise<Trip[]> {
    return await this.tripModel.find().exec();
  }

  async readById(id: ObjectId): Promise<Trip> {
    const options = {
      sort: [{ day: 'asc' }],
    };
    return await this.tripModel
      .findById(id)
      .populate('destination')
      .populate({
        path: 'planning',
        populate: {
          path: 'days',
          model: 'TripDay',
          options,
        },
      })
      .exec();
  }

  async readByIdWithUsers(id: ObjectId): Promise<Trip> {
    return await this.tripModel.findById(id).populate('users').exec();
  }

  async readByIdWithMinimumInformation(id: ObjectId): Promise<Trip> {
    return await this.tripModel.findById(id).exec();
  }

  async readStepsById(id: ObjectId): Promise<Trip> {
    const options = {
      sort: [{ day: 'asc' }],
    };
    const stepOptions = {
      sort: [{ datetime: 'asc' }],
    };
    return await this.tripModel
      .findById(id)
      .populate({
        path: 'planning',
        populate: {
          path: 'days',
          model: 'TripDay',
          populate: {
            path: 'steps',
            model: 'TripStep',
            options: stepOptions,
          },
          options,
        },
      })
      .exec();
  }

  async readByUserId(id: ObjectId): Promise<Array<Trip>> {
    return await this.tripModel
      .find({ users: { _id: id } })
      .populate('destination');
  }

  async update(tripId: ObjectId, trip: Trip): Promise<Trip> {
    return await this.tripModel.findByIdAndUpdate(tripId, trip, {
      new: true,
    });
  }

  async delete(id: ObjectId): Promise<any> {
    const trip = await this.tripModel.findById(id);
    if (trip.planning) {
      const planning = await this.tripPlanningModel.findById(trip.planning);
      if (planning.days.length > 0) {
        await Promise.all(
          planning.days.map(async (dayId) => {
            const day = await this.tripDayModel.findById(dayId);
            if (day === null) {
              resolve();
            } else if (day.steps.length > 0) {
              await Promise.all(
                day.steps.map(async (stepId) => {
                  const step = await this.tripStepModel.findById(stepId);
                  if (step === null) {
                    resolve();
                  } else {
                    step.delete();
                  }
                }),
              );
              day.delete();
            }
          }),
        );
      }
      if (planning !== null) {
        planning.delete();
      }
    }
    trip.delete();
  }

  async updateUsers(
    tripId: ObjectId,
    userObject: UpdateTripUsersModel,
  ): Promise<Trip> {
    const newUsers = [];
    const existingUsers = [];
    userObject.users.filter((user) => {
      if (user._id) {
        existingUsers.push(user._id);
      } else if (user.email) {
        newUsers.push(user.email);
      }
    });

    const trip = await this.tripModel.findById(tripId);

    await Promise.all(
      newUsers.map(async (user) => {
        if (trip.invitedUsers.includes(user)) {
          return;
        } else {
          await this.mailService.sendUserTripInvitation(
            userObject.inviteFrom,
            user,
            tripId,
          );
        }
      }),
    );

    return await this.tripModel
      .findByIdAndUpdate(
        tripId,
        { users: existingUsers, $addToSet: { invitedUsers: newUsers } },
        {
          new: true,
        },
      )
      .populate('users');
  }

  async removeCompanion(
    tripId: ObjectId,
    companionId: ObjectId,
  ): Promise<Trip> {
    return await this.tripModel
      .findByIdAndUpdate(
        tripId,
        { $pull: { users: companionId } },
        { new: true },
      )
      .populate('users');
  }

  async addPlanning(
    tripId: ObjectId,
    planning: AddTripPlanningModel,
  ): Promise<Trip> {
    const options = {
      sort: [{ day: 'asc' }],
    };
    const stepOptions = {
      sort: [{ datetime: 'asc' }],
    };
    try {
      const newDay = new this.tripDayModel(planning.days);
      await newDay.save();
      try {
        const newPlanning = new this.tripPlanningModel({
          days: [newDay],
          updatedBy: planning.updatedBy,
        });
        await newPlanning.save();
        try {
          return await this.tripModel
            .findByIdAndUpdate(tripId, { planning: newPlanning }, { new: true })
            .populate({
              path: 'planning',
              populate: {
                path: 'days',
                model: 'TripDay',
                populate: {
                  path: 'steps',
                  model: 'TripStep',
                  options: stepOptions,
                },
                options,
              },
            })
            .populate('destination');
        } catch (error) {
          newDay.delete();
          newPlanning.delete();
          throw error;
        }
      } catch (error) {
        newDay.delete();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async addDayToPlanning(
    planningId: ObjectId,
    day: TripDay,
  ): Promise<TripPlanning> {
    const options = {
      sort: [{ day: 'asc' }],
    };
    const stepOptions = {
      sort: [{ datetime: 'asc' }],
    };
    try {
      const newDay = new this.tripDayModel(day);
      await newDay.save();
      try {
        const planning = await this.tripPlanningModel.findByIdAndUpdate(
          planningId,
          {
            $push: { days: newDay },
          },
          { new: true },
        );
        await planning.save();
        return planning.populate({
          path: 'days',
          model: 'TripDay',
          populate: {
            path: 'steps',
            model: 'TripStep',
            options: stepOptions,
          },
          options,
        });
      } catch (error) {
        newDay.delete();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async updateDay(dayId: ObjectId, day: TripDay): Promise<TripDay | undefined> {
    try {
      return await this.tripDayModel.findByIdAndUpdate(dayId, day, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteDay(dayId: ObjectId): Promise<any> {
    const day = await this.tripDayModel.findById(dayId);
    if (day.steps.length > 0) {
      await Promise.all(
        day.steps.map(async (step) => {
          await this.tripStepModel.findByIdAndRemove(step);
        }),
      );
    }
    day.delete();
  }

  async addStepToDay(dayId: ObjectId, step: TripStep): Promise<TripDay> {
    const options = {
      sort: [{ datetime: 'asc' }],
    };
    try {
      const newStep = new this.tripStepModel(step);
      await newStep.save();
      try {
        const day = await this.tripDayModel.findByIdAndUpdate(
          dayId,
          {
            $push: { steps: newStep },
          },
          { new: true },
        );
        await day.save();
        return day.populate({
          path: 'steps',
          model: 'TripStep',
          options,
        });
      } catch (error) {
        newStep.delete();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async updateStep(
    stepId: ObjectId,
    step: TripStep,
  ): Promise<TripStep | undefined> {
    try {
      return await this.tripStepModel.findByIdAndUpdate(stepId, step, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteStep(stepId: ObjectId): Promise<any> {
    return await this.tripStepModel.findByIdAndRemove(stepId);
  }

  async handleInvitation(
    tripId: ObjectId,
    invitation: InvitationModel,
  ): Promise<Trip> {
    const trip = await this.tripModel.findById(tripId);
    const user = await this.userModel.findById(invitation.userId);
    if (invitation.accepted) {
      trip.users.push(user);
    }
    trip.invitedUsers = trip.invitedUsers.filter(
      (invitedUser) => invitedUser !== user.email,
    );
    await trip.save();
    return trip;
  }
}
