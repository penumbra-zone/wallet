import { useState } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Button } from '../../Button';
import { ArrowGradientSvg, SortSvg } from '../../Svg';

const renderCell = (columnId: string, cell, index: number) => {
  if (columnId === 'name')
    return (
      <div className="flex items-center  h-[48px] bg-dark_grey rounded-l-[15px]">
        <div className="flex items-end">
          <p className="mr-[10px] ml-[10px]">{index + 1}.</p>
          <span className="text_body">{cell.render('Cell')}</span>
        </div>
      </div>
    );
  else if (columnId === 'manage')
    return (
      <div className="flex items-center justify-center h-[48px] bg-dark_grey -ml-[2px] rounded-r-[15px]">
        <Button
          mode="icon_transparent"
          onClick={() => console.log('asd')}
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
  else
    return (
      <div className="flex items-center justify-center h-[48px] bg-dark_grey -ml-[2px]">
        {cell.value}
      </div>
    );
};

const columns = [
  {
    Header: 'Validator',
    accessor: 'name',
    sortable: false,
  },
  {
    Header: 'Voting Power',
    accessor: 'votingPower',
    sortable: true,
  },
  {
    Header: 'Commission',
    accessor: 'commission',
    sortable: true,
  },
  {
    Header: 'APR',
    accessor: 'arp',
    sortable: true,
  },
  {
    Header: '',
    accessor: 'manage',
    sortable: false,
  },
];

export const ValidatorTable = ({ data, handleSorting }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
      },
      useSortBy
    );

  const [sortField, setSortField] = useState('');
  const [order, setOrder] = useState('asc');

  const handleSortingChange = (accessor: string) => () => {
    const sortOrder =
      accessor === sortField && order === 'asc' ? 'desc' : 'asc';
    setSortField(accessor);
    setOrder(sortOrder);
    handleSorting(accessor, sortOrder);
    console.log(sortOrder);
  };

  return (
    <div className="bg-brown rounded-[15px] pt-[24px] pb-[20px] px-[20px]">
      <table {...getTableProps()} className="w-[100%] ">
        <thead className="h3">
          {headerGroups.map((headerGroup, headerGroupIndex) => (
            <tr key={headerGroupIndex}>
              {headerGroup.headers.map((column, index) => {
                // console.log(column);

                return (
                  <th
                    onClick={
                      column.sortable ? handleSortingChange(column.id) : null
                    }
                    key={index}
                    className={`pb-[22px] ${
                      column.id === 'name' ? 'text-left' : 'text-center'
                    }`}
                  >
                    <div className="flex items-center">
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
              })}
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
                      className="text_number_s py-[4px]"
                    >
                      {renderCell(cell.column.id, cell, i)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
