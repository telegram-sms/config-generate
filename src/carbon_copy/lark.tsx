import {Button, TextField} from "@mui/material";
import React, {useState} from "react";
import {useQrious} from "react-qrious";

function Lark() {
    const [formData, setFormData] = React.useState({
            method: 0,
            webhook: "",
            body: "",
            enabled: true,
            header: ""
        }
    );

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
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormData({
            ...formData,
            webhook: server,
            body: JSON.stringify(body)
        });
        setValue(JSON.stringify(formData));
        console.log(formData);
    };
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <TextField type="text"
                           value={server} onChange={(event) => {
                    setServer(event.target.value);
                }} label="Webhook URL"
                           variant="outlined" required/>
            </div>
            <div>
                <Button type="submit" variant="contained">Generate QR Code</Button>
            </div>
            <div style={{display: value ? 'none' : 'block'}}>Your generated QR Code will be
                displayed here
            </div>
            <div style={{display: value ? 'block' : 'none'}}>
                <img src={qrCode} alt="QR Code"/>
            </div>
        </form>
    )
        ;
}

function extractHostAndKey(url: string) {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const key = urlObj.pathname.split('/')[1];
    return {host, key};
}

export default Lark;