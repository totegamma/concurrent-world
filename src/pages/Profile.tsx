import { Box, Divider, Typography, TextField, Button } from "@mui/material";
import { useContext } from "react";
import { ApplicationContext } from "../App";
import { usePersistent } from "../hooks/usePersistent";
import { Schemas } from "../schemas";
import { Sign } from "../util";

export function Profile() {

    const appData = useContext(ApplicationContext)

    const [username, setUsername] = usePersistent<string>("Username", "anonymous");
    const [avatar, setAvatar] = usePersistent<string>("AvatarURL", "");

    const updateProfile = () => {
        const payload_obj = {
            'username': username,
            'avatar': avatar,
            'description': ''
        }

        const payload = JSON.stringify(payload_obj);
        const signature = Sign(appData.privatekey, payload)

        const requestOptions = {
            method: 'PUT',
            headers: {},
            body: JSON.stringify({
                'author': appData.userAddress,
                'schema': Schemas.profile,
                'payload': payload,
                signature: signature,
            })
        };

        fetch(appData.serverAddress + 'characters', requestOptions)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            //reload();
        });
    }

    return (<>
        <Typography variant="h5" gutterBottom>Profile</Typography>
        <Divider/>
        <Box sx={{display: "flex", flexDirection: "column", padding: "15px", gap: "5px"}}>
            <TextField label="username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)}/>
            <TextField label="avatarURL" variant="outlined" value={avatar} onChange={(e) => setAvatar(e.target.value)}/>
            <Button variant="contained" onClick={_ => updateProfile()}>Update</Button>
        </Box>
        <Divider/>
        <Typography variant="h6" gutterBottom>Concurrent Address</Typography>
        {appData.userAddress}
        <Typography variant="h6" gutterBottom>Publickey</Typography>
        {appData.publickey}
        <Typography variant="h6" gutterBottom>Privatekey</Typography>
        {appData.privatekey}
    </>)
}
