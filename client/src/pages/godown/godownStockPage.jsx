import { useParams, useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import {
  useGetGodownByIdQuery,
  useGetGodownStockQuery,
} from "../../redux/godown/godownApi";

const GodownStockPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: godown, isLoading: isGodownLoading } =
    useGetGodownByIdQuery(id);
  const { data: stock = [], isLoading: isStockLoading } =
    useGetGodownStockQuery(id);

  if (isGodownLoading || isStockLoading)
    return (
      <div className="flex justify-center items-center h-full w-full">
        <HashLoader />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Stock in {godown?.name}</h1>
        <button
          onClick={() => navigate("/godowns")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <MdOutlineKeyboardBackspace className="h-5 w-5" /> Back
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-300 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-semibold">Product</th>
              <th className="px-4 py-3 text-right font-semibold">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {stock.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-10 text-center text-gray-500">
                  No stock in this godown.
                </td>
              </tr>
            ) : (
              stock.map((row) => (
                <tr key={row.productId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.productName}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.quantity} {row.unit}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GodownStockPage;
