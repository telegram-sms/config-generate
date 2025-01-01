import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface AlertDialogProps {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({open, title, message, onClose}) => {
    return (
        <Dialog open={open} onClose={onClose} PaperProps={{style: {width: '500px'}}}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <div style={{whiteSpace: 'pre-wrap'}}>{message}</div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AlertDialog;