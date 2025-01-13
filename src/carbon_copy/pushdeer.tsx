import {Alert, Box, Button, TextField} from "@mui/material";
import React, {useState} from "react";
import {useQrious} from "react-qrious";

function PushDeer() {

    const formData = {
        name: "PushDeer",
        method: 1,
        webhook: "",
        body: "",
        enabled: true,
        header: ""
    };


    const [server, setServer] = useState("api2.pushdeer.com");
    const [key, setKey] = useState("");
    const [value, setValue] = useState('');
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 10, mime: 'image/png'});
    return (
        <>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2
            }}>
                <TextField type="text"
                           value={server} onChange={(event) => {
                    setServer(event.target.value.trim());
                }} label="Endpoint"
                           variant="outlined" required/>
                <TextField type="text"
                           value={key} onChange={(event) => {
                    setKey(event.target.value.trim());
                }} label="Pushkey"
                           variant="outlined" required/>
                <Button type="submit" disabled={server.trim() === "" || key.trim() === ""} onClick={(event) => {
                    event.preventDefault();
                    formData.webhook = `https://${server}/message/push?pushkey=${key}&text={{Title}}&desp={{Message}}&type=markdown`;
                    setValue(JSON.stringify(formData));
                    console.log(formData);
                }} variant="contained" color="warning">Generate QR Code</Button>
            </Box>
            <Box sx={{display: value ? 'none' : 'block', marginTop: 2}}>
                <Alert variant="filled" severity="info">
                    our generated QR Code will be displayed here
                </Alert>
            </Box>
            <Box sx={{
                display: value ? 'flex' : 'none', marginTop: 2, alignItems: "center",
                justifyContent: "center", backgroundColor: "#fff",
                padding: "1em",
            }}>
                <img src={qrCode} alt="QR Code" style={{
                    maxWidth: '100%', height: 'auto'
                }}/>
            </Box>
        </>
    );
}

export default PushDeer;
