import { Box, Button, CircularProgress, Modal, useMediaQuery, useTheme } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'

export interface ImagePreviewModalProps {
    src: string | undefined
    onClose: () => void
}

const zoomFactor = 8

export const ImagePreviewModal = (props: ImagePreviewModalProps): JSX.Element => {
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
        if (props.src === undefined) {
            setImageNaturalWidth(0)
            setImageNaturalHeight(0)
            return
        }
        const image = new Image()
        image.src = props.src
        image.onload = () => {
            handleImageOnLoad(image)
        }
    }, [props.src])

    return (
        <Modal
            open={!!props.src}
            onClose={() => {
                props.onClose()
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
                            props.onClose()
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
                                    src={props.src}
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
                            props.onClose()
                        }}
                    >
                        Close
                    </Button>
                </Box>
            </>
        </Modal>
    )
}
