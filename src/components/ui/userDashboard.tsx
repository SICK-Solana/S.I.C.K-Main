import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type RowData = {
  name: string;
  xirr: string;
  dayChange: number;
  returns: number;
  current: number;
  changeColor: string;
  returnColor: string;
};

type Header = {
  label: string;
  key: keyof RowData; // Ensuring the key is always keyof RowData
};

type SortConfig = {
  key: keyof RowData | null; 
  direction: 'ascending' | 'descending' | null;
};
export default function DashboardTable() {
  const initialData = [
    {
      name: "First",
      xirr: "78.4%",
      dayChange: "+0.05%",
      returns: "$20 (+2.35%)",
      current: "$200 ($300)",
      changeColor: "text-green-400",
      returnColor: "text-green-400",
    },
    {
      name: "Second",
      xirr: "78.4%",
      dayChange: "+0.10%",
      returns: "$30 (+2.35%)",
      current: "$300 ($300)",
      changeColor: "text-red-400",
      returnColor: "text-green-400",
    },
    {
      name: "Third",
      xirr: "78.4%",
      dayChange: "+0.15%",
      returns: "$40 (+2.35%)",
      current: "$400 ($300)",
      changeColor: "text-green-400",
      returnColor: "text-red-400",
    },
    {
      name: "Fourth",
      xirr: "78.4%",
      dayChange: "+0.20%",
      returns: "$50 (+2.35%)",
      current: "$500 ($300)",
      changeColor: "text-green-400",
      returnColor: "text-green-400",
    },
  ];

  const headers: Header[] = [
    { label: "Name", key: "name" },
    { label: "Day Change", key: "dayChange" },
    { label: "Returns", key: "returns" },
    { label: "Current", key: "current" },
  ];

  const [data, setData] = useState(initialData);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  const onSort = (key: keyof RowData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
  
    // Toggle the sorting direction if already sorted by the same column
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
  
    // Sort the data
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[key] as string | number; // Ensure TypeScript knows these are either string or number
      const bValue = b[key] as string | number;
  
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
  
    // Update state with sorted data and sort config
    setData(sortedData);
    setSortConfig({ key, direction });
  };
  
  const noofCrates =4;
  return (
    <>
      
      <div className="overflow-x-auto  rounded-3xl bg-black border border-yellow-500 p-4 ml-4 mb-14 lg:mb-0 lg:ml-24 font-mono">
      <h3 className="text-[#B6FF1B] text-sm ">// active_crates({noofCrates})</h3>

        <table className="min-w-full px-10  table-auto text-left text-yellow-400">
        <thead className="text-lg">
        <tr className="border-b border-green-500">
  {headers.map((header, index) => (
    <th
      key={index}
      className="px-4 py-4 text-left cursor-pointer"
      onClick={() => onSort(header.key as keyof RowData)} // Ensure `key` matches `keyof RowData`
    >
      <div className="inline-flex items-center">
        {header.label}
        {sortConfig.key === header.key ? (
          sortConfig.direction === 'ascending' ? (
            <ChevronUp className="ml-2 h-6 w-6" />
          ) : (
            <ChevronDown className="ml-2 h-6 w-6" />
          )
        ) : (
          <ChevronDown className="ml-2 h-6 w-6" />
        )}
      </div>
    </th>
  ))}
</tr>

        </thead>

          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-700 hover:bg-gray-800"
              >
                <td className="px-4 py-4">
                  <div className="text-lg text-white ">{item.name}</div>
                  <div className="text-lg text-gray-400">XIRR: {item.xirr}</div>
                </td>
                <td className={`px-4 py-2 ${item.changeColor}`}>
                  <div className="text-lg">{item.dayChange}</div>
                  <div className="text-sm">
                    {item.dayChange.includes("-") ? "-2.35%" : "+2.35%"}
                  </div>
                </td>
                <td className={`px-4 py-2 ${item.returnColor}`}>
                  <div>{item.returns.split(" ")[0]}</div>
                  <div className="text-sm">{item.returns.split(" ")[1]}</div>
                </td>
                <td className="px-4 py-2">
                  <div>{item.current.split(" ")[0]}</div>
                  <div className="text-sm text-gray-400">
                    {item.current.split(" ")[1]}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
