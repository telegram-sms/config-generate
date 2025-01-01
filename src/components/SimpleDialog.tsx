// src/components/SimpleDialog.tsx
import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';


export interface SimpleDialogProps {
    open: boolean;
    title: string;
    onClose: (index: number, value: string) => void;
    lists: string[];
}

function SimpleDialog(props: SimpleDialogProps) {
    const {onClose, title, open, lists} = props;

    const handleClose = () => {
        onClose(0, "");
    };

    const handleListItemClick = (value: string, index: number) => {
        onClose(index, value);
    };

    return (
        <Dialog PaperProps={{
            style: {
                width: '500px',
            }
        }} onClose={handleClose} open={open}>
            <DialogTitle>{title}</DialogTitle>
            <List sx={{pt: 0}}>
                {lists.map((value, index) => (
                    <ListItem disablePadding key={value}>
                        <ListItemButton onClick={() => handleListItemClick(value, index)}>
                            <ListItemText primary={value}/>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
}

export default SimpleDialog;