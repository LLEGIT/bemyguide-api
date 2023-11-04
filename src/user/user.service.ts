import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}
  async create(user: User): Promise<User> {
    const userFound = await this.userModel
      .findOne({
        $or: [{ email: user?.email }, { username: user?.username }],
      })
      .exec();

    if (userFound) {
      throw HttpStatus.FORBIDDEN;
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(user.password, salt);
    user.password = hashPassword;
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async readAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async readById(id: ObjectId): Promise<User> {
    return await this.userModel.findById(id).exec();
  }

  async readByUsername(username: string): Promise<User> {
    return await this.userModel.findOne({ username: username }).exec();
  }

  async readByEmail(
    email: string,
  ): Promise<Schema.Types.ObjectId | ObjectId | Types.ObjectId> {
    const userFound = await this.userModel.findOne({ email: email }).exec();
    return userFound?._id;
  }

  async userPrepareResetPassword(
    email: string,
  ): Promise<{ user: User; token: string }> {
    try {
      const user = await this.userModel.findOne({ email: email }).exec();

      const payload = {
        userId: user._id,
        email: user.email,
      };

      const jwt = this.jwtService.sign(payload);
      return { user: user, token: jwt };
    } catch {
      return;
    }
  }

  async resetPassword(password: string, token: string): Promise<User> {
    try {
      const verified = await this.jwtService.verify(token);
      const user = await this.update(verified.userId, {
        password: password,
      } as User);
      return user;
    } catch {
      return;
    }
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email: email }).exec();

    if (!user) {
      throw NotFoundException;
    }

    if (
      user.firstname.toLowerCase() === 'unknown' &&
      user.lastname.toLowerCase() === 'unknown'
    ) {
      throw 402;
    }

    if (password && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw ForbiddenException;
      }
    }

    const payload = {
      userId: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      role: user.role,
    };
    const jwt = this.jwtService.sign(payload);
    return {
      access_token: jwt,
    };
  }

  async loggedIn(token: string) {
    try {
      if (!token) {
        return { loggedIn: false };
      } else {
        const verified = this.jwtService.verify(token);
        const user = await this.userModel.findById(verified.userId).exec();
        if (user) {
          return {
            loggedIn: true,
            user: {
              id: user._id,
              username: user.username,
              avatar: user.avatar,
              role: user.role,
              email: user.email,
            },
          };
        } else {
          return { loggedIn: false };
        }
      }
    } catch (err) {
      return { loggedIn: false };
    }
  }

  async update(id: ObjectId | Types.ObjectId, user: User): Promise<User> {
    const currentDate = new Date();
    user.updatedAt = currentDate;

    if (user.password) {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(user.password, salt);
      user.password = hashPassword;
    }
    return await this.userModel.findByIdAndUpdate(id, user, {
      new: true,
    });
  }

  async delete(id: ObjectId): Promise<any> {
    return await this.userModel.findByIdAndRemove(id);
  }
}
