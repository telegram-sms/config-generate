import {Alert, Autocomplete, Button, FormControlLabel, Switch, TextField} from "@mui/material";
import React, {useState} from "react";
import {useQrious} from "react-qrious";

function Bark() {
    const [server, setServer] = useState("");
    const [icon, setIcon] = useState("https://avatars.githubusercontent.com/u/50076056?s=128&v=4");
    const [value, setValue] = useState("");
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 20, mime: 'image/png'});
    const barkSounds = [
        "alarm", "anticipate", "bell", "birdsong", "bloom", "calypso", "chime", "choo", "descent", "electronic", "fanfare", "gathering", "glass", "gotosleep", "healthnotification", "horn", "ladder", "mailsent", "minuet", "multiwayinvitation", "newmail", "newsflash", "noir", "paymentsuccess", "shake", "sherwoodforest", "silence", "spell", "suspense", "telegraph", "tiptoes", "typewriters", "update", "uplift", "voicemail"
    ];
    const [useRingtone, setUseRingtone] = useState(false);
    const [ringtone, setRingtone] = useState("alarm");
    return (
        <>
            <div>
                <TextField type="text"
                           value={server} onChange={(event) => {
                    setServer(event.target.value);
                }} label="Webhook URL"
                           variant="outlined" required/>
                <TextField type="text" value={icon} onChange={(event) => {
                    setIcon(event.target.value);
                }} label="Icon URL" variant="outlined" required/>
                <Button type="submit" onClick={(event) => {
                    event.preventDefault();
                    const {host, key} = extractHostAndKey(server);
                    const formData = {
                        method: 0,
                        webhook: "",
                        body: "",
                        enabled: true,
                        header: ""
                    }
                    formData.webhook = `https://${host}/${key}/{{Title}}/{{Message}}?copy={{Copy}}&icon=${encodeURIComponent(icon)}`;
                    if (useRingtone) {
                        formData.webhook += `&sound=${ringtone}`;
                    }
                    const Json = JSON.stringify(formData)
                    setValue(Json);
                }} variant="contained">Generate QR Code</Button>
            </div>
            <div>
                <FormControlLabel control={<Switch name="fallback_sms"
                                                   checked={useRingtone}
                                                   onChange={()=>{
                                                       useRingtone ? setUseRingtone(false) : setUseRingtone(true);
                                                   }}/>}
                                  label="Using RingTone"/>
                <Autocomplete
                    style={{display: useRingtone ? 'block' : 'none'}}
                    freeSolo
                    options={barkSounds}
                    value={ringtone}
                    onChange={(event, newValue) => {setRingtone(newValue?newValue:"alarm")}}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Sounds" />}
                />
            </div>
            <div style={{display: value ? 'none' : 'block'}}>
                <Alert variant="filled" severity="info">
                    Your generated QR Code will be displayed here
                </Alert>
            </div>
            <div style={{display: value ? 'block' : 'none'}}>
                <img src={qrCode} alt="QR Code"/>
            </div>
        </>
    );
}

function extractHostAndKey(url: string) {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const key = urlObj.pathname.split('/')[1];
    return {host, key};
}

export default Bark;