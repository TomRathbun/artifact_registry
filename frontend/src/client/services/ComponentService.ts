/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Component } from '../models/Component';
import type { ComponentCreate } from '../models/Component';
import type { ComponentUpdate } from '../models/Component';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ComponentService {

    /**
     * List Components
     * @param skip 
     * @param limit 
     * @returns Component Successful Response
     * @throws ApiError
     */
    public static listComponentsApiV1ComponentsGet(
        skip: number = 0,
        limit: number = 100,
        projectId?: string,
    ): CancelablePromise<Array<Component>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/components/',
            query: {
                'skip': skip,
                'limit': limit,
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }


    /**
     * Create Component
     * @param requestBody 
     * @returns Component Successful Response
     * @throws ApiError
     */
    public static createComponentApiV1ComponentsPost(
        requestBody: ComponentCreate,
    ): CancelablePromise<Component> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/components/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Component
     * @param componentId 
     * @returns Component Successful Response
     * @throws ApiError
     */
    public static getComponentApiV1ComponentsComponentIdGet(
        componentId: string,
    ): CancelablePromise<Component> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/components/{component_id}',
            path: {
                'component_id': componentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Component
     * @param componentId 
     * @param requestBody 
     * @returns Component Successful Response
     * @throws ApiError
     */
    public static updateComponentApiV1ComponentsComponentIdPut(
        componentId: string,
        requestBody: ComponentUpdate,
    ): CancelablePromise<Component> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/components/{component_id}',
            path: {
                'component_id': componentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Component
     * @param componentId 
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteComponentApiV1ComponentsComponentIdDelete(
        componentId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/components/{component_id}',
            path: {
                'component_id': componentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Link Component
     * @param componentId 
     * @param requestBody 
     * @returns any Successful Response
     * @throws ApiError
     */
    public static linkComponentApiV1ComponentsComponentIdLinkPost(
        componentId: string,
        requestBody: { child_id: string, cardinality: string },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/components/{component_id}/link',
            path: {
                'component_id': componentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Unlink Component
     * @param componentId 
     * @param childId 
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unlinkComponentApiV1ComponentsComponentIdLinkChildIdDelete(
        componentId: string,
        childId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/components/{component_id}/link/{child_id}',
            path: {
                'component_id': componentId,
                'child_id': childId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
