import { Box, IconButton } from '@mui/material'
import { useMediaViewer } from '../../context/MediaViewer'
import { VList, type VListHandle } from 'virtua'
import { useRef, useState } from 'react'

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'

export interface EmbeddedGalleryProps {
    medias: Array<{
        mediaURL: string
        mediaType: string
        thumbnailURL?: string
        blurhash?: string
    }>
}

export const EmbeddedGallery = (props: EmbeddedGalleryProps): JSX.Element => {
    const mediaViewer = useMediaViewer()
    const listRef = useRef<VListHandle>(null)

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
                {props.medias.map((media, index) => (
                    <Box
                        key={index}
                        onClick={() => {
                            mediaViewer.openMedias(props.medias, index)
                        }}
                        sx={{
                            height: '15vh',
                            aspectRatio: '4/3',
                            backgroundImage: `url(${media.mediaURL})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            borderRadius: 1,
                            mx: 0.5
                        }}
                    />
                ))}
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
