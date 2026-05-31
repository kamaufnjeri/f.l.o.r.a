import React, { useState } from 'react'
import AddSupplierModal from '../modals/AddSupplierModal';
import AddCustomerModal from '../modals/AddCustomerModal';
import AddAccountModal from '../modals/AddAccountModal';
import AddItemModal from '../modals/AddItemModal';
import AddServiceModal from '../modals/AddServiceModal';

const SubHeader = ({ customer = false, supplier = false, service = false, item = false, account = false, getData=null }) => {
    const [openAddSupplierModal, setOpenAddSupplierModal] = useState(false);
    const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);
    const [openAddAccountModal, setOpenAddAccountModal] = useState(false);
    const [openAddItemModal, setOpenAddItemModal] = useState(false);
    const [openAddServiceModal, setOpenAddServiceModal] = useState(false);
    const booleanProps = [customer, supplier, service, item, account];
    const trueBooleanCount = booleanProps.filter(Boolean).length;

    if (trueBooleanCount !== 1 && getData !== null) {
        console.log(getData);
        throw new Error('getData function can only be provided for one item');
    }
    

    return (
        <div className='flex flex-row flex-wrap gap-2 items-center justify-between p-1 w-full shadow-md rounded-md'>
            {supplier && <>
                <button onClick={() => setOpenAddSupplierModal(true)} className='p-1 h-10 self-end cursor-pointer hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border-2 border-gray-800'>
                    Add Supplier
                </button>
                <AddSupplierModal openModal={openAddSupplierModal} setOpenModal={setOpenAddSupplierModal} getData={getData}/>
            </>}
            {customer && <>
                <button onClick={() => setOpenAddCustomerModal(true)} className='p-1 h-10 self-end cursor-pointer hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border-2 border-gray-800'>
                    Add Customer
                </button>
                <AddCustomerModal openModal={openAddCustomerModal} setOpenModal={setOpenAddCustomerModal} getData={getData}/>

            </>}
            {account && <>
                <button onClick={() => setOpenAddAccountModal(true)} className='p-1 h-10 self-end cursor-pointer hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border-2 border-gray-800'>
                    Add Account
                </button>
                <AddAccountModal openModal={openAddAccountModal} setOpenModal={setOpenAddAccountModal} getData={getData}/>

            </>}
            {item && <><button onClick={() => setOpenAddItemModal(true)} className='p-1 h-10 self-end cursor-pointer hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border-2 border-gray-800'>
                Add Item
            </button>
                <AddItemModal openModal={openAddItemModal} setOpenModal={setOpenAddItemModal} getData={getData}/>
            </>}
            {service &&
                <><button onClick={() => setOpenAddServiceModal(true)} className='p-1 h-10 self-end cursor-pointer hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border-2 border-gray-800'>
                    Add Service
                </button>
                    <AddServiceModal openModal={openAddServiceModal} setOpenModal={setOpenAddServiceModal} getData={getData}/>
                </>}
        </div>
    )
}

export default SubHeader
