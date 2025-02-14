import {Alert, Box, Button, IconButton, Link, Typography, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useQrious} from "react-qrious";
import * as curlconverter from "curlconverter";
import {encrypt} from "../wasm";
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

function Curl() {
    // State Carbon Copy Provider Options

    const [curlCommand, setcurlCommand] = useState(""); // Curl Command

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
    }, [curlCommand]);

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
        const formData: {
            name: string,
            enabled: boolean,
            har: HAR
        } = {
            name: "Curl",
            enabled: true,
            har: JSON.parse(curlconverter.toHarString(curlCommand))
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
                           value={curlCommand} onChange={(event) => {
                    setcurlCommand(event.target.value);
                }} label="Curl Command"
                           error={errorMessage !== ''}
                           helperText={errorMessage}
                           variant="outlined" multiline
                           maxRows={4} required/>
                <Button type="button" onClick={() => {
                    try {
                        curlconverter.toHarString(curlCommand)
                    } catch (e: any) {
                        console.error(e);
                        setErrorMessage(e.message);
                        return;
                    }
                    setInputOpen(true)
                }} disabled={curlCommand.trim() === ""}
                        variant="contained">Send configuration</Button>
                <Button type="submit" disabled={curlCommand.trim() === ""} onClick={(event) => {
                    event.preventDefault();
                    try {
                        const formData = getFormData();
                        setValue(JSON.stringify(formData));
                        console.log(formData);
                    } catch (e: any) {
                        console.error(e);
                        setErrorMessage(e.message);
                    }
                }} variant="contained" color="warning">Generate QR Code / HAR Config</Button>
            </Box>
            {/* Data Display, including QR Code and HAR Config */}
            <DataDisplay value={value} debug={true}/>
            
             {/* Comments */}
             <Box component="section" sx={{ paddingBottom: "20px" }}>
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
            </Box>
        </>
    );
}

export default Curl;
