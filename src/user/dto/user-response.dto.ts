import { Exclude } from 'class-transformer';

// Only return specific datas of the user, different than the connected user
export class UserResponseDto {
  username: string;
  avatar: Buffer | string | null | undefined;

  // Exclude all other fields from the response
  @Exclude()
  password: string;
  firstname: string;
  lastname: string;
  phone_nb: string;
  email: string;
  updatedAt: Date;
  createdAt: Date;
}
