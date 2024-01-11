// type UserWithNullableId = Omit<User, 'id'> & { id: string | null };
import { AdminAreaType } from "./types/adminArea";
import { UserType } from "./types/user";
  
  export interface Database {
    users: UserType;
    adminArea: AdminAreaType;
  }