import { Box, Button, Modal } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'

export interface ImagePreviewModalProps {
    src: string | undefined
    onClose: () => void
}

const scaleUp = true
const zoomFactor = 8

export const ImagePreviewModal = (props: ImagePreviewModalProps): JSX.Element => {
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
        const scale = Math.min(containerWidth / imageNaturalWidth, containerHeight / imageNaturalHeight)
        return scaleUp ? scale : Math.max(scale, 1)
    }, [scaleUp, containerWidth, containerHeight, imageNaturalWidth, imageNaturalHeight])

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
        setTimeout(() => {
            transformComponentRef.current?.resetTransform()
        }, 10)
    }

    useEffect(() => {
        if (props.src === undefined) return
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
                flexDirection: 'column'
            }}
        >
            <>
                <Box
                    flex={1}
                    width="100%"
                    ref={(el: HTMLDivElement | null) => {
                        setContainer(el)
                    }}
                    onClick={(e) => {
                        if (e.target !== imageRef.current?.parentElement) {
                            props.onClose()
                        }
                    }}
                >
                    {imageScale > 0 && (
                        <TransformWrapper
                            centerOnInit
                            initialScale={imageScale}
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
                    )}
                </Box>
                <Box width="100%" display="flex" justifyContent="center" alignItems="center" flexDirection="row" p={1}>
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
