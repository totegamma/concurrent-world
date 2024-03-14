import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Breadcrumbs, Link } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface BreadcrumbItem {
    path: string
    title: string
}

const pathTitles: Record<string, string> = {
    '/settings': 'settings.title',
    '/settings/general': 'settings.general.title',
    '/settings/profile': 'settings.profile.title',
    '/settings/identity': 'settings.identity.title',
    '/settings/theme': 'settings.theme.title',
    '/settings/sound': 'settings.sound.title',
    '/settings/emoji': 'settings.emoji.title',
    '/settings/media': 'settings.media.title',
    '/settings/activitypub': 'settings.ap.title',
    '/settings/loginqr': 'settings.qr.title'
}

export const BreadcrumbList = (): JSX.Element => {
    const { t } = useTranslation()
    const currentPath = useLocation()

    const breadcrumbTitles: BreadcrumbItem[] = currentPath.pathname
        .split('/')
        .reduce<BreadcrumbItem[]>((acc, path, index, paths) => {
            const currentPath = `/${paths.slice(1, index + 1).join('/')}`
            const title = pathTitles[currentPath]
            if (title) {
                acc.push({ path: currentPath, title: t(title) })
            }
            return acc
        }, [])

    return (
        <Breadcrumbs aria-label="breadcrumb">
            {breadcrumbTitles.map(({ path, title }) => (
                <Link
                    key={path}
                    component={RouterLink}
                    to={path}
                    variant="h2"
                    underline="hover"
                    color="inherit"
                    sx={{
                        textTransform: 'capitalize',
                        color: 'text.primary'
                    }}
                >
                    {title}
                </Link>
            ))}
        </Breadcrumbs>
    )
}
