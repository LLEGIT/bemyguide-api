import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';
import { Information } from 'src/information/schemas/information.schema';
import { Destination } from './destination.schema';
import { DestinationProduct } from './destination_product.schema';
import { User } from 'src/user/schemas/user.schema';
import { Product } from 'src/product/schemas/product.schema';

export type DestinationSuggestionDocument =
  HydratedDocument<DestinationSuggestion>;

export enum ModificationSuggestionType {
  PRODUCT = 'modification_suggestion_product',
  ADVICE = 'modification_suggestion_advice',
}

@Schema()
export class DestinationSuggestion {
  @ApiProperty({ type: User })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: DestinationProduct })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: DestinationProduct.name })
  destination_product: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: Product })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name })
  product: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ enum: ModificationSuggestionType })
  @Prop({ type: String, enum: ModificationSuggestionType })
  type: ModificationSuggestionType;

  @ApiProperty()
  @Prop({ type: Number })
  floor_price: number;

  @ApiProperty()
  @Prop({ type: Number })
  ceiling_price: number;

  @ApiProperty({ type: Information })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Information.name,
  })
  information: mongoose.Schema.Types.ObjectId;

  @ApiProperty()
  @Prop()
  information_suggestion: string;

  @ApiProperty({ type: Destination })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Destination.name })
  destination: mongoose.Schema.Types.ObjectId;

  @ApiProperty()
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const DestinationSuggestionSchema = SchemaFactory.createForClass(
  DestinationSuggestion,
);
