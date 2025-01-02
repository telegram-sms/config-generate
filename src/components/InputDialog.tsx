import * as React from 'react';
import {useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface InputDialogProps {
    open: boolean;
    title: string;
    label: string;
    type: string;
    onClose: (value: string) => void;
    onVerify?: (value: string) => { state: boolean, msg: string };
}

const InputDialog: React.FC<InputDialogProps> = ({open, title, label, type, onClose, onVerify}) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleClose = () => {
        const verify = onVerify ? onVerify(inputValue) : {state: true, msg: ''};
        if (!verify.state) {
            setError(verify.msg);
            return
        }
        onClose(inputValue);
        setInputValue('');
        setError('');
    };

    return (
        <Dialog open={open} onClose={() => onClose('')} PaperProps={{
            style: {
                width: '500px',
            }
        }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label={label}
                    type={type}
                    fullWidth
                    variant="outlined"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError('');
                    }}
                    error={!!error}
                    helperText={error}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setInputValue('');
                    setError('');
                    onClose('');
                }} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleClose} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InputDialog;