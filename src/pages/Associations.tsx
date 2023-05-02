import { Box, Divider, Typography } from "@mui/material";

export function Associations() {
    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "5px", padding: "20px"}}>
            <Typography variant="h5" gutterBottom>Associations</Typography>
            <Divider/>
        </Box>
    )
}
