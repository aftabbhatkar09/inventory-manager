import { useParams, useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";

import { MdOutlineKeyboardBackspace } from "react-icons/md";

import { useGetGodownByIdQuery, useGetGodownStockQuery } from "../../redux/godown/godownApi";

const GodownStockPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: godown, isLoading: isGodownLoading } = useGetGodownByIdQuery(id);
  const { data: stock = [], isLoading: isStockLoading } = useGetGodownStockQuery(id);

  if (isGodownLoading || isStockLoading)
    return (
      <div className="flex justify-center items-center h-full w-full">
        <HashLoader />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock in {godown?.name}</h1>
        <button
          onClick={() => navigate("/godowns")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <MdOutlineKeyboardBackspace className="h-6 w-6" /> Back
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        {stock.length === 0 ? (
          <p className="text-sm text-gray-500">No stock in this godown.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((row) => (
                <tr key={row.productId} className="border-b">
                  <td className="py-2">{row.productName}</td>
                  <td className="text-right py-2">
                    {row.quantity} {row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GodownStockPage;
