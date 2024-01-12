import { SQL } from '../../src/sql';
import { v4 as uuidv4 } from 'uuid';
import type { RoleType } from '../types/role';
import type { UserType, UserFilterType } from '../types/user';

/**
 * User class
 * @class
 */
export class User implements UserType {
    id!: UserType['id'];  // ! means that the property must be initialized in the constructor
    email!: UserType['email'];
    
    constructor(user: UserType) {
        Object.assign(this, user);
    }

    /**
   * Method to get user by ID or email
   * First of either ID or email is used
   * @param {string} id - The ID of the user
   * @param {string} email - The email of the user
   * @returns {Promise<UserType>} User - The user object
   */
    static async getByIdOrEmail(idOrEmail: string): Promise<UserType> {
        
        // console.log('1. ---***** /packages/core/users.ts User.getByIdOrEmail', idOrEmail);
        
        try {
            const result = await SQL.DB
                .selectFrom('users')
                .selectAll()
                .where((eb) =>
                    eb('email', '=', idOrEmail)
                        .or('id', '=', idOrEmail)
                )
                .executeTakeFirst();

            if (!result?.id) {
                // console.log('2. --- /packages/core/users.ts User.getByIdOrEmail', `User ${idOrEmail} not found`);
                return {} as UserType;
            }
            // console.log('3. --- /packages/core/users.ts User.getByIdOrEmail', `User ${result.roles} found`);

            const user =  new User(result);
            // console.log('4. --- /packages/core/users.ts User.getByIdOrEmail user: ', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Error in user class getByIdorEmail', error);
        throw error;
        }
    }

    /**
   * Method to create or update the user object
   * @param {UserType} User - The user object to create or update
   * @returns {Promise<CreateUpdateResponse>} UserType - The new user object created or updated
   */
    static async createUpdate(newuser: UserFilterType): Promise<UserType> {
        let user: UserType;
        if (newuser.id && (newuser.email == null || newuser.email == undefined)) {
            // allows for null 
            throw new Error("You must provide an email to create or update a user");
        } else if (!newuser.id && newuser.email == '') {
            throw new Error("You must provide an email to create or update a user");
        } else {
            const id = newuser.id || uuidv4();

            const user: UserType = {
                id: id,
                email: newuser.email || '',
                picture: newuser.picture,
                firstName: newuser.firstName,
                lastName: newuser.lastName,
                roles: newuser.roles,
                lastLogin: newuser.lastLogin,
                contactTel: newuser.contactTel
            };
        
            try {
                const response = await SQL.DB
                .insertInto('users')
                .values({
                    id: user.id,
                    picture: user.picture,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles: user.roles,
                    lastLogin: newuser.lastLogin,
                    contactTel: newuser.contactTel    
                })
                .onConflict((oc) => oc
                    .column('id')
                .doUpdateSet({
                    email: user.email,
                    picture: user.picture,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles: user.roles,
                    lastLogin: newuser.lastLogin,
                    contactTel: newuser.contactTel    
                })
                )
                .execute();
                return user

            } catch (error) {
                console.error('Error in user class createUpdate: ',error);
                throw new Error('Internal Server Error' + error);
            };
            
        }
    }

    /**
   * Method to return a list filtered on the search criteria 
   * returns all if no criteria provided
   * makes partial matches on all criteria provided using LIKE
   * email: %my@email% will match any email containing email
   * @param {UserFilterType | null} UserFilter | null - The user object with the criteria to filter on (allows id: null and email: null)
   * @returns {Promise<UserType[]>} User[] - The filtered list of users objects
   */
    static async filterListUser(user: UserFilterType | null): Promise<UserType[]> {
        try {
            let query = SQL.DB
                .selectFrom('users')
                .selectAll()
            if (!!user) {
                const { id, email, firstName, lastName, contactTel } = user;
                if (id) query = query.where('id', 'like', `%${id}%`);
                if (email) query = query.where('email', 'like', `%${email}%`);
                if (firstName) query = query.where('firstName', 'like', `%${firstName}%`);
                if (lastName) query = query.where('lastName', 'like', `%${lastName}%`);
                if (contactTel) query = query.where('contactTel', 'like', `%${contactTel}%`)
            }
            const result: any[] = await query.execute();
            // console.log('7. --- /packages/core/users.ts User.filterListUser', `result.length: ${result.length}`);
        
            if (!result || result.length === 0) {
                return [];
            }
        
            // Map the result to User instances
            const users: UserType[] = result.map(userResult => new User(userResult));
        
            return users;
        } catch (error) {
            console.error('Error in user class filterListUser: ', error);
            throw error;
        }
    }
    /**
     * Deletes a user from the database.
     * 
     * The user to be deleted can be identified by either their `id` or `email`.
     * If both `id` and `email` are provided, `id` will be used.
     * 
     * @param {string} idOrEmail - The id or email of the user to delete.
     * @returns {Promise<boolean>} - Returns a promise that resolves to `true` if the user was deleted successfully, or `false` otherwise.
     */
    static async delete(idOrEmail: string): Promise<Boolean> {
        try {
            if (!idOrEmail) {
            throw new Error('You must provide either an id or an email to delete a user');
            }
        
            const deleteUser = await User.getByIdOrEmail(idOrEmail);

            let query = SQL.DB.deleteFrom('users');
            query = query.where('id', '=', deleteUser.id)
            await query.execute();
            return true;
        } catch (error) {
            console.error('Error in user class delete: ', error);
            return false;
        }
    }

    /**
    * Method to assign a role to the user object
    * Takes first id or email
    * @param {RoleType} newRole - The new role to be assigned
    * @param {id?} id - The id of the user object to update
    * @param {email?} email - The email of the user object to update
    * @returns {Promise<UserType>} User - The updaetd user object
    */
    static async assignRole(newRole: RoleType, id?: string, email?: string): Promise<UserType> {
        if (!id && !email) {
            throw new Error('You must provide either an id or an email to assign a role');
        }
        
        try {
            const user = await User.getByIdOrEmail(id ||'');
            const existingRoles = user.roles || '';
            const roles = existingRoles ? existingRoles.split(',') : [];
        
            if (!roles.includes(newRole)) {
            roles.push(newRole);
            }
        
            await SQL.DB
            .insertInto('users')
            .values({
                id: user.id,
                picture: user.picture,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: roles.join(',')
            })
            .onConflict((oc) => oc
                .column('id')
            .doUpdateSet({
                email: user.email,
                picture: user.picture,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: roles.join(',')
            })
            )
            .execute();
        
            // Fetch the updated user record from the database
            const updatedUser = await User.getByIdOrEmail(id || '');
            return updatedUser;
        } catch (error) {
            console.error('assignRole error: ', error);
            throw error;
        }
    }      

    /**
    * Method to revoke a role from the user object
    * Takes first id or email
    * @param {RoleType} delRole - The role to be revoked
    * @param {id?} id - The id of the user object to update
    * @param {email?} email - The email of the user object to update
    * @returns {Promise<UserType>} User - The updaetd user object
    */
    static async revokeRole(delRole: RoleType, id?: string, email?: string): Promise<UserType> {
        if (!id && !email) {
        throw new Error('You must provide either an id or an email to revoke a role');
        }
    
        try {
        const user = await User.getByIdOrEmail(id || email || '');
        const existingRoles = user.roles || '';
        const roles = existingRoles ? existingRoles.split(',') : [];
    
        // Remove the role if it exists
        const index = roles.indexOf(delRole);
        if (index > -1) {
            roles.splice(index, 1);
        }
    
        await SQL.DB
            .insertInto('users')
            .values({
                id: user.id,
                picture: user.picture,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: roles.join(',')
            })
            .onConflict((oc) => oc
                .column('id')
            .doUpdateSet({
                email: user.email,
                picture: user.picture,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: roles.join(',')
            })
            )
            .execute();
    
        // Fetch the updated user record from the database
        const updatedUser = await User.getByIdOrEmail(id || email || '');
        return updatedUser;
        } catch (error) {
            console.error('Error in user class revoleRole error:', error);
            throw error;
        }
    }
}