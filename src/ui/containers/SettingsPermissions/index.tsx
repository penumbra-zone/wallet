import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '../../../hooks';
import { Button, PermissionsModal } from '../../components';

export type Site = {
  name: string;
  permissions: Permissions[];
};

export type Permissions =
  | 'GET_CHAIN_CURRENT_STATUS'
  | 'GET_NOTES'
  | 'GET_QUARANTINED_NOTES'
  | 'GET_WITNESS'
  | 'GET_ASSETS'
  | 'GET_CHAIN_PARAMETERS'
  | 'GET_FMD_PARAMETERS'
  | 'GET_NOTE_BY_COMMITMENT'
  | 'GET_NULLIFIER_STATUS'
  | 'GET_TRANSACTION_HASHES'
  | 'GET_TRANSACTION_BY_HASH'
  | 'GET_TRANSACTIONS'
  | 'GET_TRANSACTION_PERSPECTIVE';

export const sites: Site[] = [
  {
    name: '1 app.uniswapp.org',
    permissions: [
      'GET_CHAIN_CURRENT_STATUS',
      'GET_NOTES',
      'GET_QUARANTINED_NOTES',
      'GET_WITNESS',
      'GET_ASSETS',
      'GET_CHAIN_PARAMETERS',
      'GET_FMD_PARAMETERS',
      'GET_NOTE_BY_COMMITMENT',
      'GET_NULLIFIER_STATUS',
      'GET_TRANSACTION_HASHES',
      'GET_TRANSACTION_BY_HASH',
      'GET_TRANSACTIONS',
      'GET_TRANSACTION_PERSPECTIVE',
    ],
  },
  {
    name: '2 app.uniswapp.org',
    permissions: [
      'GET_CHAIN_CURRENT_STATUS',
      'GET_NOTES',
      'GET_QUARANTINED_NOTES',
      'GET_WITNESS',
      'GET_NOTE_BY_COMMITMENT',
      'GET_NULLIFIER_STATUS',
      'GET_TRANSACTION_HASHES',
      'GET_TRANSACTION_BY_HASH',
      'GET_TRANSACTIONS',
      'GET_TRANSACTION_PERSPECTIVE',
    ],
  },
];

export const SettingsPermissions = () => {
  const isDesktop = useMediaQuery();
  const { state } = useLocation();

  const [selectedSite, setSelectedSite] = useState<null | Site>(null);

  useEffect(() => {
    if (!state) return;
    const editedSite = sites.find((i) => i.name === state.siteName);
    if (editedSite) setSelectedSite(editedSite);
  }, [state]);

  const handleSelectSite = (site) => () => setSelectedSite(site);

  return (
    <>
      <div>
        <p
          className={`w-[100%] px-[16px] py-[24px] border-b-[1px] border-solid border-dark_grey ${
            isDesktop ? 'h2' : 'h1_ext'
          }`}
        >
          Permissions
        </p>
        <div className="h-[100%]">
          {sites.map((i) => {
            return (
              <div
                className="flex items-center justify-between p-[16px] border-b-[1px] border-solid border-dark_grey"
                key={i.name}
              >
                <div className="flex items-center">
                  <div className="w-[36px] h-[36px] li_gradient rounded-[50%] flex items-center justify-center">
                    <div className="w-[35px] h-[35px] bg-brown rounded-[50%] flex items-center justify-center"></div>
                  </div>
                  <p className="h3 ml-[8px]">{i.name}</p>
                </div>
                <div className="flex">
                  <Button
                    mode="transparent"
                    onClick={() => console.log('asd')}
                    title="Revoke"
                    className="w-[88px] mr-[16px] ext:py-[7px] tablet:py-[7px] text_button_ext"
                  />
                  <Button
                    mode="gradient"
                    onClick={handleSelectSite(i)}
                    title="View"
                    className="w-[88px] ext:py-[7px] tablet:py-[7px] text_button_ext"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedSite && (
        <PermissionsModal
          show={Boolean(selectedSite)}
          onClose={handleSelectSite(null)}
          selectedSite={selectedSite}
        />
      )}
    </>
  );
};
