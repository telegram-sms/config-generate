import {Alert, Box, Button, Link, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useQrious} from "react-qrious";
import * as curlconverter from "curlconverter";
import {encrypt} from "../wasm";
import getHttpStatusMessage from "../constants/http";
import InputDialog from "../components/InputDialog";
import ProgressDialog from "../components/ProgressDialog";
import AlertDialog from "../components/AlertDialog";

function Lark() {

    const [server, setServer] = useState("");
    const [value, setValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 10, mime: 'image/png'});
    const [inputOpen, setInputOpen] = useState(false);
    const [progressOpen, setProgressOpen] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertTitle, setAlertTitle] = useState("");
    useEffect(() => {
        setErrorMessage("")
    }, [server]);

    async function handleSendConfig(password: string, fromData: any) {
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

    return (
        <>
            <ProgressDialog open={progressOpen} title="Loading" message={progressMessage}/>
            <AlertDialog open={alertOpen} title={alertTitle} message={alertMessage}
                         onClose={() => setAlertOpen(false)}/>
            <InputDialog open={inputOpen} title="Please enter password" onClose={async (value) => {
                setInputOpen(false);
                // noinspection JSIgnoredPromiseFromCall
                if (value !== "") {
                    const formData: {
                        name: string,
                        enabled: boolean,
                        har: HAR
                    } = {
                        name: "Curl",
                        enabled: true,
                        har: JSON.parse(curlconverter.toHarString(server))
                    }
                    const result = await handleSendConfig(value, formData);
                    if (result.key) {
                        setAlertTitle("Send configuration")
                        setAlertMessage(`Configuration sent successfully. \nID: ${result.key}`);
                        setAlertOpen(true);
                    }
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
                    setServer(event.target.value);
                }} label="Curl Command"
                           error={errorMessage !== ''}
                           helperText={errorMessage}
                           variant="outlined" multiline
                           maxRows={4} required/>
                <Button type="button" onClick={() => {
                    try {
                        curlconverter.toHarString(server)
                    } catch (e: any) {
                        console.error(e);
                        setErrorMessage(e.message);
                        return;
                    }
                    setInputOpen(true)
                }} disabled={server.trim() === ""}
                        variant="contained">Send configuration</Button>
                <Button type="submit" disabled={server.trim() === ""} onClick={(event) => {
                    event.preventDefault();
                    try {
                        const formData: {
                            name: string,
                            enabled: boolean,
                            har: HAR
                        } = {
                            name: "Curl",
                            enabled: true,
                            har: JSON.parse(curlconverter.toHarString(server))
                        }
                        setValue(JSON.stringify(formData));
                        console.log(formData);
                    } catch (e: any) {
                        console.error(e);
                        setErrorMessage(e.message);
                    }
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
            <Box component="section" sx={{paddingBottom: "20px"}}>
                <h2>COMMENT</h2>
                <p>In the request URL, Body, the following keywords can be used. The system will automatically replace
                    these keywords based on the template you provide.</p>
                <ul>
                    <li>{"{{Title}}: The title of the message"}</li>
                    <li>{"{{Message}}: The content of the message"}</li>
                    <li>{"{{Code}}: The Verification code of the message"}</li>
                </ul>
            </Box>
        </>
    );
}

export default Lark;
