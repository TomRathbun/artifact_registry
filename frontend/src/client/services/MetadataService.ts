/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__schemas__metadata__PersonOut } from '../models/app__schemas__metadata__PersonOut';
import type { AreaCreate } from '../models/AreaCreate';
import type { AreaOut } from '../models/AreaOut';
import type { PersonCreate } from '../models/PersonCreate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MetadataService {
    /**
     * List Areas
     * @param projectId
     * @returns AreaOut Successful Response
     * @throws ApiError
     */
    public static listAreasApiV1MetadataAreasGet(
        projectId?: string,
    ): CancelablePromise<Array<AreaOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/metadata/areas',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Areas
     * @param projectId
     * @returns AreaOut Successful Response
     * @throws ApiError
     */
    public static listAreasApiV1MetadataAreasGet1(
        projectId?: string,
    ): CancelablePromise<Array<AreaOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/metadata/areas',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Area
     * @param requestBody
     * @returns AreaOut Successful Response
     * @throws ApiError
     */
    public static createAreaApiV1MetadataAreasPost(
        requestBody: AreaCreate,
    ): CancelablePromise<AreaOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/metadata/areas',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Area
     * @param requestBody
     * @returns AreaOut Successful Response
     * @throws ApiError
     */
    public static createAreaApiV1MetadataAreasPost1(
        requestBody: AreaCreate,
    ): CancelablePromise<AreaOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/metadata/areas',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Area
     * @param code
     * @param requestBody
     * @returns AreaOut Successful Response
     * @throws ApiError
     */
    public static updateAreaApiV1MetadataAreasCodePut(
        code: string,
        requestBody: AreaCreate,
    ): CancelablePromise<AreaOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/metadata/areas/{code}',
            path: {
                'code': code,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Area
     * @param code
     * @param requestBody
     * @returns AreaOut Successful Response
     * @throws ApiError
     */
    public static updateAreaApiV1MetadataAreasCodePut1(
        code: string,
        requestBody: AreaCreate,
    ): CancelablePromise<AreaOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/metadata/areas/{code}',
            path: {
                'code': code,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Area
     * @param code
     * @returns void
     * @throws ApiError
     */
    public static deleteAreaApiV1MetadataAreasCodeDelete(
        code: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/metadata/areas/{code}',
            path: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Area
     * @param code
     * @returns void
     * @throws ApiError
     */
    public static deleteAreaApiV1MetadataAreasCodeDelete1(
        code: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/metadata/areas/{code}',
            path: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List People
     * @param projectId
     * @param role
     * @returns app__schemas__metadata__PersonOut Successful Response
     * @throws ApiError
     */
    public static listPeopleApiV1MetadataPeopleGet(
        projectId?: string,
        role?: string,
    ): CancelablePromise<Array<app__schemas__metadata__PersonOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/metadata/people',
            query: {
                'project_id': projectId,
                'role': role,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List People
     * @param projectId
     * @param role
     * @returns app__schemas__metadata__PersonOut Successful Response
     * @throws ApiError
     */
    public static listPeopleApiV1MetadataPeopleGet1(
        projectId?: string,
        role?: string,
    ): CancelablePromise<Array<app__schemas__metadata__PersonOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/metadata/people',
            query: {
                'project_id': projectId,
                'role': role,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Person
     * @param requestBody
     * @returns app__schemas__metadata__PersonOut Successful Response
     * @throws ApiError
     */
    public static createPersonApiV1MetadataPeoplePost(
        requestBody: PersonCreate,
    ): CancelablePromise<app__schemas__metadata__PersonOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/metadata/people',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Person
     * @param requestBody
     * @returns app__schemas__metadata__PersonOut Successful Response
     * @throws ApiError
     */
    public static createPersonApiV1MetadataPeoplePost1(
        requestBody: PersonCreate,
    ): CancelablePromise<app__schemas__metadata__PersonOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/metadata/people',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Person
     * @param personId
     * @returns app__schemas__metadata__PersonOut Successful Response
     * @throws ApiError
     */
    public static getPersonApiV1MetadataPeoplePersonIdGet(
        personId: string,
    ): CancelablePromise<app__schemas__metadata__PersonOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/metadata/people/{person_id}',
            path: {
                'person_id': personId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Person
     * @param personId
     * @returns app__schemas__metadata__PersonOut Successful Response
     * @throws ApiError
     */
    public static getPersonApiV1MetadataPeoplePersonIdGet1(
        personId: string,
    ): CancelablePromise<app__schemas__metadata__PersonOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/metadata/people/{person_id}',
            path: {
                'person_id': personId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Person
     * @param personId
     * @param requestBody
     * @returns app__schemas__metadata__PersonOut Successful Response
     * @throws ApiError
     */
    public static updatePersonApiV1MetadataPeoplePersonIdPut(
        personId: string,
        requestBody: PersonCreate,
    ): CancelablePromise<app__schemas__metadata__PersonOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/metadata/people/{person_id}',
            path: {
                'person_id': personId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Person
     * @param personId
     * @param requestBody
     * @returns app__schemas__metadata__PersonOut Successful Response
     * @throws ApiError
     */
    public static updatePersonApiV1MetadataPeoplePersonIdPut1(
        personId: string,
        requestBody: PersonCreate,
    ): CancelablePromise<app__schemas__metadata__PersonOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/metadata/people/{person_id}',
            path: {
                'person_id': personId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Person
     * @param personId
     * @returns void
     * @throws ApiError
     */
    public static deletePersonApiV1MetadataPeoplePersonIdDelete(
        personId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/metadata/people/{person_id}',
            path: {
                'person_id': personId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Person
     * @param personId
     * @returns void
     * @throws ApiError
     */
    public static deletePersonApiV1MetadataPeoplePersonIdDelete1(
        personId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/metadata/people/{person_id}',
            path: {
                'person_id': personId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
