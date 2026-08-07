/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_change_password_api_v1_users_change_password_post } from '../models/Body_change_password_api_v1_users_change_password_post';
import type { UserCreate } from '../models/UserCreate';
import type { UserOut } from '../models/UserOut';
import type { UserUpdate } from '../models/UserUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get Me
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static getMeApiV1UsersMeGet(): CancelablePromise<UserOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/me',
        });
    }
    /**
     * List Users
     * List all users (admin only)
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static listUsersApiV1UsersGet(): CancelablePromise<Array<UserOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/',
        });
    }
    /**
     * Create User
     * @param requestBody
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static createUserApiV1UsersPost(
        requestBody: UserCreate,
    ): CancelablePromise<UserOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Change Password
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static changePasswordApiV1UsersChangePasswordPost(
        formData: Body_change_password_api_v1_users_change_password_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/change-password',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reset Password
     * @param aid
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resetPasswordApiV1UsersAidResetPasswordPost(
        aid: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/{aid}/reset-password',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User
     * Update user details (admin only)
     * @param aid
     * @param requestBody
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static updateUserApiV1UsersAidPatch(
        aid: string,
        requestBody: UserUpdate,
    ): CancelablePromise<UserOut> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{aid}',
            path: {
                'aid': aid,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete User
     * Delete a user (admin only)
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteUserApiV1UsersAidDelete(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/users/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
