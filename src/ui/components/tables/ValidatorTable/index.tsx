import { useEffect, useState } from 'react';
import { useTable, useSortBy, HeaderGroup, Column } from 'react-table';
import { AllValidatorsTableDataType } from '../../../containers';
import { Button } from '../../Button';
import { ManageValidatorModal } from '../../modals/ManageValidatorModal';
import { ArrowGradientSvg, SortSvg } from '../../Svg';

const renderCell = (
  columnId: string,
  cell,
  index: number,
  type: ValidatorTableProps['type'],
  handleManage
) => {
  if (columnId === 'name')
    return (
      <div
        className={`flex items-center  bg-dark_grey rounded-l-[15px] ${
          type === 'all_validator' ? 'h-[48px]' : 'h-[60px]'
        }`}
      >
        <div className="flex items-end">
          <p className="mr-[10px] ml-[10px]">{index + 1}.</p>
          <span className="text_body">{cell.render('Cell')}</span>
        </div>
      </div>
    );
  else if (columnId === 'manage')
    return (
      <div
        className={`flex items-center justify-center bg-dark_grey -ml-[2px] rounded-r-[15px] ${
          type === 'all_validator' ? 'h-[48px]' : 'h-[60px]'
        } `}
      >
        <Button
          mode="icon_transparent"
          onClick={handleManage(cell.row.original)}
          title="Manage"
          iconRight={<ArrowGradientSvg />}
        />
      </div>
    );
  else if (columnId === 'votingPower')
    return (
      <div className="flex items-center justify-center h-[48px] bg-dark_grey -ml-[2px]">{`${cell.value.toLocaleString(
        'en-US'
      )} BNB`}</div>
    );
  else if (columnId === 'commission' || columnId === 'arp')
    return (
      <div className="flex items-center justify-center h-[48px] bg-dark_grey -ml-[2px]">{`${cell.value} %`}</div>
    );
  else if (columnId === 'stakedCurrency')
    return (
      <div className="flex flex-col items-center justify-center h-[60px] bg-dark_grey -ml-[2px] text_numbers_s">
        <p>{cell.value.toLocaleString('en-US')} PNB</p>
        <p className="text-light_grey">
          ~ ${cell.row.original.stakedDollar.toLocaleString('en-US')}
        </p>
      </div>
    );
  else if (columnId === 'rewardsCurrency')
    return (
      <div className="flex flex-col items-center justify-center h-[60px] bg-dark_grey -ml-[2px] text_numbers_s">
        <p>{cell.value.toLocaleString('en-US')} PNB</p>
        <p className="text-light_grey">
          ~ ${cell.row.original.rewardsCurrency.toLocaleString('en-US')}
        </p>
      </div>
    );
  else
    return (
      <div className="flex items-center justify-center h-[48px] bg-dark_grey -ml-[2px]">
        {cell.value}
      </div>
    );
};

export type ColumnDefinitionType<T, K extends keyof T> = {
  accessor: K;
  Header: string;
  sortable: boolean;
};

type TableHeaderProps<T, K extends keyof T> = {
  columns: Array<ColumnDefinitionType<T, K>>;
  handleSorting: (sortField: K, sortOrder: 'asc' | 'desc') => void;
};

type TableRowsProps<T> = {
  data: Array<T>;
};

type ValidatorTableProps = {
  select?: string | number;
  search?: string;
  type: 'all_validator' | 'my_validator';
};

export const ValidatorTable = <T, K extends keyof T>({
  columns,
  select,
  search,
  data,
  type,
  handleSorting,
}: TableHeaderProps<T, K> &
  TableRowsProps<T> &
  ValidatorTableProps): JSX.Element => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns: columns as readonly Column<object>[],
        data: data as readonly object[],
      },
      useSortBy
    );

  const [sortField, setSortField] = useState<K | ''>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [showedValidator, setShowedValidator] = useState<T | null>();

  useEffect(() => {
    if(!data.length) return;
    setShowedValidator(data[1]);
  }, [data])

  useEffect(() => {
    setSortField('');
    setOrder('asc');
  }, [select, search]);

  const handleSortingChange = (accessor: K) => () => {
    const sortOrder =
      accessor === sortField && order === 'asc' ? 'desc' : 'asc';
    setSortField(accessor);
    setOrder(sortOrder);
    handleSorting(accessor, sortOrder);
  };

  const handleManage = (data: T) => () => setShowedValidator(data);

  const handleClose = () => setShowedValidator(null);

  console.log(showedValidator);
  

  return (
    <>
      <div className="bg-brown rounded-[15px] pt-[24px] pb-[20px] px-[20px]">
        <table {...getTableProps()} className="w-[100%] ">
          <thead className="h3">
            {headerGroups.map((headerGroup, headerGroupIndex) => (
              <tr key={headerGroupIndex}>
                {headerGroup.headers.map(
                  (
                    column: HeaderGroup<object> & { sortable: boolean },
                    index
                  ) => {
                    return (
                      <th
                        onClick={
                          column.sortable
                            ? handleSortingChange(column.id as K)
                            : null
                        }
                        key={index}
                        className={`pb-[22px] ${
                          column.id === 'name' ? 'text-left' : ''
                        }`}
                      >
                        <div
                          className={`flex items-center ${
                            column.id === 'name'
                              ? 'justify-start'
                              : 'justify-center'
                          }`}
                        >
                          <div>{column.render('Header')}</div>
                          {column.sortable && (
                            <div className="flex flex-col ml-[8px] cursor-pointer">
                              <span>
                                <SortSvg
                                  fill={
                                    sortField === column.id && order === 'asc'
                                      ? 'white'
                                      : '#524B4B'
                                  }
                                />
                              </span>
                              <span className="rotate-180">
                                <SortSvg
                                  fill={
                                    sortField === column.id && order === 'desc'
                                      ? 'white'
                                      : '#524B4B'
                                  }
                                />
                              </span>
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  }
                )}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);

              return (
                <tr {...row.getRowProps()} key={i}>
                  {row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        className="text_numbers_s py-[4px] text-left"
                      >
                        {renderCell(
                          cell.column.id,
                          cell,
                          i,
                          type,
                          handleManage
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showedValidator && (
        <ManageValidatorModal
          show={Boolean(showedValidator)}
          onClose={handleClose}
          data={showedValidator as AllValidatorsTableDataType}
        />
      )}
    </>
  );
};
