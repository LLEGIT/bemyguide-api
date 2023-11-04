import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
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
import { InformationService } from 'src/information/information.service';
import { DestinationService } from './destination.service';
import { PaginationParams } from 'src/pagination/pagination.params';
import { checkObjectId } from 'src/utils';
import { NewsApiData } from './schemas/destination_informations.schema';
import {
  Information,
  InformationType,
} from 'src/information/schemas/information.schema';
import { UserRole } from 'src/user/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { DestinationProduct } from './schemas/destination_product.schema';
import { Destination } from './schemas/destination.schema';
import { DestinationSuggestion } from './schemas/destination_suggestion.schema';
import { DestinationActivity } from './schemas/destination_activity.schema';

@ApiTags('destination')
@Controller('destination')
export class DestinationController {
  constructor(
    private readonly destinationService: DestinationService,
    private readonly informationService: InformationService,
    private jwtService: JwtService,
  ) {}

  verifyAuth = (req) => {
    const token = req.cookies.bmg_jwt;
    if (!token) {
      return false;
    }

    const verified = this.jwtService.verify(token);

    if (verified.role !== UserRole.ADMIN) {
      return false;
    }

    return true;
  };

  @Get()
  @ApiOperation({ summary: 'Fetch all destinations' })
  @ApiCreatedResponse({ description: 'Fetch all destinations' })
  async fetchAll(@Res() response: Response) {
    const destinations = await this.destinationService.readAll();
    return response.status(HttpStatus.OK).json({
      destinations,
    });
  }

  @Get('/paginated')
  @ApiOperation({ summary: 'Fetch all destinations' })
  @ApiCreatedResponse({ description: 'Fetch all destinations' })
  async fetchPaginated(
    @Query() { skip, limit, startId }: PaginationParams,
    @Res() response: Response,
  ) {
    const paginatedDestinations =
      await this.destinationService.readAllPaginated(skip, limit, startId);
    return response.status(HttpStatus.OK).json(paginatedDestinations);
  }

  @Get('/suggestions')
  @ApiOperation({ summary: 'Fetch a sample of destinations' })
  @ApiCreatedResponse({ description: 'Fetch a sample of destinations' })
  async fetchSome(@Res() response: Response) {
    const destinations = await this.destinationService.readAll();
    const random = destinations.sort(() => 0.5 - Math.random()).slice(0, 6);
    return response.status(HttpStatus.OK).json({
      destinations: random,
    });
  }

  @Post('/suggestions')
  @ApiOperation({ summary: 'Post a suggestion' })
  @ApiCreatedResponse({ description: 'Post a suggestion' })
  async postSuggestion(
    @Res() response,
    @Body() suggestion: DestinationSuggestion,
  ) {
    try {
      const newSuggestion = await this.destinationService.createSuggestion(
        suggestion,
      );
      return response.status(HttpStatus.CREATED).json(newSuggestion);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Fetch a destination by id' })
  @ApiCreatedResponse({ description: 'Fetch a destination by id' })
  async findById(@Res() response: Response, @Param('id') id: ObjectId) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    const destination = await this.destinationService.readById(id);
    return response.status(HttpStatus.OK).json({
      destination,
    });
  }

  @Get('/:destinationName/articles')
  @ApiOperation({ summary: 'Get articles linked to a destination' })
  @ApiCreatedResponse({ description: 'Get articles linked to a destination' })
  async getArticles(
    @Res() response: Response,
    @Param('destinationName') destinationName: string,
  ) {
    try {
      const newsApiData: NewsApiData =
        await this.destinationService.fetchDestinationArticles(destinationName);
      return response.status(HttpStatus.OK).json(newsApiData.articles);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Get('/:id/informations')
  @ApiOperation({ summary: 'Fetch a destination informations' })
  @ApiCreatedResponse({ description: 'Fetch a destination informations' })
  async findDestinationInformations(
    @Res() response: Response,
    @Param('id') id: ObjectId,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    const destination: Destination = await this.destinationService.readById(id);
    return response.status(HttpStatus.OK).json(destination.informations);
  }

  @Get('/:id/activities')
  @ApiOperation({ summary: 'Fetch a destination activities' })
  @ApiCreatedResponse({ description: 'Activities fetched' })
  async findDestinationActivities(
    @Res() response: Response,
    @Param('id') id: ObjectId,
  ) {
    try {
      const destination: Destination = await this.destinationService.readById(id);

      const activities: DestinationActivity[] =
        await this.destinationService.fetchDestinationActivities(destination?.coordinates?.lat, destination?.coordinates?.long);
      return response.status(HttpStatus.OK).json([destination, activities]);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Post(':id/product')
  @ApiOperation({ summary: 'Add a destination product' })
  @ApiCreatedResponse({ description: 'Added destination product' })
  @ApiConflictResponse({ description: 'Could not add destination product' })
  async addDestinationProduct(
    @Res() response,
    @Body() destinationProduct: DestinationProduct,
    @Param('id') id: ObjectId,
  ): Promise<DestinationProduct> {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      const newDestinationProduct = await this.destinationService.createProduct(
        id,
        destinationProduct,
      );
      return response.status(HttpStatus.CREATED).json({
        newDestinationProduct,
      });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Post('/search')
  @ApiOperation({ summary: 'Search destinations by name' })
  @ApiCreatedResponse({ description: 'Search destinations by name' })
  async searchByName(@Res() response: Response, @Body() names: Array<string>) {
    try {
      const destinations = await this.destinationService.readByName(names);
      return response.status(HttpStatus.OK).json({
        destinations,
      });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Post('/:destinationId/informations')
  @ApiOperation({ summary: 'Add informations to destination' })
  @ApiCreatedResponse({ description: 'Informations added' })
  @ApiConflictResponse({ description: 'Could not add informations' })
  async addInfos(
    @Req() req,
    @Res() response,
    @Body() destinationInfos: Information,
    @Param('destinationId') destinationId: ObjectId,
  ): Promise<Information> {
    if (checkObjectId(destinationId) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    if (destinationInfos.type === InformationType.ADVICE) {
      const verify = this.verifyAuth(req);
      if (!verify) {
        return response.status(401).json({ errorMessage: 'Unauthorized' });
      }
    }
    try {
      const newInformations = await this.informationService.create(
        destinationId,
        destinationInfos,
      );

      return response.status(HttpStatus.CREATED).json(newInformations);
    } catch (error) {
      switch (error) {
        case "empty":
          return response.status(HttpStatus.NO_CONTENT).json(error);
        default: 
          return response.status(HttpStatus.BAD_REQUEST).json(error);
      }
    }
  }

  @Put('/:informationId/informations')
  @ApiOperation({ summary: 'Update information' })
  @ApiCreatedResponse({ description: 'Information updated' })
  @ApiConflictResponse({ description: 'Could not update information' })
  async updateInfos(
    @Req() req,
    @Res() response,
    @Body() destinationInfos: Information,
    @Param('informationId') informationId: ObjectId,
  ): Promise<Information> {
    if (checkObjectId(informationId) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    if (destinationInfos.type === InformationType.ADVICE) {
      const verify = this.verifyAuth(req);
      if (!verify) {
        return response.status(401).json({ errorMessage: 'Unauthorized' });
      }
    }
    try {
      const updatedInformations = await this.informationService.update(
        informationId,
        destinationInfos,
      );

      return response.status(HttpStatus.OK).json(updatedInformations);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Delete('/:informationId/informations')
  @ApiOperation({ summary: 'Delete information' })
  @ApiCreatedResponse({ description: 'Information deleted' })
  @ApiConflictResponse({ description: 'Could not delete information' })
  async deleteInfos(
    @Req() req,
    @Res() response,
    @Param('informationId') informationId: ObjectId,
    @Body() destinationInfos: Information,
  ): Promise<Information> {
    if (checkObjectId(informationId) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });

    if (destinationInfos.type === InformationType.ADVICE) {
      const verify = this.verifyAuth(req);
      if (!verify) {
        return response.status(401).json({ errorMessage: 'Unauthorized' });
      }
    }
    try {
      const deletedInformations = await this.informationService.delete(
        informationId,
      );
      return response.status(HttpStatus.OK).json(deletedInformations);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
