/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_upload_image_api_v1_images_upload_post } from '../models/Body_upload_image_api_v1_images_upload_post';
import type { RenameRequest } from '../models/RenameRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImagesService {
    /**
     * Upload Image
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadImageApiV1ImagesUploadPost(
        formData: Body_upload_image_api_v1_images_upload_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/images/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Image
     * @param filename
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteImageApiV1ImagesFilenameDelete(
        filename: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/images/{filename}',
            path: {
                'filename': filename,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Images
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listImagesApiV1ImagesGet(
        projectId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/images/',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Rename Image
     * @param filename
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static renameImageApiV1ImagesFilenameRenamePut(
        filename: string,
        requestBody: RenameRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/images/{filename}/rename',
            path: {
                'filename': filename,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
