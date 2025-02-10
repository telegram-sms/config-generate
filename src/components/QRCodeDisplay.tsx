import React from "react";
import { Box, Alert } from "@mui/material";
import { useQrious } from "react-qrious";

interface QRCodeDisplayProps {
    value: string; // 输入二维码需要编码的字符串
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value }) => {
    // 当 value 存在时自动生成二维码
    const qrOptions = {
        value,
        size: 512,
        padding: 10,
        mime: "image/png",
    };
    const [qrCode, _qrious] = useQrious(qrOptions);


    return (
        <Box sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}>
            <img src={qrCode} alt="QR Code" style={{ maxWidth: "100%", height: "auto" }} />
        </Box>
    );
};

export default QRCodeDisplay;
