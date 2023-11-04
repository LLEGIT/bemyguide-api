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
import { ProductService } from './product.service';
import { Product } from './schemas/product.schema';
import { checkObjectId } from 'src/utils';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //* CRUD PRODUCT
  @Post()
  @ApiOperation({ summary: 'Add a new product' })
  @ApiCreatedResponse({ description: 'Added new product' })
  async create(@Res() response: Response, @Body() product: Product) {
    try {
      const newProduct = await this.productService.create(product);
      return response.status(HttpStatus.CREATED).json({
        newProduct,
      });
    } catch (error) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "Couldn't create product", stackTrace: error });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Returns all products' })
  async findAll(@Res() response: Response) {
    try {
      const allProducts = await this.productService.findAll();
      return response.status(HttpStatus.OK).json(allProducts);
    } catch (error) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Couldn't retrieve products", stackTrace: error });
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Returns a specific product' })
  async findOne(@Param('id') id: ObjectId, @Res() response: Response) {
    if (!checkObjectId(id))
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Incorrect id format or length' });
    try {
      const product = await this.productService.findOne(id);
      return response.status(HttpStatus.OK).json({
        product,
      });
    } catch (error) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'No product found', stackTrace: error });
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Modify one or many fields of a product' })
  @ApiCreatedResponse({ description: 'Updated product' })
  @ApiConflictResponse({
    description: "No product found or couldn't update it",
  })
  async updateProduct(
    @Param('id') id: ObjectId,
    @Body() product: Product,
    @Res() response: Response,
  ) {
    if (!checkObjectId(id))
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Incorrect id format or length' });
    try {
      const newProduct = this.productService.update(id, product);
      return response.status(HttpStatus.OK).json({
        newProduct,
      });
    } catch (error) {
      return response.status(HttpStatus.NOT_FOUND).json({
        message: "No product found or couldn't update it",
        stackTrace: error,
      });
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Modify one or many fields of a product' })
  @ApiCreatedResponse({ description: 'Updated product' })
  @ApiConflictResponse({
    description: "No product found or couldn't update it",
  })
  async deleteProduct(
    @Param('id') id: ObjectId,
    @Body() product: Product,
    @Res() response: Response,
  ) {
    if (!checkObjectId(id))
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Incorrect id format or length' });
    try {
      const deletedProduct = this.productService.delete(id);
      return response.status(HttpStatus.OK).json({
        deletedProduct,
      });
    } catch (error) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Couldn't delete product", stackTrace: error });
    }
  }
}
