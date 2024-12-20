import {Alert, Button, TextField} from "@mui/material";
import React, {useState} from "react";
import {useQrious} from "react-qrious";

function Bark() {
    const [formData, setFormData] = React.useState({
            method: 0,
            webhook: "",
            body: "",
            enabled: true,
            header: ""
        }
    );
    const [server, setServer] = useState("");
    const [value, setValue] = useState('');
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 20, mime: 'image/png'});
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const {host, key} = extractHostAndKey(server);
        setFormData({
            ...formData,
            webhook: `https://${host}/${key}/{{Title}}/{{Message}}?copy={{Copy}}`
        });
        setValue(JSON.stringify(formData));
        console.log(formData);
    };
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <TextField type="text"
                           value={server} onChange={(event)=>{
                    setServer(event.target.value);
                }} label="Webhook URL"
                           variant="outlined" required/>
            </div>
            <div>
                <Button type="submit" variant="contained">Generate QR Code</Button>
            </div>
            <div style={{display: value ? 'none' : 'block'}}>
                <Alert variant="filled" severity="info">
                    our generated QR Code will be displayed here
                </Alert>
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

export default Bark;