import {Alert, Box, Button, TextField} from "@mui/material";
import React, {useState} from "react";
import {useQrious} from "react-qrious";
import {encrypt} from "../wasm";
import getHttpStatusMessage from "../constants/http";
import ProgressDialog from "../components/ProgressDialog";
import AlertDialog from "../components/AlertDialog";
import InputDialog from "../components/InputDialog";

function PushDeer() {
    const [server, setServer] = useState("api2.pushdeer.com");
    const [key, setKey] = useState("");
    const [value, setValue] = useState('');
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 10, mime: 'image/png'});

    const [inputOpen, setInputOpen] = useState(false);
    const [progressOpen, setProgressOpen] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertTitle, setAlertTitle] = useState("");

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
        return formData;
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
                }} label="Endpoint"
                           variant="outlined" required/>
                <TextField type="text"
                           value={key} onChange={(event) => {
                    setKey(event.target.value.trim());
                }} label="Pushkey"
                           variant="outlined" required/>
                <Button type="button" onClick={() => {
                    setInputOpen(true)
                }} disabled={server.trim() === "" || key.trim() === ""}
                        variant="contained">Send configuration</Button>
                <Button type="submit" disabled={server.trim() === "" || key.trim() === ""} onClick={(event) => {
                    event.preventDefault();
                    const formData = getFormData();
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
