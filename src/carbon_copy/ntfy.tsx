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
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 10, mime: 'image/png'});
    const [inputOpen, setInputOpen] = useState(false);
    const [progressOpen, setProgressOpen] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertTitle, setAlertTitle] = useState("");

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const next = {...prev};
                delete next[field];
                return next;
            });
        }
    };

    type FieldKey = "server" | "topic" | "priority" | "iconUrl";

    const requiredFields: { key: FieldKey; label: string; check: () => boolean }[] = [
        {key: "server", label: "Valid server URL", check: () => server.trim().startsWith("https://")},
        {key: "topic", label: "Ntfy topic", check: () => !!topic.trim()},
        {key: "priority", label: "Priority", check: () => priority > 0},
        {key: "iconUrl", label: "Icon URL", check: () => !!iconUrl.trim()},
    ];

    const allRequiredFilled = requiredFields.every(f => f.check());

    const getFieldError = (field: FieldKey): string | undefined => {
        const f = requiredFields.find(x => x.key === field)!;
        return f.check() ? undefined : `${f.label} is required`;
    };

    const validateField = (field: FieldKey) => {
        setErrors(prev => {
            const error = getFieldError(field);
            if (error) return {...prev, [field]: error};
            const next = {...prev};
            delete next[field];
            return next;
        });
    };

    const validateForm = (): boolean => {
        const next: { [key: string]: string } = {};
        for (const f of requiredFields) {
            const error = getFieldError(f.key);
            if (error) next[f.key] = error;
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

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
                                            "name": "actions",
                                            "value": "copy, Copy extracted verification codes, {{Code}}"
                                        },
                                        {
                                            "name": "priority",
                                            "value": `${priority}`
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
            if (iconUrl) {
                formData.har.log.entries[0].request.queryString.push(
                    {
                        "name": "icon",
                        "value": `${iconUrl}`
                    }
                )
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
            setErrors({submit: e.message});
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
                    clearError("server");
                }} onBlur={() => validateField("server")}
                           label="Server URL"
                           error={!!errors.server}
                           helperText={errors.server}
                           variant="outlined"
                           required/>
                 <TextField type="text"
                    value={topic} onChange={(event) => {
                    setTopic(event.target.value);
                    clearError("topic");
                }} onBlur={() => validateField("topic")}
                           label="ntfy topic"
                           error={!!errors.topic}
                           helperText={errors.topic}
                           variant="outlined"
                           required/>
                <TextField type="text"
                        value={token} onChange={(event) => {
                        setToken(event.target.value);
                 }} label="Authentication Token"
                            variant="outlined"
                            />
                {/* <TextField type="text"
                        value={authString} onChange={(event) => {
                        setAuthString(event.target.value);
                 }} label="Basic Auth String - NOT RECOMMENDED"
                            variant="outlined"
                            /> */}
                <TextField type="number"
                            value={priority} onChange={(event) => {
                            setPriority(Number(event.target.value));
                            clearError("priority");
                        }} onBlur={() => validateField("priority")}
                           label="Priority"
                            error={!!errors.priority}
                            helperText={errors.priority}
                            variant="outlined"
                            required/>
                <TextField type="text"
                            value={iconUrl} onChange={(event) => {
                            setIconUrl(event.target.value);
                            clearError("iconUrl");
                        }} onBlur={() => validateField("iconUrl")}
                           label="Icon URL"
                            error={!!errors.iconUrl}
                            helperText={errors.iconUrl}
                            variant="outlined"
                            />

                {/* Buttons */}
                <Button type="button" onClick={() => {
                    setInputOpen(true)
                }} disabled={!allRequiredFilled}
                        variant="contained">Send configuration</Button>
                <Button type="submit" disabled={!allRequiredFilled} onClick={(event) => {
                    event.preventDefault();
                    try {
                        if (!validateForm()) return;
                        const formData = getFormData();
                        setValue(JSON.stringify(formData));
                        console.log(formData);
                    } catch (e: any) {
                        console.error(e);
                        setErrors({submit: e.message});
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
                        <li><CodeKeyword>{`Token`}</CodeKeyword> is <strong>NOT REQUIRED</strong> unless the topic is protected.</li>
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
                    <li>1: <strong>Min priority.</strong> No vibration or sound. The notification will be under the fold in "Other notifications".</li>
                    <li>2: <strong>Low priority.</strong> No vibration or sound. Notification will not visibly show up until notification drawer is pulled down.</li>
                    <li>3: <strong>Default priority.</strong> Short default vibration and sound. Default notification behavior.</li>
                    <li>4: <strong>High priority.</strong> Long vibration burst, default notification sound with a pop-over notification.</li>
                    <li>5: <strong>Max priority.</strong> Really long vibration bursts, default notification sound with a pop-over notification.</li>
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
