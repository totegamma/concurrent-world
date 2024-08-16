import { Box, Button, Divider, Modal, Paper } from '@mui/material'
import { CCPostEditor, type CCPostEditorProps } from './Editor/CCPostEditor'
import { useEffect, useState } from 'react'

export interface EditorModalProps extends CCPostEditorProps {
    variant: 'desktop' | 'mobile'
    open: boolean
    onClose: () => void
    onCancel?: () => void
    context?: JSX.Element
}

export const EditorModal = (props: EditorModalProps): JSX.Element => {
    const [viewportHeight, setViewportHeight] = useState<number>(visualViewport?.height ?? 0)
    useEffect(() => {
        function handleResize(): void {
            setViewportHeight(visualViewport?.height ?? 0)
        }
        visualViewport?.addEventListener('resize', handleResize)
        return () => visualViewport?.removeEventListener('resize', handleResize)
    }, [])

    const modalProps =
        props.variant === 'mobile'
            ? {
                  backdrop: {
                      sx: {
                          backgroundColor: 'background.default'
                      }
                  }
              }
            : {}

    return (
        <Modal open={props.open} onClose={props.onClose} slotProps={modalProps}>
            {props.variant === 'desktop' ? (
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        left: '50%',
                        transform: 'translate(-50%, 0%)',
                        width: '700px',
                        maxWidth: '90vw'
                    }}
                >
                    {props.context && (
                        <>
                            {props.context}
                            <Divider />
                        </>
                    )}

                    <CCPostEditor
                        autoFocus
                        minRows={3}
                        maxRows={7}
                        {...props}
                        sx={{
                            p: 1
                        }}
                    />
                </Paper>
            ) : (
                <Box
                    sx={{
                        height: viewportHeight,
                        maxHeight: '60vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        p: 0.5,
                        backgroundColor: 'background.default'
                    }}
                >
                    <Paper
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            flex: 1,
                            p: 0.5
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Button
                                variant="text"
                                onClick={() => {
                                    props.onCancel?.()
                                }}
                                sx={{
                                    px: 1
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                        {props.context && (
                            <>
                                <Divider />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        py: 1
                                    }}
                                >
                                    {props.context}
                                </Box>
                            </>
                        )}
                        <Divider />
                        <CCPostEditor mobile autoFocus {...props} />
                    </Paper>
                </Box>
            )}
        </Modal>
    )
}
