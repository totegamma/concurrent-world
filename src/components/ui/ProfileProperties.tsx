import { type CoreCharacter } from '@concurrent-world/client'
import { Box, Link, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

export interface ProfilePropertiesProps {
    character: CoreCharacter<any>
    showCreateLink?: boolean
}

const defaultProperties = ['username', 'avatar', 'description', 'banner', 'links']

export const ProfileProperties = (props: ProfilePropertiesProps): JSX.Element => {
    const [schema, setSchema] = useState<any>()

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
            {props.showCreateLink && (
                <Box display="flex" width="100%" justifyContent="flex-end" px={1}>
                    <Typography variant="caption">
                        これはテンプレート「{schema?.title || '無名'}」で作成されました。
                    </Typography>
                    <Link variant="caption" component={RouterLink} to={`/settings/profile#${props.character.schema}`}>
                        自分も作成する
                    </Link>
                </Box>
            )}
        </Box>
    )
}
