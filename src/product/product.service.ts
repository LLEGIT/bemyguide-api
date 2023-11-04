import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(product: Product): Promise<Product> {
    const newProduct = new this.productModel(product);
    return newProduct.save();
  }

  async findAll(): Promise<null | object> {
    return this.productModel.find();
  }

  async findOne(objectId: ObjectId): Promise<Product> {
    return this.productModel.findById(objectId);
  }

  async update(id: ObjectId, product: Product): Promise<Product> {
    const currentDate = new Date();
    product.updatedAt = currentDate;
    return this.productModel.findByIdAndUpdate(id, product, { new: true });
  }

  async delete(id: ObjectId): Promise<Product> {
    return this.productModel.findByIdAndDelete(id);
  }
}
