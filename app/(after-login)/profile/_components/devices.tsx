import { formatRelative } from "date-fns";
import { motion } from "framer-motion";
import { DeviceData } from "lib/db/dto/responses/DeviceData";
import HttpGateway from "lib/middlewares/web/HttpGateway";
import { MonitorSmartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";

export default function Devices() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = async () => {
    const { data } = await HttpGateway.secureHttpGet("/api/auth/devices");
    setIsLoading(false);
    setDevices(data.data);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div>
      <h2 className="text-md font-semibold">Login Devices</h2>
      <hr className="border-gray-300 dark:border-gray-600 my-3" />

      {isLoading ? (
        <div className="text-center flex justify-center pt-3">
          <HashLoader size={30} color="#36d7b7" />
        </div>
      ) : (
        devices.map((device) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-inner mb-4">
              <MonitorSmartphone size={30} />
              <div>
                <p className="text-sm">
                  {device.userAgent.os?.name ?? "unknown"}{" "}
                  {device.userAgent.os?.version} (
                  {device.userAgent.browser?.name ?? "unknown"})
                </p>
                <p className="text-sm mt-2">
                  {device.createdAt &&
                    formatRelative(device.createdAt, new Date())}
                </p>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
