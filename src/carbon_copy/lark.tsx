import {Alert, Box, Button, TextField} from "@mui/material";
import React, {useState} from "react";
import {useQrious} from "react-qrious";

function Lark() {

    const [server, setServer] = useState("");
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
                }} label="Webhook URL"
                           variant="outlined" required/>
                <Button type="submit" disabled={server.trim()===""} onClick={(event) => {
                    event.preventDefault();
/*                    formData.webhook = server;
                    formData.body = JSON.stringify(body);*/
                    const formData:{
                        name: string,
                        enabled: boolean,
                        har: HAR
                    } = {
                        name: "Lark",
                        enabled: true,
                        har: {
                            log: {
                                version: "1.2",
                                entries: [{
                                    request: {
                                        method: "POST",
                                        url: server,
                                        httpVersion: "HTTP/1.1",
                                        headers: [
                                            {
                                                "name": "Content-Type",
                                                "value": "application/json"
                                            },
                                            {
                                                "name": "Accept",
                                                "value": "application/json"
                                            }
                                        ],
                                        queryString: [],
                                        cookies: [],
                                        headersSize: -1,
                                        bodySize: -1,
                                        postData:{
                                            mimeType: "application/json",
                                            text: JSON.stringify({
                                                msg_type: "post",
                                                content: {
                                                    "post": {
                                                        "en_us": {
                                                            "title": "{{Title}}",
                                                            "content": [
                                                                [{
                                                                    "tag": "text",
                                                                    "text": "{{Message}}"
                                                                }
                                                                ]
                                                            ]
                                                        }
                                                    }
                                                }
                                            })
                                        }
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
                justifyContent: "center",backgroundColor: "#fff",
                padding: "1em",
            }}>
                <img src={qrCode} alt="QR Code" style={{
                    maxWidth: '100%', height: 'auto'
                }}/>
            </Box>
        </>
    );
}

export default Lark;
