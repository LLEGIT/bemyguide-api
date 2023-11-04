import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type DestinationProductDocument = HydratedDocument<DestinationActivity>;

@Schema()
export class DestinationActivity {
  @ApiProperty()
  @Prop()
  type: string;

  @ApiProperty()
  @Prop()
  id: string;

  @ApiProperty()
  @Prop()
  self: {
    href: string;
    methods: string[];
  };

  @ApiProperty()
  @Prop()
  name: string;

  @ApiProperty()
  @Prop()
  shortDescription: string;

  @ApiProperty()
  @Prop()
  geoCode: {
    latitude: number;
    longitude: number;
  };

  @ApiProperty()
  @Prop()
  price: {
    amount: string;
    currencyCode: string;
  };

  @ApiProperty()
  @Prop()
  rating: string;

  @ApiProperty()
  @Prop()
  pictures: string[];

  @ApiProperty()
  @Prop()
  bookingLink: string;

  @ApiProperty()
  @Prop()
  minimumDuration: string;
}
