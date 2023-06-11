import { Box, Button, TextField, Typography } from '@mui/material'
import { forwardRef, useContext, useEffect, useState } from 'react'
import type { RJSFSchema } from '@rjsf/utils'
import Form from '@rjsf/mui'
import validator from '@rjsf/validator-ajv8'
import { useApi } from '../context/api'
import { ApplicationContext } from '../App'

const schema: RJSFSchema = {
    title: 'ActivityPubSettings',
    description: 'Activitypubに乗せるユーザー情報の設定',
    type: 'object',
    required: ['name', 'summary', 'profile_url', 'icon_url'],
    properties: {
        name: { type: 'string', title: 'Name' },
        summary: { type: 'string', title: 'Bio' },
        profile_url: { type: 'string', title: 'ProfileURL' },
        icon_url: { type: 'string', title: 'IconURL' },
        homestream: { type: 'string', title: 'Homestream' }
    }
}

export const APSettings = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const api = useApi()
    const appData = useContext(ApplicationContext)
    const [loading, setLoading] = useState(false)
    const [registered, setRegistered] = useState(false)
    const [userID, setUserID] = useState('')
    const [form, setForm] = useState<any>({})

    useEffect(() => {
        const requestOptions = {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        }

        api.fetchWithCredential(`https://${api.host!.fqdn}/api/v1/ap/entity/${api.userAddress}`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                setUserID(data.content)
                setRegistered(true)
            })
            .catch((e) => {
                console.log(e)
                setRegistered(false)
            })
    }, [])

    useEffect(() => {
        if (!api) return
        if (!userID) return
        const requestOptions = {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        }
        const profile = window.location.protocol + '//' + window.location.host + '/entity/' + api.userAddress
        const home = appData.userstreams?.payload.body.homeStream
        api.fetchWithCredential(`https://${api.host!.fqdn}/api/v1/ap/person/${userID}`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                setForm({
                    name: data.content.name,
                    summary: data.content.summary,
                    profile_url: data.content.profile_url || profile,
                    icon_url: data.content.icon_url,
                    homestream: data.content.homestream || home
                })
            })
            .catch((_) => {
                setForm({
                    name: appData.profile?.payload.body.username,
                    summary: appData.profile?.payload.body.description,
                    profile_url: profile,
                    icon_url: appData.profile?.payload.body.avatar,
                    homestream: home
                })
            })
    }, [userID])

    const register = (): void => {
        if (!api) {
            return
        }
        setLoading(true)
        const requestOptions = {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                id: userID
            })
        }

        api.fetchWithCredential(`https://${api.host!.fqdn}/api/v1/ap/entity`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                setLoading(false)
                alert('success')
            })
            .catch((e) => {
                alert(e)
                setLoading(false)
            })
    }

    const updateProfile = (form: any): void => {
        if (!api) {
            return
        }
        setLoading(true)
        const requestOptions = {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                id: userID,
                ...form
            })
        }

        api.fetchWithCredential(`https://${api.host!.fqdn}/api/v1/ap/person`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                setLoading(false)
                alert('success')
            })
            .catch((e) => {
                alert(e)
                setLoading(false)
            })
    }

    return (
        <div ref={ref} {...props}>
            {!registered ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}
                >
                    <h3>Register</h3>
                    <Typography>一度登録すると変更できません</Typography>
                    <TextField
                        label="UserID"
                        value={userID}
                        onChange={(x) => {
                            setUserID(x.target.value)
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => {
                            register()
                        }}
                    >
                        register
                    </Button>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}
                >
                    <Typography>UserID: {userID}</Typography>
                    <Form
                        disabled={loading}
                        schema={schema}
                        validator={validator}
                        formData={form}
                        onChange={(e) => {
                            setForm(e.formData)
                        }}
                        onSubmit={(e) => {
                            updateProfile(e.formData)
                        }}
                    />
                </Box>
            )}
        </div>
    )
})

APSettings.displayName = 'APSettings'
