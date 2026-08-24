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
  if (error) return <p>Error Fetching Parties</p>;

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Parties</h1>

        <button
          onClick={() => navigate("/parties/createParty")}
          className="flex items-center gap-2 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <FaPlus className="h-5 w-5" /> Add Party
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name, phone, or type"
      />

      {/* Party List  */}
      <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
        {filteredParties.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            {search ? "No parties match your search." : "No parties yet."}
          </p>
        ) : (
        filteredParties.map((party) => (
          <div
            key={party._id}
            className="flex justify-between items-center gap-2 border p-3 rounded-lg hover:shadow transition"
          >
            <div>
              <p className="font-medium">{party.name}</p>
              <p className="text-sm text-gray-500">{party.type}</p>
              <p className="text-sm text-gray-500">
                {party.phone || "No phone number"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/parties/partyLedger/${party._id}`)}
                className="text-blue-600 hover:text-blue-700 text-md font-semibold hover:cursor-pointer"
              >
                View Ledger
              </button>

              <button
                onClick={() => navigate(`/parties/editParty/${party._id}`)}
              >
                <TbEdit className="text-green-600 h-6 w-6 hover:text-green-700 hover:cursor-pointer" />
              </button>

              <button>
                <MdOutlineDeleteForever
                  onClick={() => handleDelete(party._id)}
                  className="text-red-600 h-6 w-6 hover:text-red-700 hover:cursor-pointer"
                />
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
