import {Alert, Box, Button, IconButton, Link, Typography, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {useQrious} from "react-qrious";
import {encrypt} from "../crypto";
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

function generateNtfyTopic() {
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/[+/=]/g, '')
    .substring(0, 16);
}

function Ntfy() {
    // State Carbon Copy Provider Options

    const [server, setServer] = useState("https://ntfy.sh"); // Webhook URL
    const [topic, setTopic] = useState(generateNtfyTopic());
    const [token, setToken] = useState(""); // topic Token
    const [authString, setAuthString] = useState(""); // Http Basic Auth
    const [priority, setPriority] = useState(3); // Notification Priority
    const [iconUrl, setIconUrl] = useState("https://avatars.githubusercontent.com/u/50076056?s=128&v=4"); // Notification icon

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
        const result = await encrypt(configJson, password);
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
            var formData: {
                name: string,
                enabled: boolean,
                har: HAR,
            } = {
                name: "Ntfy",
                enabled: true,
                har: {
                    log: {
                        "version": "1.2",
                        "entries": [
                            {
                                "request": {
                                    "method": "POST",
                                    "url": `${server}/${topic}`,
                                    "httpVersion": "HTTP/1.1",
                                    "cookies": [],
                                    "headers": [
                                    ],
                                    "queryString": [
                                        {
                                            "name": "title",
                                            "value": "{{Title}}"
                                        },
                                        {
                                            "name": "priority",
                                            "value": `${priority}`
                                        },
                                        {
                                            "name": "actions",
                                            "value": "copy, Copy extracted verification codes, {{Code}}"
                                        },
                                        {
                                            "name": "icon",
                                            "value": `${iconUrl}`
                                        }
                                    ],
                                    "headersSize": -1,
                                    "bodySize": -1,
                                    "postData": {
                                        "mimeType": "text/plain",
                                        "text": "{{Message}}"
                                    }
                                }
                            }
                        ]
                        }

                    }
                }
            if (token){
                formData.har.log.entries[0].request.headers.push(
                    {
                        "name": "Authorization",
                        "value": `Bearer ${token}`
                    }
                )
            } else if(authString){
                formData.har.log.entries[0].request.headers.push(
                    {
                        "name": "Authorization",
                        "value": `Basic ${btoa(authString)}`
                    }
                )
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
                    value={topic} onChange={(event) => {
                    setTopic(event.target.value);
                }} label="ntfy topic"
                           error={errorMessage !== ''}
                           helperText={errorMessage}
                           variant="outlined"
                           required/>
                <TextField type="text"
                        value={token} onChange={(event) => {
                        setToken(event.target.value);
                 }} label="Authentication Token"
                            error={errorMessage !== ''}
                            helperText={errorMessage}
                            variant="outlined"
                            />
                {/* <TextField type="text"
                        value={authString} onChange={(event) => {
                        setAuthString(event.target.value);
                 }} label="Basic Auth String - NOT RECOMMENDED"
                            error={errorMessage !== ''}
                            helperText={errorMessage}
                            variant="outlined"
                            /> */}
                <TextField type="number"
                            value={priority} onChange={(event) => {
                            setPriority(Number(event.target.value));
                        }} label="Priority"
                            error={errorMessage !== ''}
                            helperText={errorMessage}
                            variant="outlined"
                            required/>
                <TextField type="text"
                            value={iconUrl} onChange={(event) => {
                            setIconUrl(event.target.value);
                        }} label="Icon URL"
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
                    Note
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <ul>
                        <li><CodeKeyword>{`Token`}</CodeKeyword> is <strong>NOT REQUIRED</strong> and is dependant to your server and topic.</li>
                        {/* <li><CodeKeyword>{`Basic Auth String`}(username:password)</CodeKeyword> is <strong>NOT REQUIRED</strong> and <strong>STRONGLY DISCOURAGED</strong>. USE TOKEN IF POSSIBLE.</li> */}
                    </ul>
                </Typography>
                <Typography variant="h4" gutterBottom>
                    <Link href="https://docs.ntfy.sh/publish/#message-priority" target="_blank" rel="noopener">
                        Notification Priority
                    </Link>
                </Typography>
              <Typography >
                For more information, please refer to the following descriptions (the default level is 5):
                </Typography>
                <ul>
                    <li>1: Min priority. No vibration or sound. The notification will be under the fold in "Other notifications".</li>
                    <li>2: Low priority. No vibration or sound. Notification will not visibly show up until notification drawer is pulled down.</li>
                    <li>3: Default priority. Short default vibration and sound. Default notification behavior.</li>
                    <li>4: High priority. Long vibration burst, default notification sound with a pop-over notification.</li>
                    <li>5: Max priority. Really long vibration bursts, default notification sound with a pop-over notification.</li>
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

export default Ntfy;
