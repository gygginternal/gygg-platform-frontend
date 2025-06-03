import React from "react";

const BillingDashboardPage = () => {
  return (
    <div>
      <div className="flex overflow-hidden flex-col w-full bg-stone-100 max-md:max-w-full">
        <div className="w-full text-base max-md:max-w-full">
          <div className="flex flex-col justify-center items-end px-16 py-5 w-full bg-gray-700 max-md:px-5 max-md:max-w-full">
            <div className="flex flex-wrap gap-5 justify-between pl-2.5 max-w-full bg-white rounded-2xl border border-solid border-stone-100 w-[582px]">
              <div className="flex gap-3 my-auto text-neutral-400">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/b1280a9927158f9169292f3ca7fc5bc5a3832285?placeholderIfAbsent=true"
                  className="object-contain shrink-0 w-6 aspect-square"
                  alt="Search icon"
                />
                <div className="self-start">Search Tasks</div>
              </div>
              <button className="z-10 px-5 py-4 font-bold text-white whitespace-nowrap bg-cyan-600 rounded-none">
                Search
              </button>
            </div>
          </div>
        </div>
        <div className="flex z-10 flex-col self-center pb-5 mt-0 w-full max-w-[1174px] max-md:max-w-full">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f018df3dfdd4661a9799375840d522c6e89897e9?placeholderIfAbsent=true"
            className="object-contain z-10 max-w-full aspect-[2.44] w-[164px]"
            alt="Logo"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/1cbcd8b3320402fe3eaa8f59570aff0a08b2716a?placeholderIfAbsent=true"
            className="object-contain self-end mt-0 w-7 aspect-square"
            alt="Decoration"
          />
        </div>
        <div className="z-10 mt-0 w-full max-w-[1277px] max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col">
            <div className="w-[22%] max-md:ml-0 max-md:w-full">
              <div className="flex overflow-hidden flex-col grow pt-20 w-full text-lg font-medium text-gray-700 whitespace-nowrap bg-zinc-100 pb-[723px] max-md:pb-24 max-md:mt-10">
                <div className="px-14 py-5 bg-zinc-100 max-md:px-5">Home</div>
                <div className="shrink-0 h-px border border-solid border-zinc-300" />
                <div className="self-center mt-4">Messages</div>
                <div className="flex flex-col pt-px pb-6 mt-5 font-bold text-white bg-cyan-600">
                  <div className="shrink-0 h-0 border border-solid border-zinc-300" />
                  <div className="self-start mt-4 ml-14 max-md:ml-2.5">
                    Contracts
                  </div>
                </div>
                <div className="shrink-0 h-0 border border-solid border-zinc-300" />
                <div className="self-start mt-3.5 ml-14 max-md:ml-2.5">
                  Gigs
                </div>
                <div className="shrink-0 mt-6 h-0 border border-solid border-zinc-300" />
              </div>
            </div>
            <div className="ml-5 w-[24%] max-md:ml-0 max-md:w-full">
              <div className="flex overflow-hidden flex-col px-3 pt-4 pb-8 mx-auto mt-32 w-full bg-white rounded-2xl max-md:mt-10">
                <div className="flex gap-3 self-start font-bold text-gray-700">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/46aa1a41d9ebfd84ef8f781d62c0331b425fcfbd?placeholderIfAbsent=true"
                    className="object-contain shrink-0 w-16 aspect-square rounded-[700px]"
                    alt="Profile"
                  />
                  <div className="flex flex-col my-auto">
                    <div className="text-lg">Michelle Baskin</div>
                    <div className="self-start mt-2.5 text-sm underline">
                      View Profile
                    </div>
                  </div>
                </div>
                <div className="self-center mt-9 text-base font-bold text-gray-700">
                  Gyggs I can help with
                </div>
                <div className="flex gap-2 mt-6 w-full text-sm font-semibold text-center text-white">
                  <div className="self-stretch bg-orange-400 rounded-2xl border-2 border-solid border-stone-500 min-h-9">
                    Pet Sitting
                  </div>
                  <div className="self-stretch whitespace-nowrap bg-orange-400 rounded-2xl border-2 border-solid border-stone-500 min-h-9">
                    Gardening
                  </div>
                </div>
                <div className="flex gap-2 mt-3.5 w-full text-sm font-semibold text-center text-white">
                  <div className="self-stretch bg-orange-400 rounded-2xl border-2 border-solid border-stone-500 min-h-9">
                    Shelf Mounting
                  </div>
                  <div className="self-stretch bg-orange-400 rounded-2xl border-2 border-solid border-stone-500 min-h-9">
                    Grocery Shopping
                  </div>
                </div>
                <div className="self-center mt-9 text-base font-bold text-gray-700 underline">
                  3 People need your help
                </div>
                <div className="flex gap-3.5 self-start mt-6">
                  <div>
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/e8a83df72b7c252520b59a5d6dc645f3d1172b2a?placeholderIfAbsent=true"
                      className="object-contain aspect-square rounded-[700px] w-[54px]"
                      alt="User 1"
                    />
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/85eb20c0e1070ecd17fb6c271fe32e82d71a0915?placeholderIfAbsent=true"
                      className="object-contain mt-8 aspect-square rounded-[700px] w-[54px]"
                      alt="User 2"
                    />
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/08a694aef99a460e59d9facecd8f12777d5a36bf?placeholderIfAbsent=true"
                      className="object-contain mt-8 aspect-square rounded-[700px] w-[54px]"
                      alt="User 3"
                    />
                  </div>
                  <div className="flex flex-col text-xs font-medium text-slate-600">
                    <div>Ariana. A from Thornhill needs a dog sitter</div>
                    <div className="self-start mt-2.5 text-sm font-bold text-gray-700 underline">
                      View task detail
                    </div>
                    <div className="mt-8">
                      Lia.T is from Thornhill needs a grocery Shopper
                    </div>
                    <div className="self-start mt-2 text-sm font-bold text-gray-700 underline">
                      View task detail
                    </div>
                    <div className="mt-8">
                      Wilson. H from Richmondhill needs a furniture assembler
                    </div>
                    <div className="self-start mt-2.5 text-sm font-bold text-gray-700 underline">
                      View task detail
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-5 w-[54%] max-md:ml-0 max-md:w-full">
              <div className="flex flex-col self-stretch my-auto max-md:mt-10 max-md:max-w-full">
                <div className="flex shrink-0 self-center ml-5 max-w-full bg-white rounded-2xl border border-solid border-stone-100 h-[54px] w-[522px]" />
                
                <div className="px-6 pt-6 pb-72 mt-4 w-full bg-white rounded-2xl max-md:px-5 max-md:pb-24 max-md:max-w-full">
                  <div className="flex flex-wrap gap-3.5 max-md:max-w-full">
                    <div className="flex flex-col grow shrink-0 justify-center items-start px-3.5 py-1.5 bg-white rounded-2xl border border-solid basis-0 border-zinc-300 w-fit max-md:pr-5 max-md:max-w-full">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/03d835171130baae7e0c4ae2bea3dbf40c6fce9e?placeholderIfAbsent=true"
                        className="object-contain w-8 aspect-square"
                        alt="Filter"
                      />
                    </div>
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/379ac40e21f5b849adaa77deb10cb299a1608da4?placeholderIfAbsent=true"
                      className="object-contain shrink-0 my-auto w-7 aspect-square"
                      alt="Sort"
                    />
                  </div>
                  <div className="flex flex-wrap gap-5 justify-between mt-8 max-w-full text-xl font-semibold w-[546px]">
                    <div className="flex flex-col">
                      <div className="text-gray-700">In Progress</div>
                      <div className="self-start mt-5 text-orange-400">
                        $435.24
                      </div>
                    </div>
                    <div className="flex flex-col whitespace-nowrap">
                      <div className="text-gray-700">Available</div>
                      <div className="self-start mt-5 text-orange-400">
                        $586.12
                      </div>
                    </div>
                    <button className="overflow-hidden gap-2 self-start pt-14 pb-24 mt-5 text-base text-white whitespace-nowrap bg-gray-700 rounded-lg min-h-[42px] pl-[}] pr-[var(--6,] max-md:px-5">
                      Withdraw
                    </button>
                  </div>
                  <div className="shrink-0 mt-8 h-0.5 border border-solid border-zinc-300 max-md:max-w-full" />
                  <div className="flex gap-10 mt-2.5 max-w-full text-sm font-semibold text-gray-700 w-[558px]">
                    <div>Hired by</div>
                    <div>Date</div>
                    <div className="grow shrink w-[95px]">Contract detail</div>
                    <div>Invoice</div>
                  </div>
                  <div className="shrink-0 mt-3.5 h-0.5 border border-solid border-zinc-300 max-md:max-w-full" />
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <React.Fragment key={index}>
                      <div className="flex gap-10 mt-4 max-w-full text-sm text-gray-700 w-[543px]">
                        <div>Justin.S</div>
                        <div>Jun,24,2025</div>
                        <div className="grow shrink w-[186px]">
                          Dog sitting for the weekend...
                        </div>
                        <div className="font-medium underline">View</div>
                      </div>
                      <div className="shrink-0 mt-4 h-0.5 border border-solid border-zinc-300 max-md:max-w-full" />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboardPage;
