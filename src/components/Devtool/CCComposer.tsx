import { Box, Button, Divider, MenuItem, Select, TextField, Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import { useApi } from '../../context/api'
import { type Schema, type CoreCharacter } from '@concurrent-world/client'
import { CCEditor } from '../ui/cceditor'

export const CCComposer = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const client = useApi()

    const [cctype, setcctype] = useState<'message' | 'association' | 'character'>('message')
    const [schemaURL, setSchemaURL] = useState<string>('')
    const [schemaURLDraft, setSchemaURLDraft] = useState<string>('')

    const [streams, setStreams] = useState<string>('')

    const [associationTarget, setAssociationTarget] = useState<string>('')
    const [associationTargetAuthor, setAssociationTargetAuthor] = useState<string>('')
    const [associationTargetType, setAssociationTargetType] = useState<string>('message')

    const [character, setCharacter] = useState<CoreCharacter<any> | null | undefined>()

    const createMessage = async (e: any): Promise<void> => {
        client.api.createMessage(schemaURL as Schema, e, streams.split(','))
    }

    const createAssociation = async (e: any): Promise<void> => {
        client.api.createAssociation(
            schemaURL as Schema,
            e,
            associationTarget,
            associationTargetAuthor,
            associationTargetType,
            streams.split(',')
        )
    }

    const createCharacter = async (e: any): Promise<void> => {
        if (character) {
            client.api.upsertCharacter(schemaURL as Schema, e, character.id)
        } else {
            client.api.upsertCharacter(schemaURL as Schema, e)
        }
    }

    return (
        <div ref={ref} {...props}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    height: '100%'
                }}
            >
                <Typography variant="h3">Concurrent Composer</Typography>
                <Select
                    value={cctype}
                    label="Object Type"
                    onChange={(e) => {
                        setcctype(e.target.value as any)
                    }}
                >
                    <MenuItem value={'message'}>Message</MenuItem>
                    <MenuItem value={'association'}>Association</MenuItem>
                    <MenuItem value={'character'}>Character</MenuItem>
                </Select>
                {cctype === 'message' && (
                    <>
                        <TextField
                            label="Streams"
                            value={streams}
                            onChange={(e) => {
                                setStreams(e.target.value)
                            }}
                        />
                    </>
                )}
                {cctype === 'association' && (
                    <>
                        <TextField
                            label="Target"
                            value={associationTarget}
                            onChange={(e) => {
                                setAssociationTarget(e.target.value)
                            }}
                        />
                        <TextField
                            label="Target Author"
                            value={associationTargetAuthor}
                            onChange={(e) => {
                                setAssociationTargetAuthor(e.target.value)
                            }}
                        />
                        <Select
                            value={associationTargetType}
                            label="Target Type"
                            onChange={(e) => {
                                setAssociationTargetType(e.target.value as any)
                            }}
                        >
                            <MenuItem value={'message'}>Message</MenuItem>
                            <MenuItem value={'character'}>Character</MenuItem>
                        </Select>

                        <TextField
                            label="Streams"
                            value={streams}
                            onChange={(e) => {
                                setStreams(e.target.value)
                            }}
                        />
                    </>
                )}

                <Divider />

                <TextField
                    label="Schema URL"
                    value={schemaURLDraft}
                    onChange={(e) => {
                        setSchemaURLDraft(e.target.value)
                    }}
                />
                <Button
                    onClick={() => {
                        if (cctype === 'character') {
                            client.api.getCharacter(client.ccid, schemaURLDraft).then((e) => {
                                setCharacter(e)
                                setSchemaURL(schemaURLDraft)
                            })
                        } else {
                            setSchemaURL(schemaURLDraft)
                        }
                    }}
                >
                    Load
                </Button>

                <CCEditor
                    schemaURL={schemaURL}
                    onSubmit={(e) => {
                        console.log(e)
                        switch (cctype) {
                            case 'message':
                                createMessage(e)
                                break
                            case 'association':
                                createAssociation(e)
                                break
                            case 'character':
                                createCharacter(e)
                                break
                        }
                    }}
                    init={character?.payload.body}
                />
            </Box>
        </div>
    )
})

CCComposer.displayName = 'CCComposer'
