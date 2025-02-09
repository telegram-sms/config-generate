import {Alert, Box, Button, Link, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useQrious} from "react-qrious";
import {encrypt} from "../wasm/wasm_rs";
import getHttpStatusMessage from "../constants/http";
import InputDialog from "../components/InputDialog";
import ProgressDialog from "../components/ProgressDialog";
import AlertDialog from "../components/AlertDialog";

function Gotify() {

    const [server, setServer] = useState("");
    const [token, setToken] = useState("");
    const [priority, setPriority] = useState(5);
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
            const formData: {
                name: string,
                enabled: boolean,
                har: HAR,
            } = {
                name: "Gotify",
                enabled: true,
                har: {    
                    log: {
                        "version": "1.2",
                        "entries": [
                            {
                                "request": {
                                    "method": "POST",
                                    "url": `${server}`,
                                    "httpVersion": "HTTP/1.1",
                                    "cookies": [],
                                    "headers": [
                                        {
                                            "name": "Content-Type",
                                            "value": "application/json"
                                        }
                                    ],
                                    "queryString": [
                                        {
                                            "name": "token",
                                            "value": token
                                        }
                                    ],
                                    "headersSize": -1,
                                    "bodySize": -1,
                                    "postData": {
                                        "mimeType": "application/json",
                                        "text": `{\"message\": \"{{Message}}\", \"title\": \"{{Title}}\", \"priority\":${priority}, \"extras\": {\"client::display\": {\"contentType\": \"text/markdown\"}}}`
                                    }
                                }
                            }
                        ]
                        }
                    
                }
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
                // noinspection JSIgnoredPromiseFromCall
                if (value !== "") {
                    const result = await handleSendConfig(value, getFormData());
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
                }} label="Server URL"
                           error={errorMessage !== ''}
                           helperText={errorMessage}
                           variant="outlined" 
                           required/>
                <TextField type="text"
                        value={token} onChange={(event) => {
                        setToken(event.target.value);
                 }} label="Token"
                            error={errorMessage !== ''}
                            helperText={errorMessage}
                            variant="outlined" 
                            required/>
                <TextField type="number"
                            value={priority} onChange={(event) => {
                            setPriority(Number(event.target.value));
                        }} label="Priority"
                            error={errorMessage !== ''}
                            helperText={errorMessage}
                            variant="outlined" 
                            required/>
                <Button type="button" onClick={() => {
                    setInputOpen(true)
                }} disabled={server.trim() === ""}
                        variant="contained">Send configuration</Button>
                <Button type="submit" disabled={server.trim() === ""} onClick={(event) => {
                    event.preventDefault();
                    try {
                        const formData = getFormData();
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
            <Box component="section" sx={{paddingBottom: "20px"}}>
                <h2>COMMENT</h2>
                <p>In the request URL, Body, the following keywords can be used. The system will automatically replace
                    these keywords based on the template you provide.</p>
                <ul>
                    <li>{"{{Title}}: The title of the message"}</li>
                    <li>{"{{Message}}: The content of the message"}</li>
                    <li>{"{{Code}}: The Verification code of the message"}</li>
                </ul>
                <p>For <a href="https://github.com/gotify/android?tab=readme-ov-file#message-priorities" target="_blank" rel="noopener">Notification Priority</a>, the reference values are listed below (default level is 5):</p>
                <ul>
                    <li>0: No notification</li>
                    <li>1-3: Icon in notification bar</li>
                    <li>4-7: Icon in notification bar + Sound</li>
                    <li>8-10: Icon in notification bar + Sound + Vibration</li>
                </ul>
            </Box>
        </>
    );
}

function decodeHtmlEntities(str: string) { 
    const textarea = document.createElement('textarea'); 
    textarea.innerHTML = str; 
    return textarea.value; 
} 

export default Gotify;
