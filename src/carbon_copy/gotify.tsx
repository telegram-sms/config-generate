import {Alert, Box, Button, IconButton, Link, Typography, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {useQrious} from "react-qrious";
import {encrypt} from "../wasm/wasm_rs";
import getHttpStatusMessage from "../constants/http";
import InputDialog from "../components/InputDialog";
import ProgressDialog from "../components/ProgressDialog";
import AlertDialog from "../components/AlertDialog";
import DataDisplay from "../components/DataDisplay";
import styled from "@emotion/styled";

const CodeKeyword = styled.code`
    color: deeppink;
    background-color: #f9f2f4;
    padding: 2px 4px;
    border-radius: 4px;
`;

function Gotify() {
    // State Carbon Copy Provider Options

    const [server, setServer] = useState(""); // Webhook URL
    const [token, setToken] = useState(""); // App Token
    const [priority, setPriority] = useState(5); // Notification Priority

    // Provider Options Ends here

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

            {/* Main Form */}
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2
            }}>
                {/* Carbon Copy Provider Options Display */}
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
                
                {/* Buttons */}
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

            {/* Data Display, including QR Code and HAR Config */}
            <DataDisplay value={value}/>

            {/* Comments */}
             {/* Comments */}
             <Box component="section" sx={{ paddingTop: "20px" }}>
                <Typography variant="h4" gutterBottom>
                    Comment Parameters
                </Typography>
                <Typography variant="body1" gutterBottom>
                    You can use the following keywords within the request URL or body. The system will automatically
                    replace these keywords with their corresponding values based on the template you provide:
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <ul>
                        <li><CodeKeyword>{`{{Title}}`}</CodeKeyword>: Represents the title of the message.</li>
                        <li><CodeKeyword>{`{{Message}}`}</CodeKeyword>: Represents the content of the message.</li>
                        <li><CodeKeyword>{`{{Code}}`}</CodeKeyword>: Represents the verification code associated with the
                            message. </li>
                    </ul>
                </Typography>
                <Typography variant="h4" gutterBottom>
                    <Link href="https://github.com/gotify/android?tab=readme-ov-file#message-priorities" target="_blank" rel="noopener">
                        Notification Priority
                    </Link>
                </Typography>
              <Typography >
                For more information, please refer to the following descriptions (the default level is 5):
                </Typography>
                <ul>
                    <li>0: No notification is displayed.</li>
                    <li>1-3: An icon is displayed in the notification bar.</li>
                    <li>4-7: An icon is displayed in the notification bar, accompanied by a sound.</li>
                    <li>8-10: An icon is displayed in the notification bar, accompanied by both sound and vibration.</li>
                </ul>
            </Box>
        </>
    );
}

// function decodeHtmlEntities(str: string) { 
//     const textarea = document.createElement('textarea'); 
//     textarea.innerHTML = str; 
//     return textarea.value; 
// } 

export default Gotify;
