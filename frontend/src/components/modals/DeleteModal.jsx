import React, { useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { deleteRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../forms/FormHeader';

const DeleteModal = ({ openModal, setOpenModal, deleteUrl, setDeleteUrl, title, setTitle, getData }) => {
    
    const [isLoading, setIsLoading] = useState(false);

   

    const handleCancel = () => {
        setDeleteUrl("");
        setTitle('');
        setOpenModal(false);
        
    };

    const deleteItem = async () => {
        setIsLoading(true);
        const response = await deleteRequest(deleteUrl);
        if (response.success) {
            toast.success(`${title} deleted successfully`);
            getData();
            setDeleteUrl('')
            setTitle('')
            setOpenModal(false);
            
        } else {
            toast.error(`${response.error}`)

        }
        setIsLoading(false);
    }


    return (
        <Modal
            title={title}
            open={openModal}
            onCancel={handleCancel}
            className="overflow-auto custom-scrollbar max-h-[80%]"
            width={'50%'}
            footer={
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>
            }
        >
            <div className='flex flex-col gap-2 items-center'>
            <FormHeader header={`Are you sure you want to delete ${title}?`}/>

                    <Button type="primary" className="w-[30%] self-center" danger onClick={deleteItem} disabled={isLoading}>
                        {isLoading ? <Spin /> : 'Delete'}
                    </Button>
                    </div>
               
        </Modal>
    );
};

export default DeleteModal;
