import { useState } from "react";
import {
  FileText,
  MapPin,
  HelpCircle,
  Mail,
  ChevronRight,
  Clock,
  CreditCard,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

export default function HelpAndPolicies({ onNavigate }) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const sections = [
    {
      id: 1,
      icon: FileText,
      title: "Borrowing Policies",
      description: "Pickup windows, returns, late fees.",
      color: "from-violet-100 to-purple-100",
      iconColor: "text-[#57068C]",
      content: (
        <>
          <p className="mb-2 text-sm text-gray-700">
            <strong>Identification & Eligibility:</strong> Students and staff must
            present a valid Campus ID to borrow equipment. Visitors require
            prior authorization.
          </p>

          <p className="mb-2 text-sm text-gray-700">
            <strong>Reservations:</strong> Make reservations at least <strong>24 hours</strong> in
            advance for best availability. Reservations not picked up within a
            30-minute grace period may be cancelled and released to other users.
          </p>

          <p className="mb-2 text-sm text-gray-700">
            <strong>Loan Periods:</strong> Standard loans range from <strong>24–72 hours</strong>
            depending on the item and facility. Loan length is shown at checkout.
          </p>

          <p className="mb-2 text-sm text-gray-700">
            <strong>Responsibility:</strong> Borrowers are responsible for items
            until they are returned and checked in by staff. Report existing
            damage at pickup to avoid charges.
          </p>

          <p className="mb-0 text-sm text-gray-700">
            <strong>Behavior & Consequences:</strong> Repeated late returns,
            damage from misuse, or failure to pay fees may result in suspension
            of borrowing privileges.
          </p>
        </>
      ),
    },
    {
      id: 2,
      icon: MapPin,
      title: "Where to pick up",
      description: "IM Lab, Arts Centre, Library desks.",
      color: "from-purple-100 to-pink-100",
      iconColor: "text-purple-600",
      content: (
        <>
          <p className="mb-2 text-sm text-gray-700">
            Present your reservation confirmation and Campus ID at the pickup
            desk. If you have a QR code from the app, have it ready to speed up
            checkout.
          </p>

          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>
              <strong>IM Lab</strong> - Room 201, North Building. Cameras, audio
              kits, VR headsets.
            </li>
            <li>
              <strong>Arts Centre</strong> - Ground Floor Equipment Desk.
              Instruments, lighting, stage equipment.
            </li>
            <li>
              <strong>Library</strong> - Media Desk, Level 2. Laptops, projectors,
              study tech.
            </li>
          </ul>

          <p className="mt-2 text-sm text-gray-700">
            If a proxy will pick up on your behalf, contact support in advance -
            pickup generally requires the borrower's ID for verification.
          </p>
        </>
      ),
    },
    {
      id: 3,
      icon: Clock,
      title: "Operating Hours",
      description: "Facility opening and closing times.",
      color: "from-violet-100 to-purple-100",
      iconColor: "text-[#57068C]",
      content: (
        <>
          <p className="mb-2 text-sm text-gray-700">
            Hours may vary during holidays and exam periods. Always check the
            app for exceptions and holiday schedules.
          </p>

          <table className="w-full text-sm text-left border-collapse">
            <tbody>
              <tr>
                <td className="py-1">IM Lab</td>
                <td className="py-1">9:00 AM – 6:00 PM (Mon–Fri)</td>
              </tr>
              <tr>
                <td className="py-1">Arts Centre</td>
                <td className="py-1">10:00 AM – 8:00 PM (Mon–Sat)</td>
              </tr>
              <tr>
                <td className="py-1">Library</td>
                <td className="py-1">8:00 AM – 10:00 PM (Daily)</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: 4,
      icon: CreditCard,
      title: "Fees and Deposits",
      description: "Security deposits and late fee structure.",
      color: "from-violet-100 to-purple-100",
      iconColor: "text-violet-600",
      content: (
        <>
          <p className="mb-2 text-sm text-gray-700">
            Most small items do not require a deposit, but high-value items (e.g.
            professional cameras, audio mixers) may require a security deposit
            or card hold.
          </p>

          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-2">
            <li>
              <strong>Late return:</strong> $5 per day per item (capped at $50).
            </li>
            <li>
              <strong>Lost/unreturned items:</strong> Charged at full replacement
              value plus administrative fees.
            </li>
            <li>
              <strong>Deposit refunds:</strong> Refunds are processed within 7–14
              business days after successful return and inspection.
            </li>
          </ul>

          <p className="text-sm text-gray-700">
            Failure to pay assessed fees may block future reservations until
            cleared.
          </p>
        </>
      ),
    },
    {
      id: 5,
      icon: AlertCircle,
      title: "Damage Policy",
      description: "What to do if equipment is damaged.",
      color: "from-gray-100 to-gray-200",
      iconColor: "text-gray-600",
      content: (
        <>
          <p className="mb-2 text-sm text-gray-700">
            Inspect equipment at pickup and report any existing damage to staff
            immediately. Failure to report pre-existing damage may result in
            charges to the borrower.
          </p>

          <p className="mb-2 text-sm text-gray-700">
            If damage occurs while the item is on loan:
          </p>

          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-2">
            <li>
              Notify staff within <strong>24 hours</strong> and submit an incident
              report through the app or at the desk.
            </li>
            <li>
              <strong>Minor wear-and-tear</strong> (expected with normal use) is
              not typically charged.
            </li>
            <li>
              <strong>Negligence or misuse:</strong> Borrower may be charged for
              repair or full replacement depending on severity.
            </li>
          </ul>

          <p className="mb-0 text-sm text-gray-700">
            In cases of suspected intentional damage, the incident will be
            escalated for review and may result in further disciplinary action.
          </p>
        </>
      ),
    },
    {
      id: 6,
      icon: HelpCircle,
      title: "FAQs",
      description: "Common questions and answers.",
      color: "from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      content: (
        <>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-800">Can I extend my loan?</p>
              <p className="text-sm text-gray-700">
              Yes - request an extension in the app before your due time. Extensions
              are subject to availability and staff approval.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">What if I lose an accessory?</p>
              <p className="text-sm text-gray-700">
                Missing parts are charged individually based on replacement cost.
                Report lost accessories immediately.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">Can someone else pick up my reservation?</p>
              <p className="text-sm text-gray-700">
              Generally no - pickup requires the borrower's Campus ID. Contact
              support ahead of time if you need special arrangements.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">How do I report a problem?</p>
              <p className="text-sm text-gray-700">
                Use the in-app support form, email <strong>camp@nyu.edu</strong>, or
                speak with staff at the pickup desk.
              </p>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button aria-label="Back to dashboard"
              onClick={() => onNavigate && onNavigate('home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Help and Policies</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Policy Cards */}
        <div className="space-y-4 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            const isOpen = openId === section.id;
            const contentId = `section-content-${section.id}`;

            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggle(section.id)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="w-full text-left p-6 flex items-start gap-4 group focus:outline-none"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-6 h-6 ${section.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transform transition-all duration-200 ${
                          isOpen ? "rotate-90 text-gray-600" : ""
                        }`}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                  </div>
                </button>

                <div
                  id={contentId}
                  role="region"
                  aria-labelledby={`section-${section.id}`}
                  className={`px-6 overflow-hidden transition-all duration-300`}
                  style={{
                    maxHeight: isOpen ? "1000px" : "0px",
                  }}
                >
                  <div className="py-4 border-t border-gray-100">
                    {section.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-[#57068C] to-purple-600 rounded-2xl p-8 text-white shadow-lg mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Need More Help?</h3>
              <p className="text-violet-100 mb-4">
                Our support team is here to assist you with any questions or concerns.
              </p>
              <a
                href="mailto:camp@nyu.edu"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
                camp@nyu.edu
              </a>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs font-bold">1</span>
              </div>
              <p className="text-gray-600 text-sm">
                Reserve equipment at least 24 hours in advance for better availability.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs font-bold">2</span>
              </div>
              <p className="text-gray-600 text-sm">
                Always inspect equipment before borrowing and report any existing damage.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs font-bold">3</span>
              </div>
              <p className="text-gray-600 text-sm">
                Return items on time to avoid late fees and maintain your borrowing privileges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
