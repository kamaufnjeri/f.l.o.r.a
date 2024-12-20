import { createContext, useState, useContext, useEffect } from "react";
import { getItems } from "../lib/helpers";
import Loading from "../components/shared/Loading";
import { useAuth } from "./AuthContext";

const SelectOptionsContext = createContext();

export const useSelectOptions = () => useContext(SelectOptionsContext);

export const SelectOptionsProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [suppliersAccounts, setSuppliersAccounts] = useState([]);
    const [incomeDiscountAccounts, setIncomeDiscountsAccounts] = useState([]);
    const [expenseDiscountAccounts, setExpenseDiscountsAccounts] = useState([]);
    const [salesAccounts, setSalesAccounts] = useState([]);
    const [customersAccounts, setCustomersAccounts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [paymentAccounts, setPaymentsAccounts] = useState([]);
    const [purchaseAccounts, setPurchaseAccounts] = useState([]);
    const [serialNumbers, setSerialNumbers] = useState([]);
    const [fixedGroups, setFixedGoups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [services, setServices] = useState([]);
    const[serviceIncomeAccounts, setServiceIcomeAccounts] = useState([]);
    const { currentOrg } = useAuth();
    const [ isLoading, setIsLoading ] = useState(true);

    const getSelectOptions = async () => {
        if (currentOrg && currentOrg.id) {
            const queryUrl = `${currentOrg.id}/select_options`;
            try {
                const response = await getItems(queryUrl);
                setSuppliersAccounts(response.suppliers_accounts || []);
                setCustomersAccounts(response.customers_accounts || []);
                setStocks(response.stocks || []);
                setAccounts(response.accounts || []);
                setPaymentsAccounts(response.payment_accounts || []);
                setPurchaseAccounts(response.purchase_accounts || []);
                setSerialNumbers(response.serial_numbers || []);
                setSubCategories(response.sub_categories || []);
                setCategories(response.categories || []);
                setFixedGoups(response.fixed_groups || []);
                setServices(response.services || []);
                setIncomeDiscountsAccounts(response.income_discount_accounts || []);
                setExpenseDiscountsAccounts(response.expense_discount_accounts || []);
                setSalesAccounts(response.sales_accounts || []);
                setServiceIcomeAccounts(response.service_income_accounts || []);
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
        setSuppliersAccounts([]);
        setCustomersAccounts([]);
        setStocks([]);
        setAccounts([]);
        setPaymentsAccounts([]);
        setPurchaseAccounts([]);
        setSerialNumbers([]);
        setFixedGoups([]);
        setCategories([]);
        setSubCategories([]);
        setServices([]);
        setIncomeDiscountsAccounts([]);
        setExpenseDiscountsAccounts([]);
        setSalesAccounts([]);
        setServiceIcomeAccounts([]);
    }

    useEffect(() => {
        getSelectOptions();
    }, [currentOrg]);

    const value = {
        paymentAccounts,
        purchaseAccounts,
        accounts,
        stocks,
        suppliersAccounts,
        customersAccounts,
        serialNumbers,
        subCategories,
        fixedGroups,
        categories,
        services,
        incomeDiscountAccounts,
        expenseDiscountAccounts,
        salesAccounts,
        serviceIncomeAccounts,
        getSelectOptions,
        clearData,
    };
    if (isLoading) {
        return <Loading/>
    } else {
        return <SelectOptionsContext.Provider value={value}>{children}</SelectOptionsContext.Provider>;
    }
};
