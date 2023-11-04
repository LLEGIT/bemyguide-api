import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Destination, DestinationDocument } from './schemas/destination.schema';
import {
  DestinationInformations,
  DestinationInformationsDocument,
  NewsApiData,
} from './schemas/destination_informations.schema';
import {
  DestinationProduct,
  DestinationProductCreate,
  DestinationProductDocument,
} from './schemas/destination_product.schema';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { addDays } from 'date-fns';
import { DestinationSuggestion } from './schemas/destination_suggestion.schema';
import { DestinationActivity } from './schemas/destination_activity.schema';

@Injectable()
export class DestinationService {
  constructor(
    @InjectModel(Destination.name)
    private destinationModel: Model<DestinationDocument>,
    @InjectModel(DestinationInformations.name)
    private destinationInformationsModel: Model<DestinationInformationsDocument>,
    @InjectModel(DestinationProduct.name)
    private destinationProductModel: Model<DestinationProductDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(DestinationSuggestion.name)
    private destinationSuggestionModel: Model<DestinationSuggestion>,
  ) {}

  async create(destination: Destination): Promise<Destination> {
    const newDestination = new this.destinationModel(destination);
    return await newDestination.save();
  }

  async createProduct(id: ObjectId, product: DestinationProduct) {
    const newProduct = new this.destinationProductModel(product);
    await newProduct.save().then((newObject) => {
      this.destinationModel.findById(id).then((destination) => {
        this.destinationInformationsModel
          .exists({ _id: destination.informations })
          .then((res) => {
            if (res)
              this.destinationInformationsModel
                .findByIdAndUpdate(destination.informations, {
                  $push: { products: newObject._id },
                })
                .exec();
            else {
              const newInformations = new this.destinationInformationsModel({
                products: [newObject._id],
              });
              newInformations.save().then((newInfos) =>
                this.destinationModel
                  .findByIdAndUpdate(id, {
                    $set: { informations: newInfos._id },
                  })
                  .exec(),
              );
            }
          });
      });
    });
    return newProduct.populate('product');
  }

  async createProductByName(
    id: ObjectId,
    createProduct: DestinationProductCreate,
  ) {
    const product = await this.productModel
      .find({ name: createProduct.name })
      .then((foundProduct) => {
        if (foundProduct.length > 0) return foundProduct[0];
      });
    if (product) {
      const destinationProduct: DestinationProduct = {
        product: product.id,
        floor_price: createProduct.floor_price,
        ceiling_price: createProduct.ceiling_price,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return await this.createProduct(id, destinationProduct);
    }
    return null;
  }

  async readAll(): Promise<Destination[]> {
    return await this.destinationModel.find();
  }

  async readAllPaginated(
    skip = 0,
    limit?: number,
    startId?: string,
  ): Promise<{ destinations: Destination[]; count: number }> {
    const query = this.destinationModel
      .find({
        _id: {
          $gt: startId ?? '000000000000000000000000',
        },
      })
      .sort({ _id: 1 })
      .skip(skip);
    if (limit) {
      query.limit(limit);
    }
    const destinations = await query;
    const count = await this.destinationModel.count();
    return { destinations, count };
  }

  async readById(id: ObjectId): Promise<Destination> {
    return await this.destinationModel.findById(id).populate({
      path: 'informations',
      populate: [
        {
          path: 'products',
          populate: {
            path: 'product',
            model: 'Product',
          },
        },
        {
          path: 'informations',
          populate: {
            path: 'user',
            model: 'User',
          },
        },
      ],
    });
  }

  async readByName(names: Array<string>): Promise<Destination[]> {
    return await this.destinationModel.find({ name: { $in: names } });
  }

  async update(id: ObjectId, destination: Destination): Promise<Destination> {
    return await this.destinationModel.findByIdAndUpdate(id, destination, {
      new: true,
    });
  }

  async delete(id: ObjectId): Promise<Destination> {
    return await this.destinationModel.findByIdAndDelete(id);
  }

  async updateProduct(
    id: ObjectId,
    product: DestinationProduct,
  ): Promise<DestinationProduct> {
    return await this.destinationProductModel.findByIdAndUpdate(id, product, {
      new: true,
    });
  }

  async deleteProduct(id: ObjectId): Promise<DestinationProduct> {
    const response = await this.destinationProductModel.findByIdAndDelete(id);
    await this.destinationInformationsModel.findOneAndUpdate(
      { products: id },
      { $pull: { products: id } },
    );
    return response;
  }

  async fetchDestinationArticles(
    destinationName: string,
  ): Promise<NewsApiData> {
    // Calculate one month ago from the current date
    const rawFromDate: Date = addDays(new Date(), -14);
    const fromDate: string = rawFromDate.toISOString();
    let newsApiUrl: string = process.env.NEWS_API_URL;
    newsApiUrl += `?q=${destinationName}&apiKey=${process.env.NEWS_API_KEY}&from=${fromDate}&pageSize=10`;

    const response = await fetch(newsApiUrl, {
      method: 'GET',
    });

    return await response.json();
  }

  async createSuggestion(
    suggestion: DestinationSuggestion,
  ): Promise<DestinationSuggestion> {
    const newSuggestion = new this.destinationSuggestionModel(suggestion);
    return await newSuggestion.save();
  }

  async readAllSuggestionsPaginated(
    skip = 0,
    limit?: number,
    startId?: string,
  ): Promise<{ suggestions: DestinationSuggestion[]; count: number }> {
    const query = this.destinationSuggestionModel
      .find({
        _id: {
          $gt: startId ?? '000000000000000000000000',
        },
      })
      .sort({ _id: 1 })
      .skip(skip);
    if (limit) {
      query.limit(limit);
    }
    const suggestions = await query.populate('user').populate('destination');

    const count = await this.destinationSuggestionModel.count();
    return { suggestions, count };
  }

  async readSuggestionById(
    id: ObjectId,
  ): Promise<DestinationSuggestion | null> {
    return await this.destinationSuggestionModel
      .findById(id)
      .populate('user')
      .populate({
        path: 'destination_product',
        populate: {
          path: 'product',
          model: 'Product',
        },
      })
      .populate('product')
      .populate('information')
      .populate('destination');
  }

  async deleteSuggestion(id: ObjectId): Promise<DestinationSuggestion> {
    return await this.destinationSuggestionModel.findByIdAndDelete(id);
  }

  async fetchDestinationActivities(
    latitude: number,
    longitude: number,
  ): Promise<DestinationActivity[]> {
    const amadeusApiKey = process.env.AMADEUS_API_KEY;
    const amadeusApiSecret = process.env.AMADEUS_API_SECRET;

    const amadeusBaseUrl = 'https://test.api.amadeus.com/v1';

    const authEndpoint = `${amadeusBaseUrl}/security/oauth2/token`;

    try {
      // Get the Amadeus API access token
      const authResponse = await fetch(authEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${amadeusApiKey}&client_secret=${amadeusApiSecret}`,
      });

      const authObject = await authResponse.json();

      const apiEndpoint = `${amadeusBaseUrl}/shopping/activities?latitude=${latitude}&longitude=${longitude}&radius=3&limit=20`;

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authObject?.access_token}`,
        },
      });

      const result = await response.json();

      // Limit results number
      const destinationActivities = result?.data?.slice(0, 30);

      return destinationActivities;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch destination activities from Amadeus.');
    }
  }
}
