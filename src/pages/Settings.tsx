import { Button, createTheme, Typography } from "@mui/material";
import { Theme } from "@mui/system";
import { Themes } from '../themes'

export interface SettingsProp {
    setThemeName: (themename: string) => void
}

export function Settings(props: SettingsProp) {
    return (<>
        <Typography variant="h5">Settings</Typography>
        {Object.keys(Themes).map(e =>
            <Button
                key={e}
                variant="contained"
                sx={{background: (Themes as any)[e].palette.primary.main}}
                onClick={(_) => props.setThemeName(e)}
            >{e}</Button>
        )}
    </>)
}
