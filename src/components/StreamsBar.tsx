import { useEffect, useState } from "react"
import { lighten, Paper, IconButton, InputBase, Box, useTheme } from "@mui/material"
import ExploreIcon from '@mui/icons-material/Explore';
import SearchIcon from '@mui/icons-material/Search';

export interface StreamsBarProps {
  currentStreams: string,
  setCurrentStreams: (streams: string) => void,
  reload: () => void
}

export function StreamsBar(props: StreamsBarProps) {

  const theme = useTheme()
  const [streams, setStreams] = useState(props.currentStreams)

  // wait 400ms after input before applying streams to prev
  const inputTimeout = 400

  useEffect(() => {

    const timeout = setTimeout(() => {
      props.setCurrentStreams(streams)
    }, inputTimeout)

    return () => clearTimeout(timeout)
  }, [streams])

  // force local streams to change in case of external input (i.e. sidebar button)
  useEffect(() => {
    setStreams(props.currentStreams)
  }, [props.currentStreams])

  return <Box sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background:
      theme.palette.primary.main,
    padding: "5px",
    borderRadius: "20px 20px 0 0"
  }}>
    <Paper
      component="form"
      elevation={0}
      sx={{
        m: '3px 30px',
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '32px',
        borderRadius: '16px',
        background: lighten(theme.palette.primary.main, 0.3)
      }}
      onSubmit={e => {
        e.preventDefault()
        // submit logic (enter key) may be added here
      }}
    >
      <IconButton sx={{ p: '10px' }}>
        <ExploreIcon sx={{ color: "white" }} />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1, color: '#fff' }}
        value={streams}
        onChange={e => setStreams(e.target.value)}
      />
      <IconButton sx={{ p: '10px' }} onClick={_ => props.reload()}>
        <SearchIcon sx={{ color: "white" }} />
      </IconButton>
    </Paper>
  </Box>
}
