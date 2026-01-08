
// noinspection ExceptionCaughtLocallyJS

import React, {useEffect, useRef, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    FormControlLabel,
    Link,
    Switch,
    TextField,
    useMediaQuery,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import {useQrious} from 'react-qrious'
import ProgressDialog from './components/ProgressDialog';
import SimpleDialog from "./components/SimpleDialog";
import InputDialog from "./components/InputDialog";
import AlertDialog from "./components/AlertDialog";
import {encrypt} from "./crypto";
import getHttpStatusMessage from "./constants/http";

interface FormData {
    bot_token: string;
    api_address: string;
    chat_id: string;
    topic_id: string;
    trusted_phone_number: string;
    battery_monitoring_switch: boolean;
    charger_status: boolean;
    chat_command: boolean;
    fallback_sms: boolean;
    privacy_mode: boolean;
    display_dual_sim_display_name: boolean;
    call_notify: boolean;
    verification_code: boolean;
    hide_phone_number: boolean;
}

const ConfigQrcode: React.FC = () => {
    const isNonMobile = useMediaQuery('(min-width:600px)');
    let padding: any = "0px";
    if (!isNonMobile) {
        padding = null;
    }
    useEffect(() => {
        document.title = "Config Generator - Telegram SMS";
    }, []);
    const [formData, setFormData] = useState<FormData>({
        bot_token: '',
        api_address: 'api.telegram.org',
        chat_id: '',
        topic_id: '',
        trusted_phone_number: '',
        battery_monitoring_switch: false,
        charger_status: false,
        chat_command: false,
        fallback_sms: false,
        privacy_mode: false,
        display_dual_sim_display_name: false,
        call_notify: false,
        verification_code: false,
        hide_phone_number: false
    });
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [progressOpen, setProgressOpen] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [inputOpen, setInputOpen] = useState(false);
    const [lists, setLists] = useState<string[]>([]);
    const [chatIDList, setChatIDList] = useState<string[]>([]);
    const [chatThreadIDList, setChatThreadIDList] = useState<string[]>([]);
    const groupMode = formData.chat_id && Number(formData.chat_id) < 0;
    const chatIDRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState('');
    const [qrCode, _qrious] = useQrious({value, size: 512, mime: 'image/png'});
    const [disableGetChatId, setDisableGetChatId] = useState(true);
    const [disableGenerateQRCode, setDisableGenerateQRCode] = useState(true);
    const [progressMessage, setProgressMessage] = useState("Please send some messages to the bot...");
    // For confirm dialog
    const [customApiAddressConfirmOpen, setCustomApiAddressConfirmOpen] = useState(false);
    const confirmResolver = useRef<((value: boolean) => void) | null>(null);
    const requestConfirm = () => {
        setCustomApiAddressConfirmOpen(true);
        return new Promise<boolean>((resolve) => {
            confirmResolver.current = resolve;
        });
    };
    const handleDialogClose = (result: boolean) => {
        setCustomApiAddressConfirmOpen(false);
        if (confirmResolver.current) {
            confirmResolver.current(result);
            confirmResolver.current = null;
        }
    };

    useEffect(() => {
        setDisableGetChatId(String(formData.bot_token).trim() === '');
        setDisableGenerateQRCode(String(formData.bot_token).trim() === '' || String(formData.chat_id).trim() === '');
    }, [formData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        if (name === 'chat_id' && !/^-?\d*$/.test(value)) {
            return; // Ignore non-numeric input
        }
        console.log(name, value, type, checked);
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        if(name === 'trusted_phone_number' && value.trim().length === 0){
            setFormData({
                ...formData,
                fallback_sms: false,
                trusted_phone_number: value,
            });
        }
        if (name === 'battery_monitoring_switch' && !checked) {
            setFormData({
                ...formData,
                charger_status: false,
                battery_monitoring_switch: checked,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.api_address !== 'api.telegram.org'){
            const confirmed = await requestConfirm();
            if (!confirmed) return;
        }
        setValue(JSON.stringify(formData));
    };
    const handleGetRecentChatID = async () => {
        if (formData.api_address !== 'api.telegram.org'){
            const confirmed = await requestConfirm();
            if (!confirmed) return;
        }
        await executeGetRecentChatID();
    };

    const executeGetRecentChatID = async () => {
        setProgressMessage("Please send some messages to the bot...");
        setProgressOpen(true);
        try {
            const response = await fetch('https://' + formData.api_address + '/bot' + formData.bot_token + '/getUpdates?timeout=120');
            if (!response.ok) {
                throw new Error('Network response: ' + getHttpStatusMessage(response.status));
            }
            const data = await response.json();
            if (data.result.length === 0) {
                setAlertTitle("Error");
                setAlertMessage('No recent chat ID found');
                setAlertOpen(true);
                return;
            }
            const {chatNameList, chatIdList, chatThreadIdList} = fetchChatList(data);
            setChatIDList(chatIdList);
            setChatThreadIDList(chatThreadIdList);
            setLists(chatNameList);
            setSelectOpen(true);
        } catch (error: any) {
            setAlertTitle("Error");
            setAlertMessage(error.message);
            setAlertOpen(true);
        } finally {
            setProgressOpen(false);
            setTimeout(() => {
                setAlertOpen(false);
            }, 5000);
        }
    };

    function fetchChatList(message: any) {
        const chatNameList: string[] = [];
        const chatIdList: string[] = [];
        const chatThreadIdList: string[] = [];
        const chatList = message.result;
        const chatIdMap = new Map<number, number>(); // Map old chat_id to new chat_id for migration

        chatList.forEach((itemObj: any) => {
            const messageObj = itemObj.message || itemObj.channel_post;
            if (messageObj) {
                const chatObj = messageObj.chat;
                let chatId = chatObj.id;

                // Handle group migration to supergroup
                if (messageObj.migrate_to_chat_id) {
                    chatIdMap.set(chatId, messageObj.migrate_to_chat_id);
                    chatId = messageObj.migrate_to_chat_id;
                } else if (messageObj.migrate_from_chat_id) {
                    // If we encounter the new supergroup, map the old ID to this one
                    chatIdMap.set(messageObj.migrate_from_chat_id, chatId);
                }

                // Apply any known migrations
                if (chatIdMap.has(chatId)) {
                    chatId = chatIdMap.get(chatId)!;
                }

                if (!chatIdList.includes(chatId)) {
                    let username = chatObj.username || chatObj.title || '';
                    if (!username) {
                        username = [chatObj.first_name, chatObj.last_name].filter(Boolean).join(' ');
                    }

                    // Add suffix for migrated supergroups
                    const chatType = messageObj.migrate_to_chat_id || messageObj.migrate_from_chat_id
                        ? 'Supergroup'
                        : (chatObj.type || 'Channel');

                    chatNameList.push(`${username} (${chatType})`);
                    chatIdList.push(chatId);
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
        const result = await encrypt(configJson, password);
        const data = {
            encrypt: result
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
            <InputDialog open={inputOpen} title="Please enter password" onClose={async (value) => {
                setInputOpen(false);
                // noinspection JSIgnoredPromiseFromCall
                if (value !== "") {
                    const result = await handleSendConfig(value);
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
            <AlertDialog open={alertOpen} title={alertTitle} message={alertMessage}
                         onClose={() => setAlertOpen(false)}/>
            <Dialog
                open={customApiAddressConfirmOpen}
                onClose={() => handleDialogClose(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"CAUTION"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Please make sure you have executed logOut operation on official bot api.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogClose(false)}>Cancel</Button>
                    <Button onClick={() => handleDialogClose(true)} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <SimpleDialog title={"Select a chat"} open={selectOpen}
                          onClose={function (index: number): void {
                              setFormData({
                                  ...formData, chat_id: chatIDList[index],
                                  topic_id: chatThreadIDList[index],
                              });
                              chatIDRef.current?.focus();
                              setSelectOpen(false);
                          }} lists={lists}/>
            <ProgressDialog open={progressOpen} title="Loading" message={progressMessage}/>
            <Box sx={[
                (theme) => ({
                    maxWidth: "700px",
                    margin: "0 auto",
                    backgroundColor: theme.palette.configBox.main,
                    borderRadius: "1rem",
                    boxSizing: "border-box",
                    padding: "0 1.25rem",
                    boxShadow: "rgba(0, 0, 0, .12) .25em .25em 1em .25em",
                    color: '#000',
                }),
                (theme) =>
                    theme.applyStyles('dark', {
                        maxWidth: "700px",
                        margin: "0 auto",
                        backgroundColor: theme.palette.configBox.dark,
                        borderRadius: "1rem",
                        boxSizing: "border-box",
                        padding: "0 1.25rem",
                        boxShadow: "rgba(0, 0, 0, .12) .25em .25em 1em .25em",
                        color: '#fff',
                    }),
            ]}>
                <Box sx={{
                    textAlign: "center",
                    padding: "1em 0",
                    lineHeight: "2.2em",
                    boxSizing: "border-box",
                    borderBottom: "2px dashed #ddd"
                }}>
                    <Box sx={{margin: "0", fontSize: "1.7em", fontWeight: 700}}>Telegram SMS Config Generator</Box>
                </Box>
                <Box component="section"
                     sx={{paddingLeft: padding, paddingRight: padding, paddingBottom: "1.25rem", paddingTop: "1.25rem"}}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2
                        }}>
                            <TextField type="text" name="bot_token"
                                       value={formData.bot_token} onChange={handleChange} label="Bot Token"
                                       variant="outlined" required/>
                            <TextField ref={chatIDRef} name="chat_id" value={formData.chat_id}
                                       onChange={handleChange}
                                       label="Chat ID"
                                       variant="outlined" required/>
                            <TextField
                                name="topic_id"
                                style={{display: groupMode ? 'flex' : 'none'}}
                                onChange={handleChange}
                                value={formData.topic_id} label="Topic ID" variant="outlined"/>
                            <TextField
                                name="trusted_phone_number"
                                onChange={handleChange}
                                value={formData.trusted_phone_number} label="Trusted phone number"
                                variant="outlined"/>
                            <TextField
                                name="api_address"
                                onChange={handleChange}
                                value={formData.api_address} label="Bot API Address(not ready to change yet, USE WITH CAUTION)"
                                variant="outlined"/>
                        </Box>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            margin: "1em 0"
                        }}>
                            <FormControlLabel
                                style={{display: formData.trusted_phone_number.trim().length!=0 ? 'block' : 'none'}}
                                control={<Switch
                                name="fallback_sms"
                                checked={formData.fallback_sms}
                                onChange={handleChange}
                                color="warning"/>}
                                              label="Forward SMS to trusted number when network unavailable"/>
                            <FormControlLabel control={<Switch
                                name="battery_monitoring_switch"
                                checked={formData.battery_monitoring_switch}
                                onChange={handleChange}
                                color="warning"/>}
                                              label="Monitor battery level change"/>
                            <FormControlLabel
                                style={{display: formData.battery_monitoring_switch ? 'block' : 'none'}}
                                control={<Switch
                                    name="charger_status"
                                    checked={formData.charger_status}
                                    onChange={handleChange}
                                    color="warning"/>}
                                label="Monitor charger status"/>
                            <FormControlLabel control={<Switch
                                name="chat_command"
                                checked={formData.chat_command}
                                onChange={handleChange}
                                color="warning"/>}
                                              label="Response to chat command"/>
                            <FormControlLabel style={{display: groupMode ? 'block' : 'none'}}
                                              control={<Switch
                                                  name="privacy_mode"
                                                  checked={formData.privacy_mode}
                                                  onChange={handleChange}
                                                  color="warning"/>}
                                              label="Respond only to commands containing the Bot username"/>
                            <FormControlLabel
                                control={<Switch
                                    name="verification_code"
                                    checked={formData.verification_code}
                                    onChange={handleChange}
                                    color="warning"/>}
                                label="Verification code automatic extraction (Alpha)"/>
                            <FormControlLabel control={<Switch
                                name="call_notify"
                                checked={formData.call_notify}
                                onChange={handleChange}
                                color="warning"/>}
                                              label="Notify when call received"/>
                            <FormControlLabel control={<Switch
                                name="hide_phone_number"
                                checked={formData.hide_phone_number}
                                onChange={handleChange}
                                color="warning"/>}
                                              label="Hide Phone Number"/>
                            <Button type="button" onClick={handleGetRecentChatID} disabled={disableGetChatId}
                                    variant="outlined">Get recent chat
                                ID</Button>
                            <Button type="button" onClick={() => {
                                setInputOpen(true)
                            }} disabled={disableGenerateQRCode}
                                    variant="contained">Send configuration</Button>
                            <Button type="submit" variant="contained" color="warning"
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
                        backgroundColor: "#fff",
                        padding: "1em",
                        alignItems: 'center',
                        marginTop: '1em'
                    }}>
                        <img src={qrCode} alt="QR Code" style={{
                            maxWidth: '100%', height: 'auto'
                        }}/>
                    </Box>
                </Box>
                <Box component="section" sx={{paddingLeft: padding, paddingBottom: "20px", paddingRight: padding}}>
                    <p>This is a tool to help you generate a QR code with Telegram SMS configuration in your
                        browser.
                        You can use Telegram SMS to scan this QR code, which will allow you to quickly apply your
                        configuration. You can also use the Send configuration method to fetch the encrypted message
                        from the
                        cloud.</p>
                    <h2>Important Notice</h2>
                    <p>Since bot keys are very sensitive data, this tool will not upload any clear text configuration
                        files to any server. You can get
                        source code <Link href="https://github.com/telegram-sms/config-generate"
                                          target="_blank"
                                          rel="noopener noreferrer">here</Link>.</p>
                    <h2>Acknowledgements</h2>
                    <p><Link href="https://react.dev/" target="_blank">React</Link></p>
                    <p><Link href="https://mui.com/" target="_blank">Material-UI</Link></p>
                    <p><Link href="https://github.com/neocotic/qrious" target="_blank"
                             rel="noopener noreferrer">QRious</Link>
                    </p>
                </Box>
            </Box>
        </>
    );
}

export default ConfigQrcode;
