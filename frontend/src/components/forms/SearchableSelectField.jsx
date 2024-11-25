import React, { useEffect, useRef, useState } from 'react';
import { inputContainer } from '../../lib/styles';
import { FaChevronDown } from 'react-icons/fa';
import { replaceDash } from '../../lib/helpers';

const SearchableSelectField = ({ options = [], value, handleChange, name, isSubmitted, index=null }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [placeholder, setPlaceholder] = useState(`Select ${replaceDash(name)}`);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);

    const filteredOptions = options.filter(({ name }) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSearchValue(e.target.value);
    };

    const handleSelectChange = (option) => {
        if (index !== null) {
            handleChange(`${name}`, option.id, index);
        }
        setSearchValue(option.name)
        setSearchTerm('');
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (searchRef.current && !searchRef.current.contains(event.target)) {
            setIsOpen(false);
        }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
       
      }, []);
      useEffect(() => {
        if (isSubmitted) {
            setSearchTerm('');
            setSearchValue('');
        }
      }, [isSubmitted])

      useEffect(() => {
        if (value) {
            const newValue = options.find(item => item.id === value)
            setSearchValue(newValue.name);
        }
      }, [value]);

    

    return (
        <div className='h-full relative w-full' ref={searchRef}>
            <div onClick={toggleDropdown} className='relative' >
                <input
                    type="text"
                    name={name}
                    autoComplete='off'
                    required
                    className={`${inputContainer} w-full`}
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={handleSearchChange}
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleDropdown()
                    }} 
                   
                />
                <FaChevronDown size={16} className='absolute right-2 bottom-2'/>
            </div>

            {isOpen && (
                <ul
                    style={{
                        listStyle: 'none',
                        padding: '0',
                        margin: '4px 0 0 0',
                        position: 'absolute',
                        width: '100%',
                        border: '1px solid #ccc',
                        borderTop: 'none',
                        backgroundColor: 'white',
                        maxHeight: '120px',
                        overflowY: 'auto',
                        zIndex: 10,
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <li
                                key={index}
                                onClick={() => {
                                    handleSelectChange(option);
                                }}
                                className='flex flex-col p-1'
                            >
                                {option.name}
                            </li>
                        ))
                    ) : (
                        <li style={{ padding: '8px', color: 'gray' }}>No options found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchableSelectField;
