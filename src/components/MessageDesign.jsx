import React from "react";

const MessageDesign = ({ messages, onClick }) => {
  return (
    <div className="rounded-none max-w-[607px]">
      <div className="flex gap-5 max-md:flex-col">
        <div className="flex-wrap max-md:ml-0 max-md:w-full">
          <div className="pt-5 pr-7 pb-7 pl-2 mx-auto w-full bg-white rounded-2xl max-md:pr-5 max-md:mt-10 flex-1 overflow-hidden">
            {messages.map((message, index) => (
              <React.Fragment key={index}>
                <div
                  className="flex gap-5 justify-between mt-8 cursor-pointer"
                  onClick={() => onClick(message)} // Pass the message object to the onClick handler
                >
                  <div className="flex gap-3 text-base whitespace-nowrap">
                    <img
                      src={message.profileImage || "/default.jpg"}
                      className="object-contain shrink-0 aspect-square rounded-[700px] w-[54px]"
                      alt="Profile"
                    />
                    <div className="flex flex-col self-start">
                      <div className="self-start font-semibold text-gray-700 max-w-[150px] overflow-hidden text-ellipsis">
                        {message.name}
                      </div>
                      <div className="mt-3 font-light text-zinc-800">
                        {message.text}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col  text-xs font-light tracking-normal text-neutral-500">
                    <div className="max-md:mr-1.5 mt-1">{message.timestamp}</div>
                    {message.statusIcon && (
                      <img
                        src={message.statusIcon || "/default-status-icon.jpg"}
                        className="object-contain self-end mt-3 w-5 aspect-square"
                        alt="Status"
                      />
                    )}
                  </div>
                </div>
                {index < messages.length - 1 && (
                  <div className="shrink-0 mt-2.5 max-w-full h-px border border-gray-200 border-solid w-[280px] max-md:mr-1.5" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDesign;