import { Box } from '@mui/material'
import { ProfileEditor } from '../ProfileEditor'
import { type Client, type ProfileSchema } from '@concurrent-world/client'
import { StorageProvider } from '../../context/StorageContext'

export function CreateProfile(props: {
    next: () => void
    client: Client | undefined
    setProfile: (_: ProfileSchema) => void
}): JSX.Element {
    return (
        <StorageProvider>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}
            >
                ここで名前・アイコン・自己紹介を設定します。
                <Box
                    sx={{
                        width: '100%',
                        borderRadius: 1,
                        overflow: 'hidden'
                    }}
                >
                    <ProfileEditor
                        onSubmit={(newprofile) => {
                            props.setProfile(newprofile)
                            props.client?.setupUserstreams().then(() => {
                                props.next()
                            })
                        }}
                    />
                </Box>
            </Box>
        </StorageProvider>
    )
}
