import React, { useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { deleteRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../forms/FormHeader';
import { useNavigate } from 'react-router-dom';

const DeleteModal = ({ openModal, setOpenModal, deleteUrl, setDeleteUrl, title, setTitle, getData, navigateUrl=null }) => {
    const navigate = useNavigate();
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
            if (navigateUrl) {
                navigate(navigateUrl);
            } else {
                getData();

            }
            toast.success(`${title} deleted successfully`);
            setDeleteUrl('')
            setTitle('')
            setOpenModal(false);  
        } else {
            toast.error(`${response.error}`)

        }
        setIsLoading(false);
    }

    function capitalizeFirstLetter(str) {
        if (!str) return str; // return the string as is if it's empty
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    return (
        <Modal
            title={capitalizeFirstLetter(title)}
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
