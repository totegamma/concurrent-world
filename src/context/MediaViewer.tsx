import { Box, Button, CircularProgress, IconButton, Modal, useMediaQuery, useTheme } from '@mui/material'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { type ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'

const zoomFactor = 8

interface Media {
    mediaURL: string
    mediaType: string
    thumbnailURL?: string
    blurhash?: string
}

export interface MediaViewerState {
    openSingle: (src?: string) => void
    openMedias: (medias: Media[], startIndex?: number) => void
}

const MediaViewerContext = createContext<MediaViewerState>({
    openSingle: () => {},
    openMedias: () => {}
})

interface MediaViewerProviderProps {
    children: JSX.Element | JSX.Element[]
}

export const MediaViewerProvider = (props: MediaViewerProviderProps): JSX.Element => {
    const [previewImage, setPreviewImage] = useState<string | undefined>()
    const [previewIndex, setPreviewIndex] = useState<number>(0)
    const [medias, setMedias] = useState<Media[]>([])

    const openSingle = (src?: string): void => {
        setPreviewImage(src)
    }

    const openMedias = (medias: Media[], startIndex?: number): void => {
        setMedias(medias)
        setPreviewIndex(startIndex ?? 0)
        setPreviewImage(medias[startIndex ?? 0].mediaURL)
    }

    const theme = useTheme()
    const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'))
    const padding = isMobileSize ? 20 : 100

    const [container, setContainer] = useState<HTMLDivElement | null>(null)

    const [containerWidth, setContainerWidth] = useState<number>(0)
    const [containerHeight, setContainerHeight] = useState<number>(0)

    const [imageNaturalWidth, setImageNaturalWidth] = useState<number>(0)
    const [imageNaturalHeight, setImageNaturalHeight] = useState<number>(0)
    const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)

    const imageScale = useMemo(() => {
        if (containerWidth === 0 || containerHeight === 0 || imageNaturalWidth === 0 || imageNaturalHeight === 0)
            return 0
        return Math.min(
            (containerWidth - padding) / imageNaturalWidth,
            (containerHeight - padding) / imageNaturalHeight
        )
    }, [containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight])

    const centerPosition = useMemo(() => {
        if (containerWidth === 0 || containerHeight === 0 || imageNaturalWidth === 0 || imageNaturalHeight === 0)
            return { x: 0, y: 0 }
        const x = (containerWidth - imageNaturalWidth * imageScale) / 2
        const y = (containerHeight - imageNaturalHeight * imageScale) / 2
        return { x, y }
    }, [containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight, imageScale])

    const handleResize = useCallback(() => {
        if (container !== null) {
            const rect = container.getBoundingClientRect()
            setContainerWidth(rect.width)
            setContainerHeight(rect.height)
        } else {
            setContainerWidth(0)
            setContainerHeight(0)
        }
    }, [container])

    useEffect(() => {
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [handleResize])

    const handleImageOnLoad = (image: HTMLImageElement): void => {
        console.log('image loaded!', image.naturalWidth, image.naturalHeight)
        setImageNaturalWidth(image.naturalWidth)
        setImageNaturalHeight(image.naturalHeight)
    }

    useEffect(() => {
        if (previewImage === undefined) {
            setImageNaturalWidth(0)
            setImageNaturalHeight(0)
            return
        }
        const image = new Image()
        image.src = previewImage
        image.onload = () => {
            handleImageOnLoad(image)
        }
    }, [previewImage])

    return (
        <MediaViewerContext.Provider value={{ openSingle, openMedias }}>
            {props.children}
            <Modal
                open={!!previewImage}
                onClose={() => {
                    setPreviewImage(undefined)
                }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    position: 'absolute'
                }}
            >
                <>
                    <Box
                        flex={1}
                        position="absolute"
                        width="100vw"
                        height="100dvh"
                        top={0}
                        left={0}
                        ref={(el: HTMLDivElement | null) => {
                            setContainer(el)
                        }}
                        onClick={(e) => {
                            if (e.target !== imageRef.current?.parentElement) {
                                setPreviewImage(undefined)
                            }
                        }}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        {imageScale > 0 ? (
                            <TransformWrapper
                                initialScale={imageScale}
                                initialPositionX={centerPosition.x}
                                initialPositionY={centerPosition.y}
                                minScale={imageScale}
                                maxScale={imageScale * zoomFactor}
                                ref={transformComponentRef}
                            >
                                <TransformComponent
                                    wrapperStyle={{
                                        width: '100%',
                                        height: '100%'
                                    }}
                                >
                                    <img
                                        src={previewImage}
                                        alt="preview"
                                        ref={(el: HTMLImageElement | null) => {
                                            imageRef.current = el
                                        }}
                                    />
                                </TransformComponent>
                            </TransformWrapper>
                        ) : (
                            <CircularProgress
                                sx={{
                                    color: 'white'
                                }}
                            />
                        )}
                    </Box>

                    {medias && previewIndex > 0 && (
                        <IconButton
                            onClick={() => {
                                setPreviewIndex(previewIndex - 1)
                                setPreviewImage(medias[previewIndex - 1].mediaURL)
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
                    )}

                    {medias && previewIndex < medias.length - 1 && (
                        <IconButton
                            onClick={() => {
                                setPreviewIndex(previewIndex + 1)
                                setPreviewImage(medias[previewIndex + 1].mediaURL)
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
                    )}
                    <Box
                        width="100%"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="row"
                        p={1}
                        position="absolute"
                        bottom={'env(safe-area-inset-bottom)'}
                    >
                        <Button
                            onClick={() => {
                                setPreviewImage(undefined)
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </>
            </Modal>
        </MediaViewerContext.Provider>
    )
}

export const useMediaViewer = (): MediaViewerState => {
    return useContext(MediaViewerContext)
}
