import {Alert, Button, TextField} from "@mui/material";
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
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 20, mime: 'image/png'});
    return (
        <>
            <div>
                <TextField type="text"
                           value={server} onChange={(event) => {
                    setServer(event.target.value);
                }} label="Webhook URL"
                           variant="outlined" required/>
                <Button type="submit" onClick={(event) => {
                    event.preventDefault();
                    formData.webhook = server;
                    formData.body = JSON.stringify(body);
                    setValue(JSON.stringify(formData));
                    console.log(formData);
                }} variant="contained">Generate QR Code</Button>
            </div>
            <div style={{display: value ? 'none' : 'block'}}>
                <Alert variant="filled" severity="info">
                    our generated QR Code will be displayed here
                </Alert>
            </div>
            <div style={{display: value ? 'block' : 'none'}}>
                <img src={qrCode} alt="QR Code"/>
            </div>
        </>
    );
}

export default Lark;