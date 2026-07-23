import Link from "next/link";
import { RecentTransaction } from "./types";



type Props = {
    organisationId: string;
    transactions: RecentTransaction[];
};



const typeStyles: Record<string, string> = {

    Sales:
        "bg-green-50 text-green-600",

    Purchase:
        "bg-blue-50 text-blue-600",

    "Service Income":
        "bg-purple-50 text-purple-600",

    Journal:
        "bg-orange-50 text-orange-600",

    Payment:
        "bg-gray-100 text-gray-600",

};




export default function RecentTransactions({
    organisationId,
    transactions,
}: Props) {


    return (

        <div
            className="
bg-white
border
border-gray-100
rounded-2xl
shadow-sm
overflow-hidden
"
        >


            {/* HEADER */}

            <div
                className="
        p-5
        border-b
        border-gray-100
        flex
        items-center
        justify-between
        gap-3
    "
            >

                <div>

                    <h2
                        className="
                text-lg
                font-semibold
                text-primary
            "
                    >
                        Recent Transactions
                    </h2>

                    <p
                        className="
                text-sm
                text-gray-400
                mt-1
            "
                    >
                        Latest business activities
                    </p>

                </div>



            </div>




            {/* DESKTOP TABLE */}

            <div
                className="
hidden
md:block
overflow-x-auto
"
            >


                <table
                    className="
w-full
text-sm
"
                >


                    <thead
                        className="
bg-gray-50
text-gray-500
"
                    >


                        <tr>

                            <th className="text-left px-5 py-3 font-medium">
                                Type
                            </th>


                            <th className="text-left px-5 py-3 font-medium">
                                Description
                            </th>


                            <th className="text-left px-5 py-3 font-medium">
                                Party
                            </th>


                            <th className="text-left px-5 py-3 font-medium">
                                Date
                            </th>


                            <th className="text-left px-5 py-3 font-medium">
                                Entered By
                            </th>


                        </tr>


                    </thead>




                    <tbody>


                        {
                            transactions.map(
                                (transaction) => (


                                    <tr
                                        key={transaction.id}
                                        className="
border-t
border-gray-100
hover:bg-gray-50
transition
"
                                    >


                                        <td
                                            className="
px-5
py-4
"
                                        >


                                            <Link
                                                href={`/dashboard/${organisationId}${transaction.url}`}
                                                className="
flex
items-center
gap-2
"
                                            >


                                                <span
                                                    className={`
px-3
py-1
rounded-full
text-xs
font-medium
${typeStyles[transaction.type] ?? "bg-gray-100 text-gray-600"}
`}
                                                >
                                                    {transaction.type}
                                                </span>


                                            </Link>


                                        </td>





                                        <td
                                            className="
px-5
py-4
"
                                        >


                                            <Link
                                                href={`/dashboard/${organisationId}${transaction.url}`}
                                                className="
font-medium
text-gray-800
hover:text-primary
"
                                            >

                                                {
                                                    transaction.serial_number ||
                                                    transaction.description
                                                }

                                            </Link>


                                            <p
                                                className="
text-xs
text-gray-400
mt-1
"
                                            >
                                                {transaction.description}
                                            </p>


                                        </td>






                                        <td
                                            className="
px-5
py-4
text-gray-600
"
                                        >

                                            {
                                                transaction.customer_name ||
                                                transaction.supplier_name ||
                                                "-"
                                            }

                                        </td>






                                        <td
                                            className="
px-5
py-4
text-gray-500
"
                                        >

                                            {
                                                new Date(
                                                    transaction.date
                                                )
                                                    .toLocaleDateString(
                                                        "en-GB",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                        }
                                                    )
                                            }

                                        </td>





                                        <td
                                            className="
px-5
py-4
text-gray-500
"
                                        >

                                            {transaction.entered_by}

                                        </td>



                                    </tr>


                                ))
                        }


                    </tbody>


                </table>


            </div>







            {/* MOBILE */}

            <div
                className="
md:hidden
divide-y
"
            >


                {
                    transactions.map(
                        (transaction) => (


                            <Link
                                key={transaction.id}
                                                href={`/dashboard/${organisationId}${transaction.url}`}
                                className="
block
p-4
hover:bg-gray-50
transition
"
                            >


                                <div
                                    className="
flex
items-center
justify-between
"
                                >


                                    <span
                                        className={`
px-3
py-1
rounded-full
text-xs
font-medium
${typeStyles[transaction.type] ?? "bg-gray-100 text-gray-600"}
`}
                                    >
                                        {transaction.type}
                                    </span>



                                    <span
                                        className="
text-xs
text-gray-400
"
                                    >
                                        {
                                            new Date(transaction.date)
                                                .toLocaleDateString(
                                                    "en-GB"
                                                )
                                        }
                                    </span>


                                </div>





                                <h3
                                    className="
mt-3
font-medium
text-gray-800
"
                                >

                                    {
                                        transaction.serial_number ||
                                        transaction.description
                                    }

                                </h3>




                                <p
                                    className="
text-sm
text-gray-500
mt-1
"
                                >
                                    {transaction.description}
                                </p>




                                <p
                                    className="
text-xs
text-gray-400
mt-3
"
                                >
                                    {
                                        transaction.customer_name ||
                                        transaction.supplier_name ||
                                        "No party"
                                    }
                                </p>



                            </Link>


                        ))
                }


            </div>



        </div>


    );


}
