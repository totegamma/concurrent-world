import { Box, Button, ListItemIcon, ListItemText, MenuItem, TextField, Typography } from '@mui/material'
import { ProfileEditor } from '../ProfileEditor'
import { useApi } from '../../context/api'
import { closeSnackbar, useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { type CoreCharacter, type Schema } from '@concurrent-world/client'
import { useEffect, useState } from 'react'
import { CCDrawer } from '../ui/CCDrawer'
import { CCEditor } from '../ui/cceditor'
import { SubProfileCard } from '../SubProfileCard'

import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import PublishIcon from '@mui/icons-material/Publish'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import EditIcon from '@mui/icons-material/Edit'
import { useLocation } from 'react-router-dom'

export const ProfileSettings = (): JSX.Element => {
    const client = useApi()
    const { enqueueSnackbar } = useSnackbar()

    const { t } = useTranslation('', { keyPrefix: 'settings.profile' })

    const path = useLocation()
    const hash = path.hash.replace('#', '')

    const [allCharacters, setAllCharacters] = useState<Array<CoreCharacter<any>>>([])
    const [openCharacterEditor, setOpenCharacterEditor] = useState(false)

    const [schemaURLDraft, setSchemaURLDraft] = useState<string>('')
    const [schemaURL, setSchemaURL] = useState<any>(null)
    const [editingCharacter, setEditingCharacter] = useState<CoreCharacter<any> | null>(null)

    const [enabledSubprofilesDraft, setEnabledSubprofilesDraft] = useState<string[]>([])

    const [modified, setModified] = useState(false)

    const load = (): void => {
        if (!client) return
        client.api.getCharacter(client.ccid).then((characters) => {
            setAllCharacters(
                (characters ?? []).filter(
                    (c) => c.id !== client.user?.profile?.id && c.id !== client.user?.userstreams?.id
                )
            )
        })
        setEnabledSubprofilesDraft(client.user?.profile?.payload.body.subprofiles ?? [])
    }

    useEffect(() => {
        load()
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

    useEffect(() => {
        if (hash) {
            setSchemaURLDraft(hash)
            setOpenCharacterEditor(true)
        }
    }, [hash])

    useEffect(() => {
        if (modified) {
            enqueueSnackbar('掲載サブプロフィール編集中', {
                persist: true,
                variant: 'info',
                action: (key) => (
                    <>
                        <Button
                            onClick={() => {
                                setModified(false)
                                setEnabledSubprofilesDraft([])
                                load()
                                closeSnackbar(key)
                            }}
                        >
                            戻す
                        </Button>
                        <Button
                            onClick={() => {
                                setModified(false)
                                closeSnackbar(key)
                                if (!client.user?.profile?.id) return
                                client
                                    .updateProfile(client.user?.profile?.id, {
                                        subprofiles: enabledSubprofilesDraft
                                    })
                                    .then((_) => {
                                        enqueueSnackbar('保存しました', { variant: 'success' })
                                    })
                            }}
                        >
                            保存
                        </Button>
                    </>
                )
            })
        }
    }, [modified])

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
            {allCharacters.map((character) => {
                const published = enabledSubprofilesDraft.includes(character.id)
                return (
                    <SubProfileCard
                        key={character.id}
                        character={character}
                        additionalMenuItems={[
                            <MenuItem
                                key="publish"
                                onClick={() => {
                                    if (published) {
                                        setEnabledSubprofilesDraft((prev) => prev.filter((id) => id !== character.id))
                                    } else {
                                        setEnabledSubprofilesDraft((prev) => [...prev, character.id])
                                    }
                                    setModified(true)
                                }}
                            >
                                <ListItemIcon>
                                    {published ? (
                                        <VisibilityOffIcon sx={{ color: 'text.primary' }} />
                                    ) : (
                                        <PublishIcon sx={{ color: 'text.primary' }} />
                                    )}
                                </ListItemIcon>
                                <ListItemText>{published ? <>非公開にする</> : <>公開する</>}</ListItemText>
                            </MenuItem>,
                            <MenuItem
                                key="edit"
                                onClick={() => {
                                    setEditingCharacter(character)
                                }}
                            >
                                <ListItemIcon>
                                    <EditIcon sx={{ color: 'text.primary' }} />
                                </ListItemIcon>
                                <ListItemText>編集</ListItemText>
                            </MenuItem>,
                            <MenuItem
                                key="delete"
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
                        ]}
                    >
                        {published ? <>掲載中</> : <>未掲載</>}
                    </SubProfileCard>
                )
            })}
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
                                        load()
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
                                            load()
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
