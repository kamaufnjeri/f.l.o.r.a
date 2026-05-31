// components/contact/ContactInfo.tsx

import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";

export default function ContactInfo() {
  const items = [
    {
      icon: FiMail,
      title: "Email Support",
      value: "support@flora.app",
    },
    {
      icon: FiPhone,
      title: "Phone",
      value: "+254 700 000 000",
    },
    {
      icon: FiMapPin,
      title: "Office",
      value: "Nairobi, Kenya",
    },
    {
      icon: FiClock,
      title: "Working Hours",
      value: "Mon - Fri, 9AM - 6PM",
    },
  ];

  return (
    <div className="space-y-6">

      <div className="bg-primary text-white rounded-3xl p-8">
        <h3 className="text-xl font-semibold">
          Need instant help?
        </h3>
        <p className="mt-2 text-sm text-primary-light">
          Reach our support team for urgent issues.
        </p>

        <button className="mt-6 bg-white text-primary px-5 py-2 rounded-xl font-medium">
          Live Chat
        </button>
      </div>

      <div className="bg-white border border-border rounded-3xl p-8 space-y-5">

        <h3 className="text-lg font-semibold text-text">
          Contact Information
        </h3>

        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">

            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-light text-primary">
              <item.icon />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {item.title}
              </p>
              <p className="text-sm text-muted">
                {item.value}
              </p>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}