/**
 * User type
 * for use as a filter criteria
 * @type
 */
export type UserFilterType = {
    [P in keyof UserType]?: UserType[P] | null;
  };

export type UserType = {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    picture?: string | null;
    roles?: string | null;
  };