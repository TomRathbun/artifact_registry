/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExceptionCreate } from '../models/ExceptionCreate';
import type { ExceptionOut } from '../models/ExceptionOut';
import type { PostconditionCreate } from '../models/PostconditionCreate';
import type { PostconditionOut } from '../models/PostconditionOut';
import type { PreconditionCreate } from '../models/PreconditionCreate';
import type { PreconditionOut } from '../models/PreconditionOut';
import type { UseCaseCreate } from '../models/UseCaseCreate';
import type { UseCaseOut } from '../models/UseCaseOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UseCasesService {
    /**
     * List Preconditions
     * @param projectId Project ID
     * @returns PreconditionOut Successful Response
     * @throws ApiError
     */
    public static listPreconditionsApiV1UseCasesPreconditionsGet(
        projectId: string,
    ): CancelablePromise<Array<PreconditionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/preconditions',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Preconditions
     * @param projectId Project ID
     * @returns PreconditionOut Successful Response
     * @throws ApiError
     */
    public static listPreconditionsApiV1UseCasesPreconditionsGet1(
        projectId: string,
    ): CancelablePromise<Array<PreconditionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/preconditions',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Precondition
     * @param requestBody
     * @returns PreconditionOut Successful Response
     * @throws ApiError
     */
    public static createPreconditionApiV1UseCasesPreconditionsPost(
        requestBody: PreconditionCreate,
    ): CancelablePromise<PreconditionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/use-cases/preconditions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Precondition
     * @param requestBody
     * @returns PreconditionOut Successful Response
     * @throws ApiError
     */
    public static createPreconditionApiV1UseCasesPreconditionsPost1(
        requestBody: PreconditionCreate,
    ): CancelablePromise<PreconditionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/use-cases/preconditions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Precondition
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deletePreconditionApiV1UseCasesPreconditionsIdDelete(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/use-cases/preconditions/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Precondition
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deletePreconditionApiV1UseCasesPreconditionsIdDelete1(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/use-cases/preconditions/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Postconditions
     * @param projectId Project ID
     * @returns PostconditionOut Successful Response
     * @throws ApiError
     */
    public static listPostconditionsApiV1UseCasesPostconditionsGet(
        projectId: string,
    ): CancelablePromise<Array<PostconditionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/postconditions',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Postconditions
     * @param projectId Project ID
     * @returns PostconditionOut Successful Response
     * @throws ApiError
     */
    public static listPostconditionsApiV1UseCasesPostconditionsGet1(
        projectId: string,
    ): CancelablePromise<Array<PostconditionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/postconditions',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Postcondition
     * @param requestBody
     * @returns PostconditionOut Successful Response
     * @throws ApiError
     */
    public static createPostconditionApiV1UseCasesPostconditionsPost(
        requestBody: PostconditionCreate,
    ): CancelablePromise<PostconditionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/use-cases/postconditions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Postcondition
     * @param requestBody
     * @returns PostconditionOut Successful Response
     * @throws ApiError
     */
    public static createPostconditionApiV1UseCasesPostconditionsPost1(
        requestBody: PostconditionCreate,
    ): CancelablePromise<PostconditionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/use-cases/postconditions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Postcondition
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deletePostconditionApiV1UseCasesPostconditionsIdDelete(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/use-cases/postconditions/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Postcondition
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deletePostconditionApiV1UseCasesPostconditionsIdDelete1(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/use-cases/postconditions/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Exceptions
     * @param projectId Project ID
     * @returns ExceptionOut Successful Response
     * @throws ApiError
     */
    public static listExceptionsApiV1UseCasesExceptionsGet(
        projectId: string,
    ): CancelablePromise<Array<ExceptionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/exceptions',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Exceptions
     * @param projectId Project ID
     * @returns ExceptionOut Successful Response
     * @throws ApiError
     */
    public static listExceptionsApiV1UseCasesExceptionsGet1(
        projectId: string,
    ): CancelablePromise<Array<ExceptionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/exceptions',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Exception
     * @param requestBody
     * @returns ExceptionOut Successful Response
     * @throws ApiError
     */
    public static createExceptionApiV1UseCasesExceptionsPost(
        requestBody: ExceptionCreate,
    ): CancelablePromise<ExceptionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/use-cases/exceptions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Exception
     * @param requestBody
     * @returns ExceptionOut Successful Response
     * @throws ApiError
     */
    public static createExceptionApiV1UseCasesExceptionsPost1(
        requestBody: ExceptionCreate,
    ): CancelablePromise<ExceptionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/use-cases/exceptions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Exception
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteExceptionApiV1UseCasesExceptionsIdDelete(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/use-cases/exceptions/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Exception
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteExceptionApiV1UseCasesExceptionsIdDelete1(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/use-cases/exceptions/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Use Cases
     * @param projectId Project ID
     * @param area Filter by area (e.g., MCK)
     * @param status Filter by status (e.g., Draft)
     * @param primaryActor Filter by primary_actor
     * @param selectAll Select all requirements (ignore filters)
     * @returns UseCaseOut Successful Response
     * @throws ApiError
     */
    public static listUseCasesApiV1UseCasesGet(
        projectId?: string,
        area?: (Array<string> | null),
        status?: (Array<string> | null),
        primaryActor?: (string | null),
        selectAll: boolean = false,
    ): CancelablePromise<Array<UseCaseOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/',
            query: {
                'project_id': projectId,
                'area': area,
                'status': status,
                'primary_actor': primaryActor,
                'select_all': selectAll,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Use Cases
     * @param projectId Project ID
     * @param area Filter by area (e.g., MCK)
     * @param status Filter by status (e.g., Draft)
     * @param primaryActor Filter by primary_actor
     * @param selectAll Select all requirements (ignore filters)
     * @returns UseCaseOut Successful Response
     * @throws ApiError
     */
    public static listUseCasesApiV1UseCasesGet1(
        projectId?: string,
        area?: (Array<string> | null),
        status?: (Array<string> | null),
        primaryActor?: (string | null),
        selectAll: boolean = false,
    ): CancelablePromise<Array<UseCaseOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/',
            query: {
                'project_id': projectId,
                'area': area,
                'status': status,
                'primary_actor': primaryActor,
                'select_all': selectAll,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Use Case
     * @param requestBody
     * @returns UseCaseOut Successful Response
     * @throws ApiError
     */
    public static createUseCaseApiV1UseCasesPost(
        requestBody: UseCaseCreate,
    ): CancelablePromise<UseCaseOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/use-cases/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Use Case
     * @param requestBody
     * @returns UseCaseOut Successful Response
     * @throws ApiError
     */
    public static createUseCaseApiV1UseCasesPost1(
        requestBody: UseCaseCreate,
    ): CancelablePromise<UseCaseOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/use-cases/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Use Case
     * @param aid
     * @returns UseCaseOut Successful Response
     * @throws ApiError
     */
    public static getUseCaseApiV1UseCasesAidGet(
        aid: string,
    ): CancelablePromise<UseCaseOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Use Case
     * @param aid
     * @returns UseCaseOut Successful Response
     * @throws ApiError
     */
    public static getUseCaseApiV1UseCasesAidGet1(
        aid: string,
    ): CancelablePromise<UseCaseOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/use-cases/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Use Case
     * @param aid
     * @param requestBody
     * @returns UseCaseOut Successful Response
     * @throws ApiError
     */
    public static updateUseCaseApiV1UseCasesAidPut(
        aid: string,
        requestBody: UseCaseCreate,
    ): CancelablePromise<UseCaseOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/use-cases/{aid}',
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
     * Update Use Case
     * @param aid
     * @param requestBody
     * @returns UseCaseOut Successful Response
     * @throws ApiError
     */
    public static updateUseCaseApiV1UseCasesAidPut1(
        aid: string,
        requestBody: UseCaseCreate,
    ): CancelablePromise<UseCaseOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/use-cases/{aid}',
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
     * Delete Use Case
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteUseCaseApiV1UseCasesAidDelete(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/use-cases/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Use Case
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteUseCaseApiV1UseCasesAidDelete1(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/use-cases/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
