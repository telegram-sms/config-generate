import {Alert, Box, Button, TextField} from "@mui/material";
import React, {useState} from "react";
import {useQrious} from "react-qrious";

function Lark() {
    const formData = {
            method: 1,
            webhook: "",
            body: "",
            enabled: true,
            header: ""
        };

    const body = {
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
    };

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
                <Button type="submit" onClick={(event) => {
                    event.preventDefault();
                    formData.webhook = server;
                    formData.body = JSON.stringify(body);
                    setValue(JSON.stringify(formData));
                    console.log(formData);
                }} variant="contained">Generate QR Code</Button>
            </Box>
            <Box sx={{display: value ? 'none' : 'block', marginTop: 2}}>
                <Alert variant="filled" severity="info">
                    our generated QR Code will be displayed here
                </Alert>
            </Box>
            <Box sx={{
                display: value ? 'flex' : 'none', marginTop: 2, alignItems: "center",
                justifyContent: "center"
            }}>
                <img src={qrCode} alt="QR Code"/>
            </Box>
        </>
    );
}

export default Lark;
