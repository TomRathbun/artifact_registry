/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AreaCreate } from '../models/AreaCreate';
import type { AreaOut } from '../models/AreaOut';
import type { PersonCreate } from '../models/PersonCreate';
import type { PersonOut } from '../models/PersonOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MetadataService {
    /**
     * List Areas
     * @returns AreaOut Successful Response
     * @throws ApiError
     */
    public static listAreasApiV1MetadataMetadataAreasGet(): CancelablePromise<Array<AreaOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/metadata/metadata/areas',
        });
    }
    /**
     * Create Area
     * @param requestBody
     * @returns AreaOut Successful Response
     * @throws ApiError
     */
    public static createAreaApiV1MetadataMetadataAreasPost(
        requestBody: AreaCreate,
    ): CancelablePromise<AreaOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/metadata/metadata/areas',
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
    public static updateAreaApiV1MetadataMetadataAreasCodePut(
        code: string,
        requestBody: AreaCreate,
    ): CancelablePromise<AreaOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/metadata/metadata/areas/{code}',
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
    public static deleteAreaApiV1MetadataMetadataAreasCodeDelete(
        code: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/metadata/metadata/areas/{code}',
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
     * @returns PersonOut Successful Response
     * @throws ApiError
     */
    public static listPeopleApiV1MetadataMetadataPeopleGet(
        projectId?: string,
        role?: string,
    ): CancelablePromise<Array<PersonOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/metadata/metadata/people',
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
     * @returns PersonOut Successful Response
     * @throws ApiError
     */
    public static createPersonApiV1MetadataMetadataPeoplePost(
        requestBody: PersonCreate,
    ): CancelablePromise<PersonOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/metadata/metadata/people',
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
     * @returns PersonOut Successful Response
     * @throws ApiError
     */
    public static updatePersonApiV1MetadataMetadataPeoplePersonIdPut(
        personId: string,
        requestBody: PersonCreate,
    ): CancelablePromise<PersonOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/metadata/metadata/people/{person_id}',
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
    public static deletePersonApiV1MetadataMetadataPeoplePersonIdDelete(
        personId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/metadata/metadata/people/{person_id}',
            path: {
                'person_id': personId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}

