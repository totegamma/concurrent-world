import { Box, Button, ListItemIcon, ListItemText, MenuItem, TextField, Typography } from '@mui/material'
import { ProfileEditor } from '../ProfileEditor'
import { useApi } from '../../context/api'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { type CoreCharacter, type Schema } from '@concurrent-world/client'
import { useEffect, useState } from 'react'
import { CCDrawer } from '../ui/CCDrawer'
import { CCEditor } from '../ui/cceditor'
import { SubProfileCard } from '../SubProfileCard'

import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'

export const ProfileSettings = (): JSX.Element => {
    const client = useApi()
    const { enqueueSnackbar } = useSnackbar()

    const { t } = useTranslation('', { keyPrefix: 'settings.profile' })

    const [allCharacters, setAllCharacters] = useState<Array<CoreCharacter<any>>>([])
    const [openCharacterEditor, setOpenCharacterEditor] = useState(false)

    const [schemaURLDraft, setSchemaURLDraft] = useState<string>('')
    const [schemaURL, setSchemaURL] = useState<any>(null)
    const [editingCharacter, setEditingCharacter] = useState<CoreCharacter<any> | null>(null)

    useEffect(() => {
        if (!client) return
        client.api.getCharacter(client.ccid).then((characters) => {
            setAllCharacters(
                (characters ?? []).filter(
                    (c) => c.id !== client.user?.profile?.id && c.id !== client.user?.userstreams?.id
                )
            )
        })
    }, [client])

    useEffect(() => {
        let isMounted = true
        const timer = setTimeout(() => {
            if (isMounted) {
                setSchemaURL(schemaURLDraft)
            }
        }, 300)
        return () => {
            isMounted = false
            clearTimeout(timer)
        }
    }, [schemaURLDraft])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}
        >
            <Typography variant="h3">{t('title')}</Typography>
            <Box
                sx={{
                    width: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 1
                }}
            >
                <ProfileEditor
                    id={client?.user?.profile?.id}
                    initial={client?.user?.profile?.payload.body}
                    onSubmit={(_profile) => {
                        enqueueSnackbar(t('updated'), { variant: 'success' })
                    }}
                />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Typography variant="h3">サブプロフィール</Typography>
                <Button
                    onClick={() => {
                        setOpenCharacterEditor(true)
                    }}
                >
                    新規
                </Button>
            </Box>
            {allCharacters.map((character) => (
                <SubProfileCard
                    key={character.id}
                    character={character}
                    additionalMenuItems={
                        <>
                            <MenuItem
                                onClick={() => {
                                    setEditingCharacter(character)
                                }}
                            >
                                <ListItemIcon>
                                    <EditIcon sx={{ color: 'text.primary' }} />
                                </ListItemIcon>
                                <ListItemText>編集</ListItemText>
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    client.api.deleteCharacter(character.id).then((_) => {
                                        console.log('deleted')
                                    })
                                }}
                            >
                                <ListItemIcon>
                                    <DeleteForeverIcon sx={{ color: 'error.main' }} />
                                </ListItemIcon>
                                <ListItemText>削除</ListItemText>
                            </MenuItem>
                        </>
                    }
                />
            ))}
            <CCDrawer
                open={openCharacterEditor || editingCharacter !== null}
                onClose={() => {
                    setOpenCharacterEditor(false)
                    setEditingCharacter(null)
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30px',
                        p: 3
                    }}
                >
                    {openCharacterEditor && (
                        <>
                            <Typography variant="h3">新規サブプロフィール</Typography>
                            <TextField
                                label="テンプレートのURL"
                                value={schemaURLDraft}
                                onChange={(e) => {
                                    setSchemaURLDraft(e.target.value)
                                }}
                            />
                            <CCEditor
                                schemaURL={schemaURL}
                                onSubmit={(e) => {
                                    console.log(e)
                                    client.api.upsertCharacter(schemaURL as Schema, e).then((_) => {
                                        setOpenCharacterEditor(false)
                                    })
                                }}
                            />
                        </>
                    )}
                    {editingCharacter && (
                        <>
                            <Typography variant="h3">サブプロフィールの編集</Typography>
                            <CCEditor
                                schemaURL={editingCharacter.schema}
                                init={editingCharacter.payload.body}
                                onSubmit={(e) => {
                                    console.log(e)
                                    client.api
                                        .upsertCharacter(editingCharacter.schema, e, editingCharacter.id)
                                        .then((_) => {
                                            setEditingCharacter(null)
                                        })
                                }}
                            />
                        </>
                    )}
                </Box>
            </CCDrawer>
        </Box>
    )
}
