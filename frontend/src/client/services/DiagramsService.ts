/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DiagramComponentUpdate } from '../models/DiagramComponentUpdate';
import type { DiagramCreate } from '../models/DiagramCreate';
import type { DiagramEdgeUpdate } from '../models/DiagramEdgeUpdate';
import type { DiagramOut } from '../models/DiagramOut';
import type { DiagramUpdate } from '../models/DiagramUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DiagramsService {
    /**
     * List Diagrams
     * @param projectId
     * @returns DiagramOut Successful Response
     * @throws ApiError
     */
    public static listDiagramsApiV1ProjectsProjectIdDiagramsGet(
        projectId: string,
    ): CancelablePromise<Array<DiagramOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/projects/{project_id}/diagrams',
            path: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Diagram
     * @param projectId
     * @param requestBody
     * @returns DiagramOut Successful Response
     * @throws ApiError
     */
    public static createDiagramApiV1ProjectsProjectIdDiagramsPost(
        projectId: string,
        requestBody: DiagramCreate,
    ): CancelablePromise<DiagramOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/projects/{project_id}/diagrams',
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
     * Get Diagram
     * @param diagramId
     * @returns DiagramOut Successful Response
     * @throws ApiError
     */
    public static getDiagramApiV1DiagramsDiagramIdGet(
        diagramId: string,
    ): CancelablePromise<DiagramOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/diagrams/{diagram_id}',
            path: {
                'diagram_id': diagramId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Diagram
     * @param diagramId
     * @param requestBody
     * @returns DiagramOut Successful Response
     * @throws ApiError
     */
    public static updateDiagramApiV1DiagramsDiagramIdPut(
        diagramId: string,
        requestBody: DiagramUpdate,
    ): CancelablePromise<DiagramOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/diagrams/{diagram_id}',
            path: {
                'diagram_id': diagramId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Diagram
     * @param diagramId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteDiagramApiV1DiagramsDiagramIdDelete(
        diagramId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/diagrams/{diagram_id}',
            path: {
                'diagram_id': diagramId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Diagram Component
     * @param diagramId
     * @param componentId
     * @param requestBody
     * @returns DiagramOut Successful Response
     * @throws ApiError
     */
    public static updateDiagramComponentApiV1DiagramsDiagramIdComponentsComponentIdPut(
        diagramId: string,
        componentId: string,
        requestBody: DiagramComponentUpdate,
    ): CancelablePromise<DiagramOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/diagrams/{diagram_id}/components/{component_id}',
            path: {
                'diagram_id': diagramId,
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
     * Remove Component From Diagram
     * @param diagramId
     * @param componentId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeComponentFromDiagramApiV1DiagramsDiagramIdComponentsComponentIdDelete(
        diagramId: string,
        componentId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/diagrams/{diagram_id}/components/{component_id}',
            path: {
                'diagram_id': diagramId,
                'component_id': componentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Diagram Edge
     * @param diagramId
     * @param sourceId
     * @param targetId
     * @param requestBody
     * @returns DiagramOut Successful Response
     * @throws ApiError
     */
    public static updateDiagramEdgeApiV1DiagramsDiagramIdEdgesPut(
        diagramId: string,
        sourceId: string,
        targetId: string,
        requestBody: DiagramEdgeUpdate,
    ): CancelablePromise<DiagramOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/diagrams/{diagram_id}/edges',
            path: {
                'diagram_id': diagramId,
            },
            query: {
                'source_id': sourceId,
                'target_id': targetId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
