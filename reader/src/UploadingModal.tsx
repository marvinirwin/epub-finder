import React, {useState} from 'react';
import {Modal, Input, Button} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import clsx from 'clsx';

interface Props {
    onSubmit: (file: File) => void;
    uploadingDocument: File;
}

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    input: {
        '&:focus': {
            outline: 'none',
            boxShadow: 'none',
        },
    },
    button: {
        marginTop: theme.spacing(2),
    },
}));

const UploadModal: React.FC<Props> = ({onSubmit, uploadingDocument}) => {
    const classes = useStyles();
    const [uploadingDocumentName, setUploadingDocumentName] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadingDocumentName(e.target.value);
    };

    const handleSubmit = () => {
        onSubmit(new File([uploadingDocument], uploadingDocumentName, { type: uploadingDocument.type }));
    };

    const buttonDisabled = uploadingDocumentName.trim() === '';

    return (
        <Modal open={true} className={classes.modal}>
            <div className={clsx(classes.paper)}>
                <Input
                    value={uploadingDocumentName}
                    onChange={handleChange}
                    placeholder="Enter a name"
                    className={classes.input}
                    fullWidth
                    autoFocus
                />
                <Button
                    variant="contained"
                    color="primary"
                    disabled={buttonDisabled}
                    className={classes.button}
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </div>
        </Modal>
    );
};

export default UploadModal;
