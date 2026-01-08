import React, { FC, useState } from "react";
import { Box, IconButton, Snackbar, Alert } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface HARDataDisplayProps {
    value: string;
}

// HARDataDisplay displays HAR data with syntax highlighting and copy-to-clipboard functionality
const HARDataDisplay: FC<HARDataDisplayProps> = ({ value }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    if (!value) return null;

    const parsedJson = (() => {
        try {
            return JSON.stringify(JSON.parse(value), null, 2);
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            return value;
        }
    })();

    async function copyToClipboard () {
        try {
            await navigator.clipboard.writeText(value);
            setSnackbarMessage("Data copied to clipboard!");
            setSnackbarSeverity("success");
        } catch (err) {
            setSnackbarMessage("Failed to copy data");
            setSnackbarSeverity("error");
        } finally {
            setSnackbarOpen(true);
        }
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: 2,
                padding: "1em",
                borderRadius: "4px",
            }}
        >
            {/* Title and copy button */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 1,
                }}
            >
                <h3 style={{ margin: 0 }}>HAR Data</h3>
                <IconButton onClick={copyToClipboard} color="primary" aria-label="copy to clipboard">
                    <ContentCopyIcon />
                </IconButton>
            </Box>

            {/* Code syntax highlighting area */}
            <Box
                sx={{
                    maxHeight: "800px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                }}
            >
                <SyntaxHighlighter language="json" style={materialDark} showLineNumbers showInlineLineNumbers>
                    {parsedJson}
                </SyntaxHighlighter>
            </Box>

            {/* Display notification message with Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert variant="filled" severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default HARDataDisplay;
