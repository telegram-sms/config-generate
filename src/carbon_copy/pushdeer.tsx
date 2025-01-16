import {Alert, Box, Button, TextField} from "@mui/material";
import React, {useState} from "react";
import {useQrious} from "react-qrious";

function PushDeer() {
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
                    const formData:{
                        name: string,
                        enabled: boolean,
                        har: HAR
                    } ={
                        name: "PushDeer",
                        enabled: true,
                        har: {
                            log: {
                                version: "1.2",
                                entries: [{
                                    request: {
                                        method: "GET",
                                        url: `https://${server}/message/push`,
                                        httpVersion: "HTTP/1.1",
                                        headers: [],
                                        queryString: [{name: "pushkey", value: key}, {name: "text", value: "{{Title}}"}, {name: "desp", value: "{{Message}}"}, {name: "type", value: "markdown"}],
                                        cookies: [],
                                        headersSize: -1,
                                        bodySize: -1,
                                    }         
                                }]
                            }
                        }
                    }
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
