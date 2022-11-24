import { useState } from 'react';

type TabsProps = {
  tabs: string[];
  children: any;
  className?: string
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  children,
  className = 'bg-brown',
}) => {
  const [activeTab, setActivetab] = useState<string>(tabs[0]);

  const handleChangeTab = (tab: string) => () => setActivetab(tab);

  return (
    <div className="w-[100%] flex flex-col">
      <div className="flex mb-[24px]">
        {tabs.map((i) => {
          return (
            <div
              key={i}
              className={`w-[50%] h-[52px] text-center text_button cursor-pointer ${
                activeTab === i
                  ? 'tab_gradient'
                  : 'border-b-[1px] border-solid border-dark_grey'
              }`}
              onClick={handleChangeTab(i)}
            >
              <p className={`h-[51px] flex items-center justify-center ${className}`}>
                {i}
              </p>
            </div>
          );
        })}
      </div>
      {children(activeTab)}
    </div>
  );
};
