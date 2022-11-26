import { useState } from 'react';
import { columnsMyValidator } from '../../../lib';
import { EmptyTableHelper, ValidatorTable } from '../../components';

export type MyValidatorsTableDataType = {
  name: string;
  stakedCurrency: number;
  stakedDollar: number;
  rewardsCurrency: number;
  rewardsDollar: number;
  manage?: undefined;
};

export const MyValidators = () => {
  const [tableData, setTableData] = useState<MyValidatorsTableDataType[]>([
    // {
    //   name: 'DokiaCapital 1',
    //   stakedCurrency: 538,
    //   stakedDollar: 117,
    //   rewardsCurrency: 4631,
    //   rewardsDollar: 1.35,
    // },
    // {
    //   name: 'DokiaCapital 2',
    //   stakedCurrency: 500,
    //   stakedDollar: 157,
    //   rewardsCurrency: 5631,
    //   rewardsDollar: 1.35,
    // },
  ]);

  const handleSorting = (sortField, sortOrder) => {
    if (sortField) {
      const sorted = [...tableData].sort((a, b) => {
        if (a[sortField] === null) return 1;
        if (b[sortField] === null) return -1;
        if (a[sortField] === null && b[sortField] === null) return 0;
        return (
          a[sortField].toString().localeCompare(b[sortField].toString(), 'en', {
            numeric: true,
          }) * (sortOrder === 'asc' ? 1 : -1)
        );
      });
      setTableData(sorted);
    }
  };

  return (
    <div className="mt-[26px]">
      {!tableData.length ? (
        <EmptyTableHelper text='There are not validators' />
      ) : (
        <ValidatorTable
          data={tableData}
          handleSorting={handleSorting}
          columns={columnsMyValidator}
          type="my_validator"
        />
      )}
    </div>
  );
};
