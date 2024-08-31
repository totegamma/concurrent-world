import { Box, IconButton, Typography } from '@mui/material'
import { useMediaViewer } from '../../context/MediaViewer'
import { VList, type VListHandle } from 'virtua'
import { useRef, useState } from 'react'

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { type WorldMedia } from '../../model'
import { Blurhash } from 'react-blurhash'

export interface EmbeddedGalleryProps {
    medias: WorldMedia[]
}

export const MediaCard = ({ media, onExpand }: { media: WorldMedia; onExpand?: () => void }): JSX.Element => {
    const [_, setForceUpdate] = useState(0)

    const setAllowedUrl = (url: string): void => {
        const key = 'reveal:' + url
        localStorage.setItem(key, 'true')
        setForceUpdate((prev) => prev + 1)
    }

    const resetAllowedUrls = (url: string): void => {
        const key = 'reveal:' + url
        localStorage.removeItem(key)
        setForceUpdate((prev) => prev + 1)
    }

    const checkUrlAllowed = (url: string): boolean => {
        const key = 'reveal:' + url
        return localStorage.getItem(key) === 'true'
    }

    const isHidden = media.flag && !checkUrlAllowed(media.mediaURL)

    return (
        <Box
            sx={{
                height: '15vh',
                aspectRatio: '4/3',
                backgroundColor: '#111',
                borderRadius: 1,
                mx: 0.5,
                position: 'relative',
                overflow: 'hidden',
                userSelect: 'none'
            }}
            onClick={() => {
                if (isHidden) setAllowedUrl(media.mediaURL)
                else onExpand?.()
            }}
        >
            {!isHidden ? (
                <>
                    {media.mediaType.startsWith('image') && (
                        <img
                            src={media.mediaURL}
                            style={{
                                display: isHidden ? 'none' : 'block',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                cursor: 'pointer'
                            }}
                        />
                    )}

                    {media.mediaType.startsWith('video') && (
                        <>
                            <video
                                controls
                                style={{
                                    display: isHidden ? 'none' : 'block',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    cursor: 'pointer'
                                }}
                                muted
                            >
                                <source src={media.mediaURL} type={media.mediaType} />
                            </video>
                        </>
                    )}

                    {media.flag && (
                        <VisibilityOffIcon
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                color: 'rgba(255, 255, 255, 0.5)'
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                resetAllowedUrls(media.mediaURL)
                            }}
                        />
                    )}
                </>
            ) : (
                <>
                    {media.blurhash && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            <Blurhash
                                hash={media.blurhash}
                                height={'100%'}
                                width={'100%'}
                                punch={1}
                                resolutionX={32}
                                resolutionY={32}
                            />
                        </Box>
                    )}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'rgba(255, 255, 255, 0.5)',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h3">{media.flag}</Typography>
                        <Typography variant="caption">Click to reveal</Typography>
                    </Box>
                </>
            )}
        </Box>
    )
}

export const EmbeddedGallery = (props: EmbeddedGalleryProps): JSX.Element => {
    const listRef = useRef<VListHandle>(null)
    const mediaViewer = useMediaViewer()

    const [range, setRange] = useState({ start: 0, end: 0 })

    return (
        <Box position="relative">
            <VList
                horizontal
                style={{
                    height: '15vh',
                    overflowY: 'hidden'
                }}
                ref={listRef}
                onRangeChange={(start, end) => {
                    setRange({ start, end })
                }}
            >
                {props.medias.map((media, index) => {
                    return (
                        <MediaCard
                            key={index}
                            media={media}
                            onExpand={() => {
                                mediaViewer.openMedias(props.medias, index)
                            }}
                        />
                    )
                })}
            </VList>
            {range.start !== range.end && (
                <>
                    <IconButton
                        onClick={() => {
                            listRef.current?.scrollToIndex(range.start, {
                                align: 'center',
                                smooth: true
                            })
                        }}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            transform: 'translateY(-50%)',
                            zIndex: 1,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    >
                        <KeyboardArrowLeftIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => {
                            listRef.current?.scrollToIndex(range.end, {
                                align: 'center',
                                smooth: true
                            })
                        }}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            right: 0,
                            transform: 'translateY(-50%)',
                            zIndex: 1,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    >
                        <KeyboardArrowRightIcon />
                    </IconButton>
                </>
            )}
        </Box>
    )
}
