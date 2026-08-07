/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DatabaseService {
    /**
     * Backup Database
     * Export full database as a PostgreSQL dump file.
     * Returns the dump file for download.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static backupDatabaseApiV1DatabaseBackupGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/database/backup',
        });
    }
    /**
     * Create Backup
     * Create a new backup file on the server.
     * @param note
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createBackupApiV1DatabaseBackupCreatePost(
        note: string = '',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/database/backup/create',
            query: {
                'note': note,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Restore Database
     * Restore database from uploaded dump file.
     * WARNING: This will overwrite the current database!
     * @returns any Successful Response
     * @throws ApiError
     */
    public static restoreDatabaseApiV1DatabaseRestorePost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/database/restore',
        });
    }
    /**
     * List Backups
     * List available backup files with metadata.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listBackupsApiV1DatabaseBackupsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/database/backups',
        });
    }
    /**
     * Download Backup
     * Download a specific backup file.
     * @param filename
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadBackupApiV1DatabaseBackupsFilenameGet(
        filename: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/database/backups/{filename}',
            path: {
                'filename': filename,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Backup
     * Delete a backup file.
     * @param filename
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteBackupApiV1DatabaseBackupsFilenameDelete(
        filename: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/database/backups/{filename}',
            path: {
                'filename': filename,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Backup Note
     * Add or update a note for a backup.
     * @param filename
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addBackupNoteApiV1DatabaseBackupsFilenameNotePost(
        filename: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/database/backups/{filename}/note',
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
    /**
     * Restore From Backup
     * Restore database from a specific backup file on the server.
     * @param filename
     * @returns any Successful Response
     * @throws ApiError
     */
    public static restoreFromBackupApiV1DatabaseBackupsFilenameRestorePost(
        filename: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/database/backups/{filename}/restore',
            path: {
                'filename': filename,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Restart Db
     * Flushes all database connections.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static restartDbApiV1DatabaseRestartPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/database/restart',
        });
    }
    /**
     * Get Schema
     * Get database tables and masked sample data (admin only).
     * Sensitive columns (passwords, secrets) are redacted.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSchemaApiV1DatabaseSchemaGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/database/schema',
        });
    }
}
