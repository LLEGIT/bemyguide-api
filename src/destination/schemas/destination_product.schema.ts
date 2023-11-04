import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument, now } from 'mongoose';
import { Product } from '../../product/schemas/product.schema';

export type DestinationProductDocument = HydratedDocument<DestinationProduct>;

export interface DestinationProductCreate {
  name: string;
  floor_price: number;
  ceiling_price: number;
}

@Schema()
export class DestinationProduct {
  @ApiProperty({ type: Product })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
  })
  product: mongoose.Schema.Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true, type: Number })
  floor_price: number;

  @ApiProperty()
  @Prop({ required: true, type: Number })
  ceiling_price: number;

  @ApiProperty()
  @Prop({ default: now() })
  createdAt: Date;

  @ApiProperty({ default: now() })
  @Prop({ default: now() })
  updatedAt: Date;
}

export const DestinationProductsSchema =
  SchemaFactory.createForClass(DestinationProduct);
