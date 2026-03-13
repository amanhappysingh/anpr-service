import Urls from "@/config/urls";
import http from "@/lib/http";


// GET all registered vehicles
export const getRegisteredVehicles = async () => {
  const res = await http.get(Urls.get_vechile);
  return res.data;
};

// POST register vehicle
export const registerVehicle = async (payload) => {
  const res = await http.post(Urls.register_vechile, payload);
  return res.data;
};
export const deleteVehicle = async (payload) => {
  const res = await http.delete(Urls.get_vechile+"/"+payload,);
  return res.data;
};
export const updatedVehicle = async ( id , payload) => {
  
  const res = await http.patch(Urls.get_vechile+"/"+id, payload);
  return res.data;
};
export const getVehicleLogs = ({ page, skip }) =>
  http.get(`/vehicle-logs?page=${page}&skip=${skip}`).then(res => res.data);

export const uploadVehiclesBulk = async (vehicles) => {
  const res = await http.post(
    Urls.get_vechile+"/bulk",
    { vehicles }
  );
  return res.data;
};