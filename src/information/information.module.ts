import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Destination,
  DestinationSchema,
} from 'src/destination/schemas/destination.schema';
import {
  DestinationInformations,
  DestinationInformationsSchema,
} from 'src/destination/schemas/destination_informations.schema';
import { InformationService } from './information.service';
import { Information, InformationSchema } from './schemas/information.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Information.name, schema: InformationSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: DestinationInformations.name,
        schema: DestinationInformationsSchema,
      },
    ]),
    MongooseModule.forFeature([
      { name: Destination.name, schema: DestinationSchema },
    ]),
  ],
  providers: [InformationService],
  exports: [InformationService],
})
export class InformationsModule {}
