import { useTable, useSortBy } from 'react-table';
import { Button } from '../../Button';
import { ArrowGradientSvg } from '../../Svg';

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
  else
    return (
      <div className="flex items-center justify-center h-[48px] bg-dark_grey -ml-[2px]">
        {cell.value}
      </div>
    );
};

export const ValidatorTable = ({ columns, data }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
      },
      useSortBy
    );

  return (
    <div className="bg-brown rounded-[15px] pt-[24px] pb-[20px] px-[20px]">
      <table {...getTableProps()} className="w-[100%] ">
        <thead className="h3">
          {headerGroups.map((headerGroup, headerGroupIndex) => (
            <tr key={headerGroupIndex}>
              {headerGroup.headers.map((column, index) => {
                return (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={index}
                    className={`pb-[22px] ${
                      column.id === 'name' ? 'text-left' : 'text-center'
                    }`}
                  >
                    {column.render('Header')}

                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
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
