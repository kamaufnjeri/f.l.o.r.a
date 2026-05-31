import React, { useState } from 'react';
import { Modal, Button, Form } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import DateField from '../forms/DateField.Jsx'
import { getItems, getQueryParams } from '../../lib/helpers';
import { useParams } from 'react-router-dom';



const FromToDateModal = ({ openModal, setOpenModal, setSearchItem, searchItem, setData, setPageNo = null, type }) => {
    const handleCancel = () => {
        setOpenModal(false);

    };
    const { orgId } = useParams();
    const [formData, setFormData] = useState({
        from: '',
        to: ''
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({...prev, [field]: value}))
    };

   
    const handleSubmit = async (e) => {
        e.preventDefault();
        const customRange = `${formData.from}to${formData.to}`
        setSearchItem({ ...searchItem, date: customRange });
        let queryParamsUrl = ''
        if (type.includes('stocks')) {
            queryParamsUrl = `?date=${customRange}`

        } else {
            queryParamsUrl = getQueryParams({
                type: type,
                paginate: true,
                search: '',
                date: customRange,
                sortBy: searchItem.sortBy,
                typeValue: searchItem[type]
            })
        }

        const newData = await getItems(`${orgId}/${type}`, queryParamsUrl);
        setData(newData);
        if (setPageNo) {
            setPageNo(1);

        }
        setFormData({
            from: '',
            to: ''
        })
        setOpenModal(false)
        handleCancel();
    }


    return (
        <>

            <Modal
                title="Custom range dates"
                open={openModal}
                onCancel={handleCancel}
                width={'50%'}
                footer={
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>
                }
            >

                <form
                    onSubmit={handleSubmit}
                    className='flex flex-col gap-2'
                >
                    <div className='flex flex-row gap-5 items-start'>
                        <div className='flex flex-row gap-5 items-start w-full'>
                            <label htmlFor="date" className='w-[15%]'>From</label>
                            <DateField handleChange={handleChange} className='w-[80%]' value={formData.from} name='from' />
                        </div>
                        <div className='flex flex-row gap-5 items-start w-full'>
                            <label htmlFor="date" className='w-[15%]'>To</label>
                            <DateField className='w-[80%]' handleChange={handleChange} name='to'  value={formData.to}/>
                        </div>
                    </div>


                    <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                        Submit
                    </Button>
                </form>


            </Modal >
        </>
    );
};

export default FromToDateModal;
