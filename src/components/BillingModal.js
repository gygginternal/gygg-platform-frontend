import React from "react";
import { Dialog } from "@headlessui/react";

export const BillingModal = ({ isOpen, onClose, gig }) => {
  if (!gig) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-5">
        <Dialog.Panel className="relative bg-white rounded-2xl shadow-md h-[516px] w-[937px] max-md:p-6 max-md:w-full max-md:h-auto max-md:max-w-[600px] max-sm:p-4">
          {/* Header */}
          <header>
            <button
              aria-label="Close invoice"
              className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
              onClick={onClose}
            >
              X
            </button>
            <Dialog.Title className="absolute top-6 left-8 text-4xl font-bold text-gray-700 h-[54px] leading-[54px] w-[127px] max-md:static max-md:mb-3 max-md:text-3xl max-sm:text-2xl">
              Invoice
            </Dialog.Title>
            <p className="absolute left-8 h-9 text-2xl font-bold leading-9 text-gray-700 top-[93px] w-[91px] max-md:static max-md:mb-6 max-md:text-xl max-sm:text-lg">
              #{gig._id || "N/A"}
            </p>
          </header>

          {/* Gig Title Section */}
          <section className="mt-16 max-md:mt-0">
            <div className="flex justify-between items-start max-md:flex-col">
              <p className="absolute text-xl leading-8 text-gray-700 h-[30px] left-[34px] top-[170px] w-[75px] max-md:static max-md:mb-2 max-sm:text-base">
                Gig title
              </p>
              <p className="absolute h-9 text-2xl font-bold leading-9 text-gray-700 left-[462px] top-[164px] w-[321px] max-md:static max-md:mb-4 max-md:text-xl max-sm:text-lg">
                {gig.gig.title || "N/A"}
              </p>
            </div>
          </section>

          <hr className="absolute top-56 h-px bg-gray-200 left-[18px] w-[901px] max-md:static max-md:mx-0 max-md:my-4 max-md:w-full" />

          {/* Earnings Section */}
          <section className="mt-4">
            <div className="flex justify-between items-start max-md:flex-col">
              <p className="absolute text-xl leading-8 text-gray-700 h-[30px] left-[34px] top-[250px] w-[178px] max-md:static max-md:mb-2 max-sm:text-base">
                Your total earnings
              </p>
              <p className="absolute h-9 text-2xl font-bold leading-9 text-gray-700 left-[462px] top-[238px] w-[94px] max-md:static max-md:mb-4 max-md:text-xl max-sm:text-lg">
                ${((gig.amount || 0) / 100).toFixed(2)}
              </p>
            </div>
          </section>

          <hr className="absolute h-px bg-gray-200 left-[18px] top-[296px] w-[901px] max-md:static max-md:mx-0 max-md:my-4 max-md:w-full" />

          {/* Fees and Taxes Section */}
          <section className="mt-4">
            <div className="flex justify-between items-start max-md:flex-col">
              <p className="absolute text-xl leading-8 text-gray-700 h-[30px] left-[34px] top-[323px] w-[143px] max-md:static max-md:mb-2 max-sm:text-base">
                Fees and taxes
              </p>
              <p className="absolute w-20 h-9 text-2xl font-bold leading-9 text-gray-700 left-[462px] top-[317px] max-md:static max-md:mb-4 max-md:text-xl max-sm:text-lg">
                ${((gig.applicationFeeAmount || 0) / 100).toFixed(2)}
              </p>
            </div>
          </section>

          <section className="mt-16 max-md:mt-4">
            <div className="flex justify-between items-start max-md:flex-col">
              <p className="absolute text-xl leading-8 text-gray-700 h-[30px] left-[34px] top-[410px] w-[324px] max-md:static max-md:mb-2 max-sm:text-base">
                Your earnings after fees and taxes
              </p>
              <p className="absolute text-4xl font-bold text-gray-700 h-[54px] leading-[54px] left-[462px] top-[398px] w-[140px] max-md:static max-md:text-3xl max-sm:text-2xl">
                ${((gig.amountReceivedByPayee || 0) / 100).toFixed(2)}
              </p>
            </div>
          </section>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
