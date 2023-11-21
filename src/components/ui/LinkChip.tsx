import { Avatar, Chip, Link } from '@mui/material'
import PublicIcon from '@mui/icons-material/Public'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faDiscord,
    faMastodon,
    faFacebook,
    faGithub,
    faTwitter,
    faYoutube,
    faInstagram,
    faTwitch,
    faSteam,
    faPatreon,
    faBandcamp,
    faSoundcloud
} from '@fortawesome/free-brands-svg-icons'

const iconMap: Record<string, JSX.Element> = {
    discord: <FontAwesomeIcon icon={faDiscord} />,
    mastodon: <FontAwesomeIcon icon={faMastodon} />,
    facebook: <FontAwesomeIcon icon={faFacebook} />,
    github: <FontAwesomeIcon icon={faGithub} />,
    twitter: <FontAwesomeIcon icon={faTwitter} />,
    youtube: <FontAwesomeIcon icon={faYoutube} />,
    instagram: <FontAwesomeIcon icon={faInstagram} />,
    twitch: <FontAwesomeIcon icon={faTwitch} />,
    steam: <FontAwesomeIcon icon={faSteam} />,
    patreon: <FontAwesomeIcon icon={faPatreon} />,
    bandcamp: <FontAwesomeIcon icon={faBandcamp} />,
    soundcloud: <FontAwesomeIcon icon={faSoundcloud} />
}

export interface LinkChipProps {
    href?: string
    service: string
    icon?: string
    children: string
}

export const LinkChip = ({ href, service, icon, children }: LinkChipProps): JSX.Element => {
    const useAvatar = icon !== undefined && icon !== ''

    return (
        <Chip
            clickable={href !== undefined && href !== ''}
            size="small"
            icon={useAvatar ? undefined : iconMap[service] ?? <PublicIcon />}
            avatar={useAvatar ? <Avatar src={icon} /> : undefined}
            component={Link}
            href={href}
            label={children}
            target="_blank"
            rel="noreferrer noopener"
        />
    )
}
