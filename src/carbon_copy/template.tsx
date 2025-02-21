import { Alert, Box, Button, TextField, Typography, Link } from "@mui/material";
import React, { useState } from "react";
import { useQrious } from "react-qrious";
import { encrypt } from "../wasm/wasm_rs";
import getHttpStatusMessage from "../constants/http";
import ProgressDialog from "../components/ProgressDialog";
import AlertDialog from "../components/AlertDialog";
import InputDialog from "../components/InputDialog";
import DataDisplay from "../components/DataDisplay";
import styled from "@emotion/styled";

const CodeKeyword = styled.code`
    color: deeppink;
    background-color: #f9f2f4;
    padding: 2px 4px;
    border-radius: 4px;
`;


function Template () {
    // State Carbon Copy Provider Options
    const [server, setServer] = useState("");
    const [value, setValue] = useState("");


    const [qrCode, _qrious] = useQrious({ value, size: 512, padding: 10, mime: "image/png" });

    const [inputOpen, setInputOpen] = useState(false);
    const [progressOpen, setProgressOpen] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertTitle, setAlertTitle] = useState("");

    async function handleSendConfig (password: string, fromData: any) {
        if (!fromData) {
            return;
        }
        const configJson = JSON.stringify(fromData);
        const result = encrypt(configJson, password);
        const data = {
            encrypt: result,
        };
        setProgressMessage("Transmitting, please wait...");
        setProgressOpen(true);
        try {
            const response = await fetch("https://api.telegram-sms.com/cc-config", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error("Network response: " + getHttpStatusMessage(response.status));
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
    function getFormData () {
        const formData: {
            name: string;
            enabled: boolean;
            har: HAR;
        } = {
            name: "Lark", // Carbon Copy Provider Name To be displayed in the App
            enabled: true,
            har: {
                log: {
                    version: "1.2",
                    entries: [
                        {
                            request: {
                                method: "POST", // You have to write postData for POST request, otherwise leave it empty
                                url: server,
                                httpVersion: "HTTP/1.1",
                                headers: [
                                    {
                                        name: "Content-Type",
                                        value: "application/json",
                                    },
                                    {
                                        name: "Accept",
                                        value: "application/json",
                                    },
                                ],
                                queryString: [],
                                cookies: [],
                                headersSize: -1,
                                bodySize: -1,
                                postData: {
                                    mimeType: "application/json",
                                    text: JSON.stringify({
                                        msg_type: "post",
                                        content: {
                                            post: {
                                                en_us: {
                                                    title: "{{Title}}",
                                                    content: [
                                                        [
                                                            {
                                                                tag: "text",
                                                                text: "{{Message}}",
                                                            },
                                                        ],
                                                    ],
                                                },
                                            },
                                        },
                                    }),
                                },
                            },
                        },
                    ],
                },
            },
        };
        return formData;
    }

    return (
        <>
            <ProgressDialog open={progressOpen} title="Loading" message={progressMessage} />
            <AlertDialog
                open={alertOpen}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertOpen(false)}
            />
            <InputDialog
                open={inputOpen}
                title="Please enter password"
                onClose={async value => {
                    setInputOpen(false);
                    const result = await handleSendConfig(value, getFormData());
                    if (result.key) {
                        setAlertTitle("Send configuration");
                        setAlertMessage(`Configuration sent successfully. \nID: ${result.key}`);
                        setAlertOpen(true);
                    }
                }}
                onVerify={value => {
                    if (value === "") {
                        return { state: false, msg: "Password cannot be empty" };
                    }
                    if (value.length < 6) {
                        return { state: false, msg: "Password length must be greater than 6" };
                    }
                    return { state: true, msg: "" };
                }}
                label="Password"
                type="password"
            ></InputDialog>

            {/* Main Content */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {/* Carbon Copy Provider Options Display */}
                <TextField
                    type="text"
                    value={server}
                    onChange={event => {
                        setServer(event.target.value.trim());
                    }}
                    label="Webhook URL"
                    variant="outlined"
                    required
                />
                
                {/* Buttons */}
                <Button
                    type="button"
                    onClick={() => {
                        setInputOpen(true);
                    }}
                    disabled={server.trim() === ""}
                    variant="contained"
                >
                    Send configuration
                </Button>
                <Button
                    type="submit"
                    disabled={server.trim() === ""}
                    onClick={event => {
                        event.preventDefault();
                        const formData = getFormData();
                        setValue(JSON.stringify(formData));
                        console.log(formData);
                    }}
                    variant="contained"
                    color="warning"
                >
                    Generate QR Code
                </Button>
            </Box>

            {/* Data Display, including QR Code and HAR Config */}
            <DataDisplay value={value} debug={true} />

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

export default Template;
