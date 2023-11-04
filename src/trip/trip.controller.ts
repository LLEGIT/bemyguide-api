import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ObjectId } from 'mongoose';
import { TripService } from './trip.service';
import {
  InvitationModel,
  Trip,
  UpdateTripUsersModel,
} from './schemas/trip.schema';
import { checkObjectId } from 'src/utils';
import { AddTripPlanningModel } from './schemas/trip_planning.schema';
import { TripDay } from './schemas/trip_day.schema';
import { TripStep } from './schemas/trip_step.schema';

@ApiTags('trip')
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new trip' })
  @ApiCreatedResponse({ description: 'Add a new trip' })
  async create(@Res() response: Response, @Body() trip: Trip) {
    try {
      const newTrip = await this.tripService.create(trip);
      return response.status(HttpStatus.CREATED).json({
        newTrip,
      });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all trips' })
  @ApiCreatedResponse({ description: 'Fetch all trips' })
  async fetchAll(@Res() response: Response) {
    const trips = await this.tripService.readAll();
    return response.status(HttpStatus.OK).json({
      trips,
    });
  }

  @Get('/user/:id')
  @ApiOperation({ summary: 'Fetch a trip by user id' })
  @ApiCreatedResponse({ description: 'Fetch a trip by user id' })
  async findByUserId(@Res() response: Response, @Param('id') id: ObjectId) {
    if (checkObjectId(id) === false) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json('Incorrect id format or length');
    }
    const trip = await this.tripService.readByUserId(id);
    return response.status(HttpStatus.OK).json({
      trip,
    });
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Fetch a trip by id' })
  @ApiCreatedResponse({ description: 'Fetch a trip by id' })
  async findById(@Res() response: Response, @Param('id') id: ObjectId) {
    if (checkObjectId(id) === false) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json('Incorrect id format or length');
    }
    const trip = await this.tripService.readById(id);
    return response.status(HttpStatus.OK).json(trip);
  }

  @Get('/:id/users')
  @ApiOperation({ summary: 'Fetch a trip with users by id' })
  @ApiCreatedResponse({ description: 'Fetch a trip with users by id' })
  async findByIdWithUsers(
    @Res() response: Response,
    @Param('id') id: ObjectId,
  ) {
    if (checkObjectId(id) === false) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json('Incorrect id format or length');
    }
    const trip = await this.tripService.readByIdWithUsers(id);
    return response.status(HttpStatus.OK).json(trip);
  }

  @Get('/:id/information')
  @ApiOperation({ summary: 'Fetch a trip with minimum information by id' })
  @ApiCreatedResponse({
    description: 'Fetch a trip with minimum information by id',
  })
  async findByIdWithMinimumInformation(
    @Res() response: Response,
    @Param('id') id: ObjectId,
  ) {
    if (checkObjectId(id) === false) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json('Incorrect id format or length');
    }
    const trip = await this.tripService.readByIdWithMinimumInformation(id);
    return response.status(HttpStatus.OK).json(trip);
  }

  @Get('/steps/:id/')
  @ApiOperation({ summary: 'Fetch a trip steps by id' })
  @ApiCreatedResponse({ description: 'Fetch a trip steps by id' })
  async findStepsById(@Res() response: Response, @Param('id') id: ObjectId) {
    if (checkObjectId(id) === false) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json('Incorrect id format or length');
    }
    const trip = await this.tripService.readStepsById(id);
    return response.status(HttpStatus.OK).json(trip);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update trip' })
  @ApiCreatedResponse({ description: 'Update trip' })
  async update(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Body() trip: Trip,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });

    try {
      const updatedTrip = await this.tripService.update(id, trip);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Put('/:id/users')
  @ApiOperation({ summary: 'Update trip users' })
  @ApiCreatedResponse({ description: 'Update trip users' })
  async updateUsers(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Body() trip: UpdateTripUsersModel,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });

    try {
      const updatedTrip = await this.tripService.updateUsers(id, trip);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Put('/:id/invitation')
  @ApiOperation({ summary: 'Handle trip invitation' })
  @ApiCreatedResponse({ description: 'Handle trip invitation' })
  async handleInvitation(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Body() invitation: InvitationModel,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect trip id format or length' });

    if (checkObjectId(invitation.userId) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect user id format or length' });

    try {
      const updatedTrip = await this.tripService.handleInvitation(
        id,
        invitation,
      );
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Post('/:id/planning')
  @ApiOperation({ summary: 'Add a new trip planning' })
  @ApiCreatedResponse({ description: 'Add a new trip planning' })
  async addPlanning(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Body() planning: AddTripPlanningModel,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });

    try {
      const updatedTrip = await this.tripService.addPlanning(id, planning);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Post('/:id/planning/day')
  @ApiOperation({ summary: 'Add a day into trip planning' })
  @ApiCreatedResponse({ description: 'Add a day into trip planning' })
  async updatePlanning(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Body() day: TripDay,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });

    try {
      const updatedTrip = await this.tripService.addDayToPlanning(id, day);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Put('/:id/planning/day')
  @ApiOperation({ summary: 'Update a day from trip planning' })
  @ApiCreatedResponse({ description: 'Update a day from trip planning' })
  async updatePlanningDay(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Body() day: TripDay,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      const updatedTrip = await this.tripService.updateDay(id, day);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Delete('/:id/planning/day')
  @ApiOperation({ summary: 'Delete a day from trip planning' })
  @ApiCreatedResponse({ description: 'Delete a day from trip planning' })
  async deletePlanningDay(
    @Res() response: Response,
    @Param('id') id: ObjectId,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      const updatedTrip = await this.tripService.deleteDay(id);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Post('/:id/day/step')
  @ApiOperation({ summary: 'Add a step into trip day' })
  @ApiCreatedResponse({ description: 'Add a step into trip day' })
  async addPlanningDay(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Body() step: TripStep,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });

    try {
      const updatedTrip = await this.tripService.addStepToDay(id, step);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Put('/:id/day/step')
  @ApiOperation({ summary: 'Update a step from trip day' })
  @ApiCreatedResponse({ description: 'Update a step from trip day' })
  async updatePlanningDayStep(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Body() step: TripStep,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });

    try {
      const updatedTrip = await this.tripService.updateStep(id, step);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Delete('/:id/day/step')
  @ApiOperation({ summary: 'Delete a step from trip day' })
  @ApiCreatedResponse({ description: 'Delete a step from trip day' })
  async deletePlanningDayStep(
    @Res() response: Response,
    @Param('id') id: ObjectId,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      const updatedTrip = await this.tripService.deleteStep(id);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Delete('/:id/users/:userId')
  @ApiOperation({ summary: 'Delete trip user' })
  @ApiCreatedResponse({ description: 'Delete trip user' })
  async deleteTripUser(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Param('userId') userId: ObjectId,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });

    try {
      const updatedTrip = await this.tripService.removeCompanion(id, userId);
      return response.status(HttpStatus.OK).json(updatedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete trip' })
  @ApiCreatedResponse({ description: 'Trip deleted' })
  @ApiConflictResponse({ description: 'Could not delete trip' })
  async deleteInfos(@Res() response: Response, @Param('id') id: ObjectId) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });

    try {
      const deletedTrip = await this.tripService.delete(id);
      return response.status(HttpStatus.OK).json(deletedTrip);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
