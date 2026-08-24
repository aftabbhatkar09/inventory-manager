import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { HashLoader } from "react-spinners";

import { TbEdit } from "react-icons/tb";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

import { useGetMeQuery } from "../../redux/auth/authApi";
import {
  useGetUsersQuery,
  useDeleteUserByIdMutation,
} from "../../redux/user/userApi";

const ROLE_BADGE = {
  super_admin: "bg-purple-50 text-purple-700",
  admin: "bg-blue-50 text-blue-700",
};

const ROLE_LABEL = {
  super_admin: "Super Admin",
  admin: "Admin",
};

const UserPage = () => {
  const navigate = useNavigate();

  const { data: me } = useGetMeQuery();
  const { data: users = [], isLoading, isError } = useGetUsersQuery();
  const [deleteUserById] = useDeleteUserByIdMutation();

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserById(id).unwrap();
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete user");
      }
    }
  };

  if (isLoading)
    return (
      <div className="w-full h-full mx-auto flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );
  if (isError) return <p className="text-red-600">Error loading users.</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Users</h1>

        <button
          onClick={() => navigate("/users/createUser")}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition"
        >
          <FaPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-300 divide-y divide-gray-300 overflow-hidden">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500 py-10 text-center">
            No users yet.
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-gray-900">{user.username}</p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE[user.role] || "bg-gray-100 text-gray-600"}`}
                >
                  {ROLE_LABEL[user.role] || user.role}
                </span>
                {me?.username === user.username && (
                  <span className="text-xs text-gray-400">(You)</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`/users/editUser/${user._id}`)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Edit user"
                >
                  <TbEdit className="text-green-600 h-5 w-5" />
                </button>

                <button
                  onClick={() => handleDelete(user._id)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Delete user"
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

export default UserPage;
