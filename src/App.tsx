import React, {useState, useRef} from 'react';
import {Alert, AlertTitle, Button, FormControlLabel, Switch, TextField} from "@mui/material";
import {useQrious} from 'react-qrious'
import ProgressDialog from './components/ProgressDialog';
import SimpleDialog from "./components/SimpleDialog";

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

const App: React.FC = () => {
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
        verification_code: false,
    });
    const [progressOpen, setProgressOpen] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const [lists, setLists] = useState<string[]>([]);
    const [chatIDList, setChatIDList] = useState<string[]>([]);
    const [chatThreadIDList, setChatThreadIDList] = useState<string[]>([]);
    const groupMode = formData.chat_id && Number(formData.chat_id) < 0;
    const chatIDRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState('');
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 20, mime: 'image/png'});
    const [errorAlert, setErrorAlert] = useState(false);
    const [error, setError] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        console.log(formData);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValue(JSON.stringify(formData));
    };
    const handleGetRecentChatID = () => {
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
                    chat_name_list,
                    chat_id_list,
                    chat_thread_id_list,
                } = fetchChatList(data);
                setChatIDList(chat_id_list);
                setChatThreadIDList(chat_thread_id_list);
                setLists(chat_name_list);
                setSelectOpen(true);
            })
            .catch(error => {
                console.error('Error:', error);
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
        // https://github.com/telegram-sms/telegram-sms/blob/master/app/src/main/java/com/qwe7002/telegram_sms/main_activity.java#L285
        // (JavaScript ver.)
        const chat_name_list = [];
        const chat_id_list: any[] = [];
        const chat_thread_id_list = [];
        const chat_list = message.result;
        for (let i = 0; i < chat_list.length; i++) {
            const item_obj = chat_list[i];
            if (item_obj.message) {
                const message_obj = item_obj.message;
                const chat_obj = message_obj.chat;
                if (!chat_id_list.includes(chat_obj.id)) {
                    let username = "";
                    if (chat_obj.username) {
                        username = chat_obj.username;
                    }
                    if (chat_obj.title) {
                        username = chat_obj.title;
                    }
                    if (username === '' && !chat_obj.username) {
                        if (chat_obj.first_name) {
                            username = chat_obj.first_name;
                        }
                        if (chat_obj.last_name) {
                            username += " " + chat_obj.last_name;
                        }
                    }
                    chat_name_list.push(username + " (" + chat_obj.type + ")");
                    chat_id_list.push(chat_obj.id);
                    chat_thread_id_list.push("");
                }
            }
            if (item_obj.channel_post) {
                const message_obj = item_obj.channel_post;
                const chat_obj = message_obj.chat;
                if (!chat_id_list.includes(chat_obj.id)) {
                    chat_name_list.push(chat_obj.title + " (Channel)");
                    chat_id_list.push(chat_obj.id);
                    chat_thread_id_list.push(message_obj.message_thread_id);
                }
            }
        }
        return {
            chat_name_list,
            chat_id_list,
            chat_thread_id_list,
        }
    }


    return (
        <div className="container">
            {errorAlert && (<Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                {error}
            </Alert>)}
            <SimpleDialog title={"Select a chat"} open={selectOpen} onClose={function (index: number,value: string): void {
                setFormData({
                    ...formData,
                    chat_id: chatIDList[index],
                    topic_id: chatThreadIDList[index],
                });
                chatIDRef.current?.focus();
                setSelectOpen(false);
            }} lists={lists}/>
            <ProgressDialog open={progressOpen} title="Loading" message="Please send some messages to the bot..."/>
            <header>
                <h1>Telegram SMS Config Generator</h1>
            </header>
            <section className="generate">
                <form onSubmit={handleSubmit}>
                    <div>
                        <TextField id="bot-token" type="text"
                                   name="bot_token"
                                   value={formData.bot_token} onChange={handleChange} label="Bot Token"
                                   variant="outlined" required/>
                    </div>
                    <div>
                        <TextField ref={chatIDRef} name="chat_id" value={formData.chat_id} onChange={handleChange}
                                   id="bot-chat_id"
                                   label="Chat ID"
                                   variant="outlined" required/>
                    </div>
                    <div style={{display: groupMode ? 'block' : 'none'}}>
                        <TextField
                            name="topic_id"
                            onChange={handleChange}
                            value={formData.topic_id} label="Topic ID" variant="outlined"/>
                    </div>
                    <div>
                        <TextField
                            name="trusted_phone_number"
                            onChange={handleChange}
                            value={formData.trusted_phone_number} label="Trusted phone number" variant="outlined"/>
                    </div>
                    <div>
                        <FormControlLabel control={<Switch name="battery_monitoring_switch"
                                                           checked={formData.battery_monitoring_switch}
                                                           onChange={handleChange}/>}
                                          label="Monitor battery level change"/>
                    </div>
                    <div style={{display: formData.battery_monitoring_switch ? 'block' : 'none'}}>
                        <FormControlLabel control={<Switch name="charger_status"
                                                           checked={formData.charger_status}
                                                           onChange={handleChange}/>}
                                          label="Monitor charger status"/>
                    </div>
                    <div>
                        <FormControlLabel control={<Switch name="chat_command"
                                                           checked={formData.chat_command}
                                                           onChange={handleChange}/>}
                                          label="Response to chat command"/>
                    </div>
                    <div>
                        <FormControlLabel control={<Switch name="fallback_sms"
                                                           checked={formData.fallback_sms}
                                                           onChange={handleChange}/>}
                                          label="Forward SMS to trusted number when network unavailable"/>
                    </div>
                    <div style={{display: groupMode ? 'block' : 'none'}}>
                        <FormControlLabel control={<Switch name="privacy_mode"
                                                           checked={formData.privacy_mode}
                                                           onChange={handleChange}/>}
                                          label="Respond only to commands containing the Bot username"/>
                    </div>
                    <div>
                        <FormControlLabel control={<Switch name="verification_code"
                                                           checked={formData.verification_code}
                                                           onChange={handleChange}/>}
                                          label="Verification code automatic extraction (Alpha)"/>
                    </div>
                    <div>
                        <Button type="submit" variant="contained">Generate QR Code</Button>
                        <Button type="button" onClick={handleGetRecentChatID} variant="outlined">Get recent chat
                            ID</Button>
                    </div>
                </form>
                <div style={{display: value ? 'none' : 'block'}}>Your generated QR Code will be
                    displayed here
                </div>
                <div style={{display: value ? 'block' : 'none'}}>
                    <img src={qrCode} alt="QR Code"/>
                </div>
            </section>
            <section className="info">
                <div>
                    <p>This is a tool to help you generate a QR code with Telegram SMS configuration in your browser.
                        You can use Telegram SMS to scan this QR code, which will allow you to quickly apply your
                        configuration.</p>
                    <h2>Important Notice</h2>
                    <p>This tool is purely frontend-based, which won't upload any data into our server. You can get
                        source code <a href="https://github.com/telegram-sms/qrcode.telegram-sms.com" target="_blank"
                                       rel="noopener noreferrer">here</a>.</p>
                    <h2>Acknowledgements</h2>
                    <p><a href="https://github.com/neocotic/qrious" target="_blank" rel="noopener noreferrer">QRious</a>
                    </p>
                </div>
            </section>
        </div>
    );
}

export default App;
