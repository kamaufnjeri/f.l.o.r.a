import { createContext, useState, useContext, useEffect } from "react";
import { getItems } from "../lib/helpers";
import Loading from "../components/shared/Loading";
import { useAuth } from "./AuthContext";

const SelectOptionsContext = createContext();

export const useSelectOptions = () => useContext(SelectOptionsContext);

export const SelectOptionsProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [paymentAccounts, setPaymentsAccounts] = useState([]);
    const [incomeAccounts, setIncomeAccounts] = useState([]);
    const [expenseAccounts, setExpenseAccounts] = useState([]);
    const [serialNumbers, setSerialNumbers] = useState([]);
    const [fixedGroups, setFixedGoups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [services, setServices] = useState([]);
    const { currentOrg } = useAuth();
    const [ isLoading, setIsLoading ] = useState(true);

    const getSelectOptions = async () => {
        if (currentOrg && currentOrg.id) {
            const queryUrl = `${currentOrg.id}/select_options`;
            try {
                const response = await getItems(queryUrl);
                setSuppliers(response.suppliers || []);
                setCustomers(response.customers || []);
                setStocks(response.stocks || []);
                setAccounts(response.accounts || []);
                setPaymentsAccounts(response.payment_accounts || []);
                setExpenseAccounts(response.expense_accounts || []);
                setIncomeAccounts(response.income_accounts || []);
                setSerialNumbers(response.serial_numbers || []);
                setSubCategories(response.sub_categories || []);
                setCategories(response.categories || []);
                setFixedGoups(response.fixed_groups || []);
                setServices(response.services || []);
            } catch (error) {
                console.error("Failed to fetch select options:", error);
            }
            setIsLoading(false);
        } else {
            setIsLoading(false);
            return;
        }
    };

    const clearData = () => {
        setSuppliers([]);
        setCustomers([]);
        setStocks([]);
        setAccounts([]);
        setPaymentsAccounts([]);
        setExpenseAccounts([]);
        setIncomeAccounts([]);
        setSerialNumbers([]);
        setFixedGoups([]);
        setCategories([]);
        setSubCategories([]);
        setServices([]);
    }

    useEffect(() => {
        getSelectOptions();
    }, [currentOrg]);

    const value = {
        paymentAccounts,
        incomeAccounts,
        expenseAccounts,
        accounts,
        stocks,
        suppliers,
        customers,
        serialNumbers,
        subCategories,
        fixedGroups,
        categories,
        services,
        getSelectOptions,
        clearData,
    };
    if (isLoading) {
        return <Loading/>
    } else {
        return <SelectOptionsContext.Provider value={value}>{children}</SelectOptionsContext.Provider>;
    }
};
