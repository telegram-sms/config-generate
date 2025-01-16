import {Alert, Box, Button, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useQrious} from "react-qrious";
import * as curlconverter from "curlconverter";

function Lark() {

    const [server, setServer] = useState("");
    const [value, setValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [qrCode, _qrious] = useQrious({value, size: 512, padding: 10, mime: 'image/png'});
    useEffect(() => {setErrorMessage("")}, [server]);
    return (
        <>
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
                    }catch (e:any) {
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
        </>
    );
}

export default Lark;
