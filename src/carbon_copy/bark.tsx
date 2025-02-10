import {Alert, Autocomplete, Box, Button, FormControlLabel, Switch, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useQrious} from "react-qrious";
import ProgressDialog from "../components/ProgressDialog";
import AlertDialog from "../components/AlertDialog";
import InputDialog from "../components/InputDialog";
import {encrypt} from "../wasm";
import getHttpStatusMessage from "../constants/http";
import DataDisplay from "../components/DataDisplay";

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

    const [inputOpen, setInputOpen] = useState(false);
    const [progressOpen, setProgressOpen] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertTitle, setAlertTitle] = useState("");
    const [errorMessage, setErrorMessage] = useState('');


    useEffect(() => {
        setErrorMessage("")
    }, [server]);

    async function handleSendConfig(password: string, fromData: any) {
        if(!fromData) {
            return;
        }
        const configJson = JSON.stringify(fromData);
        const result = encrypt(configJson, password);
        const data = {
            encrypt: result
        }
        setProgressMessage("Transmitting, please wait...");
        setProgressOpen(true);
        try {
            const response = await fetch('https://api.telegram-sms.com/cc-config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('Network response: ' + getHttpStatusMessage(response.status));
            }
            return await response.json();
        } catch (error: any) {
            setAlertTitle("Error");
            setAlertMessage(error.message);
            setAlertOpen(true);
        } finally {
            setProgressOpen(false);
        }
    }
    function getFormData() {
        try {
            const {host, key} = extractHostAndKey(server);
            const formData: {
                name: string,
                enabled: boolean,
                har: HAR,
            } = {
                name: "Bark",
                enabled: true,
                har: {
                    log: {
                        version: "1.2",
                        entries: [{
                            request: {
                                method: "GET",
                                url: `https://${host}/${key}/{{Title}}/{{Message}}`,
                                httpVersion: "HTTP/1.1",
                                headers: [],
                                queryString: [{name: "copy", value: "{{Code}}"}, {
                                    name: "icon",
                                    value: icon
                                }],
                                cookies: [],
                                headersSize: -1,
                                bodySize: -1,
                            }
                        }]
                    }
                }
            }
            if (useRingtone) {
                formData.har.log.entries[0].request.queryString.push({name: "sound", value: ringtone});
            }
            if (useGroup) {
                formData.har.log.entries[0].request.queryString.push({name: "group", value: group});
            }
            if (useTimeSensitive) {
                formData.har.log.entries[0].request.queryString.push({name: "level", value: "timeSensitive"});
            }
            return formData;
        }catch (e: any) {
            setErrorMessage(e.message);
            console.error(e);
        }
    }

    return (
        <>
            <ProgressDialog open={progressOpen} title="Loading" message={progressMessage}/>
            <AlertDialog open={alertOpen} title={alertTitle} message={alertMessage}
                         onClose={() => setAlertOpen(false)}/>
            <InputDialog open={inputOpen} title="Please enter password" onClose={async (value) => {
                setInputOpen(false);
                const result = await handleSendConfig(value, getFormData());
                if (result.key) {
                    setAlertTitle("Send configuration")
                    setAlertMessage(`Configuration sent successfully. \nID: ${result.key}`);
                    setAlertOpen(true);
                }
            }} onVerify={
                (value) => {
                    if (value === "") {
                        return {state: false, msg: "Password cannot be empty"};
                    }
                    if (value.length < 6) {
                        return {state: false, msg: "Password length must be greater than 6"};
                    }
                    return {state: true, msg: ""};
                }
            } label="Password" type="password"></InputDialog>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2
            }}>
                <TextField type="text"
                           value={server} onChange={(event) => {
                    setServer(event.target.value.trim());
                }} label="Webhook URL"
                           error={errorMessage !== ''}
                           helperText={errorMessage}
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
                <Button type="button" onClick={() => {
                    setInputOpen(true)
                }} disabled={server.trim() === ""}
                        variant="contained">Send configuration</Button>
                <Button type="submit" disabled={server.trim() === ""} onClick={(event) => {
                    event.preventDefault();
                    try {
                        const Json = JSON.stringify(getFormData());
                        setValue(Json);
                    }catch (e: any) {
                        setAlertTitle("Error");
                        setAlertMessage(e.message);
                        setAlertOpen(true);
                        console.error(e);
                    }


                }} variant="contained" color="warning">Generate QR Code/ HAR Config</Button>
            </Box>
            <DataDisplay value={value}/>

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
