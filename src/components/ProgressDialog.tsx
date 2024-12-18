import React from 'react';
import { Dialog, DialogTitle, DialogContent, CircularProgress, Typography } from '@mui/material';

interface ProgressDialogProps {
    open: boolean;
    title?: string;
    message?: string;
}

const ProgressDialog: React.FC<ProgressDialogProps> = ({ open, title, message }) => {
    return (
        <Dialog open={open} aria-labelledby="progress-dialog-title">
            {title && <DialogTitle id="progress-dialog-title">{title}</DialogTitle>}
            <DialogContent style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CircularProgress />
                {message && <Typography>{message}</Typography>}
            </DialogContent>
        </Dialog>
    );
};

export default ProgressDialog;