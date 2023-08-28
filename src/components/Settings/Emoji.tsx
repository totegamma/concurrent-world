import { Box, IconButton, Paper, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { usePreference } from '../../context/PreferenceContext'
import { type EmojiPackage, type RawEmojiPackage } from '../../model'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useSnackbar } from 'notistack'
import { useLocation } from 'react-router-dom'

export const EmojiSettings = (): JSX.Element => {
    const pref = usePreference()
    const path = useLocation()
    const { enqueueSnackbar } = useSnackbar()

    const [addingPackageURL, setAddingPackageURL] = useState<string>('')
    const [packages, setPackages] = useState<EmojiPackage[]>([])
    const [preview, setPreview] = useState<EmojiPackage | null>(null)

    useEffect(() => {
        const emojiURL = path.hash.slice(1)
        if (emojiURL?.startsWith('http')) {
            setAddingPackageURL(emojiURL)
        }
    }, [path.hash])

    useEffect(() => {
        Promise.all(
            pref.emojiPackages.map((url) =>
                fetch(url)
                    .then((j) => j.json())
                    .then((p: RawEmojiPackage) => ({ ...p, packageURL: url }))
            )
        ).then((packages: EmojiPackage[]) => {
            setPackages(packages)
        })
    }, [pref.emojiPackages])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (addingPackageURL) {
                fetch(addingPackageURL)
                    .then((j) => j.json())
                    .then((p: RawEmojiPackage) => {
                        setPreview({ ...p, packageURL: addingPackageURL })
                    })
                    .catch(() => {
                        setPreview(null)
                        enqueueSnackbar('パッケージが見つかりませんでした', { variant: 'error' })
                    })
            } else {
                setPreview(null)
            }
        }, 500)
        return () => {
            clearTimeout(timer)
        }
    }, [addingPackageURL])

    return (
        <>
            <Typography variant="h3">絵文字パッケージ</Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 2
                }}
            >
                {packages.map((e) => {
                    return (
                        <Paper
                            key={e.iconURL}
                            variant="outlined"
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: '10px',
                                gap: 1,
                                height: '80px',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                navigator.clipboard.writeText(e.packageURL)
                                enqueueSnackbar('コピーしました', { variant: 'success' })
                            }}
                        >
                            <Box display="flex">
                                <Box component="img" src={e.iconURL} alt={e.name} height="60px" />
                            </Box>
                            <Typography variant="h4" gutterBottom>
                                {e.name}
                            </Typography>
                            <IconButton
                                onClick={() => {
                                    pref.setEmojiPackages(pref.emojiPackages.filter((p) => p !== e.packageURL))
                                }}
                                sx={{
                                    position: 'absolute',
                                    top: '0px',
                                    right: '0px'
                                }}
                            >
                                <CancelIcon />
                            </IconButton>
                        </Paper>
                    )
                })}
            </Box>

            {preview && (
                <Paper
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: '10px',
                        gap: 1,
                        height: '80px',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box display="flex">
                        <Box component="img" src={preview.iconURL} alt={preview.name} height="60px" />
                    </Box>
                    <Typography variant="h4" gutterBottom>
                        {preview.name}
                    </Typography>
                    <IconButton
                        onClick={() => {
                            if (!packages.find((p) => p.packageURL === preview.packageURL)) {
                                pref.setEmojiPackages([...pref.emojiPackages, addingPackageURL])
                                setAddingPackageURL('')
                                setPreview(null)
                            } else {
                                enqueueSnackbar('すでに追加されています', { variant: 'error' })
                            }
                        }}
                    >
                        <AddCircleIcon />
                    </IconButton>
                </Paper>
            )}

            <TextField
                label="絵文字パッケージURL"
                placeholder="https://example.com/emoji.zip"
                value={addingPackageURL}
                onChange={(e) => {
                    setAddingPackageURL(e.target.value)
                }}
            />
        </>
    )
}
