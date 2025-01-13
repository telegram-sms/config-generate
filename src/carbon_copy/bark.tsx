import {Alert, Autocomplete, Box, Button, FormControlLabel, Switch, TextField} from "@mui/material";
import React, {useState} from "react";
import {useQrious} from "react-qrious";

function Bark() {
    const [server, setServer] = useState("");
    const [icon, setIcon] = useState("https://avatars.githubusercontent.com/u/50076056?s=128&v=4");
    const [value, setValue] = useState("");
    const [qrCode, _qrious] = useQrious({value, size: 512, mime: 'image/png'});
    const barkSounds = [
        "alarm", "anticipate", "bell", "birdsong", "bloom", "calypso", "chime", "choo", "descent", "electronic", "fanfare", "gathering", "glass", "gotosleep", "healthnotification", "horn", "ladder", "mailsent", "minuet", "multiwayinvitation", "newmail", "newsflash", "noir", "paymentsuccess", "shake", "sherwoodforest", "silence", "spell", "suspense", "telegraph", "tiptoes", "typewriters", "update", "uplift", "voicemail"
    ];
    const [useRingtone, setUseRingtone] = useState(false);
    const [ringtone, setRingtone] = useState("alarm");
    const barkGroups = [
        "{{Title}}", "Telegram SMS", "Home", "Work"
    ];
    const [useGroup, setUseGroup] = useState(false);
    const [group, setGroup] = useState("{{Title}}");
    const [useTimeSensitive, setTimeSensitive] = useState(false);

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
                <TextField type="text" value={icon} onChange={(event) => {
                    setIcon(event.target.value.trim());
                }} label="Icon URL" variant="outlined" required/>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column", gap: 1
                }}>
                    <FormControlLabel control={<Switch name="time_sensitive"
                                                       checked={useTimeSensitive}
                                                       onChange={() => {
                                                           useTimeSensitive ? setTimeSensitive(false) : setTimeSensitive(true);
                                                       }}
                                                       color="warning"/>}
                                      label="Time Sensitive"/>
                    <FormControlLabel control={<Switch name="fallback_sms"
                                                       checked={useRingtone}
                                                       onChange={() => {
                                                           useRingtone ? setUseRingtone(false) : setUseRingtone(true);
                                                       }}
                                                       color="warning"/>}
                                      label="Using RingTone"/>
                    <Autocomplete
                        style={{display: useRingtone ? 'block' : 'none'}}
                        freeSolo
                        options={barkSounds}
                        value={ringtone}
                        onChange={(event, newValue) => {
                            setRingtone(newValue ? newValue : "alarm")
                        }}
                        renderInput={(params) => <TextField {...params} label="Sounds"/>}
                    />
                    <FormControlLabel control={<Switch name="use_group"
                                                       checked={useGroup}
                                                       onChange={() => {
                                                           useGroup ? setUseGroup(false) : setUseGroup(true);
                                                       }}
                                                       color="warning"/>}
                                      label="Using Group"/>
                    <Autocomplete
                        style={{display: useGroup ? 'block' : 'none'}}
                        freeSolo
                        options={barkGroups}
                        value={group}
                        onChange={(event, newValue) => {
                            setGroup(newValue ? newValue : "{{Title}}")
                        }}
                        renderInput={(params) => <TextField {...params} label="Group"/>}
                    />
                </Box>
                <Button type="submit" disabled={server.trim() === ""} onClick={(event) => {
                    event.preventDefault();
                    const {host, key} = extractHostAndKey(server);
                    const formData = {
                        method: 0,
                        webhook: "",
                        body: "",
                        enabled: true,
                        header: ""
                    }
                    formData.webhook = `https://${host}/${key}/{{Title}}/{{Message}}?copy={{Code}}&icon=${encodeURIComponent(icon)}`;
                    if (useRingtone) {
                        formData.webhook += `&sound=${ringtone}`;
                    }
                    if (useGroup) {
                        formData.webhook += `&group=${group}`;
                    }
                    if (useTimeSensitive) {
                        formData.webhook += `&level=timeSensitive`;
                    }
                    const Json = JSON.stringify(formData)
                    setValue(Json);
                }} variant="contained" color="warning">Generate QR Code</Button>
            </Box>
            <Box sx={{display: value ? 'none' : 'block', marginTop: 2}}>
                <Alert variant="filled" severity="info">
                    Your generated QR Code will be displayed here
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

function extractHostAndKey(url: string) {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const key = urlObj.pathname.split('/')[1];
    return {host, key};
}

export default Bark;
