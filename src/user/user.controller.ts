import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Request as Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';
import { checkObjectId } from 'src/utils';
import { User } from './schemas/user.schema';
import { UserService } from './user.service';
import { MailService } from 'src/mail/mail.service';
import { UserUpdate } from './schemas/user-update.schema';

import * as bcrypt from 'bcrypt';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new User' })
  @ApiCreatedResponse({ description: 'Create a new User' })
  @ApiConflictResponse({
    description: 'A user with this email/username already exists',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Res() response: Response,
    @Body() user: User,
    @UploadedFile() avatar,
  ) {
    // If already exists but was deleted, it should be updated with new values
    const userFound = await this.userService.readByEmail(user.email);

    if (avatar) {
      // Read the file content as a Buffer
      const fileData: Buffer = Buffer.from(avatar.buffer);

      // Save the avatar as a Buffer in the user object
      user.avatar = fileData;
    }

    if (!userFound) {
      try {
        const newUser = await this.userService.create(user);
        return response.status(HttpStatus.CREATED).json({
          newUser,
        });
      } catch (error) {
        switch (error) {
          case 11000:
            return response.status(HttpStatus.FORBIDDEN).json({ error });
          case HttpStatus.FORBIDDEN:
            return response
              .status(HttpStatus.FORBIDDEN)
              .json({ message: 'user already exists' });
          default:
            return response.status(HttpStatus.BAD_REQUEST).json({ error });
        }
      }
    } else {
      // If already exists but was deleted, it should be updated with new values
      const updatedUser = await this.userService.update(userFound, user);
      if (user.avatar === 'null') {
        user.avatar = null;
      }

      return response.status(HttpStatus.CREATED).json({
        updatedUser,
      });
    }
  }

  @Post('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiCreatedResponse({ description: 'User login' })
  @ApiConflictResponse({
    description: 'Wrong combination email/password',
  })
  async findByEmail(@Res() response: Response, @Body() login) {
    try {
      if (login.password == null || login.email == null) {
        throw ForbiddenException;
      }
      const jwt = await this.userService.login(login.email, login.password);
      if (jwt === null)
        return response.status(HttpStatus.UNAUTHORIZED).json('No user found');
      return response
        .status(HttpStatus.OK)
        .cookie('bmg_jwt', jwt.access_token, {
          httpOnly: true,
          maxAge: 36000000,
        })
        .json({ jwt });
    } catch (error) {
      switch (error) {
        case NotFoundException:
          return response
            .status(HttpStatus.NO_CONTENT)
            .json({ message: 'no_account' });
        case 402:
          return response
            .status(HttpStatus.UNAUTHORIZED)
            .json({ error, error_code: 'toast_error_user_deleted_account' });
        case 11000:
          return response.status(HttpStatus.FORBIDDEN).json({ error });
        default:
          return response
            .status(HttpStatus.BAD_REQUEST)
            .json({ error, error_code: 'toast_error_user_wrong_login' });
      }
    }
  }

  @Get('/loggedIn')
  @ApiOperation({ summary: 'Check the validity of the jwt cookie' })
  @ApiCreatedResponse({ description: 'Check the validity of the jwt cookie' })
  async loggedIn(@Req() request: Request, @Res() response: Response) {
    const token = request.cookies.bmg_jwt;
    const user = await this.userService.loggedIn(token);
    return response.status(HttpStatus.OK).json(user);
  }

  @Get('/logout')
  @ApiOperation({ summary: 'Logout the currently loggedIn user' })
  @ApiCreatedResponse({ description: 'Logout the currently loggedIn user' })
  async logout(@Res() response: Response) {
    return response
      .status(HttpStatus.OK)
      .cookie('bmg_jwt', '', { httpOnly: true, expires: new Date(0) })
      .json(true);
  }

  @Post('/password/email')
  @ApiOperation({ summary: 'Made to send an email to reset password' })
  @ApiCreatedResponse({
    description: 'Send an email to user to reset password',
  })
  async sendResetMail(@Res() response: Response, @Body() data) {
    const payload = await this.userService.userPrepareResetPassword(data.email);
    if (!payload) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: 'No user with that email.',
        error_code: 'user_forgottenpwd_error_nomailfound',
      });
    }
    if (
      payload.user.firstname.toLowerCase() === 'unknown' &&
      payload.user.lastname.toLowerCase() === 'unknown'
    ) {
      return response
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error_code: 'toast_error_user_deleted_account' });
    }
    try {
      await this.mailService.sendUserResetPassword(payload.user, payload.token);
      return response.status(HttpStatus.OK).json('Email sent successfully');
    } catch {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json('An error has occurred');
    }
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Made to send an email to reset password' })
  @ApiCreatedResponse({
    description: 'Send an email to user to reset password',
  })
  async resetPassword(@Res() response: Response, @Body() data) {
    const user = await this.userService.resetPassword(
      data.password,
      data.token,
    );
    if (!user) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: "Couldn't update password",
        error_code: 'user_resetpwd_toast_error',
      });
    }
    return response.status(HttpStatus.OK).json('Password updated successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all users' })
  @ApiCreatedResponse({ description: 'Fetch all users' })
  async fetchAll(@Res() response: Response) {
    const users = await this.userService.readAll();
    return response.status(HttpStatus.OK).json({
      users,
    });
  }

  @Get('/me')
  @ApiOperation({ summary: 'Fetch user profile' })
  @ApiCreatedResponse({ description: 'Fetch user profile' })
  async me(@Res() response: Response, @Req() request: Request): Promise<any> {
    const user = await this.userService.readById(request.user as ObjectId);

    return response.status(HttpStatus.OK).json({ user });
  }

  @Get('/profile/:username')
  @ApiOperation({ summary: 'Fetch user profile by username' })
  @ApiCreatedResponse({ description: 'Fetch user by username' })
  async findByUsername(
    @Res() response: Response,
    @Param('username') username: string,
  ): Promise<any> {
    const user = await this.userService.readByUsername(username);

    if (user) {
      // Prevents sending sensible informations
      user.password = undefined;
      user.role = undefined;
      user.updatedAt = undefined;
      // TODO => Implements a way to determine if the person wants to share his/her email and phone number
      user.email = undefined;
      user.phone_nb = undefined;

      return response.status(HttpStatus.OK).json(user);
    } else {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'No user found' });
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Fetch a user by id' })
  @ApiCreatedResponse({ description: 'Fetch a user by id' })
  async findById(
    @Res() response: Response,
    @Req() request: Request,
    @Param('id') id: ObjectId,
  ) {
    if (!checkObjectId(id)) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Incorrect id format or length' });
    }
    if (request.user === id) {
      const user = await this.userService.readById(id);
      return response.status(HttpStatus.OK).json({
        user,
      });
    } else {
      return response.status(401).json({ errorMessage: 'Unauthorized' });
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiCreatedResponse({ description: 'Update a user' })
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Res() response: Response,
    @Req() request: Request,
    @Param('id') id: ObjectId,
    @Body() user: UserUpdate,
    @UploadedFile() avatar,
  ) {
    if (!checkObjectId(id))
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Incorrect id format or length' });
    if (request.user === id) {
      // Check if the old_password matches with the initial_password
      if (user.old_password) {
        const isSamePassword = await bcrypt.compare(
          user.old_password,
          user.initial_password,
        );

        if (!isSamePassword) {
          return response
            .status(HttpStatus.UNAUTHORIZED)
            .json('Wrong password combination');
        }
      }

      if (avatar) {
        // Read the file content as a Buffer
        const fileData: Buffer = Buffer.from(avatar.buffer);

        // Save the avatar as a Buffer in the user object
        user.avatar = fileData;
      }

      if (user.avatar === 'null') {
        user.avatar = null;
      }

      delete user.old_password;
      delete user.initial_password;
      // If a new_password is sent, it should replace the old one
      if (user.new_password) {
        user.password = user.new_password;
        // Rewrite the user object with new password
        delete user.new_password;
      } else {
        // Rewrite the user object without password
        delete user.password;
      }

      const updatedUser = await this.userService.update(id, user);

      return response.status(HttpStatus.OK).json({
        updatedUser,
      });
    } else {
      return response.status(401).json({ errorMessage: 'Unauthorized' });
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiCreatedResponse({ description: 'Delete a user' })
  async delete(
    @Res() response: Response,
    @Req() request: Request,
    @Param('id') id: ObjectId,
    @Body() user: UserUpdate,
  ) {
    if (!checkObjectId(id))
      return response
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'Incorrect id format or length' });
    if (request.user === id) {
      // Rewrite user's data
      user.firstname = 'Unknown';
      user.lastname = 'Unknown';
      user.phone_nb = 'Unknown';
      delete user.old_password;
      delete user.initial_password;
      delete user.password;

      const deletedUser = await this.userService.update(id, user);
      return response.status(HttpStatus.OK).json({
        deletedUser,
      });
    } else {
      return response.status(401).json({ errorMessage: 'Unauthorized' });
    }
  }
}
