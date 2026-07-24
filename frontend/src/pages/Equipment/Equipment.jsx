import { useEffect, useState } from "react";



import {
  getEquipment,
  deleteEquipment,
} from "../../services/equipmentService";

import CreateEquipmentModal from "./CreateEquipmentModal";

function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await getEquipment(token);

      setEquipment(response.equipment);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this equipment?")) return;

    try {
      const token = localStorage.getItem("token");

      await deleteEquipment(token, id);

      fetchEquipment();

    } catch (error) {
      console.error(error);
      alert("Failed to delete equipment");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Equipment
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Equipment
        </button>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Serial No.</th>
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {equipment.length > 0 ? (

              equipment.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">{item.serial_number}</td>
                  <td className="p-4">{item.location}</td>
                  <td className="p-4">{item.status}</td>

                  <td className="p-4 text-center">

                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="text-center p-8 text-slate-500"
                >
                  No Equipment Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <CreateEquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEquipmentCreated={fetchEquipment}
      />

    </>
  );
}

export default Equipment;