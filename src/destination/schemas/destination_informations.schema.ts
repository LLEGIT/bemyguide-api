import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { DestinationProduct } from './destination_product.schema';
import { Information } from 'src/information/schemas/information.schema';

export type DestinationInformationsDocument =
  HydratedDocument<DestinationInformations>;

export interface NewsApiData {
  status: string;
  totalResults: number;
  articles: Array<Article>;
}

export interface Article {
  source: {
    id: string;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

@Schema()
export class DestinationInformations {
  @ApiProperty({ type: [DestinationProduct] })
  @Prop({
    type: [
      { type: mongoose.Schema.Types.ObjectId, ref: DestinationProduct.name },
    ],
  })
  products: DestinationProduct[];

  @ApiProperty({ type: [Information] })
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Information.name }],
  })
  informations: Information[];
}

export const DestinationInformationsSchema = SchemaFactory.createForClass(
  DestinationInformations,
);
