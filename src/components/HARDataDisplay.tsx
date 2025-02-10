import React, { FC, useState } from "react";
import { Box, IconButton, Snackbar, Alert } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface HARDataDisplayProps {
    value: string; // 要显示的 JSON 字符串
}

/**

HARDataDisplay 封装了 HAR 的显示和复制逻辑
子组件会自行处理复制成功/失败的提示，不再依赖父组件传入的 onCopy。
*/
const HARDataDisplay: FC<HARDataDisplayProps> = ({ value }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    if (!value) return null;

    const parsedJson = (() => {
        try {
            return JSON.stringify(JSON.parse(value), null, 2);
        } catch (e) {
            // 如果 JSON 无法解析，返回原始字符串
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
            {/* 标题与复制按钮 */}
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

            {/* 代码高亮显示区域 */}
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

            {/* 用 Snackbar 显示提示信息 */}
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
