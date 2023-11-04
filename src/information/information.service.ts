import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Destination } from 'src/destination/schemas/destination.schema';
import { DestinationInformations } from 'src/destination/schemas/destination_informations.schema';
import { Information, InformationDocument } from './schemas/information.schema';

@Injectable()
export class InformationService {
  constructor(
    @InjectModel(Information.name)
    private informationModel: Model<InformationDocument>,

    @InjectModel(DestinationInformations.name)
    private destinationInformationsModel: Model<DestinationInformations>,

    @InjectModel(Destination.name)
    private destinationModel: Model<Destination>,
  ) {}

  async findAll(): Promise<null | object> {
    return this.informationModel.find();
  }

  async create(destinationId: ObjectId, information: Information) {
    if (!information.rawText || !information.type) {
      throw new Error('empty');
    }

    try {
      const newInformation = new this.informationModel(information);
      const newObject = await newInformation.save();

      const destination = await this.destinationModel.findById(destinationId);
      const destinationInfos = await this.destinationInformationsModel.exists({
        _id: destination.informations,
      });

      if (destinationInfos) {
        await this.destinationInformationsModel
          .findByIdAndUpdate(destinationInfos._id, {
            $push: { informations: newObject._id },
          })
          .exec();
        return this.destinationInformationsModel.findById(destinationInfos._id);
      } else {
        const newDestinationInfos = new this.destinationInformationsModel({
          informations: newObject._id,
        });
        const newDestinationInfosObject = await newDestinationInfos.save();

        await this.destinationModel
          .findByIdAndUpdate(destinationId, {
            $set: { informations: newDestinationInfosObject._id },
          })
          .exec();
        return newObject;
      }
    } catch (error) {
      throw error;
    }
  }

  async update(id: ObjectId, newInfos: Information) {
    return await this.informationModel.findByIdAndUpdate(id, newInfos, {
      new: true,
    });
  }

  async delete(id: ObjectId) {
    const response = await this.informationModel.findByIdAndDelete(id);
    await this.destinationInformationsModel.findOneAndUpdate(
      { informations: id },
      { $pull: { informations: id } },
    );
    return response;
  }
}
