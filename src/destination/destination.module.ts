import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InformationService } from 'src/information/information.service';
import {
  Information,
  InformationSchema,
} from 'src/information/schemas/information.schema';
import { DestinationController } from './destination.controller';
import { DestinationService } from './destination.service';
import { Destination, DestinationSchema } from './schemas/destination.schema';
import {
  DestinationInformations,
  DestinationInformationsSchema,
} from './schemas/destination_informations.schema';
import {
  DestinationProduct,
  DestinationProductsSchema,
} from './schemas/destination_product.schema';
import { Product, ProductSchema } from 'src/product/schemas/product.schema';
import { ProductService } from 'src/product/product.service';
import { DestinationAdministrationController } from './destination_administration.controller';
import {
  DestinationSuggestion,
  DestinationSuggestionSchema,
} from './schemas/destination_suggestion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Destination.name, schema: DestinationSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: DestinationInformations.name,
        schema: DestinationInformationsSchema,
      },
    ]),
    MongooseModule.forFeature([
      { name: DestinationProduct.name, schema: DestinationProductsSchema },
    ]),
    MongooseModule.forFeature([
      { name: Information.name, schema: InformationSchema },
    ]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([
      { name: DestinationSuggestion.name, schema: DestinationSuggestionSchema },
    ]),
  ],
  controllers: [DestinationController, DestinationAdministrationController],
  providers: [DestinationService, InformationService, ProductService],
})
export class DestinationsModule {}
