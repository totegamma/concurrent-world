import { type CoreCharacter } from '@concurrent-world/client'
import { Box, IconButton, Menu, Paper, Typography } from '@mui/material'
import { CCWallpaper } from './ui/CCWallpaper'
import { CCAvatar } from './ui/CCAvatar'
import { MarkdownRendererLite } from './ui/MarkdownRendererLite'
import { useState } from 'react'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { ProfileProperties } from './ui/ProfileProperties'

export interface SubProfileCardProps {
    character: CoreCharacter<any>
    additionalMenuItems?: JSX.Element | JSX.Element[]
    children?: JSX.Element | JSX.Element[]
}

export const SubProfileCard = (props: SubProfileCardProps): JSX.Element => {
    const isProfile = 'username' in props.character.payload.body && 'avatar' in props.character.payload.body

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

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
                        {props.children}
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
                    <ProfileProperties character={props.character} />
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
