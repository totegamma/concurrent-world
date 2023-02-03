import { useEffect, useState } from 'react';
import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import { pki, md, util } from 'node-forge';

import { usePersistent } from './hooks/usePersistent';

function App() {

    const [server, setServer] = usePersistent<string>("ServerAddress", "");
    const [pubkey, setPubKey] = usePersistent<string>("PublicKey", "");
    const [prvkey, setPrvKey] = usePersistent<string>("PrivateKey", "");


    const [username, setUsername] = usePersistent<string>("Username", "anonymous");
    const [avatar, setAvatar] = usePersistent<string>("AvatarURL", "");

    const [draft, setDraft] = useState<string>("");


    useEffect(() => {
        if (pubkey == "" && prvkey == "") regenerateKeys();
    }, []);

    const regenerateKeys = () => {
        pki.rsa.generateKeyPair({bits: 512, workers: 2}, function(_, keypair) {
            let publickey = pki.publicKeyToPem(keypair.publicKey);
            let privatekey = pki.privateKeyToPem(keypair.privateKey);

            publickey = publickey.replace("-----BEGIN PUBLIC KEY-----", "");
            publickey = publickey.replace("-----END PUBLIC KEY-----", "");
            publickey = publickey.replace(/\r?\n/g, '');

            privatekey = privatekey.replace("-----BEGIN RSA PRIVATE KEY-----", "");
            privatekey = privatekey.replace("-----END RSA PRIVATE KEY-----", "");
            privatekey = privatekey.replace(/\r?\n/g, '');

            setPubKey(publickey);
            setPrvKey(privatekey);
        });
    }

    const post = () => {

        let privatekey = pki.privateKeyFromPem(
            "-----BEGIN RSA PRIVATE KEY-----"
            + prvkey
            + "-----END RSA PRIVATE KEY-----");

        const payload_obj = {
            'username': username,
            'avatar': avatar,
            'body': draft
        }

        const payload = JSON.stringify(payload_obj);

        let hash = md.sha256.create();
        hash.update(payload, 'utf8');
        let signature = util.encode64(privatekey.sign(hash));
        console.log(signature);

        const requestOptions = {
            method: 'POST',
            headers: {},
            body: JSON.stringify({'author': pubkey, 'payload': payload, 'signature': signature})
        };

        fetch(server, requestOptions)
        .then(res => res.json())
        .then(data => {
            console.log(data);
        });
    }

    return (<Box sx={{display: "flex", padding: "10px", gap: "10px"}}>
        <Paper sx={{width: "300px", padding: "5px"}}>
            <Typography variant="h5" gutterBottom>Settings</Typography>
            <Divider/>
            <Box sx={{display: "flex", flexDirection: "column", padding: "15px", gap: "5px"}}>
                <TextField label="server" variant="outlined" value={server} onChange={(e) => setServer(e.target.value)}/>
                <TextField label="privateKey" variant="outlined" value={prvkey} onChange={(e) => setPrvKey(e.target.value)}/>
                <TextField label="publicKey" variant="outlined" value={pubkey} onChange={(e) => setPubKey(e.target.value)}/>
                <Button variant="contained" onClick={_ => regenerateKeys()}>Generate Key</Button>
            </Box>
        </Paper>

        <Paper sx={{width: "300px", padding: "5px"}}>
            <Typography variant="h5" gutterBottom>Avatar</Typography>
            <Divider/>
            <Box sx={{display: "flex", flexDirection: "column", padding: "15px", gap: "5px"}}>
                <TextField label="username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <TextField label="avatarURL" variant="outlined" value={avatar} onChange={(e) => setAvatar(e.target.value)}/>
            </Box>
        </Paper>

        <Paper sx={{width: "300px", padding: "5px"}}>
            <Typography variant="h5" gutterBottom>Post</Typography>
            <Divider/>
            <Box sx={{display: "flex", flexDirection: "column", padding: "15px", gap: "5px"}}>
                <TextField multiline rows={6} label="message" variant="outlined" value={draft} onChange={(e) => setDraft(e.target.value)}/>
                <Button variant="contained" onClick={_ => post()}>post</Button>
            </Box>
        </Paper>
    </Box>)
}

export default App
