import Link from "next/link";


type ActionLink = {
  label: string;
  href: string;
};


type Props = {
  title: string;
  value: number;
  description: string;
  tone?: "green" | "blue" | "red" | "purple";
  actions: ActionLink[];
};


export default function FinancialCard({
  title,
  value,
  description,
  actions,
  tone = 'blue'
}: Props) {


  const amount = new Intl.NumberFormat(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);



  const tones: Record<
  NonNullable<Props["tone"]>,
  string
> = {
  green: "text-green-600",
  blue: "text-blue-600",
  red: "text-red-600",
  purple: "text-purple-600",
};



  return (

    <div
      className="
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-5
        shadow-sm
        hover:shadow-md
        transition
      "
    >


      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <div>

          <p
  className={`
    text-sm
    font-medium
    ${tones[tone]}
  `}
>
  {title}
</p>



          <h3
            className="
              mt-2
              text-2xl
              font-bold
              text-gray-900
            "
          >

           
              

            {amount}

          </h3>


        </div>



      

      </div>




      <p
        className="
          mt-3
          text-sm
          text-gray-500
        "
      >
        {description}
      </p>




      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-2
        "
      >

        {actions.map((action) => (

          <Link
            key={action.href}
            href={action.href}
            className="
              rounded-lg
              border
              border-gray-200
              px-3
              py-1.5
              text-xs
              font-medium
              text-gray-700
              hover:bg-gray-50
              hover:text-primary
              transition
            "
          >
            View {action.label}
          </Link>

        ))}


      </div>


    </div>

  );

}
