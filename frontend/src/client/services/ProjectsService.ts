/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectCreate } from '../models/ProjectCreate';
import type { ProjectOut } from '../models/ProjectOut';
import type { ProjectUpdate } from '../models/ProjectUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProjectsService {
    /**
     * List Projects
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static listProjectsApiV1ProjectsProjectsGet(): CancelablePromise<Array<ProjectOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/projects/',
        });
    }
    /**
     * Create Project
     * @param requestBody
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static createProjectApiV1ProjectsProjectsPost(
        requestBody: ProjectCreate,
    ): CancelablePromise<ProjectOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/projects/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Project
     * @param projectId
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static getProjectApiV1ProjectsProjectsProjectIdGet(
        projectId: string,
    ): CancelablePromise<ProjectOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Project
     * @param projectId
     * @param requestBody
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static updateProjectApiV1ProjectsProjectsProjectIdPut(
        projectId: string,
        requestBody: ProjectUpdate,
    ): CancelablePromise<ProjectOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Project
     * @param projectId
     * @returns void
     * @throws ApiError
     */
    public static deleteProjectApiV1ProjectsProjectsProjectIdDelete(
        projectId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
