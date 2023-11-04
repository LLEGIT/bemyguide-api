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
import { DestinationService } from './destination.service';
import { Destination } from './schemas/destination.schema';
import {
  DestinationProduct,
  DestinationProductCreate,
} from './schemas/destination_product.schema';
import { checkObjectId } from 'src/utils';
import { PaginationParams } from 'src/pagination/pagination.params';

@ApiTags('administration/destination')
@Controller('administration/destination')
export class DestinationAdministrationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new destination' })
  @ApiCreatedResponse({ description: 'Add a new destination' })
  async create(@Res() response: Response, @Body() destination: Destination) {
    try {
      const newDestination = await this.destinationService.create(destination);
      return response.status(HttpStatus.CREATED).json(newDestination);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: "Couldn't create destination",
        stackTrace: error,
        error_code: 'destination_trips_create_error',
      });
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update a destination by id' })
  @ApiCreatedResponse({ description: 'Destination updated' })
  async update(
    @Res() response: Response,
    @Param('id') id: ObjectId,
    @Body() destination: Destination,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      const updatedDestination = await this.destinationService.update(
        id,
        destination,
      );
      return response.status(HttpStatus.OK).json(updatedDestination);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a destination by id' })
  @ApiCreatedResponse({ description: 'Destination deleted' })
  async delete(@Res() response: Response, @Param('id') id: ObjectId) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      const deletedDestination = await this.destinationService.delete(id);
      return response.status(HttpStatus.OK).json(deletedDestination);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Post('/:id/product/id')
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

  @Post('/:destinationId/product')
  @ApiOperation({ summary: 'Add a destination product' })
  @ApiCreatedResponse({ description: 'Added destination product' })
  @ApiConflictResponse({ description: 'Could not add destination product' })
  async addDestinationProductByName(
    @Res() response,
    @Body() destinationProduct: DestinationProductCreate,
    @Param('destinationId') destinationId: ObjectId,
  ): Promise<DestinationProduct> {
    if (checkObjectId(destinationId) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      const newDestinationProduct =
        await this.destinationService.createProductByName(
          destinationId,
          destinationProduct,
        );
      return response.status(HttpStatus.CREATED).json(newDestinationProduct);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Put('/:productId/product')
  @ApiOperation({ summary: 'Update a destination product by id' })
  @ApiCreatedResponse({ description: 'Destination product updated' })
  async updateDestinationProduct(
    @Res() response: Response,
    @Param('productId') productId: ObjectId,
    @Body() destinationProduct: DestinationProduct,
  ) {
    if (checkObjectId(productId) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      const updatedDestinationProduct =
        await this.destinationService.updateProduct(
          productId,
          destinationProduct,
        );
      return response.status(HttpStatus.OK).json(updatedDestinationProduct);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Delete('/:productId/product')
  @ApiOperation({ summary: 'Delete a destination product by id' })
  @ApiCreatedResponse({ description: 'Destination product deleted' })
  async deleteDestinationProduct(
    @Res() response: Response,
    @Param('productId') productId: ObjectId,
  ) {
    if (checkObjectId(productId) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      await this.destinationService.deleteProduct(productId);
      return response.status(HttpStatus.OK).json({
        message: 'Destination product deleted',
      });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Get('/suggestions')
  @ApiOperation({ summary: 'Get destinations suggestions' })
  @ApiCreatedResponse({ description: 'Destinations suggestions' })
  async getDestinationsSuggestions(
    @Query() { skip, limit, startId }: PaginationParams,
    @Res() response: Response,
  ) {
    try {
      const paginatedSuggestions =
        await this.destinationService.readAllSuggestionsPaginated(
          skip,
          limit,
          startId,
        );
      return response.status(HttpStatus.OK).json(paginatedSuggestions);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Get('/suggestions/:id')
  @ApiOperation({ summary: 'Get destination suggestion by id' })
  @ApiCreatedResponse({ description: 'Destination suggestions' })
  async getDestinationSuggestionById(
    @Param('id') id: ObjectId,
    @Res() response: Response,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      const destinationSuggestion =
        await this.destinationService.readSuggestionById(id);
      return response.status(HttpStatus.OK).json(destinationSuggestion);
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }

  @Delete('/suggestions/:id')
  @ApiOperation({ summary: 'Delete destination suggestion by id' })
  @ApiCreatedResponse({ description: 'Destination suggestion deleted' })
  async deleteDestinationSuggestionById(
    @Param('id') id: ObjectId,
    @Res() response: Response,
  ) {
    if (checkObjectId(id) === false)
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Incorrect id format or length' });
    try {
      await this.destinationService.deleteSuggestion(id);
      return response.status(HttpStatus.OK).json({
        message: 'Destination suggestion deleted',
      });
    } catch (error) {
      return response.status(HttpStatus.BAD_REQUEST).json(error);
    }
  }
}
