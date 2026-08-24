import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { HashLoader } from "react-spinners";

import { TbEdit } from "react-icons/tb";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import SearchInput from "../../components/SearchInput";

import {
  useGetPartiesQuery,
  useDeletePartyByIdMutation,
} from "../../redux/party/partyApi";

const TYPE_BADGE = {
  customer: "bg-blue-50 text-blue-700",
  supplier: "bg-orange-50 text-orange-700",
};

const PartyPage = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetPartiesQuery();
  const [deletePartyById] = useDeletePartyByIdMutation();
  const [search, setSearch] = useState("");

  const filteredParties = (data || []).filter((party) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      party.name.toLowerCase().includes(q) ||
      (party.phone || "").toLowerCase().includes(q) ||
      party.type.join(" ").toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this party?")) {
      try {
        await deletePartyById(id).unwrap();
        toast.success("Party deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete party");
      }
    }
  };

  if (isLoading)
    return (
      <div className="w-full h-full mx-auto flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );
  if (error) return <p className="text-red-600">Error fetching parties.</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Parties</h1>

        <button
          onClick={() => navigate("/parties/createParty")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <FaPlus className="h-4 w-4" /> Add Party
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name, phone, or type"
      />

      {/* Party List  */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 divide-y divide-gray-100 overflow-hidden">
        {filteredParties.length === 0 ? (
          <p className="text-sm text-gray-500 py-10 text-center">
            {search ? "No parties match your search." : "No parties yet."}
          </p>
        ) : (
          filteredParties.map((party) => (
            <div
              key={party._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900">{party.name}</p>
                  {party.type.map((t) => (
                    <span
                      key={t}
                      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_BADGE[t] || "bg-gray-100 text-gray-600"}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {party.phone || "No phone number"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`/parties/partyLedger/${party._id}`)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  View Ledger
                </button>

                <button
                  onClick={() => navigate(`/parties/editParty/${party._id}`)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Edit party"
                >
                  <TbEdit className="text-green-600 h-5 w-5" />
                </button>

                <button
                  onClick={() => handleDelete(party._id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Delete party"
                >
                  <MdOutlineDeleteForever className="text-red-600 h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PartyPage;
