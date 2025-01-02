import React, {useEffect, useRef, useState} from 'react';
import {Alert, AlertTitle, Box, Button, FormControlLabel, Switch, TextField} from "@mui/material";
import {useQrious} from 'react-qrious'
import ProgressDialog from './components/ProgressDialog';
import SimpleDialog from "./components/SimpleDialog";
import InputDialog from "./components/InputDialog";
import AlertDialog from "./components/AlertDialog";
import './wasm_exec.js';

interface FormData {
    bot_token: string;
    chat_id: string;
    topic_id: string;
    trusted_phone_number: string;
    battery_monitoring_switch: boolean;
    charger_status: boolean;
    chat_command: boolean;
    fallback_sms: boolean;
    privacy_mode: boolean;
    verification_code: boolean;
}

const ConfigQrcode: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        bot_token: '',
        chat_id: '',
        topic_id: '',
        trusted_phone_number: '',
        battery_monitoring_switch: false,
        charger_status: false,
        chat_command: false,
        fallback_sms: false,
        privacy_mode: false,
        verification_code: false
    });
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const [progressOpen, setProgressOpen] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [inputOpen, setInputOpen] = useState(false);
    const [lists, setLists] = useState<string[]>([]);
    const [chatIDList, setChatIDList] = useState<string[]>([]);
    const [chatThreadIDList, setChatThreadIDList] = useState<string[]>([]);
    const groupMode = formData.chat_id && Number(formData.chat_id) < 0;
    const chatIDRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState('');
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 20, mime: 'image/png'});
    const [errorAlert, setErrorAlert] = useState(false);
    const [error, setError] = useState('');
    const [disableGetChatId, setDisableGetChatId] = useState(false);
    const [disableGenerateQRCode, setDisableGenerateQRCode] = useState(false);
    const [progressMessage, setProgressMessage] = useState("Please send some messages to the bot...");

    useEffect(() => {
        setDisableGetChatId(String(formData.bot_token).trim() === '');
        setDisableGenerateQRCode(String(formData.bot_token).trim() === '' || String(formData.chat_id).trim() === '');
    }, [formData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        if (name === 'battery_monitoring_switch' && !checked) {
            setFormData({
                ...formData,
                charger_status: false,
                battery_monitoring_switch: checked,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValue(JSON.stringify(formData));
    };
    const handleGetRecentChatID = () => {
        setProgressMessage("Please send some messages to the bot...");
        setProgressOpen(true);
        fetch('https://api.telegram.org/bot' + formData.bot_token + '/getUpdates?timeout=120')
            .then(response => response.json())
            .then(data => {
                if (data.result.length === 0) {
                    setError('No recent chat ID found');
                    setErrorAlert(true);
                    return;
                }
                const {
                    chatNameList,
                    chatIdList,
                    chatThreadIdList,
                } = fetchChatList(data);
                setChatIDList(chatIdList);
                setChatThreadIDList(chatThreadIdList);
                setLists(chatNameList);
                setSelectOpen(true);
            })
            .catch(error => {
                setError(error.message);
                setErrorAlert(true);
            })
            .finally(() => {
                setProgressOpen(false);
                setTimeout(() => {
                    setErrorAlert(false);
                }, 5000);
            });
    };

    function fetchChatList(message: any) {
        const chatNameList: string[] = [];
        const chatIdList: string[] = [];
        const chatThreadIdList: string[] = [];
        const chatList = message.result;

        chatList.forEach((itemObj: any) => {
            const messageObj = itemObj.message || itemObj.channel_post;
            if (messageObj) {
                const chatObj = messageObj.chat;
                if (!chatIdList.includes(chatObj.id)) {
                    let username = chatObj.username || chatObj.title || '';
                    if (!username) {
                        username = [chatObj.first_name, chatObj.last_name].filter(Boolean).join(' ');
                    }
                    chatNameList.push(`${username} (${chatObj.type || 'Channel'})`);
                    chatIdList.push(chatObj.id);
                    chatThreadIdList.push(messageObj.message_thread_id ? messageObj.message_thread_id.toString() : '');
                }
            }
        });

        return {
            chatNameList,
            chatIdList,
            chatThreadIdList,
        };
    }

    async function handleSendConfig(password: string) {
        const configJson = JSON.stringify(formData)
        const response = await fetch('crypto.wasm');
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.compile(buffer);
        const go = new window.Go();
        const instance = new WebAssembly.Instance(module, go.importObject);
        go.run(instance);
        // @ts-ignore
        const result = window.encrypt(configJson, password);
        const data = {
            encrypt: result.result
        }
        setProgressMessage("Transmitting, please wait...");
        setProgressOpen(true);
        try {
            const response = await fetch('https://api.telegram-sms.com/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProgressOpen(false);
        }
    }


    return (
        <>
            <InputDialog open={inputOpen} title="Please enter password" onClose={async (value) => {
                setInputOpen(false);
                // noinspection JSIgnoredPromiseFromCall
                if (value !== "") {
                    const result = await handleSendConfig(value);
                    if (result.key) {
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
            {errorAlert && (<Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                {error}
            </Alert>)}
            <AlertDialog open={alertOpen} title="Send configuration" message={alertMessage}
                         onClose={() => setAlertOpen(false)}/>
            <SimpleDialog title={"Select a chat"} open={selectOpen}
                          onClose={function (index: number): void {
                              setFormData({
                                  ...formData,
                                  chat_id: chatIDList[index],
                                  topic_id: chatThreadIDList[index],
                              });
                              chatIDRef.current?.focus();
                              setSelectOpen(false);
                          }} lists={lists}/>
            <ProgressDialog open={progressOpen} title="Loading" message={progressMessage}/>
            <Box sx={{
                maxWidth: "700px",
                margin: "0 auto",
                backgroundColor: "#fff",
                borderRadius: "1em",
                boxSizing: "border-box",
                padding: "0 1em",
                boxShadow: "rgba(0, 0, 0, .12) .25em .25em 1em .25em"
            }}>
                <Box sx={{
                    textAlign: "center",
                    padding: "1em 0",
                    lineHeight: "2.2em",
                    boxSizing: "border-box",
                    borderBottom: "2px dashed #ddd"
                }}>
                    <Box sx={{margin: "0", fontSize: "1.7em", fontWeight: 700}}>Telegram SMS Config Generator</Box>
                </Box>
                <Box component="section">
                    <form onSubmit={handleSubmit}>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            margin: "1em 0"
                        }}>
                            <TextField type="text"
                                       value={formData.bot_token} onChange={handleChange} label="Bot Token"
                                       variant="outlined" required/>
                            <TextField ref={chatIDRef} name="chat_id" value={formData.chat_id}
                                       onChange={handleChange}
                                       label="Chat ID"
                                       variant="outlined" required/>
                            <TextField
                                style={{display: groupMode ? 'flex' : 'none'}}
                                onChange={handleChange}
                                value={formData.topic_id} label="Topic ID" variant="outlined"/>
                            <TextField
                                name="trusted_phone_number"
                                onChange={handleChange}
                                value={formData.trusted_phone_number} label="Trusted phone number"
                                variant="outlined"/>
                        </Box>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            margin: "em 0"
                        }}>
                            <FormControlLabel control={<Switch
                                checked={formData.battery_monitoring_switch}
                                onChange={handleChange}/>}
                                              label="Monitor battery level change"/>
                            <FormControlLabel
                                style={{display: formData.battery_monitoring_switch ? 'block' : 'none'}}
                                control={<Switch
                                    checked={formData.charger_status}
                                    onChange={handleChange}/>}
                                label="Monitor charger status"/>
                            <FormControlLabel control={<Switch
                                checked={formData.chat_command}
                                onChange={handleChange}/>}
                                              label="Response to chat command"/>
                            <FormControlLabel control={<Switch
                                checked={formData.fallback_sms}
                                onChange={handleChange}/>}
                                              label="Forward SMS to trusted number when network unavailable"/>
                            <FormControlLabel style={{display: groupMode ? 'block' : 'none'}}
                                              control={<Switch
                                                  checked={formData.privacy_mode}
                                                  onChange={handleChange}/>}
                                              label="Respond only to commands containing the Bot username"/>
                            <FormControlLabel control={<Switch
                                checked={formData.verification_code}
                                onChange={handleChange}/>}
                                              label="Verification code automatic extraction (Alpha)"/>
                            <Button type="button" onClick={handleGetRecentChatID} disabled={disableGetChatId}
                                    variant="outlined">Get recent chat
                                ID</Button>
                            <Button type="button" onClick={() => {
                                setInputOpen(true)
                            }} disabled={disableGenerateQRCode}
                                    variant="contained">Send configuration</Button>
                            <Button type="submit" variant="contained" color="secondary"
                                    disabled={disableGenerateQRCode}>Generate QR
                                Code</Button>
                        </Box>
                    </form>
                    <Box sx={{display: value ? 'none' : 'block', marginTop: '1em'}}>
                        <Alert variant="filled" severity="info">
                            Your generated QR Code will be displayed here
                        </Alert>
                    </Box>
                    <Box sx={{
                        display: value ? 'flex' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '1em'
                    }}>
                        <img src={qrCode} alt="QR Code"/>
                    </Box>
                </Box>
                <Box component="section" sx={{paddingBottom: "2em"}}>
                    <p>This is a tool to help you generate a QR code with Telegram SMS configuration in your
                        browser.
                        You can use Telegram SMS to scan this QR code, which will allow you to quickly apply your
                        configuration. You can also use the Send configuration method to fetch the encrypted message
                        from the
                        cloud.</p>
                    <h2>Important Notice</h2>
                    <p>Since bot keys are very sensitive data, this tool will not upload any clear text configuration
                        files to any server. You can get
                        source code <a href="https://github.com/telegram-sms/config-generate"
                                       target="_blank"
                                       rel="noopener noreferrer">here</a>.</p>
                    <h2>Acknowledgements</h2>
                    <p><a href="https://react.dev/" target="_blank">React</a></p>
                    <p><a href="https://mui.com/" target="_blank">Material-UI</a></p>
                    <p><a href="https://github.com/neocotic/qrious" target="_blank"
                          rel="noopener noreferrer">QRious</a>
                    </p>
                </Box>
            </Box>
        </>
    );
}

export default ConfigQrcode;