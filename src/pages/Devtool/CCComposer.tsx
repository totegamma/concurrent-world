import { Box, Button, Divider, MenuItem, Select, TextField, Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import { useApi } from '../../context/api'
import { CCEditor } from '../../components/cceditor'
import { type Character } from '@concurrent-world/client'

export const CCComposer = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const api = useApi()

    const [cctype, setcctype] = useState<'message' | 'association' | 'character'>('message')
    const [schemaURL, setSchemaURL] = useState<string>('')
    const [schemaURLDraft, setSchemaURLDraft] = useState<string>('')

    const [streams, setStreams] = useState<string>('')

    const [associationTarget, setAssociationTarget] = useState<string>('')
    const [associationTargetAuthor, setAssociationTargetAuthor] = useState<string>('')
    const [associationTargetType, setAssociationTargetType] = useState<string>('message')

    const [character, setCharacter] = useState<Character<any>>()

    const createMessage = async (e: any): Promise<void> => {
        api.createMessage(schemaURL, e, streams.split(','))
    }

    const createAssociation = async (e: any): Promise<void> => {
        api.createAssociation(
            schemaURL,
            e,
            associationTarget,
            associationTargetAuthor,
            associationTargetType,
            streams.split(',')
        )
    }

    const createCharacter = async (e: any): Promise<void> => {
        if (character) {
            api.upsertCharacter(schemaURL, e, character.id)
        } else {
            api.upsertCharacter(schemaURL, e)
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
                    variant="contained"
                    onClick={() => {
                        if (cctype === 'character') {
                            api.readCharacter(api.userAddress, schemaURLDraft).then((e) => {
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
