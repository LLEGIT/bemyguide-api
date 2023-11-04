import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.schema';

@Schema()
export class UserUpdate extends User {
  // Should be sent to check if it matches with the initial_password while user update by id
  @ApiProperty()
  @Prop({ type: String })
  old_password: string;

  // Should be sent for user update by id to compare with the old_password
  @ApiProperty()
  @Prop({ type: String })
  initial_password: string;

  // The new password will replace the old one
  @ApiProperty()
  @Prop({ type: String })
  new_password: string;
}
