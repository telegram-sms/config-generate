import React from "react";
import { Box, Alert } from "@mui/material";
import QRCodeDisplay from "./QRCodeDisplay";
import HARDataDisplay from "./HARDataDisplay";

interface DataDisplayProps {
    value: string;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ value }) => {

    if (!value) {
        return (
            <Box sx={{ marginTop: 2 }}>
                <Alert variant="filled" severity="info">
                    <p>Your generated QR Code will be displayed here.</p>
                    <p>Below the QR Code is the HAR data that you can copy and paste into the app directly.</p>
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <QRCodeDisplay value={value} />
            <HARDataDisplay value={value} />
        </Box>
    );
};

export default DataDisplay;