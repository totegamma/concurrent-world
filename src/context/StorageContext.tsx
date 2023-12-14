import { createContext, useCallback, useContext, useMemo } from 'react'
import { usePreference } from './PreferenceContext'
import { useApi } from './api'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fileToBase64 } from '../util'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface StorageState {
    uploadFile: (file: File) => Promise<string | null>
    isUploadReady: boolean
}

const StorageContext = createContext<StorageState | undefined>(undefined)

export const StorageProvider = ({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element => {
    const client = useApi()
    const [storageProvider] = usePreference('storageProvider')
    const [s3Config] = usePreference('s3Config')
    const [imgurClientID] = usePreference('imgurClientID')

    const s3Client = useMemo(() => {
        if (storageProvider !== 's3') return null
        return new S3Client({
            endpoint: s3Config.endpoint,
            credentials: {
                accessKeyId: s3Config.accessKeyId,
                secretAccessKey: s3Config.secretAccessKey
            },
            region: 'auto',
            forcePathStyle: s3Config.forcePathStyle
        })
    }, [storageProvider, s3Config])

    const uploadFile = useCallback(
        async (file: File) => {
            const base64Data = await fileToBase64(file)
            if (!base64Data) return null

            if (storageProvider === 's3') {
                if (!s3Client) return null
                const _base64Data = base64Data.split(',')[1]
                const byteCharacters = atob(_base64Data)
                const byteNumbers = new Array(byteCharacters.length)
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i)
                }
                const byteArray = new Uint8Array(byteNumbers)

                const fileName = `${Date.now()}`
                const url = await getSignedUrl(
                    s3Client,
                    new PutObjectCommand({
                        Bucket: s3Config.bucketName,
                        Key: fileName
                    }),
                    {
                        expiresIn: 60 // 1 minute
                    }
                )
                try {
                    const result = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': file.type,
                            'Content-Encoding': 'base64',
                            'x-amz-acl': 'public-read',
                            'Content-Disposition': 'inline'
                        },
                        body: byteArray
                    })
                    if (!result.ok) {
                        return null
                    }
                    return `${s3Config.publicUrl}/${fileName}`
                } catch (e) {
                    return null
                }
            } else if (storageProvider === 'imgur') {
                const url = 'https://api.imgur.com/3/image'
                if (!imgurClientID) return ''
                const isImage = file.type.includes('image')
                if (!isImage) return null

                const result = await fetch(url, {
                    method: 'POST',
                    headers: {
                        Authorization: `Client-ID ${imgurClientID}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'base64',
                        image: base64Data.replace(/^data:image\/[a-zA-Z]*;base64,/, '')
                    })
                })
                return (await result.json()).data.link
            } else {
                const isImage = file.type.includes('image')
                if (!isImage) return null

                const result = await client.api.fetchWithCredential(client.host, '/storage/files', {
                    method: 'POST',
                    headers: {
                        'Content-Type': file.type
                    },
                    body: file
                })

                if (!result.ok) {
                    console.error('upload failed:', result)
                    return null
                }

                const json = await result.json()

                return json.content.url
            }
        },
        [storageProvider, imgurClientID, s3Config]
    )

    const isUploadReady = useMemo(() => {
        console.log(client.domainServices)
        if (storageProvider === 's3') {
            return !!s3Config.endpoint
        } else if (storageProvider === 'imgur') {
            return !!imgurClientID
        } else {
            return 'mediaserver' in client.domainServices
        }
    }, [storageProvider, imgurClientID, s3Client, client.domainServices])

    return (
        <StorageContext.Provider
            value={useMemo(
                () => ({
                    uploadFile,
                    isUploadReady
                }),
                [uploadFile, isUploadReady]
            )}
        >
            {children}
        </StorageContext.Provider>
    )
}

export function useStorage(): StorageState {
    const context = useContext(StorageContext)
    if (context === undefined) {
        throw new Error('useStorage must be used within a StorageProvider')
    }
    return context
}
