import { Contact } from '../../../controllers';
import { useMediaQuery } from '../../../hooks';
import { getShortKey, getShortName } from '../../../utils';
import { Button } from '../Button';
import { AccountSvg } from '../Svg';

type ContactsListProps = {
  list: { [key: string]: Contact[] };
  handleSelect?: (c: Contact) => () => void;
  handleCreate?: () => void;
};

export const ContactsList: React.FC<ContactsListProps> = ({
  list,
  handleSelect,
  handleCreate,
}) => {
  const isDesktop = useMediaQuery();
  return (
    <div className="w-[100%] py-[24px]">
      {Object.keys(list).length ? (
        <div className="w-[100%]">
          {Object.keys(list)
            .sort()
            .map((i) => {
              return (
                <div key={i} className="flex flex-col">
                  <p
                    className={`mb-[8px] mx-[16px] px-[16px] ext:py-[10px] tablet:py-[8px] bg-dark_grey rounded-[15px] ${
                      isDesktop ? 'h3' : 'h2_ext'
                    }`}
                  >
                    {i}
                  </p>
                  <div className="mb-[16px]">
                    {list[i].map((c: Contact) => {
                      return (
                        <div
                          className="flex items-center px-[16px] cursor-pointer hover:bg-dark_grey my-[8px]"
                          key={c.address}
                          onClick={handleSelect(c)}
                        >
                          <div className="w-[36px] h-[36px] border-[1px] border-solid border-[#282626] rounded-[50%] mr-[8px]"></div>
                          <div className="flex flex-col">
                            <p
                              className={`${
                                isDesktop ? 'h3' : 'h2_ext'
                              } break-all`}
                            >
                              {getShortName(c.name)}
                            </p>
                            <p className="text_body text-light_grey">
                              {getShortKey(c.address)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-[16px]">
          <AccountSvg />
          <p className={`mt-[24px] mb-[16px] ${isDesktop ? 'h3' : 'h2_ext'}`}>
            Build your contact list
          </p>
          <p className="text_body text-light_grey mb-[24px] text-center">
            Add friends and addresses you trust
          </p>
          <Button
            title="Add contact"
            mode="gradient"
            onClick={handleCreate}
            className="w-[100%] "
          />
        </div>
      )}
    </div>
  );
};
