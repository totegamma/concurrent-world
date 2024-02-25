import { type CoreCharacter } from '@concurrent-world/client'
import { Box, IconButton, Menu, Paper, Typography } from '@mui/material'
import { CCWallpaper } from './ui/CCWallpaper'
import { CCAvatar } from './ui/CCAvatar'
import { MarkdownRendererLite } from './ui/MarkdownRendererLite'
import { useEffect, useMemo, useState } from 'react'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

export interface SubProfileCardProps {
    character: CoreCharacter<any>
    additionalMenuItems?: JSX.Element | JSX.Element[]
}

const defaultProperties = ['username', 'avatar', 'description', 'banner', 'links']

export const SubProfileCard = (props: SubProfileCardProps): JSX.Element => {
    const isProfile = 'username' in props.character.payload.body && 'avatar' in props.character.payload.body
    const [schema, setSchema] = useState<any>()

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    const properties = useMemo(() => {
        if (!schema) return []
        const specialProperties = schema.properties
        for (const def of defaultProperties) {
            delete specialProperties[def]
        }

        const properties = []
        for (const key in specialProperties) {
            if (specialProperties[key].type !== 'string') continue
            properties.push({
                key,
                title: specialProperties[key].title,
                description: specialProperties[key].description
            })
        }
        return properties
    }, [schema])

    useEffect(() => {
        let unmounted = false
        fetch(props.character.schema)
            .then((res) => res.json())
            .then((data) => {
                if (unmounted) return
                setSchema(data)
            })
        return () => {
            unmounted = true
        }
    }, [])

    return (
        <Paper variant="outlined">
            {isProfile ? (
                <>
                    <CCWallpaper
                        sx={{
                            height: '80px',
                            position: 'relative'
                        }}
                        override={props.character.payload.body.banner}
                    >
                        {props.additionalMenuItems && (
                            <IconButton
                                sx={{
                                    color: 'text.disabled',
                                    position: 'absolute',
                                    right: 2,
                                    top: 2
                                }}
                                onClick={(e) => {
                                    setMenuAnchor(e.currentTarget)
                                }}
                            >
                                <MoreHorizIcon sx={{ fontSize: '80%' }} />
                            </IconButton>
                        )}
                    </CCWallpaper>
                    <Box position="relative" height={0}>
                        <Box
                            position="relative"
                            sx={{
                                top: '-30px',
                                left: '10px'
                            }}
                        >
                            <CCAvatar
                                alt={props.character.payload.body.username}
                                avatarURL={props.character.payload.body.avatar}
                                identiconSource={props.character.payload.body.username}
                                sx={{
                                    width: '60px',
                                    height: '60px'
                                }}
                            />
                        </Box>
                    </Box>
                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="flex-end"
                        alignItems="center"
                        height="40px"
                        gap={1}
                        px={1}
                        mb={1}
                    >
                        未掲載
                    </Box>
                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                        px={1}
                        mb={1}
                    >
                        <Typography variant="h2">{props.character.payload.body.username}</Typography>
                        <Box />
                    </Box>
                    <Box
                        sx={{
                            maxHeight: '100px',
                            overflowX: 'hidden',
                            overflowY: 'auto',
                            px: 1,
                            mb: 1
                        }}
                    >
                        <MarkdownRendererLite
                            messagebody={props.character.payload.body.description ?? ''}
                            emojiDict={{}}
                        />
                    </Box>
                    <Box>
                        {properties.map(
                            (property, index) =>
                                property.key in props.character.payload.body && (
                                    <Box key={index} px={1} mb={1}>
                                        {/* <Typography variant="h3">{property.title}</Typography> */}
                                        <Typography variant="body1">
                                            {property.description}: {props.character.payload.body[property.key]}
                                        </Typography>
                                    </Box>
                                )
                        )}
                    </Box>
                </>
            ) : (
                <>
                    <Typography variant="h2">Not a profile</Typography>
                </>
            )}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => {
                    setMenuAnchor(null)
                }}
            >
                {props.additionalMenuItems}
            </Menu>
        </Paper>
    )
}
