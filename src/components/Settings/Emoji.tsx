import {
    Box,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    TextField,
    Typography
} from '@mui/material'
import { useEffect, useState } from 'react'

import { type EmojiPackage, type RawEmojiPackage } from '../../model'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useSnackbar } from 'notistack'
import { useLocation } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useEmojiPicker } from '../../context/EmojiPickerContext'

import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CachedIcon from '@mui/icons-material/Cached'

export const EmojiSettings = (): JSX.Element => {
    const picker = useEmojiPicker()
    const path = useLocation()
    const { enqueueSnackbar } = useSnackbar()

    const [addingPackageURL, setAddingPackageURL] = useState<string>('')
    const [preview, setPreview] = useState<Partial<EmojiPackage> | null>(null)

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
    const [selectedPackageURL, setSelectedPackageURL] = useState<null | string>(null)

    const { t } = useTranslation('', { keyPrefix: 'settings.emoji' })

    useEffect(() => {
        const emojiURL = path.hash.slice(1)
        if (emojiURL?.startsWith('http')) {
            setAddingPackageURL(emojiURL)
        }
    }, [path.hash])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (addingPackageURL) {
                fetch(addingPackageURL)
                    .then((j) => j.json())
                    .then((p: RawEmojiPackage) => {
                        setPreview({
                            ...p,
                            packageURL: addingPackageURL
                        })
                    })
                    .catch(() => {
                        setPreview(null)
                        enqueueSnackbar(t('packageNotFound'), { variant: 'error' })
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
            <Typography variant="h3">{t('emojiPackage')}</Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 2
                }}
            >
                {picker.packages.map((e) => {
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
                                enqueueSnackbar(t('copied'), { variant: 'success' })
                            }}
                        >
                            <Box display="flex">
                                <Box component="img" src={e.iconURL} alt={e.name} height="60px" />
                            </Box>
                            <Typography variant="h4" gutterBottom>
                                {e.name}
                            </Typography>
                            <IconButton
                                onClick={(a) => {
                                    setMenuAnchor(a.currentTarget)
                                    setSelectedPackageURL(e.packageURL)
                                }}
                                sx={{
                                    position: 'absolute',
                                    top: '0px',
                                    right: '0px'
                                }}
                            >
                                <MoreHorizIcon />
                            </IconButton>
                        </Paper>
                    )
                })}
            </Box>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => {
                    setMenuAnchor(null)
                }}
            >
                <MenuItem
                    onClick={() => {
                        if (selectedPackageURL) picker.updateEmojiPackage(selectedPackageURL)
                        setMenuAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <CachedIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>更新</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (selectedPackageURL) picker.removeEmojiPackage(selectedPackageURL)
                        setMenuAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>削除</ListItemText>
                </MenuItem>
            </Menu>

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
                            if (preview.packageURL) picker.addEmojiPackage(preview.packageURL)
                            setAddingPackageURL('')
                            setPreview(null)
                        }}
                    >
                        <AddCircleIcon />
                    </IconButton>
                </Paper>
            )}

            <TextField
                label={t('emojiPackageURL')}
                placeholder="https://example.com/emoji.zip"
                value={addingPackageURL}
                onChange={(e) => {
                    setAddingPackageURL(e.target.value)
                }}
            />
        </>
    )
}
