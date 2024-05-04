import { Box, Button, ListItemIcon, ListItemText, MenuItem, TextField, Typography } from '@mui/material'
import { ProfileEditor } from '../ProfileEditor'
import { useClient } from '../../context/ClientContext'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { type ProfileSchema, type CoreProfile, type Schema } from '@concurrent-world/client'
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
    const { client } = useClient()
    const { enqueueSnackbar } = useSnackbar()

    const { t } = useTranslation('', { keyPrefix: 'settings.profile' })

    const path = useLocation()
    const hash = path.hash.replace('#', '')

    const [allProfiles, setAllProfiles] = useState<Array<CoreProfile<any>>>([])
    const [openProfileEditor, setOpenProfileEditor] = useState(false)

    const [schemaURLDraft, setSchemaURLDraft] = useState<string>('')
    const [schemaURL, setSchemaURL] = useState<any>(null)
    const [editingProfile, setEditingProfile] = useState<CoreProfile<any> | null>(null)

    const [latestProfile, setLatestProfile] = useState<ProfileSchema | null | undefined>(client.user?.profile)

    const [subprofileDraft, setSubprofileDraft] = useState<any>(null)

    const load = (): void => {
        if (!client?.ccid) return
        // client.api.invalidateProfile(client.ccid)

        client.api.getProfiles({ author: client.ccid }).then((characters) => {
            setAllProfiles(characters ?? [])
        })

        if (!client.user?.profile) return

        client.api.getProfileBySemanticID<ProfileSchema>('world.concrnt.p', client.ccid).then((profile) => {
            setLatestProfile(profile?.document.body)
        })
    }

    useEffect(() => {
        load()
    }, [client])

    const enabledSubprofiles = latestProfile?.subprofiles ?? []

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
            setOpenProfileEditor(true)
        }
    }, [hash])

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
                    initial={client?.user?.profile}
                    onSubmit={() => {
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
                        setSubprofileDraft({})
                        setOpenProfileEditor(true)
                    }}
                >
                    新規
                </Button>
            </Box>
            {allProfiles.map((character) => {
                const published = enabledSubprofiles.includes(character.id)
                return (
                    <SubProfileCard
                        key={character.id}
                        character={character}
                        additionalMenuItems={[
                            <MenuItem
                                key="publish"
                                onClick={() => {
                                    let subprofiles
                                    if (published) {
                                        subprofiles = enabledSubprofiles.filter((id) => id !== character.id)
                                    } else {
                                        subprofiles = [...enabledSubprofiles, character.id]
                                    }

                                    client
                                        .setProfile({
                                            subprofiles
                                        })
                                        .then((_) => {
                                            load()
                                        })
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
                                    setSubprofileDraft(character.document.body)
                                    setEditingProfile(character)
                                }}
                            >
                                <ListItemIcon>
                                    <EditIcon sx={{ color: 'text.primary' }} />
                                </ListItemIcon>
                                <ListItemText>編集</ListItemText>
                            </MenuItem>,
                            <MenuItem
                                key="delete"
                                disabled={published}
                                onClick={() => {
                                    client.api.deleteProfile(character.id).then((_) => {
                                        load()
                                    })
                                }}
                            >
                                <ListItemIcon>
                                    <DeleteForeverIcon sx={{ color: 'error.main' }} />
                                </ListItemIcon>
                                <ListItemText>
                                    {published ? <>削除するには非公開にしてください</> : <>削除</>}
                                </ListItemText>
                            </MenuItem>
                        ]}
                    >
                        {published ? <>掲載中</> : <>未掲載</>}
                    </SubProfileCard>
                )
            })}
            <CCDrawer
                open={openProfileEditor || editingProfile !== null}
                onClose={() => {
                    setOpenProfileEditor(false)
                    setEditingProfile(null)
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
                    {openProfileEditor && (
                        <>
                            <Typography variant="h3">新規サブプロフィール</Typography>
                            <TextField
                                label="テンプレートのURL"
                                value={schemaURLDraft}
                                onChange={(e) => {
                                    setSchemaURLDraft(e.target.value)
                                }}
                            />
                            <CCEditor schemaURL={schemaURL} value={subprofileDraft} setValue={setSubprofileDraft} />
                            <Button
                                onClick={() => {
                                    client.api.upsertProfile(schemaURL as Schema, subprofileDraft, {}).then((_) => {
                                        setOpenProfileEditor(false)
                                        load()
                                    })
                                }}
                            >
                                作成
                            </Button>
                        </>
                    )}
                    {editingProfile && (
                        <>
                            <Typography variant="h3">サブプロフィールの編集</Typography>
                            <CCEditor
                                schemaURL={editingProfile.schema}
                                value={subprofileDraft}
                                setValue={setSubprofileDraft}
                            />
                            <Button
                                onClick={() => {
                                    client.api
                                        .upsertProfile(editingProfile.schema, subprofileDraft, {
                                            id: editingProfile.id
                                        })
                                        .then((_) => {
                                            setEditingProfile(null)
                                            // client.api.invalidateProfileByID(editingProfile.id)
                                            load()
                                        })
                                }}
                            >
                                更新
                            </Button>
                        </>
                    )}
                </Box>
            </CCDrawer>
        </Box>
    )
}
